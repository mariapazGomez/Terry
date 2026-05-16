import { createServiceClient } from "@/lib/supabase/service-client"
import { getValidSumupToken } from "@/lib/sumup/tokens"

const ORG_ID      = process.env.TELEGRAM_ORG_ID!
const SUCURSAL_ID = process.env.TELEGRAM_SUCURSAL_ID!
const BASE        = "https://api.sumup.com/v0.1/me/transactions/history"

export async function POST(request: Request) {
  const { dias = 30 } = await request.json().catch(() => ({}))

  const oldest = new Date()
  oldest.setDate(oldest.getDate() - Number(dias))

  const token = await getValidSumupToken()
  const headers = { Authorization: `Bearer ${token}` }

  // ── Paginar hasta agotar resultados ──────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allItems: any[] = []
  let nextQuery: string | null = new URLSearchParams({
    oldest_time: oldest.toISOString(),
    limit: "100",
    order: "ascending",
  }).toString()

  let paginas = 0

  while (nextQuery) {
    const res = await fetch(`${BASE}?${nextQuery}`, { headers, cache: "no-store" })

    if (!res.ok) {
      const err = await res.text()
      console.error("[sumup/sync-historico] SumUp error:", err)
      return Response.json({ error: "Error al consultar SumUp" }, { status: 500 })
    }

    const data = await res.json()
    allItems.push(...(data.items ?? []))
    paginas++

    const next = (data.links ?? []).find((l: { rel: string }) => l.rel === "next")
    nextQuery = next?.href ?? null
  }

  if (allItems.length === 0) {
    return Response.json({ insertadas: 0, paginas, mensaje: "Sin transacciones en el período" })
  }

  // ── Upsert — sumup_id UNIQUE previene duplicados ──────────────────────────
  const rows = allItems.map((t) => ({
    sumup_id:         t.id,
    transaction_code: t.transaction_code ?? null,
    amount:           t.amount,
    currency:         t.currency ?? "CLP",
    payment_type:     t.payment_type,
    card_type:        t.card_type ?? null,
    status:           t.status,
    timestamp:        t.timestamp,
    payout_date:      t.payout_date ?? null,
    organizacion_id:  ORG_ID,
    sucursal_id:      SUCURSAL_ID,
    sincronizado_en:  new Date().toISOString(),
  }))

  const supabase = createServiceClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("sumup_transacciones")
    .upsert(rows, { onConflict: "sumup_id" })

  if (error) {
    console.error("[sumup/sync-historico] supabase:", error.message)
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ insertadas: rows.length, paginas })
}
