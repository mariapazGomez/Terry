import type { PuntoDia } from "@/lib/sumup/resumen"

const GREEN_DK = "#2d7a45"
const GREEN_LT = "#a3d4b4"
const INK50    = "rgba(10,10,10,0.52)"

const COLORS_2M = [GREEN_LT, GREEN_DK]

function fmtShort(v: number) {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000)     return `$${Math.round(v / 1_000)}k`
  return `$${v}`
}

function fmtFull(v: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency", currency: "CLP", maximumFractionDigits: 0,
  }).format(v)
}

function fmtFecha(fecha: string) {
  return `${fecha.slice(8)}/${fecha.slice(5, 7)}`
}

export default function Ventas3MesesBars({
  puntos,
  meses,
}: {
  puntos: PuntoDia[]
  meses:  string[]
}) {
  // Solo los últimos 2 meses
  const last2 = meses.slice(-2)

  if (last2.length === 0) {
    return (
      <div className="terry-card" style={{
        padding: "32px 24px", display: "flex", flexDirection: "column",
        alignItems: "center", textAlign: "center", gap: 8,
      }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: "#0a0a0a" }}>Sin datos de snapshot</p>
        <p style={{ fontSize: 11, color: INK50, fontFamily: "var(--font-mono)" }}>
          Ejecuta{" "}
          <code style={{ background: "rgba(10,10,10,0.06)", padding: "1px 5px", borderRadius: 4 }}>
            POST /api/sumup/snapshots/dia
          </code>{" "}
          para generar los datos.
        </p>
      </div>
    )
  }

  // Año y mes numérico de cada mes (de la primera fecha disponible)
  const mesInfo: Record<string, { year: number; month: number }> = {}
  for (const p of puntos) {
    if (!mesInfo[p.mes]) {
      const [y, m] = p.fecha.split("-").map(Number)
      mesInfo[p.mes] = { year: y, month: m }
    }
  }

  // Totales diarios por mes
  const totalPorMesDia: Record<string, Record<number, number>> = {}
  for (const mes of last2) totalPorMesDia[mes] = {}
  for (const p of puntos) {
    if (last2.includes(p.mes)) {
      const d = parseInt(p.fecha.split("-")[2])
      totalPorMesDia[p.mes][d] = p.total
    }
  }

  // Total mensual
  const totalPorMes: Record<string, number> = {}
  for (const mes of last2) {
    totalPorMes[mes] = Object.values(totalPorMesDia[mes]).reduce((s, v) => s + v, 0)
  }

  const colorPorMes: Record<string, string> = {}
  last2.forEach((mes, i) => { colorPorMes[mes] = COLORS_2M[i] })

  // Generar TODOS los días del calendario para cada mes
  type DayEntry = { fecha: string; mes: string; diaNum: number; total: number; hasData: boolean }
  const allDays: DayEntry[] = []

  for (const mes of last2) {
    const info = mesInfo[mes]
    if (!info) continue
    const diasEnMes = new Date(info.year, info.month, 0).getDate()
    for (let d = 1; d <= diasEnMes; d++) {
      const fecha = `${info.year}-${String(info.month).padStart(2, "0")}-${String(d).padStart(2, "0")}`
      const total = totalPorMesDia[mes][d] ?? 0
      allDays.push({ fecha, mes, diaNum: d, total, hasData: d in totalPorMesDia[mes] })
    }
  }

  const maxVal = Math.max(...allDays.map(d => d.total), 1)
  const n      = allDays.length

  // Índices del primer día de cada mes (para label eje X)
  const firstOfMonthIdx = new Set<number>()
  allDays.forEach((d, i) => {
    if (i === 0 || allDays[i - 1].mes !== d.mes) firstOfMonthIdx.add(i)
  })

  return (
    <div className="terry-card" style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
      <style>{`
        .bar3m-col {
          position: relative; flex: 1; display: flex;
          flex-direction: column; justify-content: flex-end;
          height: 100%; cursor: default;
        }
        .bar3m-tip {
          display: none; position: absolute; bottom: calc(100% + 7px); left: 50%;
          transform: translateX(-50%); background: #0a0a0a;
          color: rgba(255,255,255,0.90); padding: 5px 9px; border-radius: 6px;
          font-size: 10px; line-height: 1.55; white-space: nowrap; z-index: 30;
          font-family: var(--font-mono); pointer-events: none;
          box-shadow: 0 4px 12px rgba(0,0,0,0.18);
        }
        .bar3m-tip::after {
          content: ""; position: absolute; top: 100%; left: 50%;
          transform: translateX(-50%); border: 4px solid transparent;
          border-top-color: #0a0a0a;
        }
        .bar3m-col:hover .bar3m-tip { display: block; }
      `}</style>

      {/* ── Leyenda ── */}
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
        {last2.map((mes, mi) => {
          const total = totalPorMes[mes] ?? 0
          const prev  = mi > 0 ? (totalPorMes[last2[mi - 1]] ?? 0) : null
          const delta = prev && prev > 0 ? ((total - prev) / prev) * 100 : null
          const color = COLORS_2M[mi]
          return (
            <div key={mes} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: color, flexShrink: 0 }} />
              <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                <span style={{ fontSize: 9.5, fontFamily: "var(--font-mono)", color: INK50, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {mes}
                </span>
                <span style={{ fontSize: 15, fontFamily: "var(--font-mono)", fontWeight: 700, color: "#0a0a0a", letterSpacing: "-0.02em" }}>
                  {fmtShort(total)}
                </span>
                {delta !== null && (
                  <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", fontWeight: 600, color: delta >= 0 ? GREEN_DK : "#b91c1c" }}>
                    {delta >= 0 ? "+" : ""}{delta.toFixed(1)}%
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Barras ── */}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 1.5, height: 100 }}>
        {allDays.map((entry) => {
          const pct   = entry.hasData ? Math.max((entry.total / maxVal) * 100, 3) : 0
          const color = colorPorMes[entry.mes]
          return (
            <div key={entry.fecha} className="bar3m-col">
              <div className="bar3m-tip">
                <span style={{ color: "rgba(255,255,255,0.50)" }}>{fmtFecha(entry.fecha)}</span>
                <br />
                {entry.hasData ? fmtFull(entry.total) : "Sin ventas"}
              </div>
              {entry.hasData ? (
                <div style={{
                  width: "100%", height: `${pct}%`,
                  background: color, borderRadius: "2px 2px 0 0",
                }} />
              ) : (
                <div style={{
                  width: "100%", height: "2px",
                  background: "rgba(10,10,10,0.08)", borderRadius: 1,
                }} />
              )}
            </div>
          )
        })}
      </div>

      {/* ── Eje X ── */}
      <div style={{ position: "relative", height: 18, marginTop: -6 }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, borderTop: "1px solid rgba(10,10,10,0.07)" }} />
        {allDays.map((entry, i) =>
          firstOfMonthIdx.has(i) ? (
            <div key={entry.fecha} style={{
              position: "absolute",
              left: `${(i / n) * 100}%`,
              top: 4,
              fontSize: 9,
              fontFamily: "var(--font-mono)",
              color: "rgba(10,10,10,0.40)",
              whiteSpace: "nowrap",
            }}>
              {fmtFecha(entry.fecha)}
            </div>
          ) : null
        )}
      </div>
    </div>
  )
}
