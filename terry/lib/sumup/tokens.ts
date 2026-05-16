import { createServiceClient } from "@/lib/supabase/service-client"

const ORG_ID = process.env.TELEGRAM_ORG_ID!

type TokenRow = {
  access_token: string
  refresh_token: string
  expires_at: string
}

async function refreshAccessToken(refreshToken: string): Promise<{
  access_token: string
  refresh_token: string
  expires_at: string
}> {
  const res = await fetch("https://api.sumup.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      client_id: process.env.SUMUP_CLIENT_ID!,
      client_secret: process.env.SUMUP_CLIENT_SECRET!,
      refresh_token: refreshToken,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`SumUp refresh failed: ${err}`)
  }

  const data = await res.json()
  const expires_at = new Date(Date.now() + data.expires_in * 1000).toISOString()

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token ?? refreshToken,
    expires_at,
  }
}

export async function getValidSumupToken(): Promise<string> {
  const supabase = createServiceClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("sumup_tokens")
    .select("access_token, refresh_token, expires_at")
    .eq("organizacion_id", ORG_ID)
    .single()

  if (error || !data) {
    throw new Error("No hay token SumUp configurado. Ve a /api/sumup/auth para autorizar.")
  }

  const row = data as TokenRow
  const expiresAt = new Date(row.expires_at)
  const margen = 5 * 60 * 1000 // 5 minutos antes de que expire

  if (expiresAt.getTime() - Date.now() > margen) {
    return row.access_token
  }

  // Token expirado o por expirar — refrescar
  console.log("[sumup/tokens] Renovando access token...")
  const nuevo = await refreshAccessToken(row.refresh_token)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any)
    .from("sumup_tokens")
    .update({
      access_token: nuevo.access_token,
      refresh_token: nuevo.refresh_token,
      expires_at: nuevo.expires_at,
      updated_at: new Date().toISOString(),
    })
    .eq("organizacion_id", ORG_ID)

  return nuevo.access_token
}

export async function guardarTokens(
  accessToken: string,
  refreshToken: string,
  expiresIn: number
): Promise<void> {
  const supabase = createServiceClient()
  const expires_at = new Date(Date.now() + expiresIn * 1000).toISOString()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("sumup_tokens")
    .upsert(
      {
        organizacion_id: ORG_ID,
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_at,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "organizacion_id" }
    )

  if (error) throw new Error(`guardarTokens: ${error.message}`)
}
