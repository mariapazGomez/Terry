export type FrecuenciaGasto = 'semanal' | 'quincenal' | 'mensual' | 'anual'

export type TipoGasto =
  | 'factura_proveedor'
  | 'salario'
  | 'arriendo'
  | 'subscripcion'
  | 'otro'

export type GastoRecurrente = {
  id: string
  nombre: string
  tipo_gasto: TipoGasto
  monto_estimado: number
  moneda: string
  frecuencia: FrecuenciaGasto
  dia_del_mes: number | null
  proveedor_id: string | null
  categoria_id: string | null
  sucursal_id: string | null
  organizacion_id: string
  activo: boolean
  creado_en: string
}
