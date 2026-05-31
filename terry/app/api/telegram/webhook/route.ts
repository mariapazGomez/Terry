import { manejarFoto } from "@/modules/telegram/extraction-flow"
import { manejarConfirmacion } from "@/modules/telegram/confirmation-flow"
import { sendMessage } from "@/lib/telegram/api"

export const maxDuration = 60

const ORG_ID = process.env.TELEGRAM_ORG_ID!
const SUCURSAL_ID = process.env.TELEGRAM_SUCURSAL_ID!

export async function POST(request: Request) {
  const secretToken = request.headers.get("X-Telegram-Bot-Api-Secret-Token")
  if (secretToken !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return new Response("Unauthorized", { status: 401 })
  }

  let update: TelegramUpdate
  try {
    update = await request.json()
  } catch {
    return new Response("Bad request", { status: 400 })
  }

  try {
    await handleUpdate(update)
  } catch (err) {
    console.error("[telegram/webhook]", err)
  }

  return new Response("ok", { status: 200 })
}

async function handleUpdate(update: TelegramUpdate) {
  // Button press (confirm / discard)
  if (update.callback_query) {
    const { id, from, data } = update.callback_query
    const chatId = String(from.id)
    if (data === "confirmar" || data === "descartar") {
      await manejarConfirmacion(chatId, id, data)
    }
    return
  }

  const message = update.message
  if (!message) return

  const chatId = String(message.chat.id)

  // Photo → extraction flow
  if (message.photo?.length) {
    await manejarFoto(chatId, message.photo, ORG_ID, SUCURSAL_ID)
    return
  }

  // Text commands
  if (message.text) {
    if (message.text === "/start") {
      await sendMessage(
        chatId,
        "👋 Hola! Soy Terry, tu agente financiero.\n\nEnvíame una foto de cualquier factura o boleta y la proceso al instante. 📸"
      )
    } else {
      await sendMessage(chatId, "Envíame una foto de tu factura y la proceso al instante. 📸")
    }
  }
}

// ─── Telegram Update types (minimal) ─────────────────────────────────────────

type PhotoSize = {
  file_id: string
  file_size?: number
  width: number
  height: number
}

type TelegramMessage = {
  message_id: number
  from: { id: number; first_name: string }
  chat: { id: number; type: string }
  text?: string
  photo?: PhotoSize[]
}

type TelegramCallbackQuery = {
  id: string
  from: { id: number; first_name: string }
  data: string
  message?: { chat: { id: number } }
}

type TelegramUpdate = {
  update_id: number
  message?: TelegramMessage
  callback_query?: TelegramCallbackQuery
}
