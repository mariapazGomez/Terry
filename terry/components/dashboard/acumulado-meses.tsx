"use client"

import { useState } from "react"
import type { PuntoDia } from "@/lib/sumup/resumen"

const GREEN_DK = "#2d7a45"
const GREEN_LT = "#a3d4b4"
const INK50    = "rgba(10,10,10,0.52)"
const INK30    = "rgba(10,10,10,0.30)"

function fmtShort(v: number) {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000)     return `$${Math.round(v / 1_000)}k`
  return `$${v}`
}

const SVG_W   = 600
const SVG_H   = 130
const CHART_B = 110
const PAD_TOP = 10
const chartH  = CHART_B - PAD_TOP
const MAX_DIA = 31

const xOf = (d: number) => ((d - 1) / (MAX_DIA - 1)) * SVG_W
const yOf = (v: number, maxCum: number) => PAD_TOP + chartH - (v / maxCum) * chartH

export default function AcumuladoMeses({
  puntos,
  meses,
}: {
  puntos: PuntoDia[]
  meses:  string[]
}) {
  const [hoverDay, setHoverDay] = useState<number | null>(null)

  const last2 = meses.slice(-2)
  if (last2.length < 2) {
    return (
      <div className="terry-card" style={{
        padding: "32px 24px", display: "flex", flexDirection: "column",
        alignItems: "center", textAlign: "center", gap: 8,
      }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: "#0a0a0a" }}>Sin datos suficientes</p>
        <p style={{ fontSize: 11, color: INK50, fontFamily: "var(--font-mono)" }}>
          Se necesitan al menos 2 meses de historial.
        </p>
      </div>
    )
  }

  const [mesPrev, mesCurr] = last2

  const diasPrev: Record<number, number> = {}
  const diasCurr: Record<number, number> = {}
  for (const p of puntos) {
    const d = parseInt(p.fecha.split("-")[2])
    if (p.mes === mesPrev) diasPrev[d] = p.total
    if (p.mes === mesCurr) diasCurr[d] = p.total
  }

  const maxDiaPrev = Math.max(...Object.keys(diasPrev).map(Number), 0)
  const maxDiaCurr = Math.max(...Object.keys(diasCurr).map(Number), 0)

  type Pt = { d: number; cum: number }
  const ptsPrev: Pt[] = []
  const ptsCurr: Pt[] = []
  const cumMapPrev: Record<number, number> = {}
  const cumMapCurr: Record<number, number> = {}

  let cumPrev = 0
  for (let d = 1; d <= maxDiaPrev; d++) {
    cumPrev += diasPrev[d] ?? 0
    ptsPrev.push({ d, cum: cumPrev })
    cumMapPrev[d] = cumPrev
  }

  let cumCurr = 0
  for (let d = 1; d <= maxDiaCurr; d++) {
    cumCurr += diasCurr[d] ?? 0
    ptsCurr.push({ d, cum: cumCurr })
    cumMapCurr[d] = cumCurr
  }

  const totalPrev = cumPrev
  const totalCurr = cumCurr

  // Delta al mismo día del mes
  let cumPrevAlDiaCurr = 0
  for (let d = 1; d <= maxDiaCurr; d++) cumPrevAlDiaCurr += diasPrev[d] ?? 0
  const deltaDefault = cumPrevAlDiaCurr > 0
    ? ((totalCurr - cumPrevAlDiaCurr) / cumPrevAlDiaCurr) * 100
    : null

  const maxCum = Math.max(totalPrev, totalCurr, 1)

  // Valores en el día hover
  const hoverValPrev = hoverDay != null
    ? (hoverDay <= maxDiaPrev ? (cumMapPrev[hoverDay] ?? null) : totalPrev)
    : null
  const hoverValCurr = hoverDay != null
    ? (hoverDay <= maxDiaCurr ? (cumMapCurr[hoverDay] ?? null) : null)
    : null
  const hoverDelta = hoverValPrev && hoverValCurr && hoverValPrev > 0
    ? ((hoverValCurr - hoverValPrev) / hoverValPrev) * 100
    : null

  const ptsStrPrev = ptsPrev.map(p => `${xOf(p.d)},${yOf(p.cum, maxCum)}`).join(" ")
  const ptsStrCurr = ptsCurr.map(p => `${xOf(p.d)},${yOf(p.cum, maxCum)}`).join(" ")
  const lastCurr   = ptsCurr[ptsCurr.length - 1]

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const frac = (e.clientX - rect.left) / rect.width
    const day  = Math.round(frac * (MAX_DIA - 1)) + 1
    setHoverDay(Math.min(Math.max(day, 1), MAX_DIA))
  }

  // KPI dinámica: muestra valores del día hover o totales por defecto
  const showingHover = hoverDay != null

  return (
    <div className="terry-card" style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 12 }}>

      {/* ── KPI strip — cambia con el hover ── */}
      <div style={{ display: "flex", gap: 24, flexWrap: "wrap", minHeight: 28, alignItems: "center" }}>

        {showingHover && (
          <span style={{
            fontSize: 10, fontFamily: "var(--font-mono)", fontWeight: 600,
            color: INK30, letterSpacing: "0.04em", textTransform: "uppercase",
            marginRight: 4,
          }}>
            día {hoverDay}
          </span>
        )}

        {/* Mes anterior */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 16, height: 2.5, background: GREEN_LT, borderRadius: 2, flexShrink: 0 }} />
          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            <span style={{ fontSize: 9.5, fontFamily: "var(--font-mono)", color: INK50, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {mesPrev}
            </span>
            <span style={{ fontSize: 15, fontFamily: "var(--font-mono)", fontWeight: 700, color: "#0a0a0a", letterSpacing: "-0.02em" }}>
              {showingHover
                ? (hoverValPrev != null ? fmtShort(hoverValPrev) : "—")
                : fmtShort(totalPrev)}
            </span>
            {!showingHover && (
              <span style={{ fontSize: 9.5, fontFamily: "var(--font-mono)", color: INK50 }}>total</span>
            )}
          </div>
        </div>

        {/* Mes actual */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 16, height: 2.5, background: GREEN_DK, borderRadius: 2, flexShrink: 0 }} />
          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            <span style={{ fontSize: 9.5, fontFamily: "var(--font-mono)", color: INK50, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {mesCurr}
            </span>
            <span style={{ fontSize: 15, fontFamily: "var(--font-mono)", fontWeight: 700, color: "#0a0a0a", letterSpacing: "-0.02em" }}>
              {showingHover
                ? (hoverValCurr != null ? fmtShort(hoverValCurr) : "—")
                : fmtShort(totalCurr)}
            </span>
            {(() => {
              const delta = showingHover ? hoverDelta : deltaDefault
              const label = showingHover ? "" : ` al día ${maxDiaCurr}`
              if (delta == null) return null
              return (
                <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", fontWeight: 600, color: delta >= 0 ? GREEN_DK : "#b91c1c" }}>
                  {delta >= 0 ? "+" : ""}{delta.toFixed(1)}%{label}
                </span>
              )
            })()}
          </div>
        </div>
      </div>

      {/* ── SVG ── */}
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        style={{ width: "100%", height: 155, display: "block", cursor: "crosshair" }}
        preserveAspectRatio="none"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverDay(null)}
      >
        {/* Grid horizontal */}
        {[0.25, 0.5, 0.75, 1].map(pct => (
          <line
            key={pct}
            x1={0}     y1={yOf(maxCum * pct, maxCum)}
            x2={SVG_W} y2={yOf(maxCum * pct, maxCum)}
            stroke="rgba(10,10,10,0.06)" strokeWidth={1}
          />
        ))}

        {/* Línea mes anterior */}
        {ptsStrPrev && (
          <polyline points={ptsStrPrev} fill="none" stroke={GREEN_LT} strokeWidth={2}
            strokeLinejoin="round" strokeLinecap="round" />
        )}

        {/* Línea mes actual */}
        {ptsStrCurr && (
          <polyline points={ptsStrCurr} fill="none" stroke={GREEN_DK} strokeWidth={2.5}
            strokeLinejoin="round" strokeLinecap="round" />
        )}

        {/* Punto "hoy" — se oculta cuando hay crosshair */}
        {lastCurr && !showingHover && (
          <circle cx={xOf(lastCurr.d)} cy={yOf(lastCurr.cum, maxCum)}
            r={4} fill={GREEN_DK} stroke="white" strokeWidth={2} />
        )}

        {/* Crosshair */}
        {showingHover && hoverDay != null && (
          <>
            <line
              x1={xOf(hoverDay)} y1={PAD_TOP}
              x2={xOf(hoverDay)} y2={CHART_B}
              stroke="rgba(10,10,10,0.18)" strokeWidth={1} strokeDasharray="4 3"
            />
            {hoverValPrev != null && hoverDay <= maxDiaPrev && (
              <circle cx={xOf(hoverDay)} cy={yOf(hoverValPrev, maxCum)}
                r={4} fill={GREEN_LT} stroke="white" strokeWidth={2} />
            )}
            {hoverValCurr != null && (
              <circle cx={xOf(hoverDay)} cy={yOf(hoverValCurr, maxCum)}
                r={4} fill={GREEN_DK} stroke="white" strokeWidth={2} />
            )}
          </>
        )}

        {/* Baseline eje X */}
        <line x1={0} y1={CHART_B} x2={SVG_W} y2={CHART_B} stroke="rgba(10,10,10,0.08)" strokeWidth={1} />

        {/* Labels eje X */}
        {[1, 10, 20, 31].map(d => (
          <text key={d} x={xOf(d)} y={SVG_H - 2}
            textAnchor={d === 1 ? "start" : d === 31 ? "end" : "middle"}
            fontSize={9} fill="rgba(10,10,10,0.35)">
            {d}
          </text>
        ))}
      </svg>
    </div>
  )
}
