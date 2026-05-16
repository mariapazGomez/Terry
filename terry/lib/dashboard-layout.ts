"use server"
import { createServiceClient } from "@/lib/supabase/service-client"
import { getContextoUsuario } from "@/lib/contexto-usuario"
import { DEFAULT_LAYOUT, type WidgetConfig } from "@/lib/dashboard-layout-types"

export type { WidgetId, WidgetConfig } from "@/lib/dashboard-layout-types"

export async function getLayout(): Promise<WidgetConfig[]> {
  try {
    const contexto  = await getContextoUsuario()
    const supabase  = createServiceClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from("dashboard_layout")
      .select("widgets_json")
      .eq("usuario_id", contexto.user.id)
      .maybeSingle()

    if (!data?.widgets_json?.length) return DEFAULT_LAYOUT

    // Merge: mantener widgets nuevos que el usuario no tenga guardados aún
    const saved: WidgetConfig[] = data.widgets_json
    const savedIds = new Set(saved.map((w: WidgetConfig) => w.id))
    const extras   = DEFAULT_LAYOUT.filter(w => !savedIds.has(w.id))
    return [...saved, ...extras]
  } catch {
    return DEFAULT_LAYOUT
  }
}

export async function saveLayout(widgets: WidgetConfig[]): Promise<void> {
  const contexto = await getContextoUsuario()
  const supabase = createServiceClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any)
    .from("dashboard_layout")
    .upsert(
      { usuario_id: contexto.user.id, widgets_json: widgets, actualizado_en: new Date().toISOString() },
      { onConflict: "usuario_id" }
    )
}
