import { createServiceClient } from "@/lib/supabase/service-client"
import SyncButton from "@/components/dashboard/sync-button"
import SyncHistoricoButton from "@/components/dashboard/sync-historico-button"

const INK    = "#0a0a0a"
const INK50  = "rgba(10,10,10,0.52)"
const INK30  = "rgba(10,10,10,0.30)"
const INK08  = "rgba(10,10,10,0.07)"
const GREEN  = "oklch(0.62 0.15 145)"
const GREEN_BG = "oklch(0.94 0.05 145)"

function formatCLP(n: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency", currency: "CLP", maximumFractionDigits: 0,
  }).format(n)
}

function formatFecha(iso: string) {
  return new Date(iso).toLocaleDateString("es-CL", {
    timeZone: "America/Santiago",
    day: "2-digit", month: "2-digit", year: "numeric",
  })
}

function formatHora(iso: string) {
  return new Date(iso).toLocaleTimeString("es-CL", {
    timeZone: "America/Santiago",
    hour: "2-digit", minute: "2-digit",
  })
}

function labelMedio(payment_type: string, card_type?: string | null) {
  if (payment_type === "CASH") return "Efectivo"
  if (card_type) return card_type.charAt(0) + card_type.slice(1).toLowerCase()
  return "Tarjeta"
}

type Transaccion = {
  id: string
  sumup_id: string
  transaction_code: string
  amount: number
  payment_type: string
  card_type: string | null
  status: string
  timestamp: string
  payout_date: string | null
  sincronizado_en: string
}

export default async function VentasPage() {
  const supabase = createServiceClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("sumup_transacciones")
    .select("*")
    .order("timestamp", { ascending: false })
    .limit(200)

  const transacciones: Transaccion[] = data ?? []
  const total = transacciones.reduce((s: number, t: Transaccion) => s + t.amount, 0)
  const count = transacciones.length

  return (
    <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: INK, letterSpacing: "-0.02em", margin: 0 }}>
            Ventas SumUp
          </h1>
          <p style={{ fontSize: 12, color: INK50, marginTop: 4, fontFamily: "var(--font-mono)" }}>
            {count} transacciones almacenadas · {count > 0 ? `total ${formatCLP(total)}` : "sin datos — sincroniza para empezar"}
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
          <SyncButton />
          <SyncHistoricoButton />
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div style={{ padding: 12, background: "oklch(0.94 0.05 27)", borderRadius: 8, fontSize: 12, color: "oklch(0.58 0.19 27)" }}>
          Error al cargar datos: {error.message}
        </div>
      )}

      {/* Empty state */}
      {count === 0 && !error && (
        <div
          className="terry-card"
          style={{ padding: "48px 24px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}
        >
          <p style={{ fontSize: 14, fontWeight: 600, color: INK }}>Sin transacciones almacenadas</p>
          <p style={{ fontSize: 12, color: INK50, marginTop: 4 }}>
            Haz clic en &ldquo;Sincronizar SumUp&rdquo; para importar las últimas transacciones.
          </p>
        </div>
      )}

      {/* Table */}
      {count > 0 && (
        <div className="terry-card" style={{ overflow: "hidden" }}>
          {/* Table header */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "110px 70px 1fr 130px 120px 100px",
            padding: "9px 16px",
            borderBottom: `1px solid ${INK08}`,
            fontFamily: "var(--font-mono)", fontSize: 9.5, fontWeight: 500,
            color: INK50, letterSpacing: "0.04em", textTransform: "uppercase",
            background: "white", position: "sticky", top: 0,
          }}>
            <div>Fecha</div>
            <div>Hora</div>
            <div>Código</div>
            <div>Medio</div>
            <div style={{ textAlign: "right" }}>Monto</div>
            <div style={{ textAlign: "right" }}>Cobro</div>
          </div>

          {/* Rows */}
          <div style={{ maxHeight: 560, overflowY: "auto" }}>
            {transacciones.map((t: Transaccion, i: number) => (
              <div
                key={t.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "110px 70px 1fr 130px 120px 100px",
                  padding: "9px 16px",
                  borderBottom: i < count - 1 ? `1px solid ${INK08}` : "none",
                  fontSize: 12, color: INK, alignItems: "center",
                  background: i % 2 === 0 ? "white" : "rgba(10,10,10,0.015)",
                }}
              >
                <div style={{ fontFamily: "var(--font-mono)", color: INK50, fontSize: 11 }}>
                  {formatFecha(t.timestamp)}
                </div>
                <div style={{ fontFamily: "var(--font-mono)", color: INK50, fontSize: 11 }}>
                  {formatHora(t.timestamp)}
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: INK30 }}>
                  {t.transaction_code ?? "—"}
                </div>
                <div>
                  <span style={{
                    display: "inline-block",
                    padding: "2px 7px", borderRadius: 4, fontSize: 10.5,
                    background: t.payment_type === "CASH" ? INK08 : GREEN_BG,
                    color: t.payment_type === "CASH" ? INK50 : GREEN,
                    fontFamily: "var(--font-mono)",
                  }}>
                    {labelMedio(t.payment_type, t.card_type)}
                  </span>
                </div>
                <div style={{ textAlign: "right", fontFamily: "var(--font-mono)", fontWeight: 600 }}>
                  {formatCLP(t.amount)}
                </div>
                <div style={{ textAlign: "right", fontFamily: "var(--font-mono)", fontSize: 11, color: INK50 }}>
                  {t.payout_date ?? "—"}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
