"use client"

import { useState } from "react"
import type { HeatmapCell } from "@/lib/sumup/analytics"

type Metric = "total" | "num_tx"

// 0 = sin datos; 1-5 = intensidad creciente
const LEVELS = [
  "rgba(10,10,10,0.05)",
  "#d4f1de",
  "#9dd4b0",
  "#5aaa78",
  "#3d9058",
  "#2d7a45",
]

function levelColor(val: number, max: number): string {
  if (val === 0 || max === 0) return LEVELS[0]
  const r = val / max
  if (r < 0.15) return LEVELS[1]
  if (r < 0.35) return LEVELS[2]
  if (r < 0.55) return LEVELS[3]
  if (r < 0.75) return LEVELS[4]
  return LEVELS[5]
}

function fmtShort(v: number) {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000)     return `$${Math.round(v / 1_000)}k`
  return `$${Math.round(v)}`
}

function fmtFecha(fecha: string) {
  const [y, m, d] = fecha.split("-").map(Number)
  return new Date(y, m - 1, d).toLocaleDateString("es-CL", {
    weekday: "short", day: "numeric", month: "short",
  })
}

const GREEN_DK = "#2d7a45"
const GREEN_BG = "oklch(0.94 0.05 145)"
const INK50    = "rgba(10,10,10,0.52)"

const HORAS      = Array.from({ length: 24 }, (_, h) => h)
const Y_LABELS   = [0, 6, 12, 18, 23]
const CELL_H     = 9    // px
const CELL_GAP   = 2    // px
const GRID_H     = HORAS.length * CELL_H + (HORAS.length - 1) * CELL_GAP  // 238px
const Y_COL_W    = 22   // px for hour labels
const H_GAP      = 6    // gap between Y-labels and grid

type HoverState = {
  fecha: string; hora: number; total: number; num_tx: number
  clientX: number; clientY: number
}

export default function HeatmapHoraDia({
  data, anio, mes,
}: {
  data: HeatmapCell[]
  anio: number
  mes:  number
}) {
  const [metric, setMetric] = useState<Metric>("total")
  const [hover,  setHover]  = useState<HoverState | null>(null)

  const mesStr      = String(mes).padStart(2, "0")
  const daysInMonth = new Date(anio, mes, 0).getDate()
  const dias        = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  const lookup = new Map<string, HeatmapCell>()
  for (const c of data) lookup.set(`${c.fecha}-${c.hora}`, c)

  const maxTotal = Math.max(...data.map(c => c.total),  1)
  const maxNumTx = Math.max(...data.map(c => c.num_tx), 1)
  const maxVal   = metric === "total" ? maxTotal : maxNumTx

  return (
    <div className="terry-card" style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>

      {/* ── Controles ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
        {(["total", "num_tx"] as Metric[]).map(m => (
          <button
            key={m}
            onClick={() => setMetric(m)}
            style={{
              padding: "4px 11px", borderRadius: 20, fontSize: 10.5, fontWeight: 500,
              fontFamily: "var(--font-mono)", cursor: "pointer", border: "1px solid",
              borderColor: metric === m ? GREEN_DK : "rgba(10,10,10,0.12)",
              background:  metric === m ? GREEN_BG : "white",
              color:       metric === m ? GREEN_DK : INK50,
              transition: "all 0.12s",
            }}
          >
            {m === "total" ? "Ventas" : "Transacciones"}
          </button>
        ))}

        {/* Leyenda de color */}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: 8.5, fontFamily: "var(--font-mono)", color: INK50 }}>Menos</span>
          {LEVELS.map((c, i) => (
            <div key={i} style={{ width: 11, height: 11, background: c, borderRadius: 2 }} />
          ))}
          <span style={{ fontSize: 8.5, fontFamily: "var(--font-mono)", color: INK50 }}>Más</span>
        </div>
      </div>

      {/* ── Heatmap ── */}
      <div>
        <div style={{ display: "flex", gap: H_GAP }}>

          {/* Eje Y: etiquetas de hora */}
          <div style={{ width: Y_COL_W, height: GRID_H, position: "relative", flexShrink: 0 }}>
            {Y_LABELS.map(h => (
              <span key={h} style={{
                position: "absolute",
                top: h * (CELL_H + CELL_GAP),
                fontSize: 8, fontFamily: "var(--font-mono)", color: INK50,
                lineHeight: `${CELL_H}px`,
              }}>
                {h}h
              </span>
            ))}
          </div>

          {/* Grid */}
          <div style={{
            flex: 1,
            display: "grid",
            gridTemplateColumns: `repeat(${daysInMonth}, 1fr)`,
            gridAutoRows: `${CELL_H}px`,
            gap: `${CELL_GAP}px`,
          }}>
            {HORAS.flatMap(hora =>
              dias.map(dia => {
                const fechaStr = `${anio}-${mesStr}-${String(dia).padStart(2, "0")}`
                const cell     = lookup.get(`${fechaStr}-${hora}`)
                const val      = metric === "total" ? (cell?.total ?? 0) : (cell?.num_tx ?? 0)
                return (
                  <div
                    key={`${hora}-${dia}`}
                    style={{ background: levelColor(val, maxVal), borderRadius: 1 }}
                    onMouseEnter={e => setHover({
                      fecha: fechaStr, hora,
                      total: cell?.total ?? 0, num_tx: cell?.num_tx ?? 0,
                      clientX: e.clientX, clientY: e.clientY,
                    })}
                    onMouseMove={e => setHover(prev => prev
                      ? { ...prev, clientX: e.clientX, clientY: e.clientY }
                      : null
                    )}
                    onMouseLeave={() => setHover(null)}
                  />
                )
              })
            )}
          </div>
        </div>

        {/* Eje X: etiquetas de día */}
        <div style={{
          display: "flex", gap: `${CELL_GAP}px`,
          paddingLeft: Y_COL_W + H_GAP, marginTop: 4,
        }}>
          {dias.map(dia => (
            <div key={dia} style={{
              flex: 1, textAlign: "center",
              fontSize: 7.5, fontFamily: "var(--font-mono)", color: INK50,
            }}>
              {[1, 7, 14, 21, 28].includes(dia) ? dia : ""}
            </div>
          ))}
        </div>
      </div>

      {/* ── Tooltip fijo ── */}
      {hover && (
        <div style={{
          position: "fixed",
          left: hover.clientX + 14,
          top:  hover.clientY - 12,
          background: "#0a0a0a",
          color: "rgba(255,255,255,0.90)",
          padding: "7px 11px",
          borderRadius: 7,
          fontSize: 10.5,
          fontFamily: "var(--font-mono)",
          lineHeight: 1.75,
          whiteSpace: "nowrap",
          zIndex: 1000,
          boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
          pointerEvents: "none",
        }}>
          <div style={{ color: "rgba(255,255,255,0.50)", fontSize: 9.5, marginBottom: 3 }}>
            {fmtFecha(hover.fecha)} · {String(hover.hora).padStart(2, "0")}:00 – {String(hover.hora).padStart(2, "0")}:59
          </div>
          <div>Ventas    <span style={{ fontWeight: 600 }}>{fmtShort(hover.total)}</span></div>
          <div>Tx        <span style={{ fontWeight: 600 }}>{hover.num_tx}</span></div>
          {hover.num_tx > 0 && (
            <div>Ticket    <span style={{ fontWeight: 600 }}>{fmtShort(hover.total / hover.num_tx)}</span></div>
          )}
        </div>
      )}
    </div>
  )
}
