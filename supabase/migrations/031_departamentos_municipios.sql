-- 031_departamentos_municipios.sql
-- Tablas de catálogo global para departamentos y municipios con coordenadas.

BEGIN;

-- ============================================================================
-- departamentos
-- ============================================================================

CREATE TABLE departamentos (
  id       bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre   text NOT NULL UNIQUE,
  latitud  double precision,
  longitud double precision
);

COMMENT ON TABLE departamentos IS
  'Departamentos de Colombia. Catálogo global de plataforma.';
COMMENT ON COLUMN departamentos.latitud IS
  'Coordenada geográfica del centroide del departamento.';
COMMENT ON COLUMN departamentos.longitud IS
  'Coordenada geográfica del centroide del departamento.';

-- ============================================================================
-- municipios
-- ============================================================================

CREATE TABLE municipios (
  id                bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_departamento   bigint NOT NULL REFERENCES departamentos(id) ON DELETE RESTRICT,
  nombre            text NOT NULL,
  latitud           double precision,
  longitud          double precision,
  UNIQUE (id_departamento, nombre)
);

COMMENT ON TABLE municipios IS
  'Municipios de Colombia. Catálogo global de plataforma.';
COMMENT ON COLUMN municipios.id_departamento IS
  'Departamento al que pertenece el municipio.';
COMMENT ON COLUMN municipios.latitud IS
  'Coordenada geográfica del centroide del municipio.';
COMMENT ON COLUMN municipios.longitud IS
  'Coordenada geográfica del centroide del municipio.';

-- ============================================================================
-- RLS
-- ============================================================================

ALTER TABLE departamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE municipios ENABLE ROW LEVEL SECURITY;

-- departamentos
CREATE POLICY departamentos_select ON departamentos
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY departamentos_write ON departamentos
  FOR ALL TO authenticated
  USING (es_dueno_plataforma())
  WITH CHECK (es_dueno_plataforma());

-- municipios
CREATE POLICY municipios_select ON municipios
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY municipios_write ON municipios
  FOR ALL TO authenticated
  USING (es_dueno_plataforma())
  WITH CHECK (es_dueno_plataforma());

COMMIT;
