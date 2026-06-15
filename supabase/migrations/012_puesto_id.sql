-- Renombra codigo_registraduria → id_puesto (identificador del puesto en la campaña).
-- Requiere 002_domain_schema.sql aplicada previamente.
-- Idempotente: se puede ejecutar aunque la columna ya esté renombrada.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'puestos_votacion'
      AND column_name = 'codigo_registraduria'
  ) THEN
    ALTER TABLE puestos_votacion
      RENAME COLUMN codigo_registraduria TO id_puesto;
  END IF;
END $$;

COMMENT ON COLUMN puestos_votacion.id_puesto IS
  'Identificador del puesto de votación dentro de la campaña (no es el UUID de la fila).';
