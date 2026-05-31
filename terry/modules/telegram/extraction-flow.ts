import { createServiceClient } from "@/lib/supabase/service-client"
import { getFile, downloadFile, sendMessage, sendMessageWithButtons } from "@/lib/telegram/api"
import { parseFactura } from "@/lib/whatsapp/parse-invoice"
import { guardarSesion } from "./session"

const BUCKET = "documentos-financieros"

type PhotoSize = {
  file_id: string
  file_size?: number
  width: number
  height: number
}

export async function manejarFoto(
  chatId: string,
  photos: PhotoSize[],
  orgId: string,
  sucursalId: string
): Promise<void> {
  await sendMessage(chatId, "Procesando tu factura... ⏳")

  // Telegram sends multiple sizes — take the largest
  const photo = photos.reduce((best, p) =>
    (p.file_size ?? 0) > (best.file_size ?? 0) ? p : best
  )

  try {
    // 1. Download image from Telegram
    const filePath = await getFile(photo.file_id)
    const imgBuffer = await downloadFile(filePath)
    const imgBase64 = imgBuffer.toString("base64")
    const mimeType = "image/jpeg"
    const timestamp = Date.now()
    const ruta = `telegram/${orgId}/${timestamp}.jpg`
    const nombre = `telegram_${timestamp}.jpg`

    // 2. Save original to Supabase Storage
    const supabase = createServiceClient()
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(ruta, imgBuffer, { contentType: mimeType })

    if (uploadError) throw new Error(`Storage: ${uploadError.message}`)

    // 3. Extract structured data with Claude Vision
    const datos = await parseFactura(imgBase64, mimeType)

    // 4. Persist session state — waits for user confirmation before saving to DB
    await guardarSesion({
      chat_id: chatId,
      estado: "esperando_confirmacion",
      datos_extraidos: datos,
      archivo_ruta: ruta,
      archivo_nombre: nombre,
      archivo_mime: mimeType,
      archivo_tamano: imgBuffer.byteLength,
      org_id: orgId,
      sucursal_id: sucursalId,
    })

    // 5. Send summary to user with confirmation buttons
    const lineas = [
      "📄 Encontré esto:",
      datos.tercero_nombre ? `🏢 ${datos.tercero_nombre}` : null,
      datos.numero_documento ? `📋 N° ${datos.numero_documento}` : null,
      `📅 ${datos.fecha_emision}`,
      `💰 $${datos.monto_total.toLocaleString("es-CL")} CLP`,
      datos.tipo_documento ? `📁 ${datos.tipo_documento}` : null,
      "",
      "¿Confirmas que guarde este gasto?",
    ]
      .filter(Boolean)
      .join("\n")

    await sendMessageWithButtons(chatId, lineas, [
      { text: "✅ Confirmar", callback_data: "confirmar" },
      { text: "❌ Descartar", callback_data: "descartar" },
    ])
  } catch (err) {
    console.error("[telegram/extraction]", err)
    await sendMessage(
      chatId,
      "No pude leer la factura. ¿Puedes tomar otra foto con mejor luz? 📸"
    )
  }
}
