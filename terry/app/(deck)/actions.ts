"use server";

import { createClient } from "@/lib/supabase/server";
import { waitlistSchema } from "./schema";

export type WaitlistResult = { ok: true } | { ok: false; error: string };

export async function unirseWaitlist(formData: FormData): Promise<WaitlistResult> {
  // Honeypot: los bots llenan este campo, los humanos no
  if (formData.get("website")) {
    return { ok: true };
  }

  const raw = {
    nombre: formData.get("nombre"),
    email: formData.get("email"),
    rubro: formData.get("rubro") || undefined,
    num_sucursales: formData.get("num_sucursales") || undefined,
  };

  const parsed = waitlistSchema.safeParse(raw);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Datos inválidos";
    return { ok: false, error: firstError };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("waitlist_leads").insert(parsed.data);

  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "Este email ya está en la lista de espera." };
    }
    return { ok: false, error: "No pudimos registrarte. Intenta de nuevo." };
  }

  return { ok: true };
}
