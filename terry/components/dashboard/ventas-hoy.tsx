import { getResumenVentas } from "@/lib/sumup/resumen"
import { createServiceClient } from "@/lib/supabase/service-client"
import TerryPanel from "./terry-panel"
import { VentasSemanasChartWrapper, VentasMesChartWrapper } from "./charts-wrapper"

const INK     = "#0a0a0a"
const INK50   = "rgba(10,10,10,0.52)"
const INK30   = "rgba(10,10,10,0.30)"
const INK08   = "rgba(10,10,10,0.07)"
const GREEN   = "oklch(0.62 0.15 145)"
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
      .limit(100),
  ])

  const txsHoy: Tx[] = txData.data ?? []
  const efectivo = txsHoy.filter(t => t.payment_type === "CASH").reduce((s, t) => s + t.amount, 0)
  const tarjeta  = resumen.totalHoy - efectivo

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      {/* ── Sección header ── */}
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
        <span style={{ fontSize: 11, color: INK50, fontFamily: "var(--font-mono)", letterSpacing: "0.05em", textTransform: "uppercase", fontWeight: 500 }}>
          Ventas SumUp
        </span>
        <span style={{ fontSize: 11, color: INK50, fontFamily: "var(--font-mono)" }}>
          {resumen.countHoy} transacciones hoy
        </span>
      </div>

      {/* ── KPI strip: Hoy / Semana / Mes ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {[
          { label: "Hoy",            value: resumen.totalHoy,    sub: `${resumen.countHoy} transacciones`, tone: "green" },
          { label: "Esta semana",     value: resumen.totalSemana, sub: "lunes a hoy",          tone: "ink" },
          { label: "Mes acumulado",   value: resumen.totalMes,    sub: "mes en curso",          tone: "ink" },
        ].map(({ label, value, sub, tone }) => (
          <div key={label} className="terry-card" style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ fontSize: 11, color: INK50, fontFamily: "var(--font-mono)", letterSpacing: "0.04em", textTransform: "uppercase", fontWeight: 500 }}>
              {label}
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 26, fontWeight: 600, color: tone === "green" ? GREEN : INK, letterSpacing: "-0.02em", lineHeight: 1.05 }}>
              {formatCLP(value)}
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: INK50 }}>
              {sub}
            </div>
          </div>
        ))}
      </div>

      {/* ── Charts ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 14 }}>
        <div style={{ height: 300 }}>
          <TerryPanel title="Comparativa semanal" subtitle="últimas 4 semanas · día a día" tag="SEMANAS" tagTone="ink">
            <VentasSemanasChartWrapper data={resumen.dataSemanas} labels={resumen.labelsSemanas} />
          </TerryPanel>
        </div>
        <div style={{ height: 300 }}>
          <TerryPanel title="Evolución del mes" subtitle="ventas diarias · mes en curso" tag="MES" tagTone="green">
            <VentasMesChartWrapper data={resumen.dataEvolucionMes} />
          </TerryPanel>
        </div>
      </div>

      {/* ── Tablas ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: 14 }}>

        {/* Mejor día por semana */}
        <div style={{ height: 280 }}>
          <TerryPanel title="Mejor día por semana" subtitle="últimas 4 semanas" tag="TOP" tagTone="ink" bodyPadding={0}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <div style={{
                display: "grid", gridTemplateColumns: "1fr auto",
                padding: "8px 14px", borderBottom: `1px solid ${INK08}`,
                fontFamily: "var(--font-mono)", fontSize: 9.5, fontWeight: 500,
                color: INK50, letterSpacing: "0.04em", textTransform: "uppercase",
              }}>
                <div>Semana · Día</div>
                <div style={{ textAlign: "right" }}>Total</div>
              </div>
              {resumen.mejoresDias.map(({ semana, dia, total }, i) => (
                <div key={i} style={{
                  display: "grid", gridTemplateColumns: "1fr auto",
                  padding: "12px 14px",
                  borderBottom: i < 3 ? `1px solid ${INK08}` : "none",
                  alignItems: "start",
                }}>
                  <div>
                    <div style={{ fontSize: 10, color: INK50, fontFamily: "var(--font-mono)", marginBottom: 2 }}>{semana}</div>
                    <div style={{ fontSize: 12, color: INK, fontWeight: 500, textTransform: "capitalize" }}>{dia}</div>
                  </div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 600, color: total > 0 ? GREEN : INK30 }}>
                    {total > 0 ? formatCLP(total) : "—"}
                  </div>
                </div>
              ))}
            </div>
          </TerryPanel>
        </div>

        {/* Transacciones de hoy */}
        <div style={{ height: 280 }}>
          <TerryPanel title="Transacciones de hoy" subtitle="SumUp · tiempo real" tag="HOY" tagTone="green" bodyPadding={0}>
            {txsHoy.length === 0 ? (
              <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <p style={{ fontSize: 12, color: INK30, fontFamily: "var(--font-mono)" }}>
                  Sin ventas hoy · sincroniza SumUp
                </p>
              </div>
            ) : (
              <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
                <div style={{
                  display: "grid", gridTemplateColumns: "60px 1fr 100px 90px",
                  padding: "8px 14px", borderBottom: `1px solid ${INK08}`,
                  fontFamily: "var(--font-mono)", fontSize: 9.5, fontWeight: 500,
                  color: INK50, letterSpacing: "0.04em", textTransform: "uppercase",
                  position: "sticky", top: 0, background: "white",
                }}>
                  <div>Hora</div><div>Código</div><div>Medio</div>
                  <div style={{ textAlign: "right" }}>Monto</div>
                </div>
                {txsHoy.map((t, i) => (
                  <div key={t.id} style={{
                    display: "grid", gridTemplateColumns: "60px 1fr 100px 90px",
                    padding: "8px 14px",
                    borderBottom: i < txsHoy.length - 1 ? `1px solid ${INK08}` : "none",
                    fontSize: 11.5, color: INK, alignItems: "center",
                  }}>
                    <div style={{ fontFamily: "var(--font-mono)", color: INK50, fontSize: 11 }}>{formatHora(t.timestamp)}</div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: INK50 }}>{t.transaction_code ?? "—"}</div>
                    <div>
                      <span style={{
                        display: "inline-block", padding: "2px 6px", borderRadius: 4, fontSize: 10.5,
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
              </div>
            )}
          </TerryPanel>
        </div>
      </div>
    </div>
  )
}
