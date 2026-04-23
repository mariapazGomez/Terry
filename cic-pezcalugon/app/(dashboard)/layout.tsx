import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getContextoUsuario } from "@/lib/contexto-usuario";
import AppHeader from "@/components/layout/app-header";
import AppSidebar from "@/components/layout/app-sidebar";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const contexto = await getContextoUsuario();

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <AppHeader
        userEmail={user.email}
        sucursalNombre={contexto.sucursalActiva?.nombre}
      />
      <div className="flex flex-1">
        <AppSidebar />
        <main className="flex-1 bg-zinc-50 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
