-- Plantillas de gastos recurrentes por organización.
-- Cada registro representa un gasto fijo o periódico (arriendo, sueldos, créditos, etc.)
-- que se puede "generar" al inicio de cada mes como registros_financieros pendientes.

CREATE TABLE IF NOT EXISTS gastos_recurrentes (
  id               UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  organizacion_id  UUID          NOT NULL,
  sucursal_id      UUID          REFERENCES sucursales(id) ON DELETE SET NULL,
  categoria_id     UUID,
  proveedor_id     UUID,

  nombre           TEXT          NOT NULL,
  tipo_gasto       TEXT          NOT NULL DEFAULT 'otro',
  frecuencia       TEXT          NOT NULL DEFAULT 'mensual',
  dia_del_mes      INT           CHECK (dia_del_mes BETWEEN 1 AND 31),

  monto_estimado   NUMERIC(14,2) NOT NULL DEFAULT 0,
  moneda           TEXT          NOT NULL DEFAULT 'CLP',

  activo           BOOLEAN       NOT NULL DEFAULT TRUE,
  creado_en        TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS gastos_recurrentes_org_idx
  ON gastos_recurrentes (organizacion_id, activo);

ALTER TABLE gastos_recurrentes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org accede a sus recurrentes"
  ON gastos_recurrentes
  USING (
    organizacion_id IN (
      SELECT organizacion_id
      FROM miembros_organizacion
      WHERE usuario_id = auth.uid()
    )
  );

CREATE POLICY "service role full access"
  ON gastos_recurrentes
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
