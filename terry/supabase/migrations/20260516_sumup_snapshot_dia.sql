-- Snapshot diario de ventas SumUp
-- Una fila por día calendario con totales pre-calculados en zona horaria Santiago.
-- Se regenera vía POST /api/sumup/snapshots/dia — no editar manualmente.

CREATE TABLE IF NOT EXISTS sumup_snapshot_dia (
  fecha         DATE         PRIMARY KEY,
  dia_codigo    TEXT         NOT NULL,          -- 'L' | 'M' | 'X' | 'J' | 'V' | 'S' | 'D'
  dia_nombre    TEXT         NOT NULL,          -- 'Lunes' | 'Martes' | ...
  semana_num    INT          NOT NULL,          -- semana dentro del mes (1-4)
  mes_num       INT          NOT NULL,          -- 1-12
  mes_nombre    TEXT         NOT NULL,          -- 'Enero' | 'Febrero' | ...
  anio          INT          NOT NULL,
  total         NUMERIC(14,2) NOT NULL DEFAULT 0,
  num_tx        INT          NOT NULL DEFAULT 0,
  generado_en   TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- Índices para las consultas más frecuentes del dashboard
CREATE INDEX IF NOT EXISTS idx_snapshot_dia_anio_mes
  ON sumup_snapshot_dia (anio, mes_num);

CREATE INDEX IF NOT EXISTS idx_snapshot_dia_fecha
  ON sumup_snapshot_dia (fecha DESC);

-- RLS: solo el service role puede leer/escribir (el dashboard usa service client)
ALTER TABLE sumup_snapshot_dia ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service role full access"
  ON sumup_snapshot_dia
  FOR ALL
  USING (true)
  WITH CHECK (true);
