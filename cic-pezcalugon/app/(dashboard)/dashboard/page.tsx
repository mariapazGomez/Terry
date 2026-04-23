import Link from "next/link";
import dynamic from "next/dynamic";
import { getContextoUsuario } from "@/lib/contexto-usuario";
import {
  getResumenMes,
  getRegistrosFinancieros,
  getVentasDiarias,
  getComparativaMeses,
  getDistribucionEgresos,
} from "@/modules/registros-financieros/queries";
import { setSucursalActiva } from "@/app/actions/set-sucursal-activa";

const VentasChart = dynamic(() => import("@/components/dashboard/ventas-chart"), { ssr: false });
const ComparativaChart = dynamic(() => import("@/components/dashboard/comparativa-chart"), { ssr: false });
const DistribucionChart = dynamic(() => import("@/components/dashboard/distribucion-chart"), { ssr: false });

function formatCLP(amount: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(amount);
}

function KpiCard({
  label,
  value,
  sub,
  accent = "neutral",
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: "positive" | "negative" | "neutral" | "warning";
}) {
  const colors = {
    positive: "text-emerald-600",
    negative: "text-rose-500",
    warning: "text-amber-500",
    neutral: "text-zinc-950",
  };
  const dots = {
    positive: "bg-emerald-500",
    negative: "bg-rose-500",
    warning: "bg-amber-500",
    neutral: "bg-zinc-400",
  };

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-widest text-zinc-400">{label}</p>
        <span className={`h-1.5 w-1.5 rounded-full ${dots[accent]}`} />
      </div>
      <p className={`text-2xl font-semibold tracking-tight ${colors[accent]}`}>{value}</p>
      {sub && <p className="text-xs text-zinc-400 -mt-2">{sub}</p>}
    </div>
  );
}

function ChartCard({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-zinc-200 bg-white p-5 flex flex-col ${className}`}>
      <p className="text-xs font-medium uppercase tracking-widest text-zinc-400 mb-4">{title}</p>
      {children}
    </div>
  );
}

function mesAnterior(anio: number, mes: number) {
  return mes === 1 ? { anio: anio - 1, mes: 12 } : { anio, mes: mes - 1 };
}
function mesSiguiente(anio: number, mes: number) {
  return mes === 12 ? { anio: anio + 1, mes: 1 } : { anio, mes: mes + 1 };
}
function mesUrl(anio: number, mes: number) {
  return `/dashboard?anio=${anio}&mes=${mes}`;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ anio?: string; mes?: string }>;
}) {
  const params = await searchParams;
  const ahora = new Date();

  const anioDefault = ahora.getMonth() === 0 ? ahora.getFullYear() - 1 : ahora.getFullYear();
  const mesDefault = ahora.getMonth() === 0 ? 12 : ahora.getMonth();

  const anio = params.anio ? parseInt(params.anio) : anioDefault;
  const mes = params.mes ? parseInt(params.mes) : mesDefault;

  const esActual = anio === ahora.getFullYear() && mes === ahora.getMonth() + 1;
  const anterior = mesAnterior(anio, mes);
  const siguiente = mesSiguiente(anio, mes);
  const esFuturo =
    siguiente.anio > ahora.getFullYear() ||
    (siguiente.anio === ahora.getFullYear() && siguiente.mes > ahora.getMonth() + 1);

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
    <div className="p-6 space-y-5 max-w-6xl">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Link
            href={mesUrl(anterior.anio, anterior.mes)}
            className="rounded-lg border border-zinc-200 p-1.5 hover:border-zinc-400 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </Link>

          <div className="px-1">
            <h1 className="text-lg font-semibold tracking-tight text-zinc-950 capitalize">
              {resumen?.label ?? `${anio}`}
            </h1>
            {esActual && <p className="text-xs text-zinc-400 leading-none mt-0.5">Mes en curso</p>}
          </div>

          {!esFuturo && (
            <Link
              href={mesUrl(siguiente.anio, siguiente.mes)}
              className="rounded-lg border border-zinc-200 p-1.5 hover:border-zinc-400 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
          )}
        </div>

        {contexto.sucursales.length > 1 && (
          <form
            action={async (fd) => {
              "use server";
              await setSucursalActiva(String(fd.get("sucursal_id") ?? ""));
            }}
            className="flex items-center gap-2"
          >
            <select
              name="sucursal_id"
              defaultValue={contexto.sucursalActiva?.id}
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 outline-none focus:border-zinc-950"
            >
              {contexto.sucursales.map((s) => (
                <option key={s.id} value={s.id}>{s.nombre}</option>
              ))}
            </select>
            <button type="submit" className="rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-600 hover:border-zinc-400 transition-colors">
              Cambiar
            </button>
          </form>
        )}
      </div>

      {/* ── Sin sucursal ───────────────────────────────────────── */}
      {!contexto.sucursalActiva ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-10 text-center">
          <p className="text-sm text-zinc-400">No hay sucursal activa seleccionada.</p>
        </div>

      ) : sinDatos ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-10 text-center space-y-2">
          <p className="text-sm text-zinc-500">Sin registros para este período.</p>
          <p className="text-xs text-zinc-400">
            <Link href="/dashboard/registros" className="underline underline-offset-2">Agregar registros</Link>
            {" · "}
            <Link href="/dashboard/seed" className="underline underline-offset-2">Datos de prueba</Link>
          </p>
        </div>

      ) : (
        <>
          {/* ── KPI Cards ──────────────────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard label="Ingresos" value={formatCLP(resumen!.ingresos)} sub={`${resumen!.totalRegistros} registros`} accent="positive" />
            <KpiCard label="Egresos" value={formatCLP(resumen!.egresos)} accent="negative" />
            <KpiCard
              label="Balance neto"
              value={formatCLP(resumen!.balance)}
              accent={resumen!.balance >= 0 ? "positive" : "negative"}
            />
            <KpiCard
              label="Pendientes de pago"
              value={String(resumen!.pendientes)}
              sub={resumen!.pendientes === 1 ? "registro" : "registros"}
              accent={resumen!.pendientes > 0 ? "warning" : "neutral"}
            />
          </div>

          {/* ── Charts fila 1 ──────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <ChartCard title="Flujo diario del mes" className="lg:col-span-2">
              <div className="h-52">
                <VentasChart data={ventasDiarias} />
              </div>
              <div className="flex items-center gap-4 mt-3 text-xs text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />Ingresos
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-2 w-2 rounded-full bg-rose-400" />Egresos
                </span>
              </div>
            </ChartCard>

            <ChartCard title="Distribución egresos">
              <div className="h-64">
                <DistribucionChart data={distribucion} />
              </div>
            </ChartCard>
          </div>

          {/* ── Charts fila 2 ──────────────────────────────────── */}
          <ChartCard title="Comparativa últimos 5 meses">
            <div className="h-52">
              <ComparativaChart data={comparativa} />
            </div>
          </ChartCard>

          {/* ── Últimos movimientos ────────────────────────────── */}
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-zinc-400 mb-3">
              Últimos movimientos
            </p>

            {registros.length === 0 ? (
              <div className="rounded-xl border border-zinc-200 bg-white p-6 text-center">
                <p className="text-sm text-zinc-400">No hay movimientos en este período.</p>
              </div>
            ) : (
              <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-100">
                      {["Fecha", "Descripción", "Tipo", "Estado", "Monto"].map((h, i) => (
                        <th
                          key={h}
                          className={`px-4 py-3 text-xs font-medium uppercase tracking-widest text-zinc-400 ${i === 4 ? "text-right" : "text-left"} ${i >= 2 && i <= 3 ? "hidden sm:table-cell" : ""}`}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {registros.map((r) => (
                      <tr key={r.id} className="hover:bg-zinc-50 transition-colors">
                        <td className="px-4 py-3 text-zinc-400 tabular-nums text-xs">
                          {new Date(r.fecha_emision + "T12:00:00").toLocaleDateString("es-CL")}
                        </td>
                        <td className="px-4 py-3 text-zinc-700 max-w-xs truncate">
                          {r.descripcion ?? r.tercero_nombre ?? "—"}
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${r.tipo_registro === "ingreso" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-600"}`}>
                            {r.tipo_registro === "ingreso" ? "Ingreso" : "Gasto"}
                          </span>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${r.estado === "pagado" ? "bg-zinc-100 text-zinc-500" : "bg-amber-50 text-amber-600"}`}>
                            {r.estado === "pagado" ? "Pagado" : "Pendiente"}
                          </span>
                        </td>
                        <td className={`px-4 py-3 text-right font-medium tabular-nums text-sm ${r.tipo_registro === "ingreso" ? "text-emerald-600" : "text-rose-500"}`}>
                          {r.tipo_registro === "gasto" ? "−" : "+"}
                          {formatCLP(r.monto_total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
