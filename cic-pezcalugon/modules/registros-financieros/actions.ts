"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getContextoUsuario } from "@/lib/contexto-usuario";
import { registroFinancieroSchema } from "./schema";

export async function crearRegistroFinanciero(formData: FormData) {
  const supabase = await createClient();
  const contexto = await getContextoUsuario();

  if (!contexto.user) {
    throw new Error("Usuario no autenticado");
  }

  if (!contexto.sucursalActiva) {
    throw new Error("No hay sucursal activa");
  }

  const parsed = registroFinancieroSchema.safeParse({
    tipo_registro: formData.get("tipo_registro"),
    estado: formData.get("estado"),
    fecha_emision: formData.get("fecha_emision"),
    moneda: formData.get("moneda"),

    categoria_id: formData.get("categoria_id") || null,
    numero_documento: formData.get("numero_documento"),
    tercero_nombre: formData.get("tercero_nombre"),

    monto_neto: formData.get("monto_neto"),
    monto_impuesto: formData.get("monto_impuesto"),
    monto_total: formData.get("monto_total"),

    descripcion: formData.get("descripcion"),
  });

  if (!parsed.success) {
    console.error(parsed.error.flatten());
    throw new Error("Datos invalidos");
  }

  const {
    tipo_registro,
    estado,
    fecha_emision,
    moneda,
    categoria_id,
    numero_documento,
    tercero_nombre,
    monto_neto,
    monto_impuesto,
    monto_total,
    descripcion,
  } = parsed.data;

  const { error } = await supabase.from("registros_financieros").insert({
    organizacion_id: contexto.organizacionId,
    sucursal_id: contexto.sucursalActiva.id,
    creado_por: contexto.user.id,

    tipo_registro,
    estado,
    fecha_emision,
    moneda,

    categoria_id,
    numero_documento,
    tercero_nombre,

    monto_neto,
    monto_impuesto,
    monto_total,
    descripcion,
  });

  if (error) {
    throw new Error(`No se pudo crear el registro: ${error.message}`);
  }

  revalidatePath("/dashboard/registros");
}

export async function marcarComoPagado(formData: FormData) {
  const supabase = await createClient();

  const registroId = String(formData.get("registro_id") ?? "");

  const { error } = await supabase
    .from("registros_financieros")
    .update({
      estado: "pagado",
    })
    .eq("id", registroId);

  if (error) {
    throw new Error("No se pudo actualizar el estado");
  }

  revalidatePath("/dashboard/registros");
}