export type WidgetId =
  | "ventas-hoy"
  | "balance-mes"
  | "comparativa-3m"
  | "indicadores-mes"
  | "analisis-financiero"
  | "vencimientos"

export type WidgetConfig = {
  id: WidgetId
  visible: boolean
}

export const DEFAULT_LAYOUT: WidgetConfig[] = [
  { id: "ventas-hoy",          visible: true },
  { id: "balance-mes",         visible: true },
  { id: "comparativa-3m",      visible: true },
  { id: "indicadores-mes",     visible: true },
  { id: "analisis-financiero", visible: true },
  { id: "vencimientos",        visible: true },
]
