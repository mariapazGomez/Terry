import Link from "next/link";
import { getContextoUsuario } from "@/lib/contexto-usuario";
import {
  getResumenMes,
  getRegistrosFinancieros,
  getVentasDiarias,
  getComparativaMeses,
  getDistribucionEgresos,
} from "@/modules/registros-financieros/queries";
import { setSucursalActiva } from "@/app/actions/set-sucursal-activa";
import {
  VentasChartWrapper as VentasChart,
  ComparativaChartWrapper as ComparativaChart,
  DistribucionChartWrapper as DistribucionChart,
} from "@/components/dashboard/charts-wrapper";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCLP(n: number) {
  if (Math.abs(n) >= 1_000_000)
    return `${n < 0 ? "-" : ""}$${(Math.abs(n) / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000)
    return `${n < 0 ? "-" : ""}$${(Math.abs(n) / 1_000).toFixed(0)}k`;
  return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(n);
}

function formatCLPFull(n: number) {
  return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(n);
}

function mesAnterior(a: number, m: number) { return m === 1 ? { anio: a - 1, mes: 12 } : { anio: a, mes: m - 1 }; }
function mesSiguiente(a: number, m: number) { return m === 12 ? { anio: a + 1, mes: 1 } : { anio: a, mes: m + 1 }; }
function mesUrl(a: number, m: number) { return `/dashboard?anio=${a}&mes=${m}`; }

// ─── Subcomponentes ───────────────────────────────────────────────────────────

function IconArrowUp() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="18 15 12 9 6 15" />
    </svg>
  );
}
function IconArrowDown() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function NavBtn({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="flex items-center justify-center h-8 w-8 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white/70 hover:text-white">
      {children}
    </Link>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ anio?: string; mes?: string }>;
}) {
  const params = await searchParams;
  const ahora = new Date();

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

  const [resumen, registros, ventasDiarias, comparativa, distribucion] = await Promise.all([
    getResumenMes(anio, mes),
    getRegistrosFinancieros(anio, mes),
    getVentasDiarias(anio, mes),
    getComparativaMeses(anio, mes, 5),
    getDistribucionEgresos(anio, mes),
  ]);

  const sinDatos = !resumen || resumen.totalRegistros === 0;

  return (
    <div className="min-h-full p-6 space-y-6">

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-900 via-slate-800 to-slate-900 p-6 text-white shadow-lg">
        {/* Decoración */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-indigo-500/10" />
        <div className="pointer-events-none absolute -bottom-10 right-32 h-40 w-40 rounded-full bg-violet-500/10" />

        {/* Navegación de mes */}
        <div className="relative mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <NavBtn href={mesUrl(ant.anio, ant.mes)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
            </NavBtn>
            <div>
              <p className="text-xs text-indigo-300 uppercase tracking-widest">Período</p>
              <p className="text-lg font-semibold capitalize">{resumen?.label ?? `${anio}`}</p>
            </div>
            {!esFuturo && (
              <NavBtn href={mesUrl(sig.anio, sig.mes)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
              </NavBtn>
            )}
            {esActual && (
              <span className="ml-1 rounded-full bg-indigo-500/30 px-2.5 py-0.5 text-xs text-indigo-200">
                En curso
              </span>
            )}
          </div>

          {/* Selector sucursal */}
          {contexto.sucursales.length > 1 && (
            <form action={async (fd) => { "use server"; await setSucursalActiva(String(fd.get("sucursal_id") ?? "")); }}>
              <select
                name="sucursal_id"
                defaultValue={contexto.sucursalActiva?.id}
                className="rounded-lg bg-white/10 border border-white/10 px-3 py-1.5 text-sm text-white outline-none focus:border-white/30 cursor-pointer"
                onChange={undefined}
              >
                {contexto.sucursales.map((s) => (
                  <option key={s.id} value={s.id} className="text-zinc-900">{s.nombre}</option>
                ))}
              </select>
            </form>
          )}
        </div>

        {/* Stats principales */}
        {sinDatos ? (
          <div className="py-4 text-center text-indigo-300 text-sm">
            Sin datos para este período —{" "}
            <Link href="/dashboard/seed" className="underline underline-offset-2 hover:text-white">cargar datos de prueba</Link>
          </div>
        ) : (
          <div className="relative grid grid-cols-3 gap-4">
            {/* Balance */}
            <div className="col-span-1 border-r border-white/10 pr-4">
              <p className="text-xs text-slate-400 uppercase tracking-widest">Balance neto</p>
              <p className={`mt-1 text-4xl font-bold tracking-tight ${resumen!.balance >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {formatCLP(resumen!.balance)}
              </p>
              <p className="mt-1 text-xs text-slate-400">{resumen!.totalRegistros} registros totales</p>
            </div>
            {/* Ingresos */}
            <div className="border-r border-white/10 pr-4">
              <p className="text-xs text-slate-400 uppercase tracking-widest">Ingresos</p>
              <p className="mt-1 text-2xl font-semibold text-emerald-400">{formatCLP(resumen!.ingresos)}</p>
              <div className="mt-1 flex items-center gap-1 text-xs text-emerald-400/70">
                <IconArrowUp />
                <span>ventas del período</span>
              </div>
            </div>
            {/* Egresos */}
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-widest">Egresos</p>
              <p className="mt-1 text-2xl font-semibold text-rose-400">{formatCLP(resumen!.egresos)}</p>
              <div className="mt-1 flex items-center gap-1 text-xs text-rose-400/70">
                <IconArrowDown />
                <span>gastos del período</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── CONTENIDO CON DATOS ───────────────────────────────────────────── */}
      {!sinDatos && (
        <>
          {/* ── KPI SECUNDARIOS ────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: "Margen neto",
                value: resumen!.ingresos > 0
                  ? `${((resumen!.balance / resumen!.ingresos) * 100).toFixed(1)}%`
                  : "—",
                sub: "ingresos − egresos / ingresos",
                color: "border-indigo-500",
                textColor: "text-indigo-600",
                bg: "bg-indigo-50",
              },
              {
                label: "Promedio diario",
                value: formatCLP(Math.round(resumen!.ingresos / (ventasDiarias.length || 1))),
                sub: `sobre ${ventasDiarias.length} días con ventas`,
                color: "border-emerald-500",
                textColor: "text-emerald-600",
                bg: "bg-emerald-50",
              },
              {
                label: "Total egresos",
                value: formatCLPFull(resumen!.egresos),
                sub: "incluyendo sueldos y servicios",
                color: "border-rose-500",
                textColor: "text-rose-600",
                bg: "bg-rose-50",
              },
              {
                label: "Pendientes de pago",
                value: String(resumen!.pendientes),
                sub: resumen!.pendientes === 1 ? "registro sin pagar" : "registros sin pagar",
                color: "border-amber-500",
                textColor: "text-amber-600",
                bg: "bg-amber-50",
              },
            ].map((kpi) => (
              <div key={kpi.label} className={`rounded-xl bg-white border-l-4 ${kpi.color} shadow-sm p-5`}>
                <p className="text-xs font-medium text-zinc-400 uppercase tracking-widest">{kpi.label}</p>
                <p className={`mt-2 text-2xl font-bold ${kpi.textColor}`}>{kpi.value}</p>
                <p className="mt-1 text-xs text-zinc-400">{kpi.sub}</p>
              </div>
            ))}
          </div>

          {/* ── CHARTS PRINCIPALES ─────────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {/* Área: flujo diario */}
            <div className="lg:col-span-3 rounded-xl bg-white shadow-sm p-6">
              <div className="flex items-start justify-between mb-1">
                <div>
                  <p className="text-sm font-semibold text-zinc-800">Flujo diario</p>
                  <p className="text-xs text-zinc-400 mt-0.5">Ingresos y egresos por día del mes</p>
                </div>
                <div className="flex items-center gap-3 text-xs text-zinc-400 pt-1">
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" />Ingresos</span>
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-rose-400" />Egresos</span>
                </div>
              </div>
              <div className="mt-4">
                <VentasChart data={ventasDiarias} />
              </div>
            </div>

            {/* Donut: distribución egresos */}
            <div className="lg:col-span-2 rounded-xl bg-white shadow-sm p-6">
              <p className="text-sm font-semibold text-zinc-800">Distribución de egresos</p>
              <p className="text-xs text-zinc-400 mt-0.5">Por categoría del período</p>
              <div className="mt-4">
                <DistribucionChart data={distribucion} />
              </div>
            </div>
          </div>

          {/* ── COMPARATIVA MESES ──────────────────────────────────────────── */}
          <div className="rounded-xl bg-white shadow-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-semibold text-zinc-800">Comparativa mensual</p>
                <p className="text-xs text-zinc-400 mt-0.5">Ingresos vs egresos — últimos 5 meses</p>
              </div>
            </div>
            <div className="mt-2">
              <ComparativaChart data={comparativa} />
            </div>
          </div>

          {/* ── TABLA MOVIMIENTOS ──────────────────────────────────────────── */}
          <div className="rounded-xl bg-white shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-zinc-800">Últimos movimientos</p>
                <p className="text-xs text-zinc-400 mt-0.5">10 más recientes del período</p>
              </div>
              <Link
                href="/dashboard/registros"
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
              >
                Ver todos →
              </Link>
            </div>

            {registros.length === 0 ? (
              <div className="py-10 text-center text-sm text-zinc-400">No hay movimientos en este período.</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50">
                    {["Fecha", "Descripción", "Tipo", "Estado", "Monto"].map((h, i) => (
                      <th key={h} className={`px-5 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-400 ${i === 4 ? "text-right" : "text-left"} ${i >= 2 && i <= 3 ? "hidden sm:table-cell" : ""}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {registros.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3.5 text-zinc-400 tabular-nums text-xs whitespace-nowrap">
                        {new Date(r.fecha_emision + "T12:00:00").toLocaleDateString("es-CL")}
                      </td>
                      <td className="px-5 py-3.5 text-zinc-700 max-w-xs truncate">
                        {r.descripcion ?? r.tercero_nombre ?? "—"}
                      </td>
                      <td className="px-5 py-3.5 hidden sm:table-cell">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${r.tipo_registro === "ingreso" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-600"}`}>
                          {r.tipo_registro === "ingreso" ? "Ingreso" : "Gasto"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 hidden sm:table-cell">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${r.estado === "pagado" ? "bg-zinc-100 text-zinc-500" : "bg-amber-100 text-amber-600"}`}>
                          {r.estado === "pagado" ? "Pagado" : "Pendiente"}
                        </span>
                      </td>
                      <td className={`px-5 py-3.5 text-right font-semibold tabular-nums ${r.tipo_registro === "ingreso" ? "text-emerald-600" : "text-rose-500"}`}>
                        {r.tipo_registro === "gasto" ? "−" : "+"}
                        {formatCLP(r.monto_total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
