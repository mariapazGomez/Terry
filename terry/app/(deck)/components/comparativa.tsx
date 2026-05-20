const filas = [
  {
    alternativa: "Excel manual",
    problema: "Actualización semanal, propenso a errores, sin tiempo real",
    terry: "Datos actualizados automáticamente, sin trabajo manual",
  },
  {
    alternativa: "WhatsApp al contador",
    problema: "Lento, caro y sin disponibilidad 24/7",
    terry: "Terry responde en segundos sobre datos actualizados",
  },
  {
    alternativa: "Reporte del POS",
    problema: "Solo muestra ventas — no gastos ni rentabilidad",
    terry: "Centraliza POS + gastos + facturas en una sola vista",
  },
  {
    alternativa: "Contador externo",
    problema: "$100–300 USD/mes, datos con semanas de retraso",
    terry: "Visibilidad diaria, a una fracción del costo",
  },
];

export function Comparativa() {
  return (
    <section className="bg-gray-50 px-6 py-20 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Terry vs. lo que haces hoy
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            El mayor competidor de Terry no es un software. Es el hábito manual.
          </p>
        </div>
        <div className="mt-10 overflow-hidden rounded-2xl shadow-sm ring-1 ring-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-900 text-white">
              <tr>
                <th className="px-6 py-4 text-left font-semibold">
                  Lo que usas hoy
                </th>
                <th className="px-6 py-4 text-left font-semibold text-gray-400">
                  El problema
                </th>
                <th className="px-6 py-4 text-left font-semibold text-emerald-400">
                  Con Terry
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filas.map((fila) => (
                <tr key={fila.alternativa}>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {fila.alternativa}
                  </td>
                  <td className="px-6 py-4 text-gray-500">{fila.problema}</td>
                  <td className="px-6 py-4 text-emerald-700">{fila.terry}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
