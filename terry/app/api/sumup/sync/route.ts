import { createServiceClient } from "@/lib/supabase/service-client"
import { getValidSumupToken } from "@/lib/sumup/tokens"

const ORG_ID     = process.env.TELEGRAM_ORG_ID!
const SUCURSAL_ID = process.env.TELEGRAM_SUCURSAL_ID!

export async function POST() {
  const supabase = createServiceClient()

  // 1. Buscar la transacción más reciente almacenada
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: ultima } = await (supabase as any)
    .from("sumup_transacciones")
    .select("timestamp")
    .order("timestamp", { ascending: false })
    .limit(1)
    .maybeSingle()

  // 2. Construir parámetros — si hay datos previos, traer solo lo nuevo
  const params = new URLSearchParams({
    limit: "100",
    order: "ascending", // ascendente para procesar desde el más antiguo
  })
  if (ultima?.timestamp) {
    params.set("oldest_time", ultima.timestamp)
  }

  const token = await getValidSumupToken()
  const res = await fetch(
    `https://api.sumup.com/v0.1/me/transactions/history?${params}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    }
  )

  if (!res.ok) {
    const err = await res.text()
    console.error("[sumup/sync]", err)
    return Response.json({ error: "Error al consultar SumUp" }, { status: 500 })
  }

  const data = await res.json()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const items: any[] = data.items ?? []

  // Si la primera es la misma que ya tenemos, la excluimos
  const nuevos = ultima?.timestamp
    ? items.filter((t) => t.timestamp !== ultima.timestamp)
    : items

  if (nuevos.length === 0) {
    return Response.json({ sincronizadas: 0, mensaje: "Sin transacciones nuevas" })
  }

  const rows = nuevos.map((t) => ({
    sumup_id:        t.id,
    transaction_code: t.transaction_code ?? null,
    amount:          t.amount,
    currency:        t.currency ?? "CLP",
    payment_type:    t.payment_type,
    card_type:       t.card_type ?? null,
    status:          t.status,
    timestamp:       t.timestamp,
    payout_date:     t.payout_date ?? null,
    organizacion_id: ORG_ID,
    sucursal_id:     SUCURSAL_ID,
    sincronizado_en: new Date().toISOString(),
  }))

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("sumup_transacciones")
    .upsert(rows, { onConflict: "sumup_id" })

  if (error) {
    console.error("[sumup/sync] supabase:", error.message)
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ sincronizadas: rows.length })
}
