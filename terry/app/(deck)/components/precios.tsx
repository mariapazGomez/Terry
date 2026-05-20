const planes = [
  {
    nombre: "Solo",
    precio: "$19",
    moneda: "USD/mes",
    descripcion: "1 sucursal · hasta 2 usuarios",
    incluye: [
      "Agente Terry",
      "Dashboard financiero",
      "1 integración (POS)",
      "Historial 3 meses",
    ],
    destacado: false,
    cta: "Unirme a la lista",
  },
  {
    nombre: "Pro",
    precio: "$39",
    moneda: "USD/mes",
    descripcion: "1 sucursal · hasta 5 usuarios",
    incluye: [
      "Todo lo de Solo",
      "Todas las integraciones",
      "Alertas inteligentes",
      "Proyecciones 90 días",
      "Historial 12 meses",
    ],
    destacado: true,
    cta: "Unirme a la lista",
  },
  {
    nombre: "Multi-local",
    precio: "$29",
    moneda: "USD/suc/mes",
    descripcion: "2+ sucursales · usuarios ilimitados",
    incluye: [
      "Todo lo de Pro",
      "Vista consolidada multi-sucursal",
      "Comparativa entre locales",
      "Roles y permisos",
      "Soporte prioritario",
    ],
    destacado: false,
    cta: "Unirme a la lista",
  },
];

export function Precios() {
  return (
    <section className="bg-white px-6 py-20 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Precio fijo. Sin sorpresas.
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Precio en USD para estabilidad ante la variación del CLP.
          </p>
        </div>
        <div className="mt-12 grid gap-8 sm:grid-cols-3">
          {planes.map((plan) => (
            <div
              key={plan.nombre}
              className={`relative rounded-2xl p-8 ${
                plan.destacado
                  ? "bg-emerald-600 text-white shadow-xl ring-2 ring-emerald-600"
                  : "bg-white shadow-sm ring-1 ring-gray-200"
              }`}
            >
              {plan.destacado && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-emerald-900 px-4 py-1 text-xs font-semibold text-white">
                    Recomendado
                  </span>
                </div>
              )}
              <h3
                className={`text-lg font-bold ${plan.destacado ? "text-white" : "text-gray-900"}`}
              >
                {plan.nombre}
              </h3>
              <div className="mt-4 flex items-end gap-1">
                <span
                  className={`text-4xl font-bold ${plan.destacado ? "text-white" : "text-gray-900"}`}
                >
                  {plan.precio}
                </span>
                <span
                  className={`mb-1 text-sm ${plan.destacado ? "text-emerald-100" : "text-gray-500"}`}
                >
                  {plan.moneda}
                </span>
              </div>
              <p
                className={`mt-1 text-sm ${plan.destacado ? "text-emerald-100" : "text-gray-500"}`}
              >
                {plan.descripcion}
              </p>
              <ul className="mt-6 space-y-2">
                {plan.incluye.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm">
                    <span
                      className={`mt-0.5 ${plan.destacado ? "text-emerald-200" : "text-emerald-600"}`}
                    >
                      ✓
                    </span>
                    <span
                      className={plan.destacado ? "text-emerald-50" : "text-gray-700"}
                    >
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
              <a
                href="#waitlist"
                className={`mt-8 block rounded-full px-6 py-3 text-center text-sm font-semibold transition ${
                  plan.destacado
                    ? "bg-white text-emerald-700 hover:bg-emerald-50"
                    : "bg-emerald-600 text-white hover:bg-emerald-700"
                }`}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>
        <p className="mt-8 text-center text-sm text-gray-500">
          Acceso anticipado con precio piloto:{" "}
          <strong>$9–15 USD/mes los primeros 2 meses.</strong> Luego pasa al
          plan elegido.
        </p>
      </div>
    </section>
  );
}
