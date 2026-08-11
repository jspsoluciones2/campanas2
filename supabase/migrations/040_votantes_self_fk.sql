-- 040_votantes_self_fk.sql
-- Restaura la FK self-reference de votantes.id_lider_directo → votantes.id.
-- La migración 029 la recreaba explícitamente, pero en la BD en vivo no existe
-- (el catálogo de PostgREST no expone ninguna relación de votantes consigo
-- misma), por lo que el embed `lider_directo:votantes(...)` de Reportes devuelve
-- vacío. Sin la FK: inserts de id_lider_directo funcionan (solo valida el
-- trigger validar_lider_misma_campana) pero el join no resuelve.

BEGIN;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint con
    JOIN pg_class cl ON con.conrelid = cl.oid
    WHERE cl.relname = 'votantes'
      AND con.contype = 'f'
      AND con.conname = 'votantes_id_lider_directo_fkey'
  ) THEN
    ALTER TABLE votantes
      ADD CONSTRAINT votantes_id_lider_directo_fkey
      FOREIGN KEY (id_lider_directo) REFERENCES votantes (id)
      ON DELETE SET NULL;
  END IF;
END $$;

-- Recarga inmediata del catálogo de PostgREST para que el embed funcione
-- sin reiniciar nada.
NOTIFY pgrst, 'reload schema';

COMMIT;