import Link from "next/link";
import { getContextoUsuario } from "@/lib/contexto-usuario";
import {
  getResumenMes,
  getRegistrosFinancieros,
  getComparativaMeses,
  getDistribucionEgresos,
} from "@/modules/registros-financieros/queries";
import { setSucursalActiva } from "@/app/actions/set-sucursal-activa";
import {
  FlujoLineasChartWrapper,
  DistribucionChartWrapper,
} from "@/components/dashboard/charts-wrapper";
import TerryPanel from "@/components/dashboard/terry-panel";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const GREEN  = "oklch(0.62 0.15 145)";
const RED    = "oklch(0.58 0.19 27)";
const YELLOW = "oklch(0.82 0.15 85)";
const YELLOW_FG = "oklch(0.45 0.12 75)";
const INK    = "#0a0a0a";
const INK50  = "rgba(10,10,10,0.52)";
const INK30  = "rgba(10,10,10,0.30)";
const INK15  = "rgba(10,10,10,0.13)";
const INK08  = "rgba(10,10,10,0.07)";

function formatCLP(n: number): string {
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000)     return `${sign}$${(abs / 1_000).toFixed(0)}k`;
  return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(n);
}

function mesAnterior(a: number, m: number) {
  return m === 1 ? { anio: a - 1, mes: 12 } : { anio: a, mes: m - 1 };
}
function mesSiguiente(a: number, m: number) {
  return m === 12 ? { anio: a + 1, mes: 1 } : { anio: a, mes: m + 1 };
}
function mesUrl(a: number, m: number) {
  return `/dashboard?anio=${a}&mes=${m}`;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ anio?: string; mes?: string }>;
}) {
  const params   = await searchParams;
  const ahora    = new Date();

  const anioDefault = ahora.getMonth() === 0 ? ahora.getFullYear() - 1 : ahora.getFullYear();
  const mesDefault  = ahora.getMonth() === 0 ? 12 : ahora.getMonth();

  const anio = params.anio ? parseInt(params.anio) : anioDefault;
  const mes  = params.mes  ? parseInt(params.mes)  : mesDefault;

  const esActual = anio === ahora.getFullYear() && mes === ahora.getMonth() + 1;
  const ant = mesAnterior(anio, mes);
  const sig = mesSiguiente(anio, mes);
  const esFuturo =
    sig.anio > ahora.getFullYear() ||
    (sig.anio === ahora.getFullYear() && sig.mes > ahora.getMonth() + 1);

  const contexto = await getContextoUsuario();

  // Nombre para el saludo
  const nombre =
    (contexto.user.user_metadata?.full_name as string | undefined)
    ?? (contexto.user.user_metadata?.name as string | undefined)
    ?? contexto.user.email?.split("@")[0]
    ?? "Usuario";
  const nombreDisplay = nombre.charAt(0).toUpperCase() + nombre.slice(1);

  // Saludo según hora
  const hora = ahora.getHours();
  const saludo = hora < 12 ? "Buenos días" : hora < 18 ? "Buenas tardes" : "Buenas noches";

  // Fecha formateada
  const fechaLabel = ahora.toLocaleDateString("es-CL", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  const [resumen, registros, comparativa, distribucion] = await Promise.all([
    getResumenMes(anio, mes),
    getRegistrosFinancieros(anio, mes),
    getComparativaMeses(anio, mes, 6),
    getDistribucionEgresos(anio, mes),
  ]);

  const sinDatos = !resumen || resumen.totalRegistros === 0;

  const margen =
    resumen && resumen.ingresos > 0
      ? `${((resumen.balance / resumen.ingresos) * 100).toFixed(1)}%`
      : "—";

  // Registros pendientes
  const pendientes = registros.filter((r) => r.estado !== "pagado");

  // IVA F29: vence el 20 del mes siguiente al período
  const vencF29 = new Date(anio, mes, 20); // mes es 1-indexed, Date usa 0-indexed → mes es el siguiente mes
  const diasF29 = Math.ceil((vencF29.getTime() - ahora.getTime()) / (1000 * 60 * 60 * 24));
  const ivaEstimado = resumen ? Math.round(resumen.ingresos * 0.19) : 0;
  const mesNombreF29 = new Date(anio, mes - 1, 20)
    .toLocaleDateString("es-CL", { month: "short" })
    .replace(".", "");
  const f29Label = `SII · vence 20-${mesNombreF29}`;

  // Etiqueta del período navegado
  const periodoLabel = resumen?.label ?? `${anio}`;

  return (
    <div style={{ minHeight: "100%", display: "flex", flexDirection: "column" }}>

      {/* ── PERIOD NAV BAR ────────────────────────────────────────────────── */}
      <div
        style={{
          background: "white",
          borderBottom: `1px solid ${INK15}`,
          padding: "10px 24px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Chevron left */}
          <Link
            href={mesUrl(ant.anio, ant.mes)}
            style={{
              width: 28, height: 28, borderRadius: 6,
              border: `1px solid ${INK15}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: INK50, textDecoration: "none", transition: "background 0.15s",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </Link>

          <span
            style={{
              fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 500,
              color: INK, minWidth: "8rem", textAlign: "center",
              textTransform: "capitalize",
            }}
          >
            {periodoLabel}
          </span>

          {!esFuturo ? (
            <Link
              href={mesUrl(sig.anio, sig.mes)}
              style={{
                width: 28, height: 28, borderRadius: 6,
                border: `1px solid ${INK15}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: INK50, textDecoration: "none",
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
          ) : (
            <div style={{ width: 28 }} />
          )}

          {esActual && (
            <span
              className="terry-tag"
              style={{ background: INK08, color: INK50 }}
            >
              en curso
            </span>
          )}
        </div>

        {/* Selector sucursal */}
        {contexto.sucursales.length > 1 && (
          <form
            action={async (fd) => {
              "use server";
              await setSucursalActiva(String(fd.get("sucursal_id") ?? ""));
            }}
          >
            <select
              name="sucursal_id"
              defaultValue={contexto.sucursalActiva?.id}
              style={{
                border: `1px solid ${INK15}`, borderRadius: 7,
                padding: "5px 10px", fontSize: 12, color: INK,
                background: "white", fontFamily: "var(--font-sans)",
                outline: "none", cursor: "pointer",
              }}
            >
              {contexto.sucursales.map((s) => (
                <option key={s.id} value={s.id}>{s.nombre}</option>
              ))}
            </select>
          </form>
        )}
      </div>

      {/* ── MAIN CONTENT ─────────────────────────────────────────────────── */}
      <div style={{ padding: "24px 24px", display: "flex", flexDirection: "column", gap: 24, flex: 1 }}>

        {/* ── SALUDO ─────────────────────────────────────────────────────── */}
        <div>
          <div
            style={{
              fontSize: 11, color: INK50,
              fontFamily: "var(--font-mono)", letterSpacing: "0.04em",
              textTransform: "uppercase", marginBottom: 6,
            }}
          >
            {fechaLabel}
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, color: INK, letterSpacing: "-0.02em" }}>
            {saludo}, {nombreDisplay}
          </div>
          <div style={{ fontSize: 13.5, color: "rgba(10,10,10,0.70)", marginTop: 4, lineHeight: 1.5, maxWidth: 560 }}>
            {sinDatos
              ? "No hay registros financieros para este período."
              : `Resumen financiero de ${periodoLabel}. Los paneles muestran la información actualizada de tus cuentas.`}
          </div>
        </div>

        {sinDatos ? (
          /* Empty state */
          <div
            className="terry-card"
            style={{
              padding: "48px 24px", display: "flex", flexDirection: "column",
              alignItems: "center", textAlign: "center",
            }}
          >
            <div
              style={{
                width: 44, height: 44, borderRadius: "50%",
                background: INK08, display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={INK50} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" />
              </svg>
            </div>
            <p style={{ fontSize: 14, fontWeight: 600, color: INK }}>Sin datos para este período</p>
            <p style={{ fontSize: 12, color: INK50, marginTop: 4 }}>
              No hay registros en{" "}
              <span style={{ textTransform: "capitalize" }}>{periodoLabel}</span>.
            </p>
            <Link
              href="/dashboard/seed"
              style={{
                marginTop: 20, display: "inline-block",
                padding: "8px 16px", borderRadius: 7,
                background: INK, color: "white",
                fontSize: 12, fontWeight: 600, textDecoration: "none",
              }}
            >
              Cargar datos de prueba
            </Link>
          </div>
        ) : (
          <>
            {/* ── KPI STRIP ──────────────────────────────────────────────── */}
            <div>
              <div
                style={{
                  display: "flex", alignItems: "baseline", justifyContent: "space-between",
                  marginBottom: 12,
                }}
              >
                <span style={{ fontSize: 11, color: INK50, fontFamily: "var(--font-mono)", letterSpacing: "0.05em", textTransform: "uppercase", fontWeight: 500 }}>
                  Indicadores del mes
                </span>
                <span style={{ fontSize: 11, color: INK50, fontFamily: "var(--font-mono)" }}>
                  {resumen!.totalRegistros} registros · actualizado
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
                {[
                  {
                    label: "Ingresos del mes",
                    value: formatCLP(resumen!.ingresos),
                    delta: `+${((resumen!.ingresos / (resumen!.ingresos || 1)) * 0).toFixed(1)}%`,
                    rawDelta: null,
                    tone: "green",
                    sub: "vs. mes anterior",
                  },
                  {
                    label: "Egresos del mes",
                    value: formatCLP(resumen!.egresos),
                    rawDelta: null,
                    tone: "red",
                    sub: "incluyendo sueldos",
                  },
                  {
                    label: "Flujo neto",
                    value: formatCLP(resumen!.balance),
                    rawDelta: null,
                    tone: resumen!.balance >= 0 ? "green" : "red",
                    sub: "ingresos − egresos",
                  },
                  {
                    label: "Margen neto",
                    value: margen,
                    rawDelta: null,
                    tone: resumen!.balance >= 0 ? "green" : "red",
                    sub: `${resumen!.pendientes} pendientes de pago`,
                    isMono: false,
                  },
                ].map((kpi, i) => {
                  const isRed   = kpi.tone === "red";
                  const color   = isRed ? RED : GREEN;
                  const arrow   = isRed ? "▾" : "▴";
                  return (
                    <div
                      key={i}
                      className="terry-card"
                      style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 6 }}
                    >
                      <div style={{ fontSize: 11, color: INK50, fontFamily: "var(--font-mono)", letterSpacing: "0.04em", textTransform: "uppercase", fontWeight: 500 }}>
                        {kpi.label}
                      </div>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: 28, fontWeight: 600, color: INK, letterSpacing: "-0.02em", lineHeight: 1.05 }}>
                        {kpi.value.startsWith("$") ? (
                          <>
                            <span style={{ fontSize: 16, color: INK50, marginRight: 2 }}>$</span>
                            {kpi.value.slice(1)}
                          </>
                        ) : (
                          kpi.value
                        )}
                      </div>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: 11.5, color: INK50, fontWeight: 400 }}>
                        {kpi.sub}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── ANÁLISIS FINANCIERO ────────────────────────────────────── */}
            <div>
              <div
                style={{
                  display: "flex", alignItems: "baseline", justifyContent: "space-between",
                  marginBottom: 12,
                }}
              >
                <span style={{ fontSize: 11, color: INK50, fontFamily: "var(--font-mono)", letterSpacing: "0.05em", textTransform: "uppercase", fontWeight: 500 }}>
                  Análisis financiero
                </span>
                <span style={{ fontSize: 11, color: INK50, fontFamily: "var(--font-mono)", textTransform: "capitalize" }}>
                  {periodoLabel}
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 14 }}>
                <div style={{ height: 280 }}>
                  <TerryPanel title="Flujo de caja" subtitle="últimos 6 meses · CLP" tag="FLUJO" tagTone="ink">
                    <FlujoLineasChartWrapper data={comparativa} />
                  </TerryPanel>
                </div>
                <div style={{ height: 280 }}>
                  <TerryPanel title="Composición de egresos" subtitle={periodoLabel} tag="SPLIT" tagTone="ink">
                    <DistribucionChartWrapper data={distribucion} />
                  </TerryPanel>
                </div>
              </div>
            </div>

            {/* ── VENCIMIENTOS ───────────────────────────────────────────── */}
            <div>
              <div
                style={{
                  display: "flex", alignItems: "baseline", justifyContent: "space-between",
                  marginBottom: 12,
                }}
              >
                <span style={{ fontSize: 11, color: INK50, fontFamily: "var(--font-mono)", letterSpacing: "0.05em", textTransform: "uppercase", fontWeight: 500 }}>
                  Vencimientos
                </span>
                <Link
                  href="/dashboard/registros"
                  style={{ fontSize: 11, color: INK50, fontFamily: "var(--font-mono)", textDecoration: "none" }}
                >
                  ver todos →
                </Link>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 14 }}>
                {/* Tabla cuentas por pagar */}
                <div style={{ height: 280 }}>
                  <TerryPanel
                    title="Cuentas por pagar"
                    subtitle={`próximos vencimientos · ${pendientes.length} ${pendientes.length === 1 ? "cuenta" : "cuentas"}`}
                    tag="TABLA"
                    tagTone="ink"
                    bodyPadding={0}
                  >
                    {pendientes.length === 0 ? (
                      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
                        <p style={{ fontSize: 12, color: INK30, fontFamily: "var(--font-mono)" }}>Sin vencimientos pendientes</p>
                      </div>
                    ) : (
                      <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                        {/* Table header */}
                        <div
                          style={{
                            display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr",
                            padding: "8px 14px", borderBottom: `1px solid ${INK08}`,
                            fontFamily: "var(--font-mono)", fontSize: 9.5, fontWeight: 500,
                            color: INK50, letterSpacing: "0.04em", textTransform: "uppercase",
                          }}
                        >
                          <div>Proveedor</div>
                          <div style={{ textAlign: "right" }}>Monto</div>
                          <div style={{ textAlign: "right" }}>Estado</div>
                        </div>

                        {/* Rows */}
                        {pendientes.slice(0, 6).map((r, ri) => (
                          <div
                            key={r.id}
                            style={{
                              display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr",
                              padding: "8px 14px",
                              borderBottom: ri < Math.min(pendientes.length, 6) - 1 ? `1px solid ${INK08}` : "none",
                              fontSize: 11.5, color: INK, alignItems: "center",
                            }}
                          >
                            <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {r.tercero_nombre ?? r.descripcion ?? "—"}
                            </div>
                            <div style={{ textAlign: "right", fontFamily: "var(--font-mono)", fontWeight: 500 }}>
                              {formatCLP(r.monto_total)}
                            </div>
                            <div style={{ textAlign: "right" }}>
                              <span
                                style={{
                                  fontFamily: "var(--font-mono)", fontSize: 10,
                                  padding: "2px 6px", borderRadius: 4,
                                  background: "oklch(0.96 0.08 85)",
                                  color: YELLOW_FG,
                                }}
                              >
                                Pendiente
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TerryPanel>
                </div>

                {/* Alerta IVA F29 */}
                <div style={{ height: 280 }}>
                  <TerryPanel title="IVA · F29" subtitle={f29Label} tag="ATENCIÓN" tagTone="yellow">
                    <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: 0 }}>
                      <div
                        style={{
                          fontFamily: "var(--font-mono)", fontSize: 22, fontWeight: 600,
                          color: INK, lineHeight: 1.1, letterSpacing: "-0.01em",
                        }}
                      >
                        {Math.max(0, diasF29)}{" "}
                        <span style={{ fontSize: 12, color: INK50, fontWeight: 400 }}>días</span>
                      </div>
                      <div style={{ fontSize: 11.5, color: "rgba(10,10,10,0.70)", marginTop: 8, lineHeight: 1.4 }}>
                        Declaración de IVA del período {periodoLabel}. Recuerda revisar tus compras antes de declarar.
                      </div>
                      <div style={{ marginTop: "auto", paddingTop: 16 }}>
                        <div style={{ fontSize: 10, color: INK50, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>
                          Estimado a pagar
                        </div>
                        <div
                          style={{
                            fontFamily: "var(--font-mono)", fontSize: 13,
                            color: INK, fontWeight: 600,
                          }}
                        >
                          {formatCLP(ivaEstimado)}
                        </div>
                        <div style={{ fontSize: 10, color: INK30, fontFamily: "var(--font-mono)", marginTop: 2 }}>
                          estimación 19% · sujeto a crédito fiscal
                        </div>
                      </div>
                    </div>
                  </TerryPanel>
                </div>
              </div>
            </div>

            {/* ── BETA FOOTER ────────────────────────────────────────────── */}
            <div
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "12px 16px",
                background: "white",
                border: `1px dashed ${INK15}`,
                borderRadius: 10,
                fontSize: 12, color: "rgba(10,10,10,0.70)",
              }}
            >
              <span
                className="terry-tag"
                style={{ background: "oklch(0.96 0.08 85)", color: YELLOW_FG, letterSpacing: "0.04em", whiteSpace: "nowrap" }}
              >
                PRÓXIMAMENTE
              </span>
              <span>
                En versiones futuras podrás pedirle a <strong>Terry</strong> que cree paneles personalizados en una pizarra interactiva.
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
