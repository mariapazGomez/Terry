import { getContextoUsuario } from "@/lib/contexto-usuario";
import { getResumenMes } from "@/modules/registros-financieros/queries";
import { getRegistrosFinancieros } from "@/modules/registros-financieros/queries";
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
      <p className="text-xs font-medium uppercase tracking-widest text-zinc-400">
        {label}
      </p>
      <p className={`mt-2 text-2xl font-semibold tracking-tight ${valueColor}`}>
        {value}
      </p>
      {sub && <p className="mt-1 text-xs text-zinc-400">{sub}</p>}
    </div>
  );
}

export default async function DashboardPage() {
  const contexto = await getContextoUsuario();
  const resumen = await getResumenMes();
  const registros = await getRegistrosFinancieros();
  const ultimos = registros.slice(0, 5);

  const mesCapitalizado = resumen?.mes
    ? resumen.mes.charAt(0).toUpperCase() + resumen.mes.slice(1)
    : "";

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-950">
            Resumen
          </h1>
          {mesCapitalizado && (
            <p className="mt-0.5 text-sm text-zinc-400">{mesCapitalizado}</p>
          )}
        </div>

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
                <option key={s.id} value={s.id}>
                  {s.nombre}
                </option>
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

      {!contexto.sucursalActiva ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center">
          <p className="text-sm text-zinc-400">No hay sucursal activa seleccionada.</p>
        </div>
      ) : resumen ? (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <KpiCard
              label="Ingresos del mes"
              value={formatCLP(resumen.ingresos)}
              accent="positive"
            />
            <KpiCard
              label="Egresos del mes"
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

          <div>
            <h2 className="mb-3 text-sm font-medium text-zinc-500 uppercase tracking-widest">
              Últimos movimientos
            </h2>

            {ultimos.length === 0 ? (
              <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center">
                <p className="text-sm text-zinc-400">
                  No hay registros este mes.{" "}
                  <a href="/dashboard/registros" className="text-zinc-950 underline underline-offset-2">
                    Agregar registro
                  </a>
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-100">
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-widest text-zinc-400">
                        Fecha
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-widest text-zinc-400">
                        Descripción
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-widest text-zinc-400">
                        Tipo
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-widest text-zinc-400">
                        Estado
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-widest text-zinc-400">
                        Monto
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {ultimos.map((r) => (
                      <tr key={r.id} className="hover:bg-zinc-50 transition-colors">
                        <td className="px-4 py-3 text-zinc-500 tabular-nums">
                          {new Date(r.fecha_emision).toLocaleDateString("es-CL")}
                        </td>
                        <td className="px-4 py-3 text-zinc-700">
                          {r.descripcion ?? r.tercero_nombre ?? "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                              r.tipo_registro === "ingreso"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-red-50 text-red-600"
                            }`}
                          >
                            {r.tipo_registro === "ingreso" ? "Ingreso" : "Gasto"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                              r.estado === "pagado"
                                ? "bg-zinc-100 text-zinc-600"
                                : "bg-amber-50 text-amber-600"
                            }`}
                          >
                            {r.estado === "pagado" ? "Pagado" : "Pendiente"}
                          </span>
                        </td>
                        <td
                          className={`px-4 py-3 text-right font-medium tabular-nums ${
                            r.tipo_registro === "ingreso"
                              ? "text-emerald-600"
                              : "text-red-500"
                          }`}
                        >
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
      ) : (
        <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center">
          <p className="text-sm text-zinc-400">Sin datos para el mes actual.</p>
        </div>
      )}
    </div>
  );
}
