export const dynamic = "force-dynamic";

import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getContextoUsuario } from "@/lib/contexto-usuario";
import AppHeader from "@/components/layout/app-header";
import AppSidebar from "@/components/layout/app-sidebar";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const contexto = await getContextoUsuario().catch(() => null);
  if (!contexto) redirect("/login");
  if (!contexto.onboardingCompletado) redirect("/onboarding");

  const { user } = contexto;

  const now = new Date();
  const mes = now.toLocaleDateString("es-CL", { month: "short" });
  const anio = now.getFullYear();
  const periodLabel = `${mes.charAt(0).toUpperCase() + mes.slice(1)} · ${anio}`;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "white" }}>
      <AppHeader
        userEmail={user.email}
        sucursalNombre={contexto.sucursalActiva?.nombre}
        periodLabel={periodLabel}
      />
      <div className="flex flex-1 overflow-hidden">
        <AppSidebar />
        <main className="flex-1 overflow-auto" style={{ background: "#faf9f7" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
