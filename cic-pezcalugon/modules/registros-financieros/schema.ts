import { z } from "zod";

export const TIPOS_DOCUMENTO = [
  'factura',
  'boleta',
  'nota_credito',
  'nota_debito',
  'liquidacion',
  'sin_documento',
] as const

export const TIPOS_GASTO = [
  'factura_proveedor',
  'salario',
  'arriendo',
  'subscripcion',
  'otro',
] as const

export const registroFinancieroSchema = z.object({
  tipo_registro: z.enum(['ingreso', 'gasto']),
  estado: z.string().min(1),
  fecha_emision: z.string().min(1),
  moneda: z.string().min(1),

  tipo_documento: z.enum(TIPOS_DOCUMENTO).nullable().optional(),
  tipo_gasto: z.enum(TIPOS_GASTO).nullable().optional(),

  categoria_id: z.string().uuid().nullable().optional(),
  proveedor_id: z.string().uuid().nullable().optional(),
  gasto_recurrente_id: z.string().uuid().nullable().optional(),

  numero_documento: z.string().optional(),
  tercero_nombre: z.string().optional(),

  monto_neto: z.coerce.number().min(0),
  monto_impuesto: z.coerce.number().min(0),
  monto_total: z.coerce.number().positive(),

  descripcion: z.string().optional(),
});