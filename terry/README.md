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
| `organizaciones` | Organizaciones (tenants) |
| `sucursales` | Sucursales por organización |
| `miembros_organizacion` | Usuarios y roles por organización |
| `perfiles` | Datos de usuario (espejo de Supabase Auth) |
| `categorias` | Clasificación de transacciones por organización |
| `registros_financieros` | Ingresos y egresos (manual, WhatsApp, Telegram) |
| `archivos_documentos` | Adjuntos vinculados a registros financieros |
| `gastos_recurrentes` | Plantillas de gastos fijos o periódicos |
| `sumup_tokens` | Tokens OAuth de SumUp por organización |
| `sumup_transacciones` | Transacciones sincronizadas desde SumUp |
| `sumup_snapshot_dia` | Agregados diarios pre-calculados (zona horaria Santiago) |
| `dashboard_layout` | Preferencias de widgets por usuario (`widgets_json: JSONB`) |
| `bot_sesiones` | Estado temporal de conversación del bot Telegram (TTL: 10 min) |

Referencia completa de esquemas en [03 - Base de Datos](https://www.notion.so/34db1f3aefb580aab2b1f82e23a40845) en Notion.

## Migraciones

Las migraciones SQL están en `supabase/migrations/`. Aplicar en orden cronológico al hacer setup inicial:

```bash
# Con Supabase CLI
supabase db push
```

## Variables de entorno

| Variable | Dónde obtenerla | Notas |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API | URL del proyecto |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API | Clave pública |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API | Solo en servidor, nunca exponer al cliente |
| `SUMUP_CLIENT_ID` | SumUp Developer Portal | App OAuth |
| `SUMUP_CLIENT_SECRET` | SumUp Developer Portal | App OAuth |
| `SUMUP_REDIRECT_URI` | Definida por ti | `https://<dominio>/api/sumup/callback` |
| `SUMUP_ACCESS_TOKEN` | Flujo OAuth completado | Token de acceso vigente (se renueva automáticamente) |
| `ANTHROPIC_API_KEY` | console.anthropic.com | Usado por Claude Vision para extraer facturas |
| `TELEGRAM_BOT_TOKEN` | @BotFather en Telegram | Token del bot |
| `TELEGRAM_WEBHOOK_SECRET` | Definida por ti | String arbitrario; debe coincidir con el usado al registrar el webhook |
| `TELEGRAM_ORG_ID` | Supabase → tabla `organizations` | UUID de la organización que recibe facturas vía Telegram |
| `TELEGRAM_SUCURSAL_ID` | Supabase → tabla correspondiente | UUID de la sucursal destino |
| `TWILIO` | Twilio Console | Credenciales para WhatsApp (ver sección WhatsApp) |

### Variables de WhatsApp (Twilio)

| Variable | Notas |
|---|---|
| `TWILIO_ACCOUNT_SID` | Twilio Console → Account Info |
| `TWILIO_AUTH_TOKEN` | Twilio Console → Account Info |
| `WHATSAPP_ORG_ID` | UUID de la organización destino en Supabase |
| `WHATSAPP_SUCURSAL_ID` | UUID de la sucursal destino en Supabase |

## Desarrollo local

```bash
npm install
npm run dev
```

El servidor corre en `http://localhost:3000`.

## Deployment en Vercel

### 1. Configurar variables de entorno

En Vercel → Settings → Environment Variables, agregar todas las variables listadas arriba. Las variables `NEXT_PUBLIC_*` deben marcarse como disponibles en el entorno de producción **y** en el cliente (Vercel lo hace automáticamente por el prefijo).

`SUMUP_REDIRECT_URI` debe apuntar al dominio de producción:
```
https://<tu-dominio>.vercel.app/api/sumup/callback
```

### 2. Registrar el webhook de Telegram

Una vez desplegado, registrar la URL del webhook con la API de Telegram. Ejecutar una sola vez (reemplazar los valores):

```bash
curl "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook" \
  -d "url=https://<tu-dominio>.vercel.app/api/telegram/webhook" \
  -d "secret_token=<TELEGRAM_WEBHOOK_SECRET>"
```

El endpoint valida el header `X-Telegram-Bot-Api-Secret-Token` en cada request entrante. Si el secret no coincide, responde `401`.

Para verificar que el webhook quedó registrado:
```bash
curl "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/getWebhookInfo"
```

### 3. Configurar el webhook de WhatsApp (Twilio)

En Twilio Console → Messaging → Senders → Sandbox (o número productivo):
- **Webhook URL**: `https://<tu-dominio>.vercel.app/api/whatsapp/webhook`
- **Método**: `HTTP POST`

Twilio envía el cuerpo como `multipart/form-data`. El endpoint lo procesa sin validación adicional de firma (a diferencia de Telegram).

### 4. Configurar SumUp OAuth

En SumUp Developer Portal → tu aplicación:
- Agregar `https://<tu-dominio>.vercel.app/api/sumup/callback` como Redirect URI permitida.

El flujo OAuth completo está en `app/api/sumup/auth/` y `app/api/sumup/callback/`. Los tokens se persisten en la tabla `sumup_tokens` y se renuevan automáticamente.

### 5. Aplicar migraciones en Supabase

```bash
supabase db push
```

O aplicar manualmente los archivos en `supabase/migrations/` en orden cronológico.
