-- Preferencias de layout del dashboard por usuario.
-- widgets_json: array JSON con el orden e visibilidad de cada widget.
-- Ejemplo: [{"id":"ventas-hoy","visible":true},{"id":"comparativa-3m","visible":true},...]

CREATE TABLE IF NOT EXISTS dashboard_layout (
  usuario_id   UUID         PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  widgets_json JSONB        NOT NULL DEFAULT '[]'::jsonb,
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE dashboard_layout ENABLE ROW LEVEL SECURITY;

-- Cada usuario solo puede leer y escribir su propio layout
CREATE POLICY "usuario lee su layout"
  ON dashboard_layout FOR SELECT
  USING (auth.uid() = usuario_id);

CREATE POLICY "usuario escribe su layout"
  ON dashboard_layout FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "usuario actualiza su layout"
  ON dashboard_layout FOR UPDATE
  USING (auth.uid() = usuario_id)
  WITH CHECK (auth.uid() = usuario_id);
