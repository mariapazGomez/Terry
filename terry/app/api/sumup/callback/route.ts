import { NextRequest } from "next/server"
import { guardarTokens } from "@/lib/sumup/tokens"
import { createServiceClient } from "@/lib/supabase/service-client"

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code")

  if (!code) {
    return new Response("Missing code", { status: 400 })
  }

  const res = await fetch("https://api.sumup.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: process.env.SUMUP_CLIENT_ID!,
      client_secret: process.env.SUMUP_CLIENT_SECRET!,
      redirect_uri: process.env.SUMUP_REDIRECT_URI!,
      code,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error("[sumup/callback]", err)
    return new Response("Error al obtener token", { status: 500 })
  }

  const { access_token, refresh_token, expires_in } = await res.json()

  await guardarTokens(access_token, refresh_token, expires_in)
  console.log("[sumup/callback] Tokens guardados en Supabase")

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createServiceClient() as any
  const orgId = process.env.TELEGRAM_ORG_ID!
  const { data: org } = await supabase
    .from("organizaciones")
    .select("onboarding_completado")
    .eq("id", orgId)
    .maybeSingle()

  const returnPath = org?.onboarding_completado === false ? "/onboarding" : "/dashboard/ventas"
  return Response.redirect(new URL(returnPath, request.url))
}
