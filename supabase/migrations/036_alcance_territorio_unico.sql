-- 036_alcance_territorio_unico.sql
-- Restringe campana_territorio a un modelo de 3 tipos exclusivos:
--   Nacional  → sin fila (todo el país disponible)
--   Departamental → 1 fila con id_departamento, id_municipio NULL
--   Municipal → 1 fila con id_municipio, id_departamento NULL

BEGIN;

-- ============================================================================
-- Paso 1: Limpiar constraint actual
-- ============================================================================

ALTER TABLE campana_territorio DROP CONSTRAINT IF EXISTS al_menos_uno;
ALTER TABLE campana_territorio DROP CONSTRAINT IF EXISTS campana_territorio_id_campana_id_departamento_id_municipio_key;

-- ============================================================================
-- Paso 2: Nuevas constraints
-- ============================================================================

-- Solo 1 fila por campaña (Nacional = 0 filas)
ALTER TABLE campana_territorio ADD CONSTRAINT campana_territorio_id_campana_unique
  UNIQUE (id_campana);

-- CHECK: si hay fila, debe ser EXACTAMENTE uno de los dos (depto XOR municipio)
ALTER TABLE campana_territorio ADD CONSTRAINT campana_territorio_xor_alcance
  CHECK (
    (id_departamento IS NOT NULL AND id_municipio IS NULL)
    OR
    (id_departamento IS NULL AND id_municipio IS NOT NULL)
  );

COMMIT;
