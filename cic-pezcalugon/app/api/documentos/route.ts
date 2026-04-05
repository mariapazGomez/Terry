import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const BUCKET = "documentos-financieros";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const ruta = searchParams.get("ruta");

  if (!ruta) {
    return NextResponse.json({ error: "Ruta requerida" }, { status: 400 });
  }

  const supabase = await createClient();

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(ruta, 60 * 5);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.redirect(data.signedUrl);
}