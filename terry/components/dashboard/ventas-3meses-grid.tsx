import type { PuntoDia } from "@/lib/sumup/resumen"

const DIAS_CORTOS  = ["L","M","X","J","V","S","D"]
const DIAS_NOMBRES = ["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"]
const GREEN = "oklch(0.62 0.15 145)"

function fmt(v: number) {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000)     return `$${Math.round(v / 1_000)}k`
  return `$${v}`
}

export default function Ventas3MesesGrid({
  puntos,
  meses,
}: {
  puntos: PuntoDia[]
  meses: string[]
}) {
  // Índice: mes → semana (1-4) → código de día → total
  const idx: Record<string, Record<number, Record<string, number>>> = {}
  for (const mes of meses) {
    idx[mes] = { 1: {}, 2: {}, 3: {}, 4: {} }
  }
  for (const p of puntos) {
    if (idx[p.mes]?.[p.semana] !== undefined) {
      idx[p.mes][p.semana][p.dia] = p.total
    }
  }

  // Máximo global para escalar la barra de fondo
  const maxTotal = Math.max(...puntos.map(p => p.total), 1)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {meses.map((mes) => (
        <div key={mes}>
          <div style={{
            fontSize: 10, fontFamily: "var(--font-mono)", color: "rgba(10,10,10,0.50)",
            textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 500, marginBottom: 10,
          }}>
            {mes}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
            {([1, 2, 3, 4] as const).map((sem) => {
              const semDias = idx[mes]?.[sem] ?? {}
              const hayDatos = Object.values(semDias).some(v => v > 0)

              return (
                <div
                  key={sem}
                  className="terry-card"
                  style={{ padding: "10px 12px", opacity: hayDatos ? 1 : 0.45 }}
                >
                  <div style={{
                    fontSize: 8.5, fontFamily: "var(--font-mono)", fontWeight: 600,
                    color: "rgba(10,10,10,0.38)", letterSpacing: "0.06em",
                    textTransform: "uppercase", marginBottom: 10,
                  }}>
                    S{sem}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    {DIAS_NOMBRES.map((nombre, i) => {
                      const codigo = DIAS_CORTOS[i]
                      const total  = semDias[codigo]
                      const existe = total !== undefined
                      const pct    = existe && total > 0 ? (total / maxTotal) * 100 : 0

                      return (
                        <div key={nombre} style={{ position: "relative" }}>
                          {/* barra de fondo proporcional */}
                          {pct > 0 && (
                            <div style={{
                              position: "absolute", left: 0, top: 0, bottom: 0,
                              width: `${pct}%`, background: "rgba(10,10,10,0.04)",
                              borderRadius: 3,
                            }} />
                          )}
                          <div style={{
                            position: "relative",
                            display: "flex", justifyContent: "space-between", alignItems: "center",
                            padding: "1px 4px",
                          }}>
                            <span style={{
                              fontSize: 10, color: "rgba(10,10,10,0.50)",
                              fontFamily: "var(--font-mono)",
                            }}>
                              {nombre}
                            </span>
                            <span style={{
                              fontSize: 10, fontFamily: "var(--font-mono)", fontWeight: 500,
                              color: existe && total > 0 ? "#0a0a0a" : "rgba(10,10,10,0.22)",
                            }}>
                              {existe ? (total > 0 ? fmt(total) : "—") : "·"}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
