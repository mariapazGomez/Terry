const INK   = "#0a0a0a"
const INK50 = "rgba(10,10,10,0.52)"
const INK30 = "rgba(10,10,10,0.30)"
const INK15 = "rgba(10,10,10,0.13)"
const GREEN = "oklch(0.62 0.15 145)"
const RED   = "oklch(0.58 0.19 27)"

function fmt(n: number) {
  const abs = Math.abs(n)
  const s   = n < 0 ? "-" : ""
  if (abs >= 1_000_000) return `${s}$${(abs / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000)     return `${s}$${Math.round(abs / 1_000)}k`
  return `${s}$${abs.toLocaleString("es-CL")}`
}

export default function BalanceMes({
  ventasMes,
  gastosMes,
  periodo,
}: {
  ventasMes: number
  gastosMes: number
  periodo:   string
}) {
  const balance = ventasMes - gastosMes
  const margen  = ventasMes > 0 ? (balance / ventasMes) * 100 : 0
  const positivo = balance >= 0
  const barPct   = ventasMes > 0 ? Math.min((gastosMes / ventasMes) * 100, 100) : 0

  return (
    <div className="terry-card" style={{ padding: "20px 24px" }}>
      {/* Cabecera */}
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 20 }}>
        <span style={{ fontSize: 11, color: INK50, fontFamily: "var(--font-mono)", letterSpacing: "0.05em", textTransform: "uppercase", fontWeight: 500 }}>
          Balance del mes
        </span>
        <span style={{ fontSize: 11, color: INK50, fontFamily: "var(--font-mono)", textTransform: "capitalize" }}>
          {periodo}
        </span>
      </div>

      {/* Tres columnas: ventas · gastos · balance */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr auto 1fr", alignItems: "center", gap: 8, marginBottom: 20 }}>

        {/* Ventas */}
        <div>
          <div style={{ fontSize: 10, color: INK30, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>
            Ventas SumUp
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 22, fontWeight: 700, color: GREEN, letterSpacing: "-0.02em" }}>
            {fmt(ventasMes)}
          </div>
        </div>

        {/* Separador − */}
        <div style={{ fontSize: 18, color: INK30, fontWeight: 300, padding: "0 4px" }}>−</div>

        {/* Gastos */}
        <div>
          <div style={{ fontSize: 10, color: INK30, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>
            Gastos registrados
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 22, fontWeight: 700, color: RED, letterSpacing: "-0.02em" }}>
            {fmt(gastosMes)}
          </div>
        </div>

        {/* Separador = */}
        <div style={{ fontSize: 18, color: INK30, fontWeight: 300, padding: "0 4px" }}>=</div>

        {/* Balance */}
        <div>
          <div style={{ fontSize: 10, color: INK30, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>
            Balance
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 22, fontWeight: 700, color: positivo ? GREEN : RED, letterSpacing: "-0.02em" }}>
            {fmt(balance)}
          </div>
        </div>
      </div>

      {/* Barra de proporción gastos / ventas */}
      <div>
        <div style={{ height: 6, borderRadius: 3, background: INK15, overflow: "hidden", marginBottom: 8 }}>
          <div style={{
            height: "100%",
            width: `${barPct}%`,
            borderRadius: 3,
            background: barPct > 80 ? RED : barPct > 60 ? "oklch(0.75 0.14 75)" : GREEN,
            transition: "width 0.4s ease",
          }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 10, color: INK50, fontFamily: "var(--font-mono)" }}>
            {ventasMes === 0 ? "Sin ventas registradas" : `Gastos = ${barPct.toFixed(1)}% de las ventas`}
          </span>
          <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", fontWeight: 600, color: positivo ? GREEN : RED }}>
            {ventasMes > 0 ? `${positivo ? "+" : ""}${margen.toFixed(1)}% margen` : "—"}
          </span>
        </div>
      </div>
    </div>
  )
}
