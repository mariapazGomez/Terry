import { createServiceClient } from "@/lib/supabase/service-client"
import type { DatosFactura } from "@/lib/whatsapp/parse-invoice"

export type SesionTelegram = {
  chat_id: string
  estado: "esperando_confirmacion"
  datos_extraidos: DatosFactura
  archivo_ruta: string
  archivo_nombre: string
  archivo_mime: string
  archivo_tamano: number
  org_id: string
  sucursal_id: string
}

export async function guardarSesion(sesion: SesionTelegram): Promise<void> {
  const supabase = createServiceClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("bot_sesiones")
    .upsert({
      chat_id: sesion.chat_id,
      estado: sesion.estado,
      datos_extraidos: sesion.datos_extraidos,
      archivo_ruta: sesion.archivo_ruta,
      archivo_nombre: sesion.archivo_nombre,
      archivo_mime: sesion.archivo_mime,
      archivo_tamano: sesion.archivo_tamano,
      org_id: sesion.org_id,
      sucursal_id: sesion.sucursal_id,
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    })
  if (error) throw new Error(`guardarSesion: ${error.message}`)
}

export async function obtenerSesion(chatId: string): Promise<SesionTelegram | null> {
  const supabase = createServiceClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from("bot_sesiones")
    .select("*")
    .eq("chat_id", chatId)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle()
  return data as SesionTelegram | null
}

export async function limpiarSesion(chatId: string): Promise<void> {
  const supabase = createServiceClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).from("bot_sesiones").delete().eq("chat_id", chatId)
}
