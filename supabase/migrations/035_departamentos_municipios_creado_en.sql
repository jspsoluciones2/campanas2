-- 035_departamentos_municipios_creado_en.sql
-- Agrega columna creado_en que faltaba en departamentos y municipios.

BEGIN;

ALTER TABLE departamentos ADD COLUMN creado_en timestamptz NOT NULL DEFAULT now();
ALTER TABLE municipios ADD COLUMN creado_en timestamptz NOT NULL DEFAULT now();

COMMENT ON COLUMN departamentos.creado_en IS 'Fecha de creacion del registro.';
COMMENT ON COLUMN municipios.creado_en IS 'Fecha de creacion del registro.';

COMMIT;
