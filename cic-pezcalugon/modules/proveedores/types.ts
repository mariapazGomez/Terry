export type TipoProveedor = 'empresa' | 'persona' | 'servicio_digital'

export type Proveedor = {
  id: string
  nombre: string
  rut: string | null
  email: string | null
  tipo: TipoProveedor
  organizacion_id: string
  activo: boolean
  creado_en: string
}
