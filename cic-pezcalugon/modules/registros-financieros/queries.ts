import { createClient } from "@/lib/supabase/server";
import { getContextoUsuario } from "@/lib/contexto-usuario";

export async function getResumenMes(anio: number, mes: number) {
  const supabase = await createClient();
  const contexto = await getContextoUsuario();

  if (!contexto.sucursalActiva) return null;

  const inicioMes = new Date(anio, mes - 1, 1).toISOString().split("T")[0];
  const finMes = new Date(anio, mes, 0).toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("registros_financieros")
    .select("tipo_registro, monto_total, monto_impuesto, estado")
    .eq("sucursal_id", contexto.sucursalActiva.id)
    .gte("fecha_emision", inicioMes)
    .lte("fecha_emision", finMes);

  if (error) throw new Error(error.message);

  const registros = data ?? [];

  const ingresos = registros
    .filter((r) => r.tipo_registro === "ingreso")
    .reduce((sum, r) => sum + r.monto_total, 0);

  const egresos = registros
    .filter((r) => r.tipo_registro === "gasto")
    .reduce((sum, r) => sum + r.monto_total, 0);

  const pendientes = registros.filter((r) => r.estado === "pendiente").length;
  const totalRegistros = registros.length;

  const label = new Date(anio, mes - 1, 1).toLocaleDateString("es-CL", {
    month: "long",
    year: "numeric",
  });

  return { ingresos, egresos, balance: ingresos - egresos, pendientes, totalRegistros, label };
}

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

export async function getRegistrosFinancieros(anio?: number, mes?: number) {
  const supabase = await createClient();
  const contexto = await getContextoUsuario();

  if (!contexto.sucursalActiva) return [];

  let query = supabase
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

  if (anio && mes) {
    const inicio = new Date(anio, mes - 1, 1).toISOString().split("T")[0];
    const fin = new Date(anio, mes, 0).toISOString().split("T")[0];
    query = query.gte("fecha_emision", inicio).lte("fecha_emision", fin);
  }

  const { data, error } = await query.limit(10);
  if (error) throw new Error("No se pudieron obtener los registros financieros");
  return data ?? [];
}