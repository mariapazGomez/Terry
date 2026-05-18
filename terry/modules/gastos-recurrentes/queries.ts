import { createClient } from '@/lib/supabase/server'
import { getContextoUsuario } from '@/lib/contexto-usuario'

export async function getGastosRecurrentes() {
  const supabase = await createClient()
  const { organizacionId } = await getContextoUsuario()

  const { data, error } = await supabase
    .from('gastos_recurrentes')
    .select('*')
    .eq('organizacion_id', organizacionId)
    .eq('activo', true)
    .order('nombre')

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function proyectarGastosDelMes(anio: number, mes: number) {
  const supabase = await createClient()
  const { organizacionId } = await getContextoUsuario()

  const { data, error } = await supabase
    .from('gastos_recurrentes')
    .select('*')
    .eq('organizacion_id', organizacionId)
    .eq('activo', true)

  if (error) throw new Error(error.message)

  const gastos = data ?? []

  return gastos.filter((g) => {
    if (g.frecuencia === 'mensual') return true
    if (g.frecuencia === 'semanal') return true
    if (g.frecuencia === 'quincenal') return true
    if (g.frecuencia === 'anual') {
      const fechaCreacion = new Date(g.creado_en)
      return fechaCreacion.getMonth() + 1 === mes
    }
    return false
  })
}
