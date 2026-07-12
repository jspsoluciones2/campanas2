-- 032_comuna_municipio.sql
-- Relaciona comunas con municipios del catálogo global.

BEGIN;

ALTER TABLE comunas ADD COLUMN id_municipio bigint REFERENCES municipios(id);

COMMENT ON COLUMN comunas.id_municipio IS
  'Municipio al que pertenece la subdivisión territorial. Catálogo global.';

COMMIT;
