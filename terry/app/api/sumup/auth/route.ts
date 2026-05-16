export async function GET(request: Request) {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.SUMUP_CLIENT_ID!,
    redirect_uri: process.env.SUMUP_REDIRECT_URI!,
    scope: "transactions.history",
  })

  const url = `https://api.sumup.com/authorize?${params}`

  // ?debug=1 → muestra la URL sin redirigir
  if (new URL(request.url).searchParams.get("debug")) {
    return new Response(url, { headers: { "Content-Type": "text/plain" } })
  }

  return Response.redirect(url)
}
