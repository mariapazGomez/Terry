import Link from "next/link";
import { getContextoUsuario } from "@/lib/contexto-usuario";
import { getResumenMes, getRegistrosFinancieros } from "@/modules/registros-financieros/queries";
import { setSucursalActiva } from "@/app/actions/set-sucursal-activa";

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
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: "positive" | "negative" | "neutral";
}) {
  const valueColor =
    accent === "positive"
      ? "text-emerald-600"
      : accent === "negative"
        ? "text-red-500"
        : "text-zinc-950";

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5">
      <p className="text-xs font-medium uppercase tracking-widest text-zinc-400">{label}</p>
      <p className={`mt-2 text-2xl font-semibold tracking-tight ${valueColor}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-zinc-400">{sub}</p>}
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

  // Por defecto mostrar el último mes completo (mes anterior al actual)
  const anioDefault = ahora.getMonth() === 0 ? ahora.getFullYear() - 1 : ahora.getFullYear();
  const mesDefault = ahora.getMonth() === 0 ? 12 : ahora.getMonth();

  const anio = params.anio ? parseInt(params.anio) : anioDefault;
  const mes = params.mes ? parseInt(params.mes) : mesDefault;

  const esActual = anio === ahora.getFullYear() && mes === ahora.getMonth() + 1;
  const anterior = mesAnterior(anio, mes);
  const siguiente = mesSiguiente(anio, mes);
  const esFuturo = siguiente.anio > ahora.getFullYear() ||
    (siguiente.anio === ahora.getFullYear() && siguiente.mes > ahora.getMonth() + 1);

  const contexto = await getContextoUsuario();
  const resumen = await getResumenMes(anio, mes);
  const registros = await getRegistrosFinancieros(anio, mes);

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      {/* Header row */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Navegación de meses */}
          <Link
            href={mesUrl(anterior.anio, anterior.mes)}
            className="rounded-md border border-zinc-200 p-1.5 hover:border-zinc-400 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </Link>

          <div>
            <h1 className="text-xl font-semibold tracking-tight text-zinc-950 capitalize">
              {resumen?.label ?? "Sin datos"}
            </h1>
            {esActual && (
              <p className="text-xs text-zinc-400">Mes en curso</p>
            )}
          </div>

          {!esFuturo && (
            <Link
              href={mesUrl(siguiente.anio, siguiente.mes)}
              className="rounded-md border border-zinc-200 p-1.5 hover:border-zinc-400 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
          )}
        </div>

        {/* Selector sucursal */}
        {contexto.sucursales.length > 1 && (
          <form
            action={async (formData) => {
              "use server";
              await setSucursalActiva(String(formData.get("sucursal_id") ?? ""));
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
            <button
              type="submit"
              className="rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-600 hover:border-zinc-400 transition-colors"
            >
              Cambiar
            </button>
          </form>
        )}
      </div>

      {/* Contenido */}
      {!contexto.sucursalActiva ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center">
          <p className="text-sm text-zinc-400">No hay sucursal activa seleccionada.</p>
        </div>
      ) : !resumen || resumen.totalRegistros === 0 ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center space-y-2">
          <p className="text-sm text-zinc-500">Sin registros para este período.</p>
          <p className="text-xs text-zinc-400">
            <Link href="/dashboard/registros" className="underline underline-offset-2 hover:text-zinc-700">
              Agregar registros
            </Link>
            {" "}o use{" "}
            <Link href="/dashboard/seed" className="underline underline-offset-2 hover:text-zinc-700">
              datos de prueba
            </Link>
          </p>
        </div>
      ) : (
        <>
          {/* KPI cards */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <KpiCard
              label="Ingresos"
              value={formatCLP(resumen.ingresos)}
              sub={`${resumen.totalRegistros} registros`}
              accent="positive"
            />
            <KpiCard
              label="Egresos"
              value={formatCLP(resumen.egresos)}
              accent="negative"
            />
            <KpiCard
              label="Balance neto"
              value={formatCLP(resumen.balance)}
              accent={resumen.balance >= 0 ? "positive" : "negative"}
            />
            <KpiCard
              label="Pendientes de pago"
              value={String(resumen.pendientes)}
              sub={resumen.pendientes === 1 ? "registro" : "registros"}
              accent="neutral"
            />
          </div>

          {/* Últimos movimientos */}
          <div>
            <h2 className="mb-3 text-xs font-medium uppercase tracking-widest text-zinc-400">
              Últimos movimientos
            </h2>

            {registros.length === 0 ? (
              <div className="rounded-xl border border-zinc-200 bg-white p-6 text-center">
                <p className="text-sm text-zinc-400">No hay movimientos en este período.</p>
              </div>
            ) : (
              <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-100">
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-widest text-zinc-400">Fecha</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-widest text-zinc-400">Descripción</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-widest text-zinc-400 hidden sm:table-cell">Tipo</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-widest text-zinc-400 hidden sm:table-cell">Estado</th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-widest text-zinc-400">Monto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {registros.map((r) => (
                      <tr key={r.id} className="hover:bg-zinc-50 transition-colors">
                        <td className="px-4 py-3 text-zinc-500 tabular-nums text-xs">
                          {new Date(r.fecha_emision + 'T12:00:00').toLocaleDateString("es-CL")}
                        </td>
                        <td className="px-4 py-3 text-zinc-700 max-w-xs truncate">
                          {r.descripcion ?? r.tercero_nombre ?? "—"}
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                            r.tipo_registro === "ingreso"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-red-50 text-red-600"
                          }`}>
                            {r.tipo_registro === "ingreso" ? "Ingreso" : "Gasto"}
                          </span>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                            r.estado === "pagado"
                              ? "bg-zinc-100 text-zinc-600"
                              : "bg-amber-50 text-amber-600"
                          }`}>
                            {r.estado === "pagado" ? "Pagado" : "Pendiente"}
                          </span>
                        </td>
                        <td className={`px-4 py-3 text-right font-medium tabular-nums ${
                          r.tipo_registro === "ingreso" ? "text-emerald-600" : "text-red-500"
                        }`}>
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
