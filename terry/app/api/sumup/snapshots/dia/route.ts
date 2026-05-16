import { createServiceClient } from "@/lib/supabase/service-client"

const TZ = "America/Santiago"

const DIAS_CODIGO = ["L", "M", "X", "J", "V", "S", "D"]  // Lun=0 … Dom=6
const DIAS_NOMBRE = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]
const MESES_NOMBRE = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
]

/** Convierte un ISO timestamp al string de fecha en Santiago: "2026-05-16" */
function fechaSantiago(iso: string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date(iso))
}

/** 0 = Lunes … 6 = Domingo */
function dowSantiago(fecha: string): number {
  const js = new Date(`${fecha}T12:00:00-04:00`).getDay() // 0=Dom … 6=Sáb
  return js === 0 ? 6 : js - 1
}

/**
 * POST /api/sumup/snapshots/dia
 *
 * Body (opcional): { desde?: "YYYY-MM-DD", hasta?: "YYYY-MM-DD" }
 * Sin body → regenera todos los días disponibles en sumup_transacciones.
 *
 * Responde: { dias: number, insertados: number }
 */
export async function POST(req: Request) {
  const supabase = createServiceClient()

  // Rango opcional del body
  let desde: string | undefined
  let hasta: string | undefined
  try {
    const body = await req.json()
    desde = body.desde
    hasta = body.hasta
  } catch {
    // body vacío → regenerar todo
  }

  // 1. Leer transacciones con paginación (Supabase limita 1000 filas por request)
  const PAGE_SIZE = 1000
  const txs: { amount: number; timestamp: string }[] = []
  let desde_ts = desde ? `${desde}T00:00:00-04:00` : undefined
  let hasta_ts = hasta ? `${hasta}T23:59:59-04:00` : undefined
  let page = 0

  while (true) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let q = (supabase as any)
      .from("sumup_transacciones")
      .select("amount, timestamp")
      .eq("status", "SUCCESSFUL")
      .order("timestamp", { ascending: true })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

    if (desde_ts) q = q.gte("timestamp", desde_ts)
    if (hasta_ts) q = q.lte("timestamp", hasta_ts)

    const { data, error: errRead } = await q

    if (errRead) {
      console.error("[snapshots/dia] read:", errRead.message)
      return Response.json({ error: errRead.message }, { status: 500 })
    }

    const chunk: { amount: number; timestamp: string }[] = data ?? []
    txs.push(...chunk)

    if (chunk.length < PAGE_SIZE) break  // última página
    page++
  }

  console.log(`[snapshots/dia] ${txs.length} transacciones leídas`)

  // 2. Agrupar por fecha Santiago
  const porDia: Record<string, { total: number; num_tx: number }> = {}

  for (const t of txs) {
    const f = fechaSantiago(t.timestamp)
    if (!porDia[f]) porDia[f] = { total: 0, num_tx: 0 }
    porDia[f].total  += t.amount
    porDia[f].num_tx += 1
  }

  // 3. Construir filas con todas las etiquetas
  const rows = Object.entries(porDia).map(([fecha, { total, num_tx }]) => {
    const [anio, mes_num_str, ] = fecha.split("-")
    const mes_num  = parseInt(mes_num_str)
    const dia_num  = parseInt(fecha.split("-")[2])
    const dow      = dowSantiago(fecha)
    const sem_num  = Math.min(Math.ceil(dia_num / 7), 4)

    return {
      fecha,
      dia_codigo:  DIAS_CODIGO[dow],
      dia_nombre:  DIAS_NOMBRE[dow],
      semana_num:  sem_num,
      mes_num,
      mes_nombre:  MESES_NOMBRE[mes_num - 1],
      anio:        parseInt(anio),
      total:       Math.round(total * 100) / 100,
      num_tx,
      generado_en: new Date().toISOString(),
    }
  })

  if (rows.length === 0) {
    return Response.json({ dias: 0, insertados: 0, mensaje: "Sin transacciones en el rango" })
  }

  // 4. Upsert por fecha (reemplaza el valor existente si ya existe)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: errWrite } = await (supabase as any)
    .from("sumup_snapshot_dia")
    .upsert(rows, { onConflict: "fecha" })

  if (errWrite) {
    console.error("[snapshots/dia] write:", errWrite.message)
    return Response.json({ error: errWrite.message }, { status: 500 })
  }

  console.log(`[snapshots/dia] ${rows.length} días procesados`)
  return Response.json({ dias: rows.length, insertados: rows.length })
}

/** GET /api/sumup/snapshots/dia — lectura directa de la tabla para verificación */
export async function GET(req: Request) {
  const supabase = createServiceClient()
  const { searchParams } = new URL(req.url)
  const limit = parseInt(searchParams.get("limit") ?? "30")

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("sumup_snapshot_dia")
    .select("fecha, dia_codigo, dia_nombre, semana_num, mes_nombre, anio, total, num_tx")
    .order("fecha", { ascending: false })
    .limit(limit)

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ dias: data })
}
