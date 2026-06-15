-- Phase 2.3: cuarentena de votantes (duplicados por campaña)
-- Requiere 002_domain_schema.sql aplicada previamente.

CREATE TYPE tipo_coincidencia_cuarentena AS ENUM (
  'cedula_exacta',
  'telefono_similitud_nombre'
);

CREATE TYPE estado_cuarentena AS ENUM (
  'pendiente',
  'resuelto',
  'descartado',
  'escalado'
);

CREATE TABLE cuarentena_votantes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_campana uuid NOT NULL REFERENCES campanas (id) ON DELETE CASCADE,
  nombres text NOT NULL,
  apellidos text NOT NULL,
  documento text NOT NULL,
  tipo_documento tipo_documento NOT NULL DEFAULT 'CC',
  sexo tipo_sexo,
  telefono text,
  direccion text,
  id_puesto_votacion uuid REFERENCES puestos_votacion (id) ON DELETE SET NULL,
  mesa text,
  id_rol uuid REFERENCES roles (id) ON DELETE SET NULL,
  id_lider_directo uuid REFERENCES votantes (id) ON DELETE SET NULL,
  id_votante_conflicto uuid REFERENCES votantes (id) ON DELETE SET NULL,
  id_cuarentena_conflicto uuid REFERENCES cuarentena_votantes (id) ON DELETE SET NULL,
  tipo_coincidencia tipo_coincidencia_cuarentena NOT NULL,
  similitud_nombre numeric(5, 4) CHECK (
    similitud_nombre IS NULL
    OR (similitud_nombre >= 0 AND similitud_nombre <= 1)
  ),
  estado estado_cuarentena NOT NULL DEFAULT 'pendiente',
  canal_origen canal_captura NOT NULL DEFAULT 'manual',
  creado_por uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  resuelto_por uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  resuelto_en timestamptz,
  notas_resolucion text,
  creado_en timestamptz NOT NULL DEFAULT now(),
  actualizado_en timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT cuarentena_sin_auto_conflicto CHECK (
    id_cuarentena_conflicto IS NULL OR id_cuarentena_conflicto <> id
  ),
  CONSTRAINT cuarentena_tiene_conflicto CHECK (
    id_votante_conflicto IS NOT NULL OR id_cuarentena_conflicto IS NOT NULL
  )
);

CREATE INDEX cuarentena_votantes_id_campana_idx ON cuarentena_votantes (id_campana);
CREATE INDEX cuarentena_votantes_estado_idx ON cuarentena_votantes (id_campana, estado);
CREATE INDEX cuarentena_votantes_documento_idx ON cuarentena_votantes (id_campana, documento);

CREATE TRIGGER cuarentena_votantes_actualizado_en
  BEFORE UPDATE ON cuarentena_votantes
  FOR EACH ROW EXECUTE FUNCTION establecer_actualizado_en();

ALTER TABLE cuarentena_votantes ENABLE ROW LEVEL SECURITY;

CREATE POLICY cuarentena_select ON cuarentena_votantes
  FOR SELECT TO authenticated
  USING (puede_leer_campana(id_campana));

CREATE POLICY cuarentena_insert ON cuarentena_votantes
  FOR INSERT TO authenticated
  WITH CHECK (puede_editar_campana(id_campana));

CREATE POLICY cuarentena_update ON cuarentena_votantes
  FOR UPDATE TO authenticated
  USING (puede_editar_campana(id_campana))
  WITH CHECK (puede_editar_campana(id_campana));

CREATE POLICY cuarentena_delete ON cuarentena_votantes
  FOR DELETE TO authenticated
  USING (puede_administrar_campana(id_campana));
