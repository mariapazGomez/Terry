"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getContextoUsuario } from "@/lib/contexto-usuario";

const BUCKET = "documentos-financieros";

export async function obtenerUrlFirmada(rutaArchivo: string) {
  const supabase = await createClient();

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(rutaArchivo, 60 * 5); // 5 minutos

  if (error) {
    throw new Error("No se pudo generar la URL firmada");
  }

  return data.signedUrl;
}

export async function subirDocumento(formData: FormData) {
  const supabase = await createClient();
  const contexto = await getContextoUsuario();

  if (!contexto.user) {
    throw new Error("Usuario no autenticado");
  }

  const archivo = formData.get("archivo");

  const registroFinancieroId = String(
    formData.get("registro_financiero_id") ?? ""
  );

  if (!(archivo instanceof File)) {
    throw new Error("No se recibio ningun archivo");
  }

  if (!registroFinancieroId) {
    throw new Error("Falta el registro financiero");
  }

  const nombreLimpio = archivo.name.replace(/\s+/g, "_");
  const rutaArchivo = `${contexto.organizacionId}/${contexto.sucursalActiva?.id}/${registroFinancieroId}/${Date.now()}_${nombreLimpio}`;

  const { error: errorUpload } = await supabase.storage
    .from(BUCKET)
    .upload(rutaArchivo, archivo, {
      contentType: archivo.type,
      upsert: false,
    });

  if (errorUpload) {
    throw new Error(`No se pudo subir el archivo: ${errorUpload.message}`);
  }

  const { error: errorInsert } = await supabase
    .from("archivos_documentos")
    .insert({
      organizacion_id: contexto.organizacionId,
      registro_financiero_id: registroFinancieroId,
      nombre_archivo: archivo.name,
      ruta_archivo: rutaArchivo,
      tipo_mime: archivo.type || null,
      tamano: archivo.size,
      subido_por: contexto.user.id,
    });

  if (errorInsert) {
    throw new Error(
      `No se pudo guardar el metadata del archivo: ${errorInsert.message}`
    );
  }

  revalidatePath("/dashboard/registros");
}


