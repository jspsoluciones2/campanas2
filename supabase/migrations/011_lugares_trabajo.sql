-- Catálogo de lugares de trabajo por campaña
-- Requiere 002_domain_schema.sql aplicada previamente.

CREATE TABLE lugares_trabajo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_campana uuid NOT NULL REFERENCES campanas (id) ON DELETE CASCADE,
  nombre text NOT NULL,
  direccion text,
  id_comuna uuid REFERENCES comunas (id) ON DELETE SET NULL,
  id_barrio uuid REFERENCES barrios (id) ON DELETE SET NULL,
  creado_en timestamptz NOT NULL DEFAULT now(),
  actualizado_en timestamptz NOT NULL DEFAULT now(),
  UNIQUE (id_campana, nombre)
);

CREATE INDEX lugares_trabajo_id_campana_idx ON lugares_trabajo (id_campana);

CREATE TRIGGER lugares_trabajo_actualizado_en
  BEFORE UPDATE ON lugares_trabajo
  FOR EACH ROW EXECUTE FUNCTION establecer_actualizado_en();

ALTER TABLE lugares_trabajo ENABLE ROW LEVEL SECURITY;

CREATE POLICY lugares_trabajo_select ON lugares_trabajo
  FOR SELECT TO authenticated
  USING (puede_leer_campana(id_campana));

CREATE POLICY lugares_trabajo_insert ON lugares_trabajo
  FOR INSERT TO authenticated
  WITH CHECK (puede_editar_campana(id_campana));

CREATE POLICY lugares_trabajo_update ON lugares_trabajo
  FOR UPDATE TO authenticated
  USING (puede_editar_campana(id_campana))
  WITH CHECK (puede_editar_campana(id_campana));

CREATE POLICY lugares_trabajo_delete ON lugares_trabajo
  FOR DELETE TO authenticated
  USING (puede_administrar_campana(id_campana));
