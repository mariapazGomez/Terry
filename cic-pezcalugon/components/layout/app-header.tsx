"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/modules/auth/actions";

const NAV = [
  { id: "inicio",    href: "/dashboard",         label: "Inicio" },
  { id: "reportes",  href: "/dashboard/reportes", label: "Reportes" },
  { id: "settings",  href: "/dashboard/settings", label: "Settings" },
];

type AppHeaderProps = {
  userEmail?: string;
  sucursalNombre?: string;
  periodLabel?: string;
};

export default function AppHeader({ userEmail, sucursalNombre, periodLabel }: AppHeaderProps) {
  const pathname = usePathname();

  const initials = userEmail
    ? userEmail.slice(0, 2).toUpperCase()
    : "??";

  return (
    <header
      className="h-14 flex items-center gap-4 px-5 flex-shrink-0"
      style={{
        background: "white",
        borderBottom: "1px solid rgba(10,10,10,0.08)",
        fontFamily: "var(--font-sans)",
      }}
    >
      {/* Logo + brand */}
      <div className="flex items-center gap-2">
        <div
          style={{
            width: 26, height: 26, borderRadius: 7,
            background: "#0a0a0a", color: "white",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 700, fontSize: 13, letterSpacing: "-0.02em",
            flexShrink: 0,
          }}
        >
          T
        </div>
        <div className="flex items-baseline gap-1.5">
          <span style={{ fontSize: 14, fontWeight: 600, color: "#0a0a0a", letterSpacing: "-0.01em" }}>
            terry
          </span>
          <span
            className="terry-tag"
            style={{
              background: "oklch(0.96 0.08 85)",
              color: "oklch(0.45 0.12 75)",
              letterSpacing: "0.04em",
              whiteSpace: "nowrap",
            }}
          >
            BETA 1.0
          </span>
        </div>
      </div>

      {/* Divider */}
      <div style={{ width: 1, height: 20, background: "rgba(10,10,10,0.13)" }} />

      {/* Navigation */}
      <nav className="flex items-center gap-0.5">
        {NAV.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.id}
              href={item.href}
              style={{
                padding: "6px 12px",
                borderRadius: 6,
                fontSize: 12.5,
                fontWeight: isActive ? 600 : 500,
                color: isActive ? "#0a0a0a" : "rgba(10,10,10,0.50)",
                background: isActive ? "rgba(10,10,10,0.07)" : "transparent",
                letterSpacing: "-0.005em",
                transition: "background 0.15s, color 0.15s",
                textDecoration: "none",
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Sucursal */}
      {sucursalNombre && (
        <span style={{ fontSize: 11.5, color: "rgba(10,10,10,0.50)", fontFamily: "var(--font-mono)" }}>
          {sucursalNombre}
        </span>
      )}

      {/* Period indicator */}
      {periodLabel && (
        <div
          style={{
            display: "flex", alignItems: "center", gap: 6,
            fontSize: 11.5, color: "rgba(10,10,10,0.70)",
            padding: "5px 10px",
            border: "1px solid rgba(10,10,10,0.13)", borderRadius: 7,
            fontFamily: "var(--font-mono)",
          }}
        >
          <span
            style={{
              display: "inline-block", width: 6, height: 6,
              borderRadius: "50%", background: "oklch(0.62 0.15 145)",
            }}
          />
          {periodLabel}
        </div>
      )}

      {/* Avatar / logout */}
      <form action={logout}>
        <button
          type="submit"
          title={`Cerrar sesión · ${userEmail}`}
          style={{
            width: 28, height: 28, borderRadius: "50%",
            background: "#0a0a0a", color: "white",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, fontWeight: 600, letterSpacing: "0.02em",
            border: "none", cursor: "pointer",
            transition: "opacity 0.15s",
          }}
          onMouseOver={(e) => (e.currentTarget.style.opacity = "0.8")}
          onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
        >
          {initials}
        </button>
      </form>
    </header>
  );
}
