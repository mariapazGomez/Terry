'use server'
import { getContextoUsuario } from '@/lib/contexto-usuario'
import { sincronizarVentasSumUp } from './sumup/sync'

export async function dispararSyncSumUp(formData: FormData) {
  const { organizacionId, sucursalActiva } = await getContextoUsuario()

  if (!sucursalActiva) throw new Error('No hay sucursal activa')

  const desde = String(formData.get('desde'))
  const hasta = String(formData.get('hasta'))

  return sincronizarVentasSumUp(organizacionId, sucursalActiva.id, desde, hasta)
}
