import { createClient } from "@/lib/supabase/server";
import { getContextoUsuario } from "@/lib/contexto-usuario";

export async function getCategorias() {
  const supabase = await createClient();
  const contexto = await getContextoUsuario();

  const { data, error } = await supabase
    .from("categorias")
    .select("id, nombre, tipo")
    .eq("organizacion_id", contexto.organizacionId)
    .order("nombre");

  if (error) {
    throw new Error("No se pudieron obtener las categorias");
  }

  return data ?? [];
}

export async function getRegistrosFinancieros() {
  const supabase = await createClient();
  const contexto = await getContextoUsuario();

  if (!contexto.sucursalActiva) {
    return [];
  }

  const { data, error } = await supabase
    .from("registros_financieros")
    .select(`
      id,
      tipo_registro,
      estado,
      fecha_emision,
      moneda,
      categoria_id,
      numero_documento,
      tercero_nombre,
      monto_neto,
      monto_impuesto,
      monto_total,
      descripcion,
      sucursal_id
    `)
    .eq("sucursal_id", contexto.sucursalActiva.id)
    .order("fecha_emision", { ascending: false });

  if (error) {
    throw new Error("No se pudieron obtener los registros financieros");
  }

  return data ?? [];
}