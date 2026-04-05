import { getContextoUsuario } from "@/lib/contexto-usuario";
import { setSucursalActiva } from "@/app/actions/set-sucursal-activa";

export default async function DashboardPage() {
  const contexto = await getContextoUsuario();

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <section className="rounded-xl border p-4">
        <h2 className="font-semibold">Usuario</h2>
        <p className="mt-2 text-sm">{contexto.user?.email}</p>
      </section>

      <section className="rounded-xl border p-4">
        <h2 className="font-semibold">Rol</h2>
        <p className="mt-2 text-sm">{contexto.rol}</p>
      </section>

      <section className="rounded-xl border p-4">
        <h2 className="font-semibold">Organizacion</h2>
        <p className="mt-2 text-sm">{contexto.organizacionId}</p>
      </section>

      <section className="rounded-xl border p-4 space-y-4">
        <div>
          <h2 className="font-semibold">Sucursal activa</h2>
          <p className="mt-2 text-sm">
            {contexto.sucursalActiva?.nombre ?? "Sin sucursal activa"}
          </p>
        </div>

        <form
          action={async (formData) => {
            "use server";
            const sucursalId = String(formData.get("sucursal_id") ?? "");
            await setSucursalActiva(sucursalId);
          }}
          className="flex items-center gap-3"
        >
          <select
            name="sucursal_id"
            defaultValue={contexto.sucursalActiva?.id}
            className="border rounded-md px-3 py-2 text-sm"
          >
            {contexto.sucursales.map((sucursal) => (
              <option key={sucursal.id} value={sucursal.id}>
                {sucursal.nombre}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="rounded-md border px-3 py-2 text-sm"
          >
            Cambiar sucursal
          </button>
        </form>
      </section>

      <section className="rounded-xl border p-4">
        <h2 className="font-semibold">Sucursales visibles</h2>
        <pre className="mt-2 text-sm">
          {JSON.stringify(contexto.sucursales, null, 2)}
        </pre>
      </section>
    </main>
  );
}