"use client"

import { useState } from "react"
import type { SemanaHoraData } from "@/lib/sumup/analytics"

// Oldest week = most transparent, newest = darkest
const WEEK_COLORS = [
  "rgba(163,212,180,0.50)",
  "#a3d4b4",
  "#5aaa78",
  "#2d7a45",
]
const GREEN_DK = "#2d7a45"
const GREEN_BG = "oklch(0.94 0.05 145)"
const INK      = "#0a0a0a"
const INK50    = "rgba(10,10,10,0.52)"
const INK30    = "rgba(10,10,10,0.30)"
const INK08    = "rgba(10,10,10,0.07)"

function fmtShort(v: number) {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000)     return `$${Math.round(v / 1_000)}k`
  return `$${Math.round(v)}`
}

type KpiKey = "total" | "promedio_dia" | "num_tx" | "ticket" | "max_tx"

const KPIS: { key: KpiKey; label: string; fmt: (v: number) => string }[] = [
  { key: "total",        label: "Acumulado",    fmt: fmtShort },
  { key: "promedio_dia", label: "Promedio",      fmt: fmtShort },
  { key: "num_tx",       label: "Transacciones", fmt: v => String(Math.round(v)) },
  { key: "ticket",       label: "Ticket",        fmt: fmtShort },
  { key: "max_tx",       label: "Mejor venta",   fmt: fmtShort },
]

const SVG_W   = 600
const SVG_H   = 140
const CHART_B = 120
const PAD_TOP = 10
const chartH  = CHART_B - PAD_TOP

const xOf = (h: number) => (h / 23) * SVG_W
const yOf = (v: number, maxV: number) => PAD_TOP + chartH - (v / Math.max(maxV, 1)) * chartH

export default function VentasHora({ data }: { data: SemanaHoraData[] }) {
  const [kpi,       setKpi]       = useState<KpiKey>("total")
  const [hoverHour, setHoverHour] = useState<number | null>(null)

  const hasData = data.length > 0 && data.some(s => s.horas.some(h => h.total > 0))
  if (!hasData) {
    return (
      <div className="terry-card" style={{
        padding: "32px 24px", display: "flex", flexDirection: "column",
        alignItems: "center", textAlign: "center", gap: 8,
      }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: INK }}>Sin datos horarios</p>
        <p style={{ fontSize: 11, color: INK50, fontFamily: "var(--font-mono)" }}>
          Ejecuta{" "}
          <code style={{ background: INK08, padding: "1px 5px", borderRadius: 4 }}>
            POST /api/sumup/snapshots/hora
          </code>{" "}
          para generar los datos.
        </p>
      </div>
    )
  }

  const selectedKpi = KPIS.find(k => k.key === kpi)!
  const maxVal = Math.max(...data.flatMap(s => s.horas.map(h => h[kpi])), 1)

  const weekLines = data.map((semana, wi) => ({
    semana,
    color:  WEEK_COLORS[Math.min(wi, WEEK_COLORS.length - 1)],
    width:  wi === data.length - 1 ? 2.5 : 1.8,
    points: semana.horas.map(h => `${xOf(h.hora)},${yOf(h[kpi], maxVal)}`).join(" "),
  }))

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const frac = (e.clientX - rect.left) / rect.width
    setHoverHour(Math.min(Math.max(Math.round(frac * 23), 0), 23))
  }

  const showingHover = hoverHour != null

  return (
    <div className="terry-card" style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 12 }}>

      {/* ── KPI pills ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
        {KPIS.map(k => (
          <button
            key={k.key}
            onClick={() => setKpi(k.key)}
            style={{
              padding: "4px 11px", borderRadius: 20, fontSize: 10.5, fontWeight: 500,
              fontFamily: "var(--font-mono)", cursor: "pointer", border: "1px solid",
              borderColor: kpi === k.key ? GREEN_DK : "rgba(10,10,10,0.12)",
              background:  kpi === k.key ? GREEN_BG : "white",
              color:       kpi === k.key ? GREEN_DK : INK50,
              transition: "all 0.12s",
            }}
          >
            {k.label}
          </button>
        ))}
      </div>

      {/* ── Legend / hover strip ── */}
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center", minHeight: 24 }}>
        {showingHover && (
          <span style={{
            fontSize: 10, fontFamily: "var(--font-mono)", fontWeight: 600,
            color: INK30, letterSpacing: "0.04em", textTransform: "uppercase", marginRight: 4,
          }}>
            {String(hoverHour).padStart(2, "0")}:00h
          </span>
        )}
        {weekLines.map(({ semana, color }, i) => {
          const val = showingHover
            ? semana.horas[hoverHour!][kpi]
            : null
          return (
            <div key={semana.label} style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <div style={{ width: 16, height: 2.5, background: color, borderRadius: 2, flexShrink: 0 }} />
              <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
                <span style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: INK50,
                  textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  {semana.label}
                </span>
                {val != null && (
                  <span style={{ fontSize: 13, fontFamily: "var(--font-mono)", fontWeight: 700,
                    color: INK, letterSpacing: "-0.02em" }}>
                    {selectedKpi.fmt(val)}
                  </span>
                )}
              </div>
            </div>
          )
        })}
        {!showingHover && (
          <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: INK30, marginLeft: "auto" }}>
            pasa el cursor para ver valores
          </span>
        )}
      </div>

      {/* ── SVG chart ── */}
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        style={{ width: "100%", height: 160, display: "block", cursor: "crosshair" }}
        preserveAspectRatio="none"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverHour(null)}
      >
        {/* Grid horizontal */}
        {[0.25, 0.5, 0.75, 1].map(pct => (
          <line key={pct}
            x1={0}     y1={yOf(maxVal * pct, maxVal)}
            x2={SVG_W} y2={yOf(maxVal * pct, maxVal)}
            stroke="rgba(10,10,10,0.06)" strokeWidth={1}
          />
        ))}

        {/* Lines per week (oldest first, newest on top) */}
        {weekLines.map(({ semana, points, color, width }) => (
          <polyline key={semana.label} points={points} fill="none"
            stroke={color} strokeWidth={width}
            strokeLinejoin="round" strokeLinecap="round"
          />
        ))}

        {/* Crosshair */}
        {showingHover && hoverHour != null && (
          <>
            <line
              x1={xOf(hoverHour)} y1={PAD_TOP}
              x2={xOf(hoverHour)} y2={CHART_B}
              stroke="rgba(10,10,10,0.18)" strokeWidth={1} strokeDasharray="4 3"
            />
            {weekLines.map(({ semana, color }, i) => {
              const v = semana.horas[hoverHour][kpi]
              return (
                <circle key={semana.label}
                  cx={xOf(hoverHour)} cy={yOf(v, maxVal)}
                  r={i === weekLines.length - 1 ? 4 : 3.5}
                  fill={color} stroke="white" strokeWidth={2}
                />
              )
            })}
          </>
        )}

        {/* Baseline eje X */}
        <line x1={0} y1={CHART_B} x2={SVG_W} y2={CHART_B} stroke="rgba(10,10,10,0.08)" strokeWidth={1} />

        {/* Labels eje X */}
        {[0, 6, 12, 18, 23].map(h => (
          <text key={h} x={xOf(h)} y={SVG_H - 2}
            textAnchor={h === 0 ? "start" : h === 23 ? "end" : "middle"}
            fontSize={9} fill="rgba(10,10,10,0.35)"
          >
            {h}h
          </text>
        ))}
      </svg>
    </div>
  )
}
