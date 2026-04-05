import { z } from "zod";

export const registroFinancieroSchema = z.object({
  tipo_registro: z.string().min(1),
  estado: z.string().min(1),
  fecha_emision: z.string().min(1),
  moneda: z.string().min(1),

  categoria_id: z.string().uuid().nullable().optional(),
  numero_documento: z.string().optional(),
  tercero_nombre: z.string().optional(),

  monto_neto: z.coerce.number().min(0),
  monto_impuesto: z.coerce.number().min(0),
  monto_total: z.coerce.number().positive(),

  descripcion: z.string().optional(),
});