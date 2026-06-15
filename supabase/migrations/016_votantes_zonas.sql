-- Zonas asignadas (catálogo operativo por campaña) y campos de votante.
-- Requiere 011_lugares_trabajo.sql y 015_codigo_autoincremental.sql aplicadas.

CREATE TABLE zonas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_campana uuid NOT NULL REFERENCES campanas (id) ON DELETE CASCADE,
  nombre text NOT NULL,
  codigo integer NOT NULL,
  descripcion text,
  creado_en timestamptz NOT NULL DEFAULT now(),
  actualizado_en timestamptz NOT NULL DEFAULT now(),
  UNIQUE (id_campana, nombre),
  UNIQUE (id_campana, codigo)
);

CREATE INDEX zonas_id_campana_idx ON zonas (id_campana);

CREATE TRIGGER zonas_actualizado_en
  BEFORE UPDATE ON zonas
  FOR EACH ROW EXECUTE FUNCTION establecer_actualizado_en();

DROP TRIGGER IF EXISTS zonas_asignar_codigo ON zonas;
CREATE TRIGGER zonas_asignar_codigo
  BEFORE INSERT ON zonas
  FOR EACH ROW EXECUTE FUNCTION asignar_codigo_serial('id_campana');

ALTER TABLE zonas ENABLE ROW LEVEL SECURITY;

CREATE POLICY zonas_select ON zonas
  FOR SELECT TO authenticated
  USING (puede_leer_campana(id_campana));

CREATE POLICY zonas_insert ON zonas
  FOR INSERT TO authenticated
  WITH CHECK (puede_editar_campana(id_campana));

CREATE POLICY zonas_update ON zonas
  FOR UPDATE TO authenticated
  USING (puede_editar_campana(id_campana))
  WITH CHECK (puede_editar_campana(id_campana));

CREATE POLICY zonas_delete ON zonas
  FOR DELETE TO authenticated
  USING (puede_administrar_campana(id_campana));

ALTER TABLE votantes
  ADD COLUMN IF NOT EXISTS id_lugar_trabajo uuid
    REFERENCES lugares_trabajo (id) ON DELETE SET NULL;

ALTER TABLE votantes
  ADD COLUMN IF NOT EXISTS id_zona uuid
    REFERENCES zonas (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS votantes_id_lugar_trabajo_idx ON votantes (id_lugar_trabajo);
CREATE INDEX IF NOT EXISTS votantes_id_zona_idx ON votantes (id_zona);

ALTER TABLE cuarentena_votantes
  ADD COLUMN IF NOT EXISTS fecha_nacimiento date;

ALTER TABLE cuarentena_votantes
  ADD COLUMN IF NOT EXISTS id_lugar_trabajo uuid
    REFERENCES lugares_trabajo (id) ON DELETE SET NULL;

ALTER TABLE cuarentena_votantes
  ADD COLUMN IF NOT EXISTS id_zona uuid
    REFERENCES zonas (id) ON DELETE SET NULL;

COMMENT ON TABLE zonas IS 'Zonas operativas asignadas a votantes (territorio de trabajo de la campaña).';
COMMENT ON COLUMN votantes.fecha_nacimiento IS 'Fecha de nacimiento del votante.';
COMMENT ON COLUMN votantes.direccion IS 'Dirección de residencia del votante.';
COMMENT ON COLUMN votantes.id_lugar_trabajo IS 'Lugar de trabajo (catálogo lugares_trabajo).';
COMMENT ON COLUMN votantes.id_zona IS 'Zona asignada (catálogo zonas).';
