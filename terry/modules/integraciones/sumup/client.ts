const SUMUP_API_BASE = 'https://api.sumup.com/v0.1'

export type SumUpTransaction = {
  id: string
  transaction_code: string
  amount: number
  currency: string
  timestamp: string
  status: 'SUCCESSFUL' | 'FAILED' | 'REFUNDED' | 'CANCELLED'
  payment_type: string
  card?: { type: string; last_4_digits: string }
  receipt_no?: string
}

export async function getSumUpTransactions(
  accessToken: string,
  desde: string,
  hasta: string
): Promise<SumUpTransaction[]> {
  const url = new URL(`${SUMUP_API_BASE}/me/transactions/history`)
  url.searchParams.set('oldest_time', desde)
  url.searchParams.set('newest_time', hasta)
  url.searchParams.set('limit', '100')
  url.searchParams.set('statuses[]', 'SUCCESSFUL')

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!res.ok) throw new Error(`SumUp API error: ${res.status}`)

  const json = await res.json()
  return json.items ?? []
}

export async function refreshSumUpToken(
  refreshToken: string,
  clientId: string,
  clientSecret: string
): Promise<{ access_token: string; refresh_token: string; expires_in: number }> {
  const res = await fetch('https://api.sumup.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  })

  if (!res.ok) throw new Error(`SumUp token refresh error: ${res.status}`)
  return res.json()
}
