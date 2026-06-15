-- Evita puestos de votación duplicados por nombre dentro de la misma campaña.
-- Requiere 002_domain_schema.sql aplicada previamente.
-- Idempotente.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'puestos_votacion_campana_nombre_unique'
  ) THEN
    ALTER TABLE puestos_votacion
      ADD CONSTRAINT puestos_votacion_campana_nombre_unique
      UNIQUE (id_campana, nombre);
  END IF;
END $$;
