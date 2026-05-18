-- Columnas para el módulo de gastos sobre la tabla registros_financieros existente.

ALTER TABLE registros_financieros
  ADD COLUMN IF NOT EXISTS tipo_gasto          TEXT,
  ADD COLUMN IF NOT EXISTS gasto_recurrente_id UUID,
  ADD COLUMN IF NOT EXISTS fuente              TEXT NOT NULL DEFAULT 'manual';

CREATE INDEX IF NOT EXISTS registros_financieros_tipo_gasto_idx
  ON registros_financieros (tipo_gasto)
  WHERE tipo_gasto IS NOT NULL;

CREATE INDEX IF NOT EXISTS registros_financieros_recurrente_idx
  ON registros_financieros (gasto_recurrente_id)
  WHERE gasto_recurrente_id IS NOT NULL;
