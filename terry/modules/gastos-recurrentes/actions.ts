'use server'
import { createClient } from '@/lib/supabase/server'
import { getContextoUsuario } from '@/lib/contexto-usuario'
import { revalidatePath } from 'next/cache'

export async function crearGastoRecurrente(formData: FormData) {
  const supabase = await createClient()
  const { organizacionId, sucursalActiva } = await getContextoUsuario()

  const { error } = await supabase.from('gastos_recurrentes').insert({
    nombre: String(formData.get('nombre')),
    tipo_gasto: String(formData.get('tipo_gasto')),
    monto_estimado: Number(formData.get('monto_estimado')),
    moneda: String(formData.get('moneda') ?? 'CLP'),
    frecuencia: String(formData.get('frecuencia')),
    dia_del_mes: formData.get('dia_del_mes') ? Number(formData.get('dia_del_mes')) : null,
    proveedor_id: formData.get('proveedor_id') ? String(formData.get('proveedor_id')) : null,
    categoria_id: formData.get('categoria_id') ? String(formData.get('categoria_id')) : null,
    sucursal_id: sucursalActiva?.id ?? null,
    organizacion_id: organizacionId,
    activo: true,
  })

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/gastos')
}

export async function generarGastosDelMes(anio: number, mes: number): Promise<{ generados: number }> {
  const supabase = await createClient()
  const { organizacionId, sucursalActiva, user } = await getContextoUsuario()
  if (!sucursalActiva) throw new Error("No hay sucursal activa")

  const { data: recurrentes } = await supabase
    .from("gastos_recurrentes")
    .select("*")
    .eq("organizacion_id", organizacionId)
    .eq("activo", true)

  if (!recurrentes?.length) return { generados: 0 }

  const inicioMes = `${anio}-${String(mes).padStart(2, "0")}-01`
  const finMes    = new Date(anio, mes, 0).toISOString().split("T")[0]

  // Verificar cuáles ya existen este mes (idempotente)
  const { data: existentes } = await supabase
    .from("registros_financieros")
    .select("gasto_recurrente_id")
    .eq("sucursal_id", sucursalActiva.id)
    .gte("fecha_emision", inicioMes)
    .lte("fecha_emision", finMes)
    .not("gasto_recurrente_id", "is", null)

  const existentesIds = new Set((existentes ?? []).map((e) => e.gasto_recurrente_id))
  const nuevos = recurrentes.filter((g) => !existentesIds.has(g.id))

  if (!nuevos.length) return { generados: 0 }

  const rows = nuevos.map((g) => ({
    organizacion_id:     organizacionId,
    sucursal_id:         sucursalActiva.id,
    creado_por:          user.id,
    tipo_registro:       "gasto",
    fuente:              "manual",
    estado:              "pendiente",
    tipo_gasto:          g.tipo_gasto,
    gasto_recurrente_id: g.id,
    descripcion:         g.nombre,
    fecha_emision:       inicioMes,
    moneda:              g.moneda ?? "CLP",
    monto_neto:          g.monto_estimado,
    monto_impuesto:      0,
    monto_total:         g.monto_estimado,
  }))

  const { error } = await supabase.from("registros_financieros").insert(rows)
  if (error) throw new Error(error.message)

  revalidatePath("/dashboard/gastos")
  revalidatePath("/dashboard")
  return { generados: rows.length }
}

export async function desactivarGastoRecurrente(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('gastos_recurrentes')
    .update({ activo: false })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/gastos')
}
