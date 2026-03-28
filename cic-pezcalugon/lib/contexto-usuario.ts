import { createClient } from "@/lib/supabase/server";

export async function getContextoUsuario() {
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

  // 3. obtener sucursales visibles
  let sucursales = [];

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
      data?.map((item: any) => item.sucursal).filter(Boolean) ?? [];
  }

  return {
    user,
    organizacionId: miembroOrg.organizacion_id,
    rol: miembroOrg.rol,
    sucursales,
  };
}