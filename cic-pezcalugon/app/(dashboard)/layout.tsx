import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppHeader from "@/components/layout/app-header";
import AppSidebar from "@/components/layout/app-sidebar";
import UserMenu from "@/components/layout/user-menu";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-white">
      <AppHeader userEmail={user.email} />

      <div className="flex min-h-[calc(100vh-4rem)]">
        <AppSidebar />

        <main className="flex-1 p-6">
          <div className="mb-6 flex justify-end">
            <UserMenu />
          </div>

          {children}
        </main>
      </div>
    </div>
  );
}