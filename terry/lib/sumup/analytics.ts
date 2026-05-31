import { createServiceClient } from "@/lib/supabase/service-client"

export type HoraMetric = {
  hora:         number
  total:        number   // acumulado en esa franja
  num_tx:       number   // transacciones totales en esa franja
  ticket:       number   // total / num_tx
  max_tx:       number   // mayor venta individual en esa franja
  dias_activos: number   // días con ventas en esa franja
  promedio_dia: number   // total / dias_activos
}

export type SemanaHoraData = {
  label: string        // "19/05 – 25/05"
  desde: string        // "YYYY-MM-DD"
  hasta: string        // "YYYY-MM-DD"
  horas: HoraMetric[]  // 24 entradas, index = hora
}

// ── Helpers de fecha ────────────────────────────────────────────────────────

const TZ = "America/Santiago"

function fechaSantiago(iso: string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date(iso))
}

function addDays(fecha: string, n: number): string {
  const d = new Date(`${fecha}T12:00:00-04:00`)
  d.setDate(d.getDate() + n)
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(d)
}

function lunesDe(fecha: string): string {
  const d   = new Date(`${fecha}T12:00:00-04:00`)
  const dow = d.getDay() === 0 ? 6 : d.getDay() - 1  // Lun=0 … Dom=6
  d.setDate(d.getDate() - dow)
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(d)
}

function fmtLabel(fecha: string): string {
  const [, mm, dd] = fecha.split("-")
  return `${dd}/${mm}`
}

function buildHoras(rows: { hora: number; total: number; num_tx: number; max_tx: number }[]): HoraMetric[] {
  type Agg = { total: number; num_tx: number; max_tx: number; dias: number }
  const byHora: Agg[] = Array.from({ length: 24 }, () => ({
    total: 0, num_tx: 0, max_tx: 0, dias: 0,
  }))

  for (const row of rows) {
    const h = row.hora
    byHora[h].total  += Number(row.total)
    byHora[h].num_tx += Number(row.num_tx)
    byHora[h].max_tx  = Math.max(byHora[h].max_tx, Number(row.max_tx))
    if (Number(row.total) > 0) byHora[h].dias++
  }

  return byHora.map((agg, h) => ({
    hora:         h,
    total:        agg.total,
    num_tx:       agg.num_tx,
    ticket:       agg.num_tx > 0 ? agg.total / agg.num_tx : 0,
    max_tx:       agg.max_tx,
    dias_activos: agg.dias,
    promedio_dia: agg.dias > 0 ? agg.total / agg.dias : 0,
  }))
}

export type HeatmapCell = {
  fecha:  string   // "YYYY-MM-DD"
  hora:   number   // 0-23
  total:  number
  num_tx: number
}

export async function getHeatmapMes(anio: number, mes: number): Promise<HeatmapCell[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createServiceClient() as any
  const mesStr  = String(mes).padStart(2, "0")
  const diaMax  = new Date(anio, mes, 0).getDate()
  const desde   = `${anio}-${mesStr}-01`
  const hasta   = `${anio}-${mesStr}-${String(diaMax).padStart(2, "0")}`

  const { data, error } = await supabase
    .from("sumup_snapshot_hora")
    .select("fecha, hora, total, num_tx")
    .gte("fecha", desde)
    .lte("fecha", hasta)
    .order("fecha")
    .order("hora")

  if (error) {
    console.error("[getHeatmapMes]", error.message)
    return []
  }

  return data ?? []
}

// ── Query semana a semana ────────────────────────────────────────────────────

export async function getVentasPorHoraSemanas(n = 4): Promise<SemanaHoraData[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createServiceClient() as any

  const hoy    = fechaSantiago(new Date().toISOString())
  const lunes0 = lunesDe(hoy)

  // Rangos de semana — índice 0 = más antigua, n-1 = semana actual
  const ranges = Array.from({ length: n }, (_, i) => {
    const weeksBack = n - 1 - i
    const desde     = addDays(lunes0, -weeksBack * 7)
    const hasta     = i === n - 1 ? hoy : addDays(lunes0, -weeksBack * 7 + 6)
    return { desde, hasta }
  })

  // Una sola query para todo el rango
  const { data, error } = await supabase
    .from("sumup_snapshot_hora")
    .select("fecha, hora, total, num_tx, max_tx")
    .gte("fecha", ranges[0].desde)
    .lte("fecha", hoy)
    .order("fecha")
    .order("hora")

  if (error) {
    console.error("[getVentasPorHoraSemanas]", error.message)
    return []
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows: { fecha: string; hora: number; total: number; num_tx: number; max_tx: number }[] = data ?? []

  return ranges.map(({ desde, hasta }) => ({
    label: `${fmtLabel(desde)} – ${fmtLabel(hasta)}`,
    desde,
    hasta,
    horas: buildHoras(rows.filter(r => r.fecha >= desde && r.fecha <= hasta)),
  }))
}
