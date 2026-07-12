-- 033_reestructura_territorio_global.sql
-- Departamentos, municipios, comunas, barrios y puestos_votacion pasan a ser
-- entidades globales. La campaña define su alcance territorial via campana_territorio.

BEGIN;

-- ============================================================================
-- PHASE 1: Drop RLS policies que dependen de id_campana en tablas territoriales
-- ============================================================================

DROP POLICY IF EXISTS comunas_select ON comunas;
DROP POLICY IF EXISTS comunas_insert ON comunas;
DROP POLICY IF EXISTS comunas_update ON comunas;
DROP POLICY IF EXISTS comunas_delete ON comunas;

DROP POLICY IF EXISTS barrios_select ON barrios;
DROP POLICY IF EXISTS barrios_insert ON barrios;
DROP POLICY IF EXISTS barrios_update ON barrios;
DROP POLICY IF EXISTS barrios_delete ON barrios;

DROP POLICY IF EXISTS puestos_select ON puestos_votacion;
DROP POLICY IF EXISTS puestos_insert ON puestos_votacion;
DROP POLICY IF EXISTS puestos_update ON puestos_votacion;
DROP POLICY IF EXISTS puestos_delete ON puestos_votacion;

-- ============================================================================
-- PHASE 2: Crear campana_territorio (junction campaign ↔ territorio)
-- ============================================================================

CREATE TABLE campana_territorio (
  id_campana      bigint NOT NULL REFERENCES campanas(id) ON DELETE CASCADE,
  id_departamento bigint REFERENCES departamentos(id),
  id_municipio    bigint REFERENCES municipios(id),
  CONSTRAINT al_menos_uno CHECK (id_departamento IS NOT NULL OR id_municipio IS NOT NULL),
  UNIQUE (id_campana, id_departamento, id_municipio)
);

COMMENT ON TABLE campana_territorio IS
  'Define el alcance territorial de una campaña. Si no hay filas, aplica a todos los departamentos.';

COMMENT ON COLUMN campana_territorio.id_departamento IS
  'Si se define, la campaña cubre todo el departamento.';
COMMENT ON COLUMN campana_territorio.id_municipio IS
  'Si se define (junto con id_departamento), la campaña cubre solo ese municipio.';

-- ============================================================================
-- PHASE 3: Migrar datos existentes
-- ============================================================================

INSERT INTO campana_territorio (id_campana, id_departamento)
SELECT DISTINCT c.id_campana, m.id_departamento
FROM comunas c
JOIN municipios m ON c.id_municipio = m.id
WHERE m.id_departamento IS NOT NULL
ON CONFLICT DO NOTHING;

-- ============================================================================
-- PHASE 4: Eliminar id_campana de tablas territoriales
-- ============================================================================

ALTER TABLE comunas DROP CONSTRAINT IF EXISTS comunas_id_campana_fkey;
ALTER TABLE comunas DROP COLUMN IF EXISTS id_campana;

ALTER TABLE puestos_votacion DROP CONSTRAINT IF EXISTS puestos_votacion_id_campana_fkey;
ALTER TABLE puestos_votacion DROP COLUMN IF EXISTS id_campana;

-- ============================================================================
-- PHASE 5: Recrear RLS policies (entidades globales, write solo dueno_plataforma)
-- ============================================================================

CREATE POLICY comunas_select ON comunas FOR SELECT TO authenticated USING (true);
CREATE POLICY comunas_write ON comunas FOR ALL TO authenticated
  USING (es_dueno_plataforma()) WITH CHECK (es_dueno_plataforma());

CREATE POLICY barrios_select ON barrios FOR SELECT TO authenticated USING (true);
CREATE POLICY barrios_write ON barrios FOR ALL TO authenticated
  USING (es_dueno_plataforma()) WITH CHECK (es_dueno_plataforma());

CREATE POLICY puestos_select ON puestos_votacion FOR SELECT TO authenticated USING (true);
CREATE POLICY puestos_write ON puestos_votacion FOR ALL TO authenticated
  USING (es_dueno_plataforma()) WITH CHECK (es_dueno_plataforma());

COMMIT;
