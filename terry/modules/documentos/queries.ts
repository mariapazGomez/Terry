import { createClient } from "@/lib/supabase/server";

export async function getDocumentosPorRegistro(registroFinancieroId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("archivos_documentos")
    .select("id, nombre_archivo, ruta_archivo, tipo_mime, tamano, creado_en")
    .eq("registro_financiero_id", registroFinancieroId)
    .order("creado_en", { ascending: false });

  if (error) {
    throw new Error("No se pudieron obtener los documentos");
  }

  return data ?? [];
}