export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-2xl font-semibold">Resumen general</h2>
        <p className="text-sm text-gray-500">
          Vista inicial del estado financiero del emprendimiento.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border p-4">
          <p className="text-sm text-gray-500">Ingresos del mes</p>
          <p className="mt-2 text-2xl font-bold">$0</p>
        </div>

        <div className="rounded-xl border p-4">
          <p className="text-sm text-gray-500">Gastos del mes</p>
          <p className="mt-2 text-2xl font-bold">$0</p>
        </div>

        <div className="rounded-xl border p-4">
          <p className="text-sm text-gray-500">Balance</p>
          <p className="mt-2 text-2xl font-bold">$0</p>
        </div>
      </section>

      <section className="rounded-xl border p-4">
        <h3 className="text-lg font-semibold">Movimientos recientes</h3>
        <p className="mt-2 text-sm text-gray-500">
          Aquí mostraremos los últimos registros financieros.
        </p>
      </section>

      <section className="rounded-xl border p-4">
        <h3 className="text-lg font-semibold">Preparación para reporting</h3>
        <p className="mt-2 text-sm text-gray-500">
          Esta app manejará la operación diaria. Más adelante, los informes
          imprimibles se apoyarán en una capa de reporting preparada para Looker.
        </p>
      </section>
    </div>
  );
}