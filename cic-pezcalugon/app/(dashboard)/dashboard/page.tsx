import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { logout } from "@/modules/auth/actions";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Dashboard</h1>
      <p>Sesión iniciada como: {user.email}</p>

      <form action={logout}>
        <button className="border px-3 py-2 rounded-md">
          Cerrar sesión
        </button>
      </form>
    </main>
  );
}