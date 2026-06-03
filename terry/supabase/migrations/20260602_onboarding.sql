ALTER TABLE organizaciones
  ADD COLUMN IF NOT EXISTS onboarding_completado BOOLEAN NOT NULL DEFAULT FALSE;

-- Existing orgs that already have SumUp connected → skip onboarding
UPDATE organizaciones o
SET onboarding_completado = TRUE
WHERE EXISTS (
  SELECT 1 FROM sumup_tokens st WHERE st.organizacion_id = o.id
);
