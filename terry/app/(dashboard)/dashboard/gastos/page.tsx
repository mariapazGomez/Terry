import { getGastosDelMes }          from "@/modules/registros-financieros/queries"
import { getGastosRecurrentes }      from "@/modules/gastos-recurrentes/queries"
import { crearGasto, marcarGastoPagado } from "@/modules/registros-financieros/actions"
import { crearGastoRecurrente, desactivarGastoRecurrente } from "@/modules/gastos-recurrentes/actions"
import GenerarMesButton              from "@/components/gastos/generar-mes-button"
import Link                          from "next/link"

// ─── Constantes ────────────────────────────────────────────────────────────────

const INK    = "#0a0a0a"
const INK50  = "rgba(10,10,10,0.52)"
const INK30  = "rgba(10,10,10,0.30)"
const INK15  = "rgba(10,10,10,0.13)"
const INK08  = "rgba(10,10,10,0.07)"
const GREEN  = "oklch(0.62 0.15 145)"

const TIPOS_GASTO_LABEL: Record<string, string> = {
  arriendo:          "Arriendo",
  salario:           "Sueldos y salarios",
  credito:           "Créditos",
  subscripcion:      "Suscripciones",
  servicio_basico:   "Servicios básicos",
  factura_proveedor: "Facturas de proveedor",
  otro:              "Otros gastos",
}

const GRUPO_FIJOS     = ["arriendo", "salario", "credito"]
const GRUPO_SERVICIOS = ["servicio_basico", "subscripcion"]

function formatCLP(n: number) {
  const abs = Math.abs(n)
  const s   = n < 0 ? "-" : ""
  if (abs >= 1_000_000) return `${s}$${(abs / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000)     return `${s}$${Math.round(abs / 1_000)}k`
  return `${s}$${abs.toLocaleString("es-CL")}`
}

function mesAnterior(a: number, m: number)  { return m === 1  ? { anio: a - 1, mes: 12 } : { anio: a, mes: m - 1 } }
function mesSiguiente(a: number, m: number) { return m === 12 ? { anio: a + 1, mes: 1  } : { anio: a, mes: m + 1 } }

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "7px 10px", borderRadius: 6, fontSize: 12,
  border: "1px solid rgba(10,10,10,0.13)", background: "white", color: INK,
  fontFamily: "var(--font-sans)", outline: "none", boxSizing: "border-box",
}

// ─── Página ────────────────────────────────────────────────────────────────────

export default async function GastosPage({
  searchParams,
}: {
  searchParams: Promise<{ anio?: string; mes?: string }>
}) {
  const params = await searchParams
  const ahora  = new Date()
  const anio   = params.anio ? parseInt(params.anio) : ahora.getFullYear()
  const mes    = params.mes  ? parseInt(params.mes)  : ahora.getMonth() + 1

  const esActual = anio === ahora.getFullYear() && mes === ahora.getMonth() + 1
  const ant      = mesAnterior(anio, mes)
  const sig      = mesSiguiente(anio, mes)
  const esFuturo = sig.anio > ahora.getFullYear() || (sig.anio === ahora.getFullYear() && sig.mes > ahora.getMonth() + 1)

  const periodoLabel = new Date(anio, mes - 1, 1).toLocaleDateString("es-CL", { month: "long", year: "numeric" })
  const periodoCorto = new Date(anio, mes - 1, 1).toLocaleDateString("es-CL", { month: "long" })
  const hoyStr       = ahora.toISOString().split("T")[0]

  const [gastos, recurrentes] = await Promise.all([
    getGastosDelMes(anio, mes),
    getGastosRecurrentes(),
  ])

  const pendientes = gastos.filter(g => g.estado !== "pagado")
  const pagados    = gastos.filter(g => g.estado === "pagado")
  const totalPend  = pendientes.reduce((s, g) => s + (g.monto_total ?? 0), 0)
  const totalPag   = pagados.reduce((s, g)    => s + (g.monto_total ?? 0), 0)
  const totalMes   = totalPend + totalPag

  const fijos     = gastos.filter(g => GRUPO_FIJOS.includes(g.tipo_gasto ?? ""))
  const servicios = gastos.filter(g => GRUPO_SERVICIOS.includes(g.tipo_gasto ?? ""))
  const otros     = gastos.filter(g => !GRUPO_FIJOS.includes(g.tipo_gasto ?? "") && !GRUPO_SERVICIOS.includes(g.tipo_gasto ?? ""))
  const grupos    = [
    { titulo: "Gastos fijos", items: fijos },
    { titulo: "Servicios",    items: servicios },
    { titulo: "Otros",        items: otros },
  ].filter(g => g.items.length > 0)

  return (
    <div style={{ minHeight: "100%", display: "flex", flexDirection: "column" }}>

      {/* NAV DE PERÍODO */}
      <div style={{ background: "white", borderBottom: `1px solid ${INK15}`, padding: "10px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Link href={`/dashboard/gastos?anio=${ant.anio}&mes=${ant.mes}`}
            style={{ width: 28, height: 28, borderRadius: 6, border: `1px solid ${INK15}`, display: "flex", alignItems: "center", justifyContent: "center", color: INK50, textDecoration: "none" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
          </Link>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 500, color: INK, minWidth: "8rem", textAlign: "center", textTransform: "capitalize" }}>
            {periodoLabel}
          </span>
          {!esFuturo ? (
            <Link href={`/dashboard/gastos?anio=${sig.anio}&mes=${sig.mes}`}
              style={{ width: 28, height: 28, borderRadius: 6, border: `1px solid ${INK15}`, display: "flex", alignItems: "center", justifyContent: "center", color: INK50, textDecoration: "none" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
            </Link>
          ) : <div style={{ width: 28 }} />}
          {esActual && <span className="terry-tag" style={{ background: INK08, color: INK50 }}>en curso</span>}
        </div>
        <GenerarMesButton anio={anio} mes={mes} label={periodoCorto} />
      </div>

      {/* CONTENIDO */}
      <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 24, flex: 1 }}>

        {/* KPIs */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          {[
            { label: "Total del mes",     value: formatCLP(totalMes),  sub: `${gastos.length} registro${gastos.length !== 1 ? "s" : ""}` },
            { label: "Pendiente de pago", value: formatCLP(totalPend), sub: `${pendientes.length} sin pagar`, warn: pendientes.length > 0 },
            { label: "Ya pagado",         value: formatCLP(totalPag),  sub: `${pagados.length} pagado${pagados.length !== 1 ? "s" : ""} este mes` },
          ].map((kpi, i) => (
            <div key={i} className="terry-card" style={{ padding: "16px 20px" }}>
              <div style={{ fontSize: 11, color: INK50, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>{kpi.label}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 26, fontWeight: 700, color: INK, letterSpacing: "-0.02em", lineHeight: 1.1 }}>{kpi.value}</div>
              <div style={{ fontSize: 11, marginTop: 4, fontFamily: "var(--font-mono)", color: ("warn" in kpi && kpi.warn) ? "oklch(0.55 0.13 75)" : INK50 }}>{kpi.sub}</div>
            </div>
          ))}
        </div>

        {/* GRID PRINCIPAL: lista de gastos + panel de recurrentes */}
        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 20, alignItems: "start" }}>

          {/* COLUMNA IZQUIERDA: gastos del mes + form gasto manual */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ fontSize: 11, color: INK50, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 500 }}>
              Gastos de {periodoCorto}
            </div>

            {gastos.length === 0 ? (
              <div className="terry-card" style={{ padding: "40px 24px", textAlign: "center" }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: INK }}>Sin gastos registrados</p>
                <p style={{ fontSize: 12, color: INK50, marginTop: 6, lineHeight: 1.5 }}>
                  {recurrentes.length > 0
                    ? `Tienes ${recurrentes.length} gasto${recurrentes.length > 1 ? "s" : ""} recurrente${recurrentes.length > 1 ? "s" : ""} configurado${recurrentes.length > 1 ? "s" : ""}. Usa el botón "Generar gastos" arriba para crearlos.`
                    : "Agrega gastos recurrentes en el panel derecho o registra uno manualmente abajo."}
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {grupos.map(({ titulo, items }) => (
                  <div key={titulo} className="terry-card" style={{ overflow: "hidden" }}>
                    <div style={{ padding: "9px 16px", borderBottom: `1px solid ${INK08}`, background: INK08 }}>
                      <span style={{ fontSize: 10, fontWeight: 600, fontFamily: "var(--font-mono)", color: INK50, textTransform: "uppercase", letterSpacing: "0.05em" }}>{titulo}</span>
                    </div>
                    {items.map((g, i) => (
                      <div key={g.id} style={{ display: "grid", gridTemplateColumns: "1fr auto auto", alignItems: "center", gap: 12, padding: "11px 16px", borderBottom: i < items.length - 1 ? `1px solid ${INK08}` : "none" }}>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 500, color: INK, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {g.descripcion || g.tercero_nombre || "—"}
                          </div>
                          {g.tercero_nombre && g.descripcion && (
                            <div style={{ fontSize: 11, color: INK30, marginTop: 1 }}>{g.tercero_nombre}</div>
                          )}
                          <div style={{ fontSize: 10, color: INK30, fontFamily: "var(--font-mono)", marginTop: 2 }}>
                            {TIPOS_GASTO_LABEL[g.tipo_gasto ?? ""] ?? g.tipo_gasto}
                          </div>
                        </div>

                        <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 600, color: INK, whiteSpace: "nowrap" }}>
                          {formatCLP(g.monto_total ?? 0)}
                        </div>

                        <div>
                          {g.estado === "pagado" ? (
                            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, padding: "3px 8px", borderRadius: 4, background: "oklch(0.96 0.05 145)", color: GREEN, fontWeight: 500 }}>
                              Pagado
                            </span>
                          ) : (
                            <form action={marcarGastoPagado}>
                              <input type="hidden" name="id" value={g.id} />
                              <button type="submit" style={{ fontFamily: "var(--font-mono)", fontSize: 10, padding: "3px 8px", borderRadius: 4, border: `1px solid ${INK15}`, background: "white", color: INK50, cursor: "pointer" }}>
                                Marcar pagado
                              </button>
                            </form>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {/* FORM GASTO MANUAL */}
            <div className="terry-card" style={{ padding: "16px 20px" }}>
              <div style={{ fontSize: 11, color: INK50, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 500, marginBottom: 14 }}>
                Agregar gasto
              </div>
              <form action={crearGasto} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <label style={{ fontSize: 10, color: INK50, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Descripción *</label>
                    <input name="descripcion" required placeholder="Ej: Arriendo enero" style={inputStyle} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <label style={{ fontSize: 10, color: INK50, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Tipo *</label>
                    <select name="tipo_gasto" style={inputStyle}>
                      {Object.entries(TIPOS_GASTO_LABEL).map(([v, l]) => (
                        <option key={v} value={v}>{l}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <label style={{ fontSize: 10, color: INK50, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Proveedor</label>
                    <input name="tercero_nombre" placeholder="Opcional" style={inputStyle} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <label style={{ fontSize: 10, color: INK50, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Fecha *</label>
                    <input name="fecha_emision" type="date" defaultValue={hoyStr} required style={inputStyle} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <label style={{ fontSize: 10, color: INK50, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Monto CLP *</label>
                    <input name="monto_total" type="number" min="1" step="1" required placeholder="850000" style={inputStyle} />
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <select name="estado" style={{ ...inputStyle, width: "auto", fontSize: 11 }}>
                    <option value="pendiente">Pendiente</option>
                    <option value="pagado">Pagado</option>
                  </select>
                  <button type="submit" style={{ padding: "7px 16px", borderRadius: 7, background: INK, color: "white", border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-mono)" }}>
                    Registrar
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* COLUMNA DERECHA: recurrentes */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ fontSize: 11, color: INK50, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 500 }}>
              Recurrentes ({recurrentes.length})
            </div>

            {/* LISTA DE RECURRENTES */}
            <div className="terry-card" style={{ overflow: "hidden" }}>
              {recurrentes.length === 0 ? (
                <div style={{ padding: "24px 16px", textAlign: "center" }}>
                  <p style={{ fontSize: 12, color: INK50 }}>Sin recurrentes configurados.</p>
                  <p style={{ fontSize: 11, color: INK30, marginTop: 4, lineHeight: 1.5 }}>
                    Agrégalos abajo para generarlos automáticamente cada mes.
                  </p>
                </div>
              ) : (
                recurrentes.map((r, i) => (
                  <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", borderBottom: i < recurrentes.length - 1 ? `1px solid ${INK08}` : "none" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: INK, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.nombre}</div>
                      <div style={{ fontSize: 10, color: INK30, fontFamily: "var(--font-mono)", marginTop: 2 }}>
                        {TIPOS_GASTO_LABEL[r.tipo_gasto] ?? r.tipo_gasto} · {r.frecuencia}
                        {r.dia_del_mes ? ` · día ${r.dia_del_mes}` : ""}
                      </div>
                    </div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 600, color: INK, whiteSpace: "nowrap" }}>
                      {formatCLP(r.monto_estimado)}
                    </div>
                    <form action={desactivarGastoRecurrente.bind(null, r.id)}>
                      <button type="submit" title="Eliminar recurrente" style={{ background: "none", border: "none", cursor: "pointer", color: INK30, padding: "2px", borderRadius: 4, display: "flex" }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </form>
                  </div>
                ))
              )}
            </div>

            {/* FORM NUEVO RECURRENTE */}
            <div className="terry-card" style={{ padding: "16px" }}>
              <div style={{ fontSize: 11, color: INK50, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 500, marginBottom: 12 }}>
                Nuevo recurrente
              </div>
              <form action={crearGastoRecurrente} style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <label style={{ fontSize: 10, color: INK50, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Nombre *</label>
                  <input name="nombre" required placeholder="Ej: Arriendo local" style={inputStyle} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <label style={{ fontSize: 10, color: INK50, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Tipo *</label>
                    <select name="tipo_gasto" style={inputStyle}>
                      {Object.entries(TIPOS_GASTO_LABEL).map(([v, l]) => (
                        <option key={v} value={v}>{l}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <label style={{ fontSize: 10, color: INK50, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Frecuencia *</label>
                    <select name="frecuencia" style={inputStyle}>
                      <option value="mensual">Mensual</option>
                      <option value="quincenal">Quincenal</option>
                      <option value="anual">Anual</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <label style={{ fontSize: 10, color: INK50, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Monto estimado *</label>
                    <input name="monto_estimado" type="number" min="0" step="1" required placeholder="850000" style={inputStyle} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <label style={{ fontSize: 10, color: INK50, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Día del mes</label>
                    <input name="dia_del_mes" type="number" min="1" max="31" placeholder="1" style={inputStyle} />
                  </div>
                </div>
                <input type="hidden" name="moneda" value="CLP" />
                <button type="submit" style={{ marginTop: 4, padding: "7px 0", borderRadius: 7, background: INK08, color: INK, border: `1px solid ${INK15}`, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-mono)" }}>
                  Agregar recurrente
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
