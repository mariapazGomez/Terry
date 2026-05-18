"use client"
import { useState, useTransition } from "react"
import {
  DndContext, closestCenter, PointerSensor,
  useSensor, useSensors, DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext, verticalListSortingStrategy,
  useSortable, arrayMove,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { saveLayout } from "@/lib/dashboard-layout"
import type { WidgetConfig } from "@/lib/dashboard-layout-types"

const LABELS: Record<string, string> = {
  "ventas-hoy":          "Ventas de hoy",
  "balance-mes":         "Balance del mes",
  "comparativa-3m":      "Comparativa 3 meses",
  "indicadores-mes":     "Indicadores del mes",
  "analisis-financiero": "Análisis financiero",
  "vencimientos":        "Vencimientos",
}

// ── Widget draggable ────────────────────────────────────────────────────────

function SortableWidget({
  id, editing, visible, onToggle, children,
}: {
  id: string
  editing: boolean
  visible: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: "relative",
  }

  if (!visible && !editing) return null

  return (
    <div ref={setNodeRef} style={style}>
      {editing && (
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          marginBottom: 8, userSelect: "none",
        }}>
          {/* Handle de arrastre */}
          <div
            {...attributes} {...listeners}
            style={{
              cursor: "grab", display: "flex", alignItems: "center",
              gap: 3, padding: "4px 6px", borderRadius: 6,
              background: "rgba(10,10,10,0.06)",
              color: "rgba(10,10,10,0.40)",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9"  cy="5"  r="1" fill="currentColor" stroke="none" />
              <circle cx="9"  cy="12" r="1" fill="currentColor" stroke="none" />
              <circle cx="9"  cy="19" r="1" fill="currentColor" stroke="none" />
              <circle cx="15" cy="5"  r="1" fill="currentColor" stroke="none" />
              <circle cx="15" cy="12" r="1" fill="currentColor" stroke="none" />
              <circle cx="15" cy="19" r="1" fill="currentColor" stroke="none" />
            </svg>
          </div>

          {/* Toggle visibilidad */}
          <button
            onClick={onToggle}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "none", border: "none", cursor: "pointer",
              fontSize: 11, fontFamily: "var(--font-mono)",
              color: visible ? "rgba(10,10,10,0.70)" : "rgba(10,10,10,0.35)",
              padding: 0,
            }}
          >
            <span style={{
              width: 14, height: 14, borderRadius: 3,
              border: "1.5px solid",
              borderColor: visible ? "oklch(0.62 0.15 145)" : "rgba(10,10,10,0.25)",
              background: visible ? "oklch(0.62 0.15 145)" : "transparent",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              {visible && (
                <svg width="8" height="8" viewBox="0 0 10 10" fill="none" stroke="white" strokeWidth="2">
                  <polyline points="1.5 5 4 7.5 8.5 2.5" />
                </svg>
              )}
            </span>
            {LABELS[id] ?? id}
          </button>
        </div>
      )}

      <div style={{ opacity: visible ? 1 : 0.35, pointerEvents: visible ? "auto" : "none" }}>
        {children}
      </div>
    </div>
  )
}

// ── DashboardGrid ───────────────────────────────────────────────────────────

export default function DashboardGrid({
  initialLayout,
  widgets,
}: {
  initialLayout: WidgetConfig[]
  widgets: Record<string, React.ReactNode>
}) {
  const [layout,  setLayout]  = useState<WidgetConfig[]>(initialLayout)
  const [editing, setEditing] = useState(false)
  const [pending, startTransition] = useTransition()

  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: { distance: 8 },
  }))

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    setLayout(prev => {
      const oldIdx = prev.findIndex(w => w.id === active.id)
      const newIdx = prev.findIndex(w => w.id === over.id)
      return arrayMove(prev, oldIdx, newIdx)
    })
  }

  function toggleVisible(id: string) {
    setLayout(prev => prev.map(w => w.id === id ? { ...w, visible: !w.visible } : w))
  }

  function handleSave() {
    startTransition(async () => {
      await saveLayout(layout)
      setEditing(false)
    })
  }

  function handleCancel() {
    setLayout(initialLayout)
    setEditing(false)
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* ── Barra de edición ─────────────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        {editing ? (
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={handleCancel}
              style={{
                padding: "6px 14px", borderRadius: 7, fontSize: 12, fontWeight: 500,
                border: "1px solid rgba(10,10,10,0.15)", background: "white",
                color: "rgba(10,10,10,0.60)", cursor: "pointer", fontFamily: "var(--font-mono)",
              }}
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={pending}
              style={{
                padding: "6px 14px", borderRadius: 7, fontSize: 12, fontWeight: 600,
                border: "none", background: "#0a0a0a",
                color: "white", cursor: pending ? "wait" : "pointer", fontFamily: "var(--font-mono)",
              }}
            >
              {pending ? "Guardando…" : "Guardar"}
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditing(true)}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "6px 12px", borderRadius: 7, fontSize: 11, fontWeight: 500,
              border: "1px solid rgba(10,10,10,0.12)", background: "white",
              color: "rgba(10,10,10,0.55)", cursor: "pointer", fontFamily: "var(--font-mono)",
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Personalizar
          </button>
        )}
      </div>

      {/* ── Widgets ──────────────────────────────────────────────── */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={layout.map(w => w.id)} strategy={verticalListSortingStrategy}>
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {layout.map(widget => (
              <SortableWidget
                key={widget.id}
                id={widget.id}
                editing={editing}
                visible={widget.visible}
                onToggle={() => toggleVisible(widget.id)}
              >
                {widgets[widget.id] ?? null}
              </SortableWidget>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}
