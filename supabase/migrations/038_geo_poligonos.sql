-- 038_geo_poligonos.sql
-- Almacena polígonos GeoJSON de departamentos y municipios para el mapa interactivo.
-- Tabla nueva, 100% retrocompatible — no toca ninguna tabla existente.
-- Los polígonos vienen de la fuente oficial DANE, simplificados para web.
-- Solamente almacena hasta nivel municipio (no barrios/comunas).

BEGIN;

-- ============================================================================
-- geo_poligonos
-- ============================================================================

CREATE TABLE geo_poligonos (
  codigo_dane    text PRIMARY KEY,
  tipo           text NOT NULL CHECK (tipo IN ('departamento', 'municipio')),
  poligono       jsonb NOT NULL,
  nombre         text NOT NULL,
  id_departamento text REFERENCES departamentos(id) ON DELETE SET NULL,
  id_municipio   text REFERENCES municipios(id) ON DELETE SET NULL,
  simplified     boolean DEFAULT true,
  bbox           jsonb,
  created_at     timestamptz DEFAULT now(),

  -- Consistencia: departamento no puede tener id_municipio; municipio requiere ambos.
  CONSTRAINT geo_poligonos_consistency CHECK (
    (tipo = 'departamento' AND id_municipio IS NULL) OR
    (tipo = 'municipio'   AND id_departamento IS NOT NULL AND id_municipio IS NOT NULL)
  )
);

COMMENT ON TABLE geo_poligonos IS
  'Polígonos GeoJSON de división política de Colombia (DANE). Solo departamentos y municipios.';

COMMENT ON COLUMN geo_poligonos.codigo_dane IS
  'Código oficial DANE. Departamentos: 2 dígitos (ej. "05"). Municipios: 5 dígitos (ej. "05001" = depto + mun).';
COMMENT ON COLUMN geo_poligonos.tipo IS
  '"departamento" o "municipio".';
COMMENT ON COLUMN geo_poligonos.poligono IS
  'GeoJSON Feature geometry. Contiene las coordenadas del polígono (EPSG:4686).';
COMMENT ON COLUMN geo_poligonos.id_departamento IS
  'FK a departamentos.id. Para tipo=departamento es el mismo codigo_dane.';
COMMENT ON COLUMN geo_poligonos.id_municipio IS
  'FK a municipios.id (3 dígitos). Solo para tipo=municipio.';
COMMENT ON COLUMN geo_poligonos.simplified IS
  'True si el polígono fue simplificado con mapshaper para reducir peso.';
COMMENT ON COLUMN geo_poligonos.bbox IS
  'Bounding box [minLon, minLat, maxLon, maxLat] para acelerar zoom/encuadre.';

-- ============================================================================
-- Índices
-- ============================================================================

CREATE INDEX idx_geo_poligonos_tipo ON geo_poligonos (tipo);
CREATE INDEX idx_geo_poligonos_id_departamento ON geo_poligonos (id_departamento);

-- ============================================================================
-- RLS: solo lectura para usuarios autenticados, escritura para dueño plataforma
-- ============================================================================

ALTER TABLE geo_poligonos ENABLE ROW LEVEL SECURITY;

CREATE POLICY geo_poligonos_select ON geo_poligonos
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY geo_poligonos_write ON geo_poligonos
  FOR ALL TO authenticated
  USING (es_dueno_plataforma())
  WITH CHECK (es_dueno_plataforma());

COMMIT;
