import { redirect } from "next/navigation";
import { getContextoUsuario } from "@/lib/contexto-usuario";
import { createServiceClient } from "@/lib/supabase/service-client";
import OnboardingWizard from "@/components/onboarding/wizard";

export default async function OnboardingPage() {
  const contexto = await getContextoUsuario().catch(() => null);
  if (!contexto) redirect("/login");
  if (contexto.onboardingCompletado) redirect("/dashboard");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createServiceClient() as any;
  const { data: tokens } = await supabase
    .from("sumup_tokens")
    .select("id")
    .eq("organizacion_id", contexto.organizacionId)
    .maybeSingle();

  return (
    <OnboardingWizard
      orgNombre={contexto.orgNombre}
      sumupConectado={!!tokens}
    />
  );
}
