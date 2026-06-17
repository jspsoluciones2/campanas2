-- Resultados de verificación registraduría (miniapp worker externa).
-- Clave lógica: id_campana + documento + tipo_documento (join con votantes).

CREATE TYPE estado_verificacion_registraduria AS ENUM (
  'pendiente',
  'en_proceso',
  'exitoso',
  'error',
  'discrepancia_nombre'
);

CREATE TABLE verificaciones_registraduria (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_campana uuid NOT NULL REFERENCES campanas (id) ON DELETE CASCADE,
  documento text NOT NULL,
  tipo_documento tipo_documento NOT NULL DEFAULT 'CC',
  estado estado_verificacion_registraduria NOT NULL DEFAULT 'pendiente',
  nombres_oficial text,
  apellidos_oficial text,
  departamento text,
  municipio text,
  puesto_votacion text,
  mesa text,
  mensaje_error text,
  datos_crudos jsonb,
  id_corrida text,
  intentos smallint NOT NULL DEFAULT 0 CHECK (intentos >= 0),
  consultado_en timestamptz,
  creado_en timestamptz NOT NULL DEFAULT now(),
  actualizado_en timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT verificaciones_documento_normalizado CHECK (documento ~ '^[0-9]{5,}$')
);

CREATE UNIQUE INDEX verificaciones_registraduria_unico_idx
  ON verificaciones_registraduria (id_campana, documento, tipo_documento);

CREATE INDEX verificaciones_registraduria_campana_estado_idx
  ON verificaciones_registraduria (id_campana, estado);

CREATE INDEX verificaciones_registraduria_campana_corrida_idx
  ON verificaciones_registraduria (id_campana, id_corrida)
  WHERE id_corrida IS NOT NULL;

CREATE OR REPLACE FUNCTION actualizar_verificacion_registraduria_ts()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.actualizado_en = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER verificaciones_registraduria_actualizado
  BEFORE UPDATE ON verificaciones_registraduria
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_verificacion_registraduria_ts();

ALTER TABLE verificaciones_registraduria ENABLE ROW LEVEL SECURITY;

-- Lectura: mismos permisos que votantes de la campaña.
CREATE POLICY verificaciones_registraduria_select ON verificaciones_registraduria
  FOR SELECT TO authenticated
  USING (puede_leer_campana(id_campana));

-- La miniapp escribe con service_role (bypass RLS). La app web no inserta/actualiza directo.
CREATE POLICY verificaciones_registraduria_write ON verificaciones_registraduria
  FOR ALL TO authenticated
  USING (puede_administrar_campana(id_campana))
  WITH CHECK (puede_administrar_campana(id_campana));

COMMENT ON TABLE verificaciones_registraduria IS
  'Resultados de consulta registraduría por documento. La miniapp worker hace upsert; la UI hace JOIN con votantes.';

COMMENT ON COLUMN verificaciones_registraduria.documento IS
  'Documento normalizado (solo dígitos). Join: votantes.documento + votantes.tipo_documento.';

COMMENT ON COLUMN verificaciones_registraduria.id_corrida IS
  'Identificador de lote opcional (texto libre) generado por la miniapp para agrupar una corrida.';
