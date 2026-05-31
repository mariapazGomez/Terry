import { createServiceClient } from "@/lib/supabase/service-client"
import { getValidSumupToken, forceRefreshSumupToken } from "@/lib/sumup/tokens"

const TZ           = "America/Santiago"
const SUMUP_BASE   = "https://api.sumup.com/v0.1/me/transactions/history"
const THROTTLE_MIN = 5   // no llamar a SumUp si el snapshot de hoy tiene <5 min

const DIAS_CODIGO  = ["L","M","X","J","V","S","D"]
const DIAS_NOMBRE  = ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"]
const MESES_NOMBRE = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"]

function fechaSantiago(iso: string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date(iso))
}
function inicioHoySantiago(hoy: string): string {
  // Detecta el offset real (varía con horario de verano: UTC-3 invierno, UTC-4 verano)
  const noonUTC = new Date(`${hoy}T12:00:00Z`)
  const noonH   = parseInt(
    new Intl.DateTimeFormat("en-US", { timeZone: TZ, hour: "numeric", hour12: false }).format(noonUTC)
  )
  const offsetH = noonH - 12   // -3 en invierno, -4 en verano
  return new Date(new Date(`${hoy}T00:00:00Z`).getTime() - offsetH * 3_600_000).toISOString()
}
function dowIndex(fecha: string): number {
  const dow = new Date(`${fecha}T12:00:00-04:00`).getDay()
  return dow === 0 ? 6 : dow - 1
}

/**
 * Sincroniza transacciones nuevas desde SumUp y reconstruye el snapshot de hoy.
 * Throttle: solo corre si el snapshot de hoy tiene más de THROTTLE_MIN minutos.
 * Silencia errores para no romper el render de la página.
 */
export async function sincronizarHoy(): Promise<void> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createServiceClient() as any
    const hoy      = fechaSantiago(new Date().toISOString())

    // ── Throttle ─────────────────────────────────────────────────────────────
    const { data: snap } = await supabase
      .from("sumup_snapshot_dia")
      .select("generado_en")
      .eq("fecha", hoy)
      .maybeSingle()

    const minAgo = snap?.generado_en
      ? (Date.now() - new Date(snap.generado_en).getTime()) / 60_000
      : 999

    if (minAgo < THROTTLE_MIN) return

    // ── 1. Sync incremental desde SumUp ──────────────────────────────────────
    const { data: ultima } = await supabase
      .from("sumup_transacciones")
      .select("timestamp")
      .order("timestamp", { ascending: false })
      .limit(1)
      .maybeSingle()

    let token  = await getValidSumupToken()
    const params = new URLSearchParams({
      limit:       "100",
      order:       "ascending",
      oldest_time: ultima?.timestamp ?? `${hoy}T00:00:00.000Z`,
    })

    const url = `${SUMUP_BASE}?${params}`
    let res: Response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      cache:   "no-store",
    })

    if (res.status === 401) {
      token = await forceRefreshSumupToken()
      res   = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
        cache:   "no-store",
      })
    }

    if (res.ok) {
      const body: { items?: { timestamp: string; [k: string]: unknown }[] } = await res.json()
      const nuevas = (body.items ?? []).filter(t => t.timestamp !== ultima?.timestamp)

      if (nuevas.length > 0) {
        const ORG_ID = process.env.TELEGRAM_ORG_ID!
        const SUC_ID = process.env.TELEGRAM_SUCURSAL_ID!

        await supabase.from("sumup_transacciones").upsert(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          nuevas.map((t: any) => ({
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
            sucursal_id:      SUC_ID,
            sincronizado_en:  new Date().toISOString(),
          })),
          { onConflict: "sumup_id" }
        )
      }
    }

    // ── 2. Reconstruir snapshot de hoy desde sumup_transacciones ─────────────
    const { data: txsHoy } = await supabase
      .from("sumup_transacciones")
      .select("amount")
      .eq("status", "SUCCESSFUL")
      .gte("timestamp", inicioHoySantiago(hoy))

    const total  = (txsHoy ?? []).reduce((s: number, t: { amount: number }) => s + t.amount, 0)
    const diaNum = parseInt(hoy.split("-")[2])
    const [anio, mes] = hoy.split("-").map(Number)
    const di     = dowIndex(hoy)

    await supabase.from("sumup_snapshot_dia").upsert({
      fecha:       hoy,
      dia_codigo:  DIAS_CODIGO[di],
      dia_nombre:  DIAS_NOMBRE[di],
      semana_num:  Math.min(Math.ceil(diaNum / 7), 4),
      mes_num:     mes,
      mes_nombre:  MESES_NOMBRE[mes - 1],
      anio,
      total:       Math.round(total * 100) / 100,
      num_tx:      (txsHoy ?? []).length,
      generado_en: new Date().toISOString(),
    }, { onConflict: "fecha" })

  } catch (err) {
    console.error("[auto-sync]", err)
    // Silencia cualquier error — nunca debe romper el render de la página
  }
}
