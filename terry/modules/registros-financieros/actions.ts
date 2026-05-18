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

export async function crearGasto(formData: FormData) {
  const supabase = await createClient()
  const contexto = await getContextoUsuario()
  if (!contexto.sucursalActiva) throw new Error("No hay sucursal activa")

  const monto = Math.abs(Number(formData.get("monto_total")))
  if (!monto) throw new Error("Monto requerido")

  const { error } = await supabase.from("registros_financieros").insert({
    organizacion_id: contexto.organizacionId,
    sucursal_id:     contexto.sucursalActiva.id,
    creado_por:      contexto.user.id,
    tipo_registro:   "gasto",
    fuente:          "manual",
    estado:          String(formData.get("estado") || "pendiente"),
    tipo_gasto:      String(formData.get("tipo_gasto") || "otro"),
    fecha_emision:   String(formData.get("fecha_emision")),
    moneda:          "CLP",
    descripcion:     String(formData.get("descripcion") || ""),
    tercero_nombre:  String(formData.get("tercero_nombre") || "") || null,
    monto_neto:      monto,
    monto_impuesto:  0,
    monto_total:     monto,
  })

  if (error) throw new Error(error.message)
  revalidatePath("/dashboard/gastos")
  revalidatePath("/dashboard")
}

export async function marcarGastoPagado(formData: FormData) {
  const supabase = await createClient()
  const id = String(formData.get("id"))

  const { error } = await supabase
    .from("registros_financieros")
    .update({ estado: "pagado" })
    .eq("id", id)

  if (error) throw new Error(error.message)
  revalidatePath("/dashboard/gastos")
  revalidatePath("/dashboard")
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