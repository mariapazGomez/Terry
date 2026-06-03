"use server";

import { redirect } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/service-client";
import { getContextoUsuario } from "@/lib/contexto-usuario";

export async function guardarNombreOrg(formData: FormData): Promise<void> {
  const nombre = String(formData.get("nombre") ?? "").trim();
  if (!nombre) return;

  const contexto = await getContextoUsuario();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createServiceClient() as any;

  await supabase
    .from("organizaciones")
    .update({ nombre })
    .eq("id", contexto.organizacionId);
}

export async function completarOnboarding(): Promise<never> {
  const contexto = await getContextoUsuario();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createServiceClient() as any;

  await supabase
    .from("organizaciones")
    .update({ onboarding_completado: true })
    .eq("id", contexto.organizacionId);

  redirect("/dashboard");
}
