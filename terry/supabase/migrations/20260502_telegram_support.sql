-- Telegram bot conversation state
-- Applies to: Hito 5 — Captura de facturas por foto
-- Run this migration in the Supabase SQL editor before deploying the Telegram webhook.

-- 1. Table for temporary conversation state per chat_id
CREATE TABLE IF NOT EXISTS bot_sesiones (
  chat_id         TEXT PRIMARY KEY,
  estado          TEXT NOT NULL DEFAULT 'esperando_confirmacion',
  datos_extraidos JSONB,
  archivo_ruta    TEXT,
  archivo_nombre  TEXT,
  archivo_mime    TEXT,
  archivo_tamano  INTEGER,
  org_id          TEXT NOT NULL,
  sucursal_id     TEXT NOT NULL,
  expires_at      TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '10 minutes'),
  creado_en       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index to efficiently find and clean up expired sessions
CREATE INDEX IF NOT EXISTS idx_bot_sesiones_expires_at ON bot_sesiones (expires_at);

-- 2. Track which channel originated each document (telegram, whatsapp, web, movil)
ALTER TABLE archivos_documentos
  ADD COLUMN IF NOT EXISTS canal TEXT DEFAULT 'web';
