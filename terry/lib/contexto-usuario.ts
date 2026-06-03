import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import type { User } from "@supabase/supabase-js";

type SucursalVisible = {
  id: string;
  nombre: string;
};

type ContextoUsuario = {
  user: User;
  organizacionId: string;
  orgNombre: string;
  onboardingCompletado: boolean;
  rol: "admin" | "lector";
  sucursales: SucursalVisible[];
  sucursalActiva: SucursalVisible | null;
};

export const getContextoUsuario = cache(async (): Promise<ContextoUsuario> => {
  const supabase = await createClient();

  // 1. usuario autenticado
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuario no autenticado");
  }

  // 2. obtener organización + rol
  const { data: miembroOrg, error: errorOrg } = await supabase
    .from("miembros_organizacion")
    .select("organizacion_id, rol")
    .eq("usuario_id", user.id)
    .single();

  if (errorOrg || !miembroOrg) {
    throw new Error("Usuario sin organizacion asignada");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: org } = await (supabase as any)
    .from("organizaciones")
    .select("nombre, onboarding_completado")
    .eq("id", miembroOrg.organizacion_id)
    .single();

  // 3. obtener sucursales visibles
  let sucursales: SucursalVisible[] = [];

  if (miembroOrg.rol === "admin") {
    // admin ve todas las sucursales de su organización
    const { data } = await supabase
      .from("sucursales")
      .select("id, nombre")
      .eq("organizacion_id", miembroOrg.organizacion_id);

    sucursales = data ?? [];
  } else {
    // lector solo ve las asignadas
    const { data } = await supabase
      .from("miembros_sucursal")
      .select("sucursal:sucursales(id, nombre)")
      .eq("usuario_id", user.id);

    sucursales =
      data
        ?.map(
          (item: { sucursal: SucursalVisible | null }) => item.sucursal
        )
        .filter((sucursal): sucursal is SucursalVisible => Boolean(sucursal)) ?? [];
  }

  const cookieStore = await cookies();
  const sucursalCookie = cookieStore.get("sucursal_activa");

  let sucursalActiva: SucursalVisible | null = null;

  if (sucursalCookie) {
    sucursalActiva = sucursales.find((s) => s.id === sucursalCookie.value) ?? null;
  }

  // fallback: primera sucursal
  if (!sucursalActiva && sucursales.length > 0) {
    sucursalActiva = sucursales[0];
  }

  return {
    user,
    organizacionId: miembroOrg.organizacion_id,
    orgNombre: org?.nombre ?? "",
    onboardingCompletado: org?.onboarding_completado ?? false,
    rol: miembroOrg.rol as "admin" | "lector",
    sucursales,
    sucursalActiva,
  };
});