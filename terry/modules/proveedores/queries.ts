import { createClient } from '@/lib/supabase/server'
import { getContextoUsuario } from '@/lib/contexto-usuario'

export async function getProveedores() {
  const supabase = await createClient()
  const { organizacionId } = await getContextoUsuario()

  const { data, error } = await supabase
    .from('proveedores')
    .select('*')
    .eq('organizacion_id', organizacionId)
    .eq('activo', true)
    .order('nombre')

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getProveedorById(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('proveedores')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw new Error(error.message)
  return data
}
