CREATE TABLE IF NOT EXISTS sumup_transacciones (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  sumup_id         TEXT        UNIQUE NOT NULL,
  transaction_code TEXT,
  amount           INTEGER     NOT NULL,
  currency         TEXT        NOT NULL DEFAULT 'CLP',
  payment_type     TEXT        NOT NULL,
  card_type        TEXT,
  status           TEXT        NOT NULL,
  timestamp        TIMESTAMPTZ NOT NULL,
  payout_date      DATE,
  organizacion_id  UUID        NOT NULL REFERENCES organizaciones(id) ON DELETE CASCADE,
  sucursal_id      UUID        REFERENCES sucursales(id) ON DELETE SET NULL,
  sincronizado_en  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sumup_ts_timestamp ON sumup_transacciones (organizacion_id, timestamp DESC);

ALTER TABLE sumup_transacciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Miembros ven transacciones de su org"
  ON sumup_transacciones FOR SELECT
  USING (
    organizacion_id IN (
      SELECT organizacion_id FROM miembros_organizacion WHERE usuario_id = auth.uid()
    )
  );
