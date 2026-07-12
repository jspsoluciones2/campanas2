-- 034_departamentos_municipios_id_text.sql
-- Cambia id de departamentos y municipios a text para usar codigos oficiales (ej. "05", "05001").
-- Elimina IDENTITY (ya no es autoincremental) y actualiza FKs en tablas relacionadas.

BEGIN;

-- ============================================================================
-- PHASE 1: Drop FK constraints que referencian departamentos/municipios
-- ============================================================================

ALTER TABLE comunas              DROP CONSTRAINT IF EXISTS comunas_id_municipio_fkey;
ALTER TABLE campana_territorio   DROP CONSTRAINT IF EXISTS campana_territorio_id_departamento_fkey;
ALTER TABLE campana_territorio   DROP CONSTRAINT IF EXISTS campana_territorio_id_municipio_fkey;
ALTER TABLE municipios           DROP CONSTRAINT IF EXISTS municipios_id_departamento_fkey;

-- ============================================================================
-- PHASE 2: Cambiar columnas FK a text (deben coincidir con el tipo de la PK)
-- ============================================================================

ALTER TABLE comunas              ALTER COLUMN id_municipio TYPE text;
ALTER TABLE campana_territorio   ALTER COLUMN id_departamento TYPE text;
ALTER TABLE campana_territorio   ALTER COLUMN id_municipio TYPE text;

-- ============================================================================
-- PHASE 3: Recrear departamentos con id text
-- ============================================================================

ALTER TABLE departamentos DROP CONSTRAINT departamentos_pkey;
ALTER TABLE departamentos ALTER COLUMN id DROP IDENTITY;
ALTER TABLE departamentos ALTER COLUMN id TYPE text;
ALTER TABLE departamentos ADD PRIMARY KEY (id);

-- ============================================================================
-- PHASE 4: Recrear municipios con id text
-- ============================================================================

ALTER TABLE municipios DROP CONSTRAINT municipios_pkey;
ALTER TABLE municipios DROP CONSTRAINT IF EXISTS municipios_id_departamento_nombre_key;
ALTER TABLE municipios ALTER COLUMN id DROP IDENTITY;
ALTER TABLE municipios ALTER COLUMN id TYPE text;
ALTER TABLE municipios ALTER COLUMN id_departamento TYPE text;
ALTER TABLE municipios ADD PRIMARY KEY (id);
ALTER TABLE municipios ADD UNIQUE (id_departamento, nombre);

-- ============================================================================
-- PHASE 5: Recrear FK constraints
-- ============================================================================

ALTER TABLE municipios ADD CONSTRAINT municipios_id_departamento_fkey
  FOREIGN KEY (id_departamento) REFERENCES departamentos(id);

ALTER TABLE comunas ADD CONSTRAINT comunas_id_municipio_fkey
  FOREIGN KEY (id_municipio) REFERENCES municipios(id);

ALTER TABLE campana_territorio ADD CONSTRAINT campana_territorio_id_departamento_fkey
  FOREIGN KEY (id_departamento) REFERENCES departamentos(id);

ALTER TABLE campana_territorio ADD CONSTRAINT campana_territorio_id_municipio_fkey
  FOREIGN KEY (id_municipio) REFERENCES municipios(id);

COMMIT;
