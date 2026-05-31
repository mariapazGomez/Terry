import { answerCallbackQuery, sendMessage } from "@/lib/telegram/api"
import { obtenerSesion, limpiarSesion } from "./session"
import { persistirFactura } from "./persistence"

export async function manejarConfirmacion(
  chatId: string,
  callbackQueryId: string,
  accion: "confirmar" | "descartar"
): Promise<void> {
  const sesion = await obtenerSesion(chatId)

  if (!sesion) {
    await answerCallbackQuery(callbackQueryId)
    await sendMessage(chatId, "La sesión expiró (10 min). Envíame la foto nuevamente. 🔄")
    return
  }

  await answerCallbackQuery(callbackQueryId)

  if (accion === "descartar") {
    await limpiarSesion(chatId)
    await sendMessage(chatId, "❌ Descartado. No se guardó nada.")
    return
  }

  try {
    const id = await persistirFactura(
      sesion.datos_extraidos,
      sesion.archivo_ruta,
      sesion.archivo_nombre,
      sesion.archivo_mime,
      sesion.archivo_tamano,
      sesion.org_id,
      sesion.sucursal_id
    )
    await limpiarSesion(chatId)
    const shortId = id.slice(0, 8).toUpperCase()
    await sendMessage(
      chatId,
      `✅ Listo. Gasto registrado correctamente.\nID: ${shortId}\n\nPuedes verlo en el dashboard de Terry.`
    )
  } catch (err) {
    console.error("[telegram/confirmation]", err)
    await sendMessage(chatId, "Hubo un problema guardando el registro. Intenta nuevamente.")
  }
}
