-- Elimina catálogo de zonas asignadas y referencias en votantes.
-- Idempotente: funciona aunque 022 nunca se haya aplicado.

DO $$
BEGIN
  IF to_regclass('public.zonas_puestos_asignados') IS NOT NULL THEN
    DROP TABLE zonas_puestos_asignados CASCADE;
  END IF;

  IF to_regclass('public.zonas') IS NOT NULL THEN
    DROP TRIGGER IF EXISTS zonas_lider_misma_campana ON zonas;
    DROP TRIGGER IF EXISTS zonas_asignar_codigo ON zonas;
    DROP TRIGGER IF EXISTS zonas_actualizado_en ON zonas;

    ALTER TABLE zonas DROP COLUMN IF EXISTS id_lider;

    DROP POLICY IF EXISTS zonas_select ON zonas;
    DROP POLICY IF EXISTS zonas_insert ON zonas;
    DROP POLICY IF EXISTS zonas_update ON zonas;
    DROP POLICY IF EXISTS zonas_delete ON zonas;

    DROP TABLE zonas CASCADE;
  END IF;
END $$;

DROP FUNCTION IF EXISTS validar_zona_lider_misma_campana();
DROP FUNCTION IF EXISTS validar_zona_puesto_misma_campana();
DROP INDEX IF EXISTS zonas_id_lider_idx;
DROP INDEX IF EXISTS votantes_id_zona_idx;

ALTER TABLE votantes DROP COLUMN IF EXISTS id_zona;
ALTER TABLE cuarentena_votantes DROP COLUMN IF EXISTS id_zona;
