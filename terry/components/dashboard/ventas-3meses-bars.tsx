import type { PuntoDia } from "@/lib/sumup/resumen"

const GREEN     = "oklch(0.62 0.15 145)"
const GREEN_HEX = "#2d7a45"
const RED_HEX   = "#b91c1c"

const MESES_ABREV = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"]

function fmt(v: number) {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000)     return `$${Math.round(v / 1_000)}k`
  return `$${v}`
}

function fmtFull(v: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency", currency: "CLP", maximumFractionDigits: 0,
  }).format(v)
}

export default function Ventas3MesesBars({
  puntos,
  meses,
}: {
  puntos: PuntoDia[]
  meses: string[]
}) {
  type DiaInfo = { total: number; fecha: string; dia: string }
  type MesInfo = {
    total:    number
    dias:     Record<number, DiaInfo>   // dia_num → datos
    numDias:  number                    // días totales del mes (para el eje X)
    bestDia:  { label: string; total: number } | null
  }

  const byMes: Record<string, MesInfo> = {}
  for (const mes of meses) {
    byMes[mes] = { total: 0, dias: {}, numDias: 0, bestDia: null }
  }

  for (const p of puntos) {
    if (!byMes[p.mes]) continue
    const info   = byMes[p.mes]
    const diaNum = parseInt(p.fecha.split("-")[2])

    info.total += p.total
    info.dias[diaNum] = { total: p.total, fecha: p.fecha, dia: p.dia }
    if (diaNum > info.numDias) info.numDias = diaNum

    if (p.total > 0 && (!info.bestDia || p.total > info.bestDia.total)) {
      const [, fm, fd] = p.fecha.split("-").map(Number)
      info.bestDia = {
        label: `${fd} ${MESES_ABREV[fm - 1]} · ${p.dia}`,
        total: p.total,
      }
    }
  }

  if (meses.length === 0) {
    return (
      <div className="terry-card" style={{
        padding: "32px 24px", display: "flex", flexDirection: "column",
        alignItems: "center", textAlign: "center", gap: 8,
      }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: "#0a0a0a" }}>Sin datos de snapshot</p>
        <p style={{ fontSize: 11, color: "rgba(10,10,10,0.50)", fontFamily: "var(--font-mono)" }}>
          Ejecuta <code style={{ background: "rgba(10,10,10,0.06)", padding: "1px 5px", borderRadius: 4 }}>
            POST /api/sumup/snapshots/dia
          </code> para generar los datos.
        </p>
      </div>
    )
  }

  return (
    <>
      <style>{`
        .dia-col { position: relative; flex: 1; display: flex; flex-direction: column; justify-content: flex-end; height: 100%; cursor: default; }
        .dia-tip {
          display: none;
          position: absolute;
          bottom: calc(100% + 7px);
          left: 50%;
          transform: translateX(-50%);
          background: #0a0a0a;
          color: rgba(255,255,255,0.90);
          padding: 5px 9px;
          border-radius: 6px;
          font-size: 10px;
          line-height: 1.55;
          white-space: nowrap;
          z-index: 30;
          font-family: var(--font-mono);
          pointer-events: none;
          box-shadow: 0 4px 12px rgba(0,0,0,0.18);
        }
        .dia-tip::after {
          content: "";
          position: absolute;
          top: 100%; left: 50%;
          transform: translateX(-50%);
          border: 4px solid transparent;
          border-top-color: #0a0a0a;
        }
        .dia-col:hover .dia-tip { display: block; }
      `}</style>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {meses.map((mes, mi) => {
          const info    = byMes[mes]
          const maxDia  = Math.max(info.numDias, 28)
          const maxVal  = Math.max(...Object.values(info.dias).map(d => d.total), 1)
          const prev    = mi > 0 ? byMes[meses[mi - 1]] : null
          const delta   = prev && prev.total > 0
            ? ((info.total - prev.total) / prev.total) * 100
            : null

          return (
            <div
              key={mes}
              className="terry-card"
              style={{ padding: "16px 16px 14px", display: "flex", flexDirection: "column", gap: 12 }}
            >
              {/* ── KPI header ──────────────────────────────── */}
              <div>
                <div style={{
                  fontSize: 9.5, fontFamily: "var(--font-mono)", fontWeight: 500,
                  color: "rgba(10,10,10,0.42)", textTransform: "uppercase",
                  letterSpacing: "0.06em", marginBottom: 5,
                }}>
                  {mes}
                </div>
                <div style={{
                  fontFamily: "var(--font-mono)", fontSize: 26, fontWeight: 700,
                  color: "#0a0a0a", letterSpacing: "-0.02em", lineHeight: 1,
                }}>
                  {fmt(info.total)}
                </div>
                {delta !== null && (
                  <div style={{
                    display: "flex", alignItems: "center", gap: 5,
                    marginTop: 4, fontSize: 10, fontFamily: "var(--font-mono)",
                  }}>
                    <span style={{ color: delta >= 0 ? GREEN_HEX : RED_HEX, fontWeight: 600 }}>
                      {delta >= 0 ? "+" : ""}{delta.toFixed(1)}%
                    </span>
                    <span style={{ color: "rgba(10,10,10,0.35)" }}>vs {meses[mi - 1]}</span>
                  </div>
                )}
              </div>

              {/* ── Barras diarias ──────────────────────────── */}
              <div>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 1.5, height: 80 }}>
                  {Array.from({ length: maxDia }, (_, i) => i + 1).map((diaNum) => {
                    const d   = info.dias[diaNum]
                    const pct = d ? Math.max((d.total / maxVal) * 100, 3) : 0

                    return (
                      <div key={diaNum} className="dia-col">
                        {d && (
                          <div className="dia-tip">
                            <span style={{ color: "rgba(255,255,255,0.50)" }}>{diaNum} {MESES_ABREV[parseInt(d.fecha.split("-")[1]) - 1]} · {d.dia}</span>
                            <br />
                            {fmtFull(d.total)}
                          </div>
                        )}
                        <div style={{
                          width: "100%",
                          height: pct > 0 ? `${pct}%` : "2px",
                          background: pct > 0 ? GREEN : "rgba(10,10,10,0.07)",
                          borderRadius: "2px 2px 0 0",
                        }} />
                      </div>
                    )
                  })}
                </div>

                {/* X-axis: solo días 1, 10, 20 y el último */}
                <div style={{
                  display: "flex", gap: 1.5,
                  borderTop: "1px solid rgba(10,10,10,0.07)",
                  paddingTop: 3, marginTop: 1,
                }}>
                  {Array.from({ length: maxDia }, (_, i) => i + 1).map((diaNum) => (
                    <div key={diaNum} style={{
                      flex: 1, textAlign: "center",
                      fontSize: 7, fontFamily: "var(--font-mono)",
                      color: "rgba(10,10,10,0.35)",
                    }}>
                      {[1, 10, 20, maxDia].includes(diaNum) ? diaNum : ""}
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Mejor día ───────────────────────────────── */}
              {info.bestDia && (
                <div style={{ borderTop: "1px solid rgba(10,10,10,0.07)", paddingTop: 10 }}>
                  <div style={{
                    fontSize: 8.5, fontFamily: "var(--font-mono)",
                    color: "rgba(10,10,10,0.35)", textTransform: "uppercase",
                    letterSpacing: "0.05em", marginBottom: 3,
                  }}>
                    Mejor día
                  </div>
                  <div style={{ fontSize: 9.5, fontFamily: "var(--font-mono)", color: "rgba(10,10,10,0.55)", marginBottom: 1 }}>
                    {info.bestDia.label}
                  </div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 600, color: "#0a0a0a" }}>
                    {fmtFull(info.bestDia.total)}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}
