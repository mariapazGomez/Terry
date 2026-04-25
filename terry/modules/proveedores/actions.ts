'use server'
import { createClient } from '@/lib/supabase/server'
import { getContextoUsuario } from '@/lib/contexto-usuario'
import { revalidatePath } from 'next/cache'

export async function crearProveedor(formData: FormData) {
  const supabase = await createClient()
  const { organizacionId } = await getContextoUsuario()

  const { error } = await supabase.from('proveedores').insert({
    nombre: String(formData.get('nombre')),
    rut: formData.get('rut') ? String(formData.get('rut')) : null,
    email: formData.get('email') ? String(formData.get('email')) : null,
    tipo: String(formData.get('tipo')),
    organizacion_id: organizacionId,
    activo: true,
  })

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/registros')
}

export async function desactivarProveedor(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('proveedores')
    .update({ activo: false })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/registros')
}
