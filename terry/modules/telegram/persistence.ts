import { createServiceClient } from "@/lib/supabase/service-client"
import type { DatosFactura } from "@/lib/whatsapp/parse-invoice"

export async function persistirFactura(
  datos: DatosFactura,
  archivoRuta: string,
  archivoNombre: string,
  archivoMime: string,
  archivoTamano: number,
  orgId: string,
  sucursalId: string
): Promise<string> {
  const supabase = createServiceClient()

  const { data: registro, error: regError } = await supabase
    .from("registros_financieros")
    .insert({
      organizacion_id: orgId,
      sucursal_id: sucursalId,
      tipo_registro: datos.tipo_registro,
      fuente: "telegram",
      estado: "pendiente",
      fecha_emision: datos.fecha_emision,
      fecha_vencimiento: datos.fecha_vencimiento ?? null,
      numero_documento: datos.numero_documento ?? null,
      tercero_nombre: datos.tercero_nombre ?? null,
      monto_neto: datos.monto_neto,
      monto_impuesto: datos.monto_impuesto,
      monto_total: datos.monto_total,
      moneda: datos.moneda ?? "CLP",
      tipo_documento: datos.tipo_documento ?? null,
      descripcion: datos.descripcion ?? null,
    })
    .select("id")
    .single()

  if (regError) throw new Error(`registros_financieros: ${regError.message}`)

  const { error: docError } = await supabase
    .from("archivos_documentos")
    .insert({
      organizacion_id: orgId,
      registro_financiero_id: registro.id,
      nombre_archivo: archivoNombre,
      ruta_archivo: archivoRuta,
      tipo_mime: archivoMime,
      tamano: archivoTamano,
      // canal is a new column — cast until types are regenerated
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

  if (docError) throw new Error(`archivos_documentos: ${docError.message}`)

  return registro.id
}
