'use server'
import { createClient } from '@/lib/supabase/server'
import { getSumUpTransactions } from './client'
import { mapSumUpTransactionToRegistro } from './mapper'

export async function sincronizarVentasSumUp(
  organizacionId: string,
  sucursalId: string,
  desde: string,
  hasta: string
) {
  const supabase = await createClient()

  const { data: integracion } = await supabase
    .from('integraciones_oauth')
    .select('access_token')
    .eq('organizacion_id', organizacionId)
    .eq('proveedor', 'sumup')
    .eq('estado', 'activa')
    .single()

  if (!integracion) throw new Error('No hay integración SumUp activa para esta organización')

  const { data: sincronizacion } = await supabase
    .from('sincronizaciones')
    .insert({
      organizacion_id: organizacionId,
      proveedor: 'sumup',
      inicio: new Date().toISOString(),
      estado: 'en_progreso',
    })
    .select()
    .single()

  try {
    const transacciones = await getSumUpTransactions(integracion.access_token, desde, hasta)

    const registros = transacciones.map((tx) =>
      mapSumUpTransactionToRegistro(tx, organizacionId, sucursalId)
    )

    const { count } = await supabase
      .from('registros_financieros')
      .upsert(registros, { onConflict: 'id_externo' })
      .select()

    await supabase
      .from('sincronizaciones')
      .update({
        fin: new Date().toISOString(),
        estado: 'exitoso',
        registros_importados: count ?? 0,
      })
      .eq('id', sincronizacion!.id)

    return { importados: count ?? 0 }
  } catch (error) {
    await supabase
      .from('sincronizaciones')
      .update({
        fin: new Date().toISOString(),
        estado: 'error',
        detalle_error: String(error),
      })
      .eq('id', sincronizacion!.id)
    throw error
  }
}
