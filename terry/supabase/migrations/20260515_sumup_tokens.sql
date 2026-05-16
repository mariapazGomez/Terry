CREATE TABLE IF NOT EXISTS sumup_tokens (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  organizacion_id UUID        NOT NULL UNIQUE REFERENCES organizaciones(id) ON DELETE CASCADE,
  access_token    TEXT        NOT NULL,
  refresh_token   TEXT        NOT NULL,
  expires_at      TIMESTAMPTZ NOT NULL,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE sumup_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Solo service role puede gestionar tokens"
  ON sumup_tokens
  USING (false);
