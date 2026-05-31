import { createServiceClient } from "@/lib/supabase/service-client"

const TZ = "America/Santiago"

function fechaSantiago(iso: string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date(iso))
}

function horaSantiago(iso: string): number {
  return (
    parseInt(
      new Intl.DateTimeFormat("en-US", {
        timeZone: TZ, hour: "numeric", hour12: false,
      }).format(new Date(iso))
    ) % 24  // guarda del '24' que algunos runtimes emiten a medianoche
  )
}

/**
 * POST /api/sumup/snapshots/hora
 *
 * Body (opcional): { desde?: "YYYY-MM-DD", hasta?: "YYYY-MM-DD" }
 * Sin body → regenera todos los días disponibles en sumup_transacciones.
 *
 * Responde: { franjas: number }
 */
export async function POST(req: Request) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createServiceClient() as any

  let desde: string | undefined
  let hasta: string | undefined
  try {
    const body = await req.json()
    desde = body.desde
    hasta = body.hasta
  } catch { /* body vacío → procesar todo */ }

  // ── 1. Leer transacciones con paginación ────────────────────────────────
  const PAGE_SIZE = 1000
  const txs: { amount: number; timestamp: string }[] = []
  let page = 0

  while (true) {
    let q = supabase
      .from("sumup_transacciones")
      .select("amount, timestamp")
      .eq("status", "SUCCESSFUL")
      .order("timestamp", { ascending: true })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

    if (desde) q = q.gte("timestamp", `${desde}T00:00:00-03:00`)
    if (hasta) q = q.lte("timestamp", `${hasta}T23:59:59-03:00`)

    const { data, error } = await q
    if (error) {
      console.error("[snapshots/hora] read:", error.message)
      return Response.json({ error: error.message }, { status: 500 })
    }

    const chunk: { amount: number; timestamp: string }[] = data ?? []
    txs.push(...chunk)
    if (chunk.length < PAGE_SIZE) break
    page++
  }

  console.log(`[snapshots/hora] ${txs.length} transacciones leídas`)

  // ── 2. Agrupar por (fecha, hora) Santiago ───────────────────────────────
  type Agg = { total: number; num_tx: number; max_tx: number }
  const porFechaHora: Record<string, Agg> = {}

  for (const t of txs) {
    const fecha = fechaSantiago(t.timestamp)
    const hora  = horaSantiago(t.timestamp)
    const key   = `${fecha}|${hora}`

    if (!porFechaHora[key]) porFechaHora[key] = { total: 0, num_tx: 0, max_tx: 0 }
    porFechaHora[key].total  += t.amount
    porFechaHora[key].num_tx += 1
    porFechaHora[key].max_tx  = Math.max(porFechaHora[key].max_tx, t.amount)
  }

  // ── 3. Construir filas ───────────────────────────────────────────────────
  const rows = Object.entries(porFechaHora).map(([key, agg]) => {
    const [fecha, horaStr] = key.split("|")
    const hora = parseInt(horaStr)
    return {
      fecha,
      hora,
      total:       Math.round(agg.total   * 100) / 100,
      num_tx:      agg.num_tx,
      avg_tx:      Math.round((agg.total / agg.num_tx) * 100) / 100,
      max_tx:      Math.round(agg.max_tx  * 100) / 100,
      generado_en: new Date().toISOString(),
    }
  })

  if (rows.length === 0) {
    return Response.json({ franjas: 0, mensaje: "Sin transacciones en el rango" })
  }

  // ── 4. Upsert ───────────────────────────────────────────────────────────
  const { error: errWrite } = await supabase
    .from("sumup_snapshot_hora")
    .upsert(rows, { onConflict: "fecha,hora" })

  if (errWrite) {
    console.error("[snapshots/hora] write:", errWrite.message)
    return Response.json({ error: errWrite.message }, { status: 500 })
  }

  console.log(`[snapshots/hora] ${rows.length} franjas procesadas`)
  return Response.json({ franjas: rows.length })
}

/** GET /api/sumup/snapshots/hora — lectura directa para verificación */
export async function GET(req: Request) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createServiceClient() as any
  const { searchParams } = new URL(req.url)
  const fecha = searchParams.get("fecha")

  let q = supabase
    .from("sumup_snapshot_hora")
    .select("fecha, hora, total, num_tx, avg_tx, max_tx")
    .order("fecha", { ascending: false })
    .order("hora", { ascending: true })
    .limit(48)

  if (fecha) q = q.eq("fecha", fecha)

  const { data, error } = await q
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ franjas: data })
}
