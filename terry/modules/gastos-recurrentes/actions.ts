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

export async function desactivarGastoRecurrente(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('gastos_recurrentes')
    .update({ activo: false })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/gastos')
}
