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

export async function getVentasDiarias(anio: number, mes: number) {
  const supabase = await createClient();
  const contexto = await getContextoUsuario();
  if (!contexto.sucursalActiva) return [];

  const inicio = new Date(anio, mes - 1, 1).toISOString().split("T")[0];
  const fin = new Date(anio, mes, 0).toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("registros_financieros")
    .select("fecha_emision, tipo_registro, monto_total")
    .eq("sucursal_id", contexto.sucursalActiva.id)
    .gte("fecha_emision", inicio)
    .lte("fecha_emision", fin)
    .order("fecha_emision");

  if (error) throw new Error(error.message);

  const byDate: Record<string, { ingresos: number; egresos: number }> = {};
  for (const r of data ?? []) {
    if (!byDate[r.fecha_emision]) byDate[r.fecha_emision] = { ingresos: 0, egresos: 0 };
    if (r.tipo_registro === "ingreso") byDate[r.fecha_emision].ingresos += r.monto_total;
    else byDate[r.fecha_emision].egresos += r.monto_total;
  }

  return Object.entries(byDate).map(([fecha, v]) => ({
    dia: parseInt(fecha.split("-")[2]),
    ...v,
  }));
}

export async function getComparativaMeses(anio: number, mes: number, n = 5) {
  const supabase = await createClient();
  const contexto = await getContextoUsuario();
  if (!contexto.sucursalActiva) return [];

  const periodos: { anio: number; mes: number }[] = [];
  let a = anio, m = mes;
  for (let i = 0; i < n; i++) {
    periodos.unshift({ anio: a, mes: m });
    if (m === 1) { a--; m = 12; } else m--;
  }

  const inicio = new Date(periodos[0].anio, periodos[0].mes - 1, 1).toISOString().split("T")[0];
  const fin = new Date(anio, mes, 0).toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("registros_financieros")
    .select("fecha_emision, tipo_registro, monto_total")
    .eq("sucursal_id", contexto.sucursalActiva.id)
    .gte("fecha_emision", inicio)
    .lte("fecha_emision", fin);

  if (error) throw new Error(error.message);

  return periodos.map(({ anio: a, mes: m }) => {
    const key = `${a}-${String(m).padStart(2, "0")}`;
    const registros = (data ?? []).filter((r) => r.fecha_emision.startsWith(key));
    const ingresos = registros.filter((r) => r.tipo_registro === "ingreso").reduce((s, r) => s + r.monto_total, 0);
    const egresos = registros.filter((r) => r.tipo_registro === "gasto").reduce((s, r) => s + r.monto_total, 0);
    const label = new Date(a, m - 1, 1).toLocaleDateString("es-CL", { month: "short", year: "2-digit" });
    return { label, ingresos, egresos };
  });
}

export async function getDistribucionEgresos(anio: number, mes: number) {
  const supabase = await createClient();
  const contexto = await getContextoUsuario();
  if (!contexto.sucursalActiva) return [];

  const inicio = new Date(anio, mes - 1, 1).toISOString().split("T")[0];
  const fin = new Date(anio, mes, 0).toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("registros_financieros")
    .select("descripcion, tercero_nombre, monto_total")
    .eq("sucursal_id", contexto.sucursalActiva.id)
    .eq("tipo_registro", "gasto")
    .gte("fecha_emision", inicio)
    .lte("fecha_emision", fin);

  if (error) throw new Error(error.message);

  const grupos: Record<string, number> = {};
  for (const r of data ?? []) {
    const desc = (r.descripcion ?? "").toLowerCase();
    let categoria = r.tercero_nombre?.split(" ")[0] ?? r.descripcion?.split(" ")[0] ?? "Otros";

    if (/sueldo|salario|quincena|jornal/.test(desc)) categoria = "Sueldos";
    else if (/arriendo/.test(desc)) categoria = "Arriendo";
    else if (/abarrotes|verdura|marisco|pan|queso|pescado|insumo|cecilia|vanni|provimarket/.test(desc)) categoria = "Insumos";
    else if (/abogado|contadora|honorario|notificacion/.test(desc)) categoria = "Servicios";
    else if (/combustible|camioneta|mantenci/.test(desc)) categoria = "Operacional";
    else if (/crédito|credito|pago cr/.test(desc)) categoria = "Financiero";

    grupos[categoria] = (grupos[categoria] ?? 0) + r.monto_total;
  }

  return Object.entries(grupos)
    .sort((a, b) => b[1] - a[1])
    .map(([nombre, monto]) => ({ nombre, monto }));
}

export async function getGastosDelMes(anio: number, mes: number) {
  const supabase = await createClient()
  const contexto = await getContextoUsuario()
  if (!contexto.sucursalActiva) return []

  const inicio = new Date(anio, mes - 1, 1).toISOString().split("T")[0]
  const fin    = new Date(anio, mes, 0).toISOString().split("T")[0]

  const { data, error } = await supabase
    .from("registros_financieros")
    .select("id, descripcion, tercero_nombre, tipo_gasto, estado, monto_total, moneda, fecha_emision, gasto_recurrente_id")
    .eq("sucursal_id", contexto.sucursalActiva.id)
    .eq("tipo_registro", "gasto")
    .gte("fecha_emision", inicio)
    .lte("fecha_emision", fin)
    .order("tipo_gasto", { ascending: true })
    .order("descripcion", { ascending: true })

  if (error) throw new Error(error.message)
  return data ?? []
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