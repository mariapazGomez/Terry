import { createServiceClient } from "@/lib/supabase/service-client"

type TxRaw = { amount: number; payment_type: string; timestamp: string }

export type PuntoDia = {
  fecha: string         // "2026-03-02"
  dia: string           // "L","M","X","J","V","S","D"
  total: number
  semana: number        // semana dentro del mes (1-4)
  mes: string           // "Enero", "Febrero", etc.
  esInicioSemana: boolean  // true en días 1, 8, 15, 22 del mes
  esPrimeroMes: boolean
}

export type ComparativaDiaria = {
  puntos: PuntoDia[]
  meses: string[]
}


export async function getVentasMes(anio: number, mes: number): Promise<number> {
  const supabase = createServiceClient()
  const mesStr   = `${anio}-${String(mes).padStart(2, "0")}`

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from("sumup_snapshot_dia")
    .select("total")
    .gte("fecha", `${mesStr}-01`)
    .lte("fecha", `${mesStr}-31`)

  return (data ?? []).reduce((s: number, d: { total: number }) => s + Number(d.total ?? 0), 0)
}

export async function getComparativa3Meses(): Promise<ComparativaDiaria> {
  const supabase = createServiceClient()

  const hoy = fechaSantiago(new Date().toISOString())
  const [hy, hm] = hoy.split("-").map(Number)
  let startYear  = hy
  let startMonth = hm - 2
  if (startMonth <= 0) { startMonth += 12; startYear -= 1 }
  const startStr = `${startYear}-${String(startMonth).padStart(2, "0")}-01`

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("sumup_snapshot_dia")
    .select("fecha, dia_codigo, semana_num, mes_nombre, total")
    .gte("fecha", startStr)
    .lte("fecha", hoy)
    .order("fecha", { ascending: true })

  if (error) {
    console.error("[getComparativa3Meses]", error.message)
    return { puntos: [], meses: [] }
  }

  const mesesSet: string[] = []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const puntos: PuntoDia[] = (data ?? []).map((r: any) => {
    if (!mesesSet.includes(r.mes_nombre)) mesesSet.push(r.mes_nombre)
    const fd = parseInt(r.fecha.split("-")[2])
    return {
      fecha:         r.fecha,
      dia:           r.dia_codigo,
      total:         Number(r.total),
      semana:        r.semana_num,
      mes:           r.mes_nombre,
      esInicioSemana: [1, 8, 15, 22].includes(fd),
      esPrimeroMes:  fd === 1,
    }
  })

  return { puntos, meses: mesesSet }
}

function fechaSantiago(iso: string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Santiago" }).format(new Date(iso))
}

function lunesDe(fecha: string): string {
  const d = new Date(`${fecha}T12:00:00-04:00`)
  const dow = d.getDay() === 0 ? 6 : d.getDay() - 1
  d.setDate(d.getDate() - dow)
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Santiago" }).format(d)
}

function nombreDia(fecha: string): string {
  return new Date(`${fecha}T12:00:00-04:00`).toLocaleDateString("es-CL", {
    weekday: "long", day: "numeric", month: "short", timeZone: "America/Santiago",
  })
}

function labelSemana(lunes: string): string {
  const domingo = new Date(`${lunes}T12:00:00-04:00`)
  domingo.setDate(domingo.getDate() + 6)
  const domStr = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Santiago" }).format(domingo)
  const fmt = (f: string) =>
    new Date(`${f}T12:00:00-04:00`).toLocaleDateString("es-CL", {
      day: "numeric", month: "short", timeZone: "America/Santiago",
    })
  return `${fmt(lunes)} – ${fmt(domStr)}`
}

const DIAS_SEMANA = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]

export type PuntoSemana = {
  dia: string
  [semana: string]: number | string
}

export type PuntoMes = { dia: string; total: number }

export type ResumenVentas = {
  totalHoy: number
  countHoy: number
  totalSemana: number
  totalMes: number
  mejoresDias: { semana: string; dia: string; total: number }[]
  dataSemanas: PuntoSemana[]       // comparativa últimas 4 semanas día a día
  dataEvolucionMes: PuntoMes[]     // total diario del mes en curso
  labelsSemanas: string[]          // etiquetas de las 4 semanas
}

export async function getResumenVentas(): Promise<ResumenVentas> {
  const supabase = createServiceClient()

  const desde = new Date()
  desde.setDate(desde.getDate() - 35)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from("sumup_transacciones")
    .select("amount, payment_type, timestamp")
    .eq("status", "SUCCESSFUL")
    .gte("timestamp", desde.toISOString())

  const txs: TxRaw[] = data ?? []

  const hoy       = fechaSantiago(new Date().toISOString())
  const lunes     = lunesDe(hoy)
  const inicioMes = `${hoy.slice(0, 7)}-01`

  // ── Totales por fecha ─────────────────────────────────────────────────────
  let totalHoy = 0, countHoy = 0, totalSemana = 0, totalMes = 0
  const porDia: Record<string, number> = {}

  for (const t of txs) {
    const f = fechaSantiago(t.timestamp)
    porDia[f] = (porDia[f] ?? 0) + t.amount
    if (f === hoy)                    { totalHoy += t.amount; countHoy++ }
    if (f >= lunes && f <= hoy)         totalSemana += t.amount
    if (f >= inicioMes && f <= hoy)     totalMes += t.amount
  }

  // ── Semanas (lunes de las últimas 4) ─────────────────────────────────────
  const semanas: string[] = []
  for (let i = 0; i < 4; i++) {
    const d = new Date(`${lunes}T12:00:00-04:00`)
    d.setDate(d.getDate() - i * 7)
    semanas.push(new Intl.DateTimeFormat("en-CA", { timeZone: "America/Santiago" }).format(d))
  }
  semanas.reverse() // cronológico: más antigua primero

  const labelsSemanas = semanas.map(labelSemana)

  // ── Mejor día por semana ──────────────────────────────────────────────────
  const mejoresDias = [...semanas].reverse().map((lunSem) => {
    const domSem = new Date(`${lunSem}T12:00:00-04:00`)
    domSem.setDate(domSem.getDate() + 6)
    const domStr = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Santiago" }).format(domSem)

    let mejorFecha = "", mejorTotal = 0
    for (const [fecha, total] of Object.entries(porDia)) {
      if (fecha >= lunSem && fecha <= domStr && total > mejorTotal) {
        mejorTotal = total; mejorFecha = fecha
      }
    }
    return { semana: labelSemana(lunSem), dia: mejorFecha ? nombreDia(mejorFecha) : "—", total: mejorTotal }
  })

  // ── Chart: comparativa semanas (Lun-Dom × 4 líneas) ──────────────────────
  const dataSemanas: PuntoSemana[] = DIAS_SEMANA.map((dia, idx) => {
    const punto: PuntoSemana = { dia }
    semanas.forEach((lunSem, si) => {
      const fechaDia = new Date(`${lunSem}T12:00:00-04:00`)
      fechaDia.setDate(fechaDia.getDate() + idx)
      const f = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Santiago" }).format(fechaDia)
      // Solo incluir si la fecha no es futura
      punto[`semana${si + 1}`] = f <= hoy ? (porDia[f] ?? 0) : (undefined as unknown as number)
    })
    return punto
  })

  // ── Chart: evolución del mes ──────────────────────────────────────────────
  const dataEvolucionMes: PuntoMes[] = []
  const diaActual = new Date(`${inicioMes}T12:00:00-04:00`)
  const hoyDate   = new Date(`${hoy}T12:00:00-04:00`)
  while (diaActual <= hoyDate) {
    const f = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Santiago" }).format(diaActual)
    dataEvolucionMes.push({ dia: String(diaActual.getDate()), total: porDia[f] ?? 0 })
    diaActual.setDate(diaActual.getDate() + 1)
  }

  return {
    totalHoy, countHoy, totalSemana, totalMes,
    mejoresDias, dataSemanas, dataEvolucionMes, labelsSemanas,
  }
}
