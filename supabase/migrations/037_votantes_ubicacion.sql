-- 037_votantes_ubicacion.sql
-- Agrega campos de ubicación del votante (residencia, no puesto de votación).
-- Jerarquía: departamento → municipio → barrio_votante (opcional).
-- El barrio_votante referencia la tabla global barrios, igual que otros barrios,
-- pero representa la ubicación de residencia del votante, no la del puesto.

BEGIN;

-- ============================================================================
-- votantes: nuevos campos de ubicación
-- ============================================================================

ALTER TABLE votantes
  ADD COLUMN IF NOT EXISTS id_departamento text REFERENCES departamentos(id) ON DELETE SET NULL;

ALTER TABLE votantes
  ADD COLUMN IF NOT EXISTS id_municipio text REFERENCES municipios(id) ON DELETE SET NULL;

ALTER TABLE votantes
  ADD COLUMN IF NOT EXISTS id_barrio_votante bigint REFERENCES barrios(id) ON DELETE SET NULL;

COMMENT ON COLUMN votantes.id_departamento IS
  'Departamento de residencia del votante (catálogo global).';
COMMENT ON COLUMN votantes.id_municipio IS
  'Municipio de residencia del votante (catálogo global).';
COMMENT ON COLUMN votantes.id_barrio_votante IS
  'Barrio de residencia del votante (no confundir con id_barrio del puesto).';

CREATE INDEX IF NOT EXISTS votantes_id_departamento_idx ON votantes (id_departamento);
CREATE INDEX IF NOT EXISTS votantes_id_municipio_idx ON votantes (id_municipio);
CREATE INDEX IF NOT EXISTS votantes_id_barrio_votante_idx ON votantes (id_barrio_votante);

-- ============================================================================
-- cuarentena_votantes: mismos campos para mantener consistencia
-- ============================================================================

ALTER TABLE cuarentena_votantes
  ADD COLUMN IF NOT EXISTS id_departamento text REFERENCES departamentos(id) ON DELETE SET NULL;

ALTER TABLE cuarentena_votantes
  ADD COLUMN IF NOT EXISTS id_municipio text REFERENCES municipios(id) ON DELETE SET NULL;

ALTER TABLE cuarentena_votantes
  ADD COLUMN IF NOT EXISTS id_barrio_votante bigint REFERENCES barrios(id) ON DELETE SET NULL;

COMMENT ON COLUMN cuarentena_votantes.id_departamento IS
  'Departamento de residencia del votante en cuarentena.';
COMMENT ON COLUMN cuarentena_votantes.id_municipio IS
  'Municipio de residencia del votante en cuarentena.';
COMMENT ON COLUMN cuarentena_votantes.id_barrio_votante IS
  'Barrio de residencia del votante en cuarentena.';

COMMIT;
