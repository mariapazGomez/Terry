import Link from "next/link"
import { getResumenVentas } from "@/lib/sumup/resumen"
import { createServiceClient } from "@/lib/supabase/service-client"

const INK      = "#0a0a0a"
const INK50    = "rgba(10,10,10,0.52)"
const INK30    = "rgba(10,10,10,0.30)"
const INK08    = "rgba(10,10,10,0.07)"
const GREEN    = "oklch(0.62 0.15 145)"
const GREEN_BG = "oklch(0.94 0.05 145)"

function formatCLP(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(0)}k`
  return new Intl.NumberFormat("es-CL", {
    style: "currency", currency: "CLP", maximumFractionDigits: 0,
  }).format(n)
}

function formatHora(iso: string) {
  return new Date(iso).toLocaleTimeString("es-CL", {
    timeZone: "America/Santiago", hour: "2-digit", minute: "2-digit",
  })
}

function labelPago(payment_type: string, card_type?: string | null) {
  if (payment_type === "CASH") return "Efectivo"
  if (card_type) return card_type.charAt(0) + card_type.slice(1).toLowerCase()
  return "Tarjeta"
}

function inicioHoySantiago(): string {
  const hoy = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Santiago" }).format(new Date())
  return new Date(`${hoy}T00:00:00-04:00`).toISOString()
}

type Tx = {
  id: string
  amount: number
  payment_type: string
  card_type: string | null
  timestamp: string
  transaction_code: string | null
}

const MAX_TX_PREVIEW = 6

export default async function VentasHoy() {
  const supabase = createServiceClient()

  const [resumen, txData] = await Promise.all([
    getResumenVentas(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("sumup_transacciones")
      .select("id, amount, payment_type, card_type, timestamp, transaction_code")
      .eq("status", "SUCCESSFUL")
      .gte("timestamp", inicioHoySantiago())
      .order("timestamp", { ascending: false })
      .limit(MAX_TX_PREVIEW + 1),
  ])

  const txsHoy: Tx[] = txData.data ?? []
  const hayMas = txsHoy.length > MAX_TX_PREVIEW
  const txsVista = txsHoy.slice(0, MAX_TX_PREVIEW)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      {/* ── Cabecera ── */}
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
        <span style={{ fontSize: 11, color: INK50, fontFamily: "var(--font-mono)", letterSpacing: "0.05em", textTransform: "uppercase", fontWeight: 500 }}>
          Ventas SumUp
        </span>
        <Link href="/dashboard/ventas" style={{ fontSize: 11, color: INK50, fontFamily: "var(--font-mono)", textDecoration: "none" }}>
          ver historial →
        </Link>
      </div>

      {/* ── KPI strip: Hoy / Semana / Mes ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {[
          { label: "Hoy",           value: resumen.totalHoy,    sub: `${resumen.countHoy} transacciones`, highlight: true },
          { label: "Esta semana",   value: resumen.totalSemana, sub: "lunes a hoy" },
          { label: "Mes acumulado", value: resumen.totalMes,    sub: "mes en curso" },
        ].map(({ label, value, sub, highlight }) => (
          <div key={label} className="terry-card" style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ fontSize: 11, color: INK50, fontFamily: "var(--font-mono)", letterSpacing: "0.04em", textTransform: "uppercase", fontWeight: 500 }}>
              {label}
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 26, fontWeight: 600, color: highlight ? GREEN : INK, letterSpacing: "-0.02em", lineHeight: 1.05 }}>
              {formatCLP(value)}
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: INK50 }}>
              {sub}
            </div>
          </div>
        ))}
      </div>

      {/* ── Transacciones de hoy ── */}
      <div className="terry-card" style={{ overflow: "hidden" }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "10px 14px", borderBottom: `1px solid ${INK08}`,
          fontFamily: "var(--font-mono)", fontSize: 9.5, fontWeight: 500,
          color: INK50, letterSpacing: "0.04em", textTransform: "uppercase",
        }}>
          <span>Transacciones de hoy</span>
          <span style={{ fontWeight: 400 }}>{resumen.countHoy} ventas</span>
        </div>

        {txsVista.length === 0 ? (
          <div style={{ padding: "24px 14px", textAlign: "center" }}>
            <p style={{ fontSize: 12, color: INK30, fontFamily: "var(--font-mono)" }}>
              Sin ventas hoy · sincroniza SumUp
            </p>
          </div>
        ) : (
          <>
            {/* Column headers */}
            <div style={{
              display: "grid", gridTemplateColumns: "55px 1fr 110px 90px",
              padding: "7px 14px", borderBottom: `1px solid ${INK08}`,
              fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 500,
              color: INK50, letterSpacing: "0.04em", textTransform: "uppercase",
            }}>
              <div>Hora</div><div>Código</div><div>Medio</div>
              <div style={{ textAlign: "right" }}>Monto</div>
            </div>

            {txsVista.map((t, i) => (
              <div key={t.id} style={{
                display: "grid", gridTemplateColumns: "55px 1fr 110px 90px",
                padding: "8px 14px",
                borderBottom: i < txsVista.length - 1 ? `1px solid ${INK08}` : "none",
                fontSize: 11.5, color: INK, alignItems: "center",
              }}>
                <div style={{ fontFamily: "var(--font-mono)", color: INK50, fontSize: 10.5 }}>{formatHora(t.timestamp)}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: INK50 }}>{t.transaction_code ?? "—"}</div>
                <div>
                  <span style={{
                    display: "inline-block", padding: "2px 6px", borderRadius: 4, fontSize: 10,
                    background: t.payment_type === "CASH" ? INK08 : GREEN_BG,
                    color: t.payment_type === "CASH" ? INK50 : GREEN,
                    fontFamily: "var(--font-mono)",
                  }}>
                    {labelPago(t.payment_type, t.card_type)}
                  </span>
                </div>
                <div style={{ textAlign: "right", fontFamily: "var(--font-mono)", fontWeight: 600 }}>{formatCLP(t.amount)}</div>
              </div>
            ))}

            {hayMas && (
              <div style={{ padding: "10px 14px", borderTop: `1px solid ${INK08}`, textAlign: "center" }}>
                <Link href="/dashboard/ventas" style={{ fontSize: 11, color: INK50, fontFamily: "var(--font-mono)", textDecoration: "none" }}>
                  Ver todas las transacciones →
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
