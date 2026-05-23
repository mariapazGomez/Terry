# Terry — Contexto de Documentación

Archivo de trabajo para el rol de experto en documentación. Se actualiza en cada sesión para mantener estado y prioridades vigentes.

---

## Rol activo

Actúo como **experto en documentación de producto en desarrollo** para Terry. En cada sesión debo:
- Proponer mejoras de documentación de forma proactiva (no esperar que se pidan).
- Actualizar este archivo con el estado actual, decisiones tomadas y próximas prioridades.
- Mantener coherencia entre lo que dice la documentación y lo que hace el código.
- **La documentación oficial vive en Notion** (espacio Terry). El README es referencia rápida para devs; Notion es la fuente de verdad del producto.

---

## Estado actual — 2026-05-18

### Documentación existente

| Archivo | Estado | Notas |
|---|---|---|
| `README.md` | Bueno, pero incompleto | Cubre stack, módulos principales, tablas, env vars y dev local. Faltan: deployment, arquitectura de datos, módulos nuevos |
| `AGENTS.md` | Mínimo | Solo una advertencia sobre Next.js — no aporta contexto de producto |
| `CLAUDE.md` | Referencia a AGENTS.md | Sin contenido propio |

### Módulos sin documentación propia

- `modules/documentos/` — sin README
- `modules/gastos-recurrentes/` — sin README
- `modules/integraciones/` — sin README
- `modules/proveedores/` — sin README
- `modules/telegram/` — nuevo, sin commitear, sin README
- `modules/organizations/` — sin README
- `modules/users/` — sin README

---

## Brechas identificadas

### Alta prioridad

1. ~~**Módulo Telegram**~~ — descartado: se rehará desde cero.
2. ~~**Flujo de datos completo**~~ — descartado por ahora.
3. ~~**Guía de deployment**~~ — ✅ **Completado 2026-05-18**. Se expandió la sección de variables de entorno (tabla con origen de cada variable) y se agregó sección completa "Deployment en Vercel" con: configuración de vars, registro de webhook Telegram (curl + verificación), configuración Twilio para WhatsApp, SumUp OAuth redirect URI, y migraciones.

### Media prioridad

4. **Tablas Supabase faltantes** — el README lista 5 tablas pero hay más en las migraciones (ej. `gastos_recurrentes`, `proveedores`, tablas de documentos). La tabla de referencia está desactualizada.
5. **Flujo de autenticación** — `modules/auth/` y `app/(auth)/` no tienen documentación. El flujo Supabase Auth + RLS no está explicado.
6. **API endpoints** — los endpoints de SumUp están bien listados pero los de Telegram y WhatsApp no aparecen en el README.

### Baja prioridad

7. **ADRs (Architecture Decision Records)** — decisiones como "por qué snapshots diarios en lugar de queries directas" están en el README inline pero no como decisiones formales razonadas.
8. **Guía de contribución** — no existe. Útil cuando el equipo crezca.
9. **Glosario de dominio** — términos como "snapshot", "registro financiero", "F29" asumen conocimiento previo.

---

## Decisiones tomadas

- **2026-05-18**: Puntos 1 y 2 (Telegram, flujo de datos) descartados — el módulo Telegram se rehará desde cero.
- **2026-05-18**: Punto 6 (endpoints en README) descartado — no se documenta.
- **2026-05-18**: Orden de ataque: 3 → 4 → 5.

---

## Plan de producto activo — 2026-05-23

### Tareas de hoy (hasta 16:00)
| # | Tarea | Tiempo | Estado | Notion ID |
|---|---|---|---|---|
| 1 | Actualizar datos del POS en cada carga de página | 1.5h | ✅ Completado | 369b1f3a-efb5-81b3-b145-de15818c1bfe |
| 2 | Estandarizar escala del eje en gráficos del mismo grupo de cards | 1.5h | ✅ Completado | 369b1f3a-efb5-8129-abf0-e5ed152ca546 |
| 3 | Rediseño de estrategia de visualización del dashboard | 2h | ✅ Completado | 369b1f3a-efb5-8197-932f-fd9130dd5e1e |
| 4 | Mejorar vista resumen del dashboard | 2h | ✅ Completado | 369b1f3a-efb5-8189-bf57-ee323558fc2c |

### Tareas planificadas próximos días
| Fecha | Tarea | Tiempo | Notion ID |
|---|---|---|---|
| 2026-05-26 | Obtener datos de productos desde API SumUp | 3h | 369b1f3a-efb5-81e7-97a3-f63ff0676076 |
| 2026-05-26 | Mejorar page de login (logo Terry + paleta) | 1.5h | 369b1f3a-efb5-8182-ac8b-ff058c2a0c3e |
| 2026-05-27 | Arreglar landing page (visual, animaciones, limpieza) | 3h | 369b1f3a-efb5-8129-a357-c22519f74a56 |

### Contexto técnico relevante para implementación
- Dashboard principal: `app/(dashboard)/dashboard/`
- Integración SumUp: `lib/sumup/`, `app/api/sumup/`
- Snapshots diarios: `app/api/sumup/snapshots/dia/` — sistema de cache en `sumup_snapshot_dia`
- Componentes de gráficos: `components/dashboard/`
- El refresh del POS implica revisar si los widgets llaman al snapshot o a la API directa

---

## Próximas acciones sugeridas

- [x] ~~Guía de deployment en Vercel~~ (punto 3)
- [x] ~~Auditar migraciones SQL y actualizar tabla de Supabase en Notion~~ (punto 4)
- [x] ~~Documentar flujo de autenticación Supabase Auth + RLS~~ (punto 5)
- [x] ~~Carta Gantt trimestral en Notion~~ — Vista "📅 Carta Gantt" en "08 - Tablero de Tareas", agrupada por persona, 15 tareas con fechas estimadas (May 18 – Jul 26)
- [x] Actualizar Notion con avance del día al cerrar sesión (2026-05-23)

---

## Historial de sesiones

| Fecha | Qué se hizo |
|---|---|
| 2026-05-18 | Diagnóstico inicial. Creación de este archivo. Identificadas 9 brechas de documentación. |
| 2026-05-18 | Punto 3 completado: guía de deployment publicada en Notion (02 - Stack Tecnológico) y en README. Variables de entorno con tabla completa + pasos Vercel, Telegram, WhatsApp, SumUp. |
| 2026-05-18 | Carta Gantt trimestral creada en Notion: columnas "Fecha inicio", "Fecha fin" y "Duración estimada" agregadas al tablero. Vista Timeline agrupada por persona. 15 tareas pendientes con fechas estimadas (horizonte May 18 – Jul 26). |
| 2026-05-18 | Punto 5 completado: Notion "01 - Arquitectura" actualizado con flujo de auth completo (3 clientes Supabase, login, protección de rutas, resolución de contexto, roles, RLS, logout). Estructura de carpetas actualizada y referencias a cic-pezcalugon eliminadas. |
| 2026-05-18 | Punto 4 completado: Notion "03 - Base de Datos" actualizado con 6 tablas nuevas (sumup_tokens, sumup_transacciones, sumup_snapshot_dia, dashboard_layout, gastos_recurrentes, bot_sesiones), columnas nuevas en registros_financieros y archivos_documentos, modelo conceptual actualizado, historial de migraciones. README actualizado con tabla completa de 13 tablas. |
| 2026-05-23 | Plan de producto estructurado: 7 tareas creadas en Notion (4 para hoy, 3 para semana siguiente). Tareas comerciales Platanus pausadas (deadlines removidos). C09 y UI gastos marcadas como Completado. |
| 2026-05-23 | 4 tareas completadas: (1) auto-sync SumUp en cada carga de dashboard via `sincronizarHoy()` con throttle 5 min; (2) escala Y compartida en gráfico comparativa 3 meses; (3) rediseño VentasHoy widget — slimmed a KPIs + tx list, retiradas charts semanales; (4) nuevo orden DEFAULT_LAYOUT: ventas-hoy → indicadores-mes → vencimientos → balance-mes → comparativa-3m → analisis-financiero. |
