-- Snapshot horario de ventas SumUp
-- Una fila por (fecha, hora) con totales pre-calculados en zona horaria Santiago.
-- Se regenera vía POST /api/sumup/snapshots/hora — no editar manualmente.

CREATE TABLE IF NOT EXISTS sumup_snapshot_hora (
  fecha         DATE          NOT NULL,
  hora          SMALLINT      NOT NULL CHECK (hora BETWEEN 0 AND 23),
  total         NUMERIC(14,2) NOT NULL DEFAULT 0,
  num_tx        INT           NOT NULL DEFAULT 0,
  avg_tx        NUMERIC(14,2) NOT NULL DEFAULT 0,
  max_tx        NUMERIC(14,2) NOT NULL DEFAULT 0,
  generado_en   TIMESTAMPTZ   NOT NULL DEFAULT now(),

  PRIMARY KEY (fecha, hora)
);

CREATE INDEX IF NOT EXISTS idx_snapshot_hora_fecha
  ON sumup_snapshot_hora (fecha DESC);

CREATE INDEX IF NOT EXISTS idx_snapshot_hora_anio_mes
  ON sumup_snapshot_hora (EXTRACT(YEAR FROM fecha), EXTRACT(MONTH FROM fecha));

ALTER TABLE sumup_snapshot_hora ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service role full access"
  ON sumup_snapshot_hora
  FOR ALL
  USING (true)
  WITH CHECK (true);
