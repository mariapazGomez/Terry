# Terry — Agente Financiero para PYMEs

Terry es un agente financiero AaaS (Agent as a Service) para pequeñas y medianas empresas. Consolida datos de múltiples fuentes (SumUp, facturas vía WhatsApp, registros manuales) y los presenta en un dashboard financiero accionable.

## Stack

- **Framework**: Next.js 16 con App Router y Turbopack
- **Base de datos**: Supabase (PostgreSQL + RLS + Storage)
- **Auth**: Supabase Auth
- **Pagos en punto de venta**: SumUp API
- **Captura de facturas**: WhatsApp + Telegram → Claude Vision (Anthropic)

## Módulos principales

### Dashboard financiero (`app/(dashboard)/dashboard/`)

Panel principal con widgets personalizables. Cada usuario puede reordenar y ocultar widgets; el layout se persiste en Supabase.

**Widgets disponibles:**
| Widget | Descripción |
|--------|-------------|
| `ventas-hoy` | Ventas del día desde SumUp en tiempo real |
| `comparativa-3m` | Gráfico de barras por día — últimos 3 meses |
| `indicadores-mes` | KPIs del período: ingresos, egresos, flujo neto, margen |
| `analisis-financiero` | Flujo de caja 6 meses + composición de egresos |
| `vencimientos` | Cuentas por pagar + estimación IVA F29 |

**Personalización del dashboard** (`components/dashboard/dashboard-grid.tsx`):  
Drag-and-drop con `@dnd-kit`. El botón "Personalizar" habilita handles de arrastre y checkboxes de visibilidad. Al guardar, se hace upsert en `dashboard_layout`.

### Integración SumUp (`lib/sumup/`, `app/api/sumup/`)

| Archivo / Ruta | Propósito |
|---|---|
| `lib/sumup/tokens.ts` | Obtiene y refresca tokens OAuth de SumUp desde Supabase |
| `lib/sumup/api.ts` | Cliente wrapper para la SumUp API |
| `lib/sumup/resumen.ts` | Calcula KPIs y comparativas desde el snapshot |
| `app/api/sumup/auth/` | Inicio del flujo OAuth de SumUp |
| `app/api/sumup/callback/` | Callback OAuth — persiste tokens en Supabase |
| `app/api/sumup/sync/` | Sincronización incremental de transacciones |
| `app/api/sumup/sync-historico/` | Sincronización histórica completa (paginada) |
| `app/api/sumup/snapshots/dia/` | Genera/lee snapshot diario en `sumup_snapshot_dia` |
| `app/api/sumup/verificar/` | Consulta directa a la API de SumUp para verificar totales |
| `app/api/sumup/transactions/` | Endpoint de transacciones raw |

**Sistema de snapshots diarios:**  
Las transacciones brutas se pre-procesan en `sumup_snapshot_dia` (una fila por día, totales y conteos). Esto desacopla el dashboard del volumen de transacciones y evita inconsistencias de zona horaria (siempre `America/Santiago`).

### Captura de facturas vía Telegram (`lib/telegram/`, `modules/telegram/`)

Bot de Telegram que recibe fotos de facturas, las procesa con Claude Vision y registra los datos en Supabase. Flujos: extracción, confirmación, persistencia y gestión de sesión.

### Registros financieros (`modules/registros-financieros/`)

Módulo de ingresos y egresos manual: queries, tipos y lógica de negocio para el período mensual navegable del dashboard.

## Supabase — Tablas clave

| Tabla | Descripción |
|---|---|
| `sumup_tokens` | Access/refresh tokens OAuth de SumUp por usuario |
| `sumup_transacciones` | Transacciones sincronizadas desde SumUp |
| `sumup_snapshot_dia` | Snapshot diario pre-calculado (total + num_tx por día) |
| `dashboard_layout` | Layout personalizado por usuario (`widgets_json: JSONB`) |
| `registros_financieros` | Ingresos y egresos registrados manualmente |

## Migraciones

Las migraciones SQL están en `supabase/migrations/`. Aplicar en orden cronológico al hacer setup inicial:

```bash
# Con Supabase CLI
supabase db push
```

## Variables de entorno

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUMUP_CLIENT_ID=
SUMUP_CLIENT_SECRET=
SUMUP_REDIRECT_URI=
ANTHROPIC_API_KEY=
TELEGRAM_BOT_TOKEN=
```

## Desarrollo local

```bash
npm install
npm run dev
```

El servidor corre en [http://localhost:3000](http://localhost:3000).
