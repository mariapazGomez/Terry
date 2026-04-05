import Link from "next/link";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/registros", label: "Registros" },
  { href: "/dashboard/gastos", label: "Gastos" },
  { href: "/dashboard/ingresos", label: "Ingresos" },
  { href: "/dashboard/documentos", label: "Documentos" },
  { href: "/dashboard/reportes", label: "Reportes" },
];

export default function AppSidebar() {
  return (
    <aside className="w-64 border-r bg-gray-50 p-4">
      <div className="mb-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Navegación
        </h2>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-200"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}