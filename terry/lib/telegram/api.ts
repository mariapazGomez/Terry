const BASE = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`
const FILES = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}`

async function telegramPost(method: string, body: object): Promise<void> {
  const res = await fetch(`${BASE}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const text = await res.text()
    console.error(`[telegram/${method}]`, text)
  }
}

export async function getFile(fileId: string): Promise<string> {
  const res = await fetch(`${BASE}/getFile?file_id=${fileId}`)
  const json = await res.json()
  if (!json.ok) throw new Error(`getFile: ${json.description}`)
  return json.result.file_path as string
}

export async function downloadFile(filePath: string): Promise<Buffer> {
  const res = await fetch(`${FILES}/${filePath}`)
  if (!res.ok) throw new Error("No se pudo descargar la imagen desde Telegram")
  return Buffer.from(await res.arrayBuffer())
}

export async function sendMessage(chatId: string, text: string): Promise<void> {
  await telegramPost("sendMessage", { chat_id: chatId, text })
}

export async function sendMessageWithButtons(
  chatId: string,
  text: string,
  buttons: Array<{ text: string; callback_data: string }>
): Promise<void> {
  await telegramPost("sendMessage", {
    chat_id: chatId,
    text,
    reply_markup: {
      inline_keyboard: [buttons.map((b) => ({ text: b.text, callback_data: b.callback_data }))],
    },
  })
}

export async function answerCallbackQuery(callbackQueryId: string, text?: string): Promise<void> {
  await telegramPost("answerCallbackQuery", { callback_query_id: callbackQueryId, text })
}
