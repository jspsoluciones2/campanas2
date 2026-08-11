-- 039_campanas_multiples_proceso.sql
-- Un proceso electoral puede tener varias campañas (incluso para el mismo cliente).
-- Se elimina la restricción creada en 005_campana_unica_cliente_proceso.sql.

BEGIN;

DROP INDEX IF EXISTS campanas_cliente_proceso_unique;

COMMIT;
