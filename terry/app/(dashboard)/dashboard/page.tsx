import Link from "next/link";
import { getContextoUsuario } from "@/lib/contexto-usuario";
import {
  getResumenMes,
  getRegistrosFinancieros,
  getDistribucionEgresos,
} from "@/modules/registros-financieros/queries";
import { setSucursalActiva } from "@/app/actions/set-sucursal-activa";
import { DistribucionChartWrapper } from "@/components/dashboard/charts-wrapper";
import TerryPanel from "@/components/dashboard/terry-panel";
import VentasHoy from "@/components/dashboard/ventas-hoy";
import Ventas3MesesBars from "@/components/dashboard/ventas-3meses-bars";
import DashboardGrid from "@/components/dashboard/dashboard-grid";
import { getComparativa3Meses, getVentasMes } from "@/lib/sumup/resumen";
import { getLayout } from "@/lib/dashboard-layout";
import { sincronizarHoy } from "@/lib/sumup/auto-sync";
import ActualizarDatosButton from "@/components/dashboard/actualizar-datos-button";
import BalanceMes from "@/components/dashboard/balance-mes";
import AcumuladoMeses from "@/components/dashboard/acumulado-meses";
import VentasHora from "@/components/dashboard/ventas-hora";
import { getVentasPorHoraSemanas, getHeatmapMes } from "@/lib/sumup/analytics";
import HeatmapHoraDia from "@/components/dashboard/heatmap-hora-dia";

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const ahora = new Date();
  const anio  = ahora.getFullYear();
  const mes   = ahora.getMonth() + 1;

  const contexto = await getContextoUsuario();

  // Auto-sync: actualiza transacciones y snapshot de hoy (throttled a 5 min)
  await sincronizarHoy();

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

  const [resumen, registros, distribucion, comparativa3m, layout, ventasMes, ventasHora, ventasHeatmap] = await Promise.all([
    getResumenMes(anio, mes),
    getRegistrosFinancieros(anio, mes),
    getDistribucionEgresos(anio, mes),
    getComparativa3Meses().catch(() => ({ puntos: [], meses: [] as string[] })),
    getLayout(),
    getVentasMes(anio, mes).catch(() => 0),
    getVentasPorHoraSemanas(4).catch(() => []),
    getHeatmapMes(anio, mes).catch(() => []),
  ]);

  const sinDatos = !resumen || resumen.totalRegistros === 0;

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

      {/* ── MAIN CONTENT ─────────────────────────────────────────────────── */}
      <div style={{ padding: "24px 24px", display: "flex", flexDirection: "column", gap: 24, flex: 1 }}>

        {/* ── SALUDO (siempre visible, no es widget) ─────────────────────── */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
          <div>
            <div style={{ fontSize: 11, color: INK50, fontFamily: "var(--font-mono)", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 6 }}>
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

          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0, paddingTop: 4 }}>
            <ActualizarDatosButton />

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
        </div>

        {/* ── WIDGETS ACOMODABLES ────────────────────────────────────────── */}
        <DashboardGrid
          initialLayout={layout}
          widgets={{

            "ventas-hoy": <VentasHoy />,

            "balance-mes": (
              <BalanceMes
                ventasMes={ventasMes}
                gastosMes={resumen?.egresos ?? 0}
                periodo={periodoLabel}
              />
            ),

            "comparativa-3m": (
              <div>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 12 }}>
                  <span style={{ fontSize: 11, color: INK50, fontFamily: "var(--font-mono)", letterSpacing: "0.05em", textTransform: "uppercase", fontWeight: 500 }}>
                    Comparativa mensual
                  </span>
                  <span style={{ fontSize: 11, color: INK50, fontFamily: "var(--font-mono)" }}>
                    ventas diarias · últimos 2 meses
                  </span>
                </div>
                <Ventas3MesesBars puntos={comparativa3m.puntos} meses={comparativa3m.meses} />
              </div>
            ),

            "acumulado-2m": (
              <div>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 12 }}>
                  <span style={{ fontSize: 11, color: INK50, fontFamily: "var(--font-mono)", letterSpacing: "0.05em", textTransform: "uppercase", fontWeight: 500 }}>
                    Acumulado del mes
                  </span>
                  <span style={{ fontSize: 11, color: INK50, fontFamily: "var(--font-mono)" }}>
                    comparativa últimos 2 meses
                  </span>
                </div>
                <AcumuladoMeses puntos={comparativa3m.puntos} meses={comparativa3m.meses} />
              </div>
            ),

            "ventas-hora": (
              <div>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 12 }}>
                  <span style={{ fontSize: 11, color: INK50, fontFamily: "var(--font-mono)", letterSpacing: "0.05em", textTransform: "uppercase", fontWeight: 500 }}>
                    Ventas por hora
                  </span>
                  <span style={{ fontSize: 11, color: INK50, fontFamily: "var(--font-mono)", textTransform: "capitalize" }}>
                    {periodoLabel}
                  </span>
                </div>
                <VentasHora data={ventasHora} />
              </div>
            ),

            "heatmap-hora-dia": (
              <div>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 12 }}>
                  <span style={{ fontSize: 11, color: INK50, fontFamily: "var(--font-mono)", letterSpacing: "0.05em", textTransform: "uppercase", fontWeight: 500 }}>
                    Actividad por hora y día
                  </span>
                  <span style={{ fontSize: 11, color: INK50, fontFamily: "var(--font-mono)", textTransform: "capitalize" }}>
                    {periodoLabel}
                  </span>
                </div>
                <HeatmapHoraDia data={ventasHeatmap} anio={anio} mes={mes} />
              </div>
            ),

            "analisis-financiero": sinDatos ? null : (
              <div>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 12 }}>
                  <span style={{ fontSize: 11, color: INK50, fontFamily: "var(--font-mono)", letterSpacing: "0.05em", textTransform: "uppercase", fontWeight: 500 }}>Análisis financiero</span>
                  <span style={{ fontSize: 11, color: INK50, fontFamily: "var(--font-mono)", textTransform: "capitalize" }}>{periodoLabel}</span>
                </div>
                <div style={{ height: 280 }}>
                  <TerryPanel title="Composición de egresos" subtitle={periodoLabel} tag="SPLIT" tagTone="ink">
                    <DistribucionChartWrapper data={distribucion} />
                  </TerryPanel>
                </div>
              </div>
            ),

            "vencimientos": sinDatos ? null : (
              <div>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 12 }}>
                  <span style={{ fontSize: 11, color: INK50, fontFamily: "var(--font-mono)", letterSpacing: "0.05em", textTransform: "uppercase", fontWeight: 500 }}>Vencimientos</span>
                  <Link href="/dashboard/registros" style={{ fontSize: 11, color: INK50, fontFamily: "var(--font-mono)", textDecoration: "none" }}>ver todos →</Link>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 14 }}>
                  <div style={{ height: 280 }}>
                    <TerryPanel title="Cuentas por pagar" subtitle={`próximos vencimientos · ${pendientes.length} ${pendientes.length === 1 ? "cuenta" : "cuentas"}`} tag="TABLA" tagTone="ink" bodyPadding={0}>
                      {pendientes.length === 0 ? (
                        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
                          <p style={{ fontSize: 12, color: INK30, fontFamily: "var(--font-mono)" }}>Sin vencimientos pendientes</p>
                        </div>
                      ) : (
                        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr", padding: "8px 14px", borderBottom: `1px solid ${INK08}`, fontFamily: "var(--font-mono)", fontSize: 9.5, fontWeight: 500, color: INK50, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                            <div>Proveedor</div><div style={{ textAlign: "right" }}>Monto</div><div style={{ textAlign: "right" }}>Estado</div>
                          </div>
                          {pendientes.slice(0, 6).map((r, ri) => (
                            <div key={r.id} style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr", padding: "8px 14px", borderBottom: ri < Math.min(pendientes.length, 6) - 1 ? `1px solid ${INK08}` : "none", fontSize: 11.5, color: INK, alignItems: "center" }}>
                              <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.tercero_nombre ?? r.descripcion ?? "—"}</div>
                              <div style={{ textAlign: "right", fontFamily: "var(--font-mono)", fontWeight: 500 }}>{formatCLP(r.monto_total)}</div>
                              <div style={{ textAlign: "right" }}><span style={{ fontFamily: "var(--font-mono)", fontSize: 10, padding: "2px 6px", borderRadius: 4, background: "oklch(0.96 0.08 85)", color: YELLOW_FG }}>Pendiente</span></div>
                            </div>
                          ))}
                        </div>
                      )}
                    </TerryPanel>
                  </div>
                  <div style={{ height: 280 }}>
                    <TerryPanel title="IVA · F29" subtitle={f29Label} tag="ATENCIÓN" tagTone="yellow">
                      <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: 0 }}>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: 22, fontWeight: 600, color: INK, lineHeight: 1.1, letterSpacing: "-0.01em" }}>
                          {Math.max(0, diasF29)} <span style={{ fontSize: 12, color: INK50, fontWeight: 400 }}>días</span>
                        </div>
                        <div style={{ fontSize: 11.5, color: "rgba(10,10,10,0.70)", marginTop: 8, lineHeight: 1.4 }}>Declaración de IVA del período {periodoLabel}. Recuerda revisar tus compras antes de declarar.</div>
                        <div style={{ marginTop: "auto", paddingTop: 16 }}>
                          <div style={{ fontSize: 10, color: INK50, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>Estimado a pagar</div>
                          <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: INK, fontWeight: 600 }}>{formatCLP(ivaEstimado)}</div>
                          <div style={{ fontSize: 10, color: INK30, fontFamily: "var(--font-mono)", marginTop: 2 }}>estimación 19% · sujeto a crédito fiscal</div>
                        </div>
                      </div>
                    </TerryPanel>
                  </div>
                </div>
              </div>
            ),

          }}
        />
      </div>
    </div>
  );
}
