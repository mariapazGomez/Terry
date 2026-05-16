import { getValidSumupToken } from "@/lib/sumup/tokens"

const TZ = "America/Santiago"

function fechaSantiago(iso: string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date(iso))
}

/**
 * GET /api/sumup/verificar?desde=2026-03-01&hasta=2026-03-31
 *
 * Consulta la API de SumUp directamente (con paginación) y devuelve
 * totales por día en zona horaria Santiago para verificación.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const desde = searchParams.get("desde") ?? "2026-03-01"
  const hasta  = searchParams.get("hasta")  ?? "2026-03-31"

  const token = await getValidSumupToken()

  // Paginar la API de SumUp hasta agotar resultados
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const txs: any[] = []
  let nextUrl: string | null =
    `https://api.sumup.com/v0.1/me/transactions/history?` +
    `limit=100&order=ascending` +
    `&oldest_time=${encodeURIComponent(`${desde}T00:00:00.000Z`)}` +
    `&newest_time=${encodeURIComponent(`${hasta}T23:59:59.999Z`)}`

  while (nextUrl) {
    const res = await fetch(nextUrl, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    })

    if (!res.ok) {
      const err = await res.text()
      return Response.json({ error: `SumUp ${res.status}: ${err}` }, { status: 500 })
    }

    const body = await res.json()
    const items = body.items ?? []
    txs.push(...items)

    // Seguir el link "next" si existe (SumUp devuelve solo query params, sin dominio)
    const linkNext = (body.links ?? []).find((l: any) => l.rel === "next")
    if (linkNext?.href) {
      const href = linkNext.href as string
      nextUrl = href.startsWith("http")
        ? href
        : `https://api.sumup.com/v0.1/me/transactions/history?${href}`
    } else {
      nextUrl = null
    }
  }

  // Filtrar solo SUCCESSFUL y agrupar por fecha Santiago
  const porDia: Record<string, { total: number; num_tx: number }> = {}

  for (const t of txs) {
    if (t.status !== "SUCCESSFUL") continue
    const f = fechaSantiago(t.timestamp)
    if (!porDia[f]) porDia[f] = { total: 0, num_tx: 0 }
    porDia[f].total  += t.amount
    porDia[f].num_tx += 1
  }

  const dias = Object.entries(porDia)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([fecha, { total, num_tx }]) => ({ fecha, total, num_tx }))

  const totalGeneral = dias.reduce((s, d) => s + d.total, 0)

  return Response.json({
    desde,
    hasta,
    total_txs_api: txs.length,
    total_exitosas: dias.reduce((s, d) => s + d.num_tx, 0),
    total_general: totalGeneral,
    dias,
  })
}
