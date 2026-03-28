import { getContextoUsuario } from "@/lib/contexto-usuario";

export default async function DashboardPage() {
  const contexto = await getContextoUsuario();

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <section className="rounded-xl border p-4">
        <h2 className="font-semibold">Usuario</h2>
        <pre className="text-sm mt-2">
          {JSON.stringify(contexto.user.email, null, 2)}
        </pre>
      </section>

      <section className="rounded-xl border p-4">
        <h2 className="font-semibold">Rol</h2>
        <p>{contexto.rol}</p>
      </section>

      <section className="rounded-xl border p-4">
        <h2 className="font-semibold">Organizacion</h2>
        <p>{contexto.organizacionId}</p>
      </section>

      <section className="rounded-xl border p-4">
        <h2 className="font-semibold">Sucursales visibles</h2>
        <pre className="text-sm mt-2">
          {JSON.stringify(contexto.sucursales, null, 2)}
        </pre>
      </section>
    </main>
  );
}