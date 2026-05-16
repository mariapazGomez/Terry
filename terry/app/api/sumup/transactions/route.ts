import { getValidSumupToken } from "@/lib/sumup/tokens"

export async function GET() {
  const token = await getValidSumupToken()
  const res = await fetch(
    "https://api.sumup.com/v0.1/me/transactions/history?limit=10&order=descending",
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    }
  )

  if (!res.ok) {
    const err = await res.text()
    console.error("[sumup/transactions]", err)
    return new Response(err, { status: res.status })
  }

  const data = await res.json()
  return Response.json(data)
}
