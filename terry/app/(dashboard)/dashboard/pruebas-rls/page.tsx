import { createClient } from "@/lib/supabase/server";
import { getContextoUsuario } from "@/lib/contexto-usuario";

export default async function PruebasRlsPage() {
  const supabase = await createClient();
  const contexto = await getContextoUsuario();

  const {
    data: { user },
    error: errorUsuario,
  } = await supabase.auth.getUser();

  const { data: miembrosOrganizacion, error: errorMiembrosOrganizacion } =
    await supabase
      .from("miembros_organizacion")
      .select("id, organizacion_id, usuario_id, rol");

  const { data: sucursales, error: errorSucursales } = await supabase
    .from("sucursales")
    .select("id, nombre, organizacion_id");

  const { data: miembrosSucursal, error: errorMiembrosSucursal } =
    await supabase
      .from("miembros_sucursal")
      .select("id, sucursal_id, usuario_id");

  const { data: registrosFinancieros, error: errorRegistrosFinancieros } =
    await supabase
      .from("registros_financieros")
      .select("id, descripcion, sucursal_id, organizacion_id, monto_total");

  return (
    <main className="p-6 space-y-8">
      <section>
        <h1 className="text-2xl font-semibold">Pruebas RLS</h1>
        <p className="text-sm text-gray-500">
          Esta pagina permite validar que cada usuario solo vea lo que le
          corresponde segun sus permisos.
        </p>
      </section>

      <section className="rounded-xl border p-4">
        <h2 className="text-lg font-semibold">Usuario autenticado</h2>
        {errorUsuario ? (
          <pre className="mt-3 text-sm text-red-600">
            {JSON.stringify(errorUsuario, null, 2)}
          </pre>
        ) : (
          <pre className="mt-3 text-sm">
            {JSON.stringify(user, null, 2)}
          </pre>
        )}
      </section>

      <section className="rounded-xl border p-4">
        <h2 className="text-lg font-semibold">Membresias de organizacion visibles</h2>
        {errorMiembrosOrganizacion ? (
          <pre className="mt-3 text-sm text-red-600">
            {JSON.stringify(errorMiembrosOrganizacion, null, 2)}
          </pre>
        ) : (
          <pre className="mt-3 text-sm">
            {JSON.stringify(miembrosOrganizacion, null, 2)}
          </pre>
        )}
      </section>

      <section className="rounded-xl border p-4">
        <h2 className="text-lg font-semibold">Sucursales visibles</h2>
        {errorSucursales ? (
          <pre className="mt-3 text-sm text-red-600">
            {JSON.stringify(errorSucursales, null, 2)}
          </pre>
        ) : (
          <pre className="mt-3 text-sm">
            {JSON.stringify(sucursales, null, 2)}
          </pre>
        )}
      </section>

      <section className="rounded-xl border p-4">
        <h2 className="text-lg font-semibold">Asignaciones visibles</h2>
        {errorMiembrosSucursal ? (
          <pre className="mt-3 text-sm text-red-600">
            {JSON.stringify(errorMiembrosSucursal, null, 2)}
          </pre>
        ) : (
          <pre className="mt-3 text-sm">
            {JSON.stringify(miembrosSucursal, null, 2)}
          </pre>
        )}
      </section>

      <section className="rounded-xl border p-4">
        <h2 className="text-lg font-semibold">Registros financieros visibles</h2>
        {errorRegistrosFinancieros ? (
          <pre className="mt-3 text-sm text-red-600">
            {JSON.stringify(errorRegistrosFinancieros, null, 2)}
          </pre>
        ) : (
          <pre className="mt-3 text-sm">
            {JSON.stringify(registrosFinancieros, null, 2)}
          </pre>
        )}
      </section>
      <form
        action={async (formData) => {
          "use server";
          const sucursalId = formData.get("sucursal_id") as string;
          const { setSucursalActiva } = await import(
            "@/app/actions/set-sucursal-activa"
          );
          await setSucursalActiva(sucursalId);
        }}
      >
        <select name="sucursal_id" defaultValue={contexto.sucursalActiva?.id}>
          {contexto.sucursales.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nombre}
            </option>
          ))}
        </select>

        <button type="submit">Cambiar</button>
      </form>
    </main>
  );
}