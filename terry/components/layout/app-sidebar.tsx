"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    href: "/dashboard",
    label: "Resumen",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    href: "/dashboard/registros",
    label: "Registros",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" />
        <line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" />
        <line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
      </svg>
    ),
  },
  {
    href: "/dashboard/ventas",
    label: "Ventas",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
        <line x1="12" y1="12" x2="12" y2="16" />
        <line x1="10" y1="14" x2="14" y2="14" />
      </svg>
    ),
  },
  {
    href: "/dashboard/ingresos",
    label: "Ingresos",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </svg>
    ),
  },
  {
    href: "/dashboard/gastos",
    label: "Gastos",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
        <polyline points="17 18 23 18 23 12" />
      </svg>
    ),
  },
  {
    href: "/dashboard/documentos",
    label: "Documentos",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
    ),
  },
  {
    href: "/dashboard/reportes",
    label: "Reportes",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
];

export default function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside
      style={{
        width: 200, flexShrink: 0,
        minHeight: "calc(100vh - 3.5rem)",
        background: "white",
        borderRight: "1px solid rgba(10,10,10,0.08)",
        display: "flex", flexDirection: "column",
      }}
    >
      <nav style={{ flex: 1, padding: "16px 10px" }}>
        <p
          style={{
            padding: "0 10px", marginBottom: 8,
            fontSize: 10, fontWeight: 600, letterSpacing: "0.05em",
            textTransform: "uppercase", color: "rgba(10,10,10,0.35)",
            fontFamily: "var(--font-mono)",
          }}
        >
          Menú
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {navItems.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "7px 10px", borderRadius: 7,
                  fontSize: 13, fontWeight: isActive ? 600 : 500,
                  color: isActive ? "#0a0a0a" : "rgba(10,10,10,0.55)",
                  background: isActive ? "rgba(10,10,10,0.06)" : "transparent",
                  textDecoration: "none", transition: "background 0.15s, color 0.15s",
                }}
              >
                <span style={{ color: isActive ? "#0a0a0a" : "rgba(10,10,10,0.35)" }}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <div style={{ padding: "0 14px 16px" }}>
        <div style={{ borderTop: "1px solid rgba(10,10,10,0.08)", paddingTop: 12 }}>
          <p style={{ fontSize: 10.5, color: "rgba(10,10,10,0.30)", fontFamily: "var(--font-mono)" }}>
            v0.1.0
          </p>
        </div>
      </div>
    </aside>
  );
}
