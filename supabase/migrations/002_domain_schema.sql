-- Phase 2: dominio electoral — campos definidos por PO (español)
-- Requiere 001_platform_core.sql aplicada previamente.

-- Tipos
CREATE TYPE tipo_documento AS ENUM (
  'CC',
  'TI',
  'CE',
  'PA',
  'PEP',
  'PPT'
);

CREATE TYPE tipo_sexo AS ENUM ('Masculino', 'Femenino');

CREATE TYPE estado_votante AS ENUM (
  'activo',
  'en_cuarentena',
  'pendiente_verificacion',
  'rechazado'
);

CREATE TYPE canal_captura AS ENUM (
  'whatsapp',
  'telegram',
  'web',
  'web_publico',
  'manual'
);

-- ROLES organizacionales del votante (jerarquía 1/2/3)
CREATE TABLE roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_campana uuid NOT NULL REFERENCES campanas (id) ON DELETE CASCADE,
  nombre text NOT NULL,
  nivel_jerarquia smallint NOT NULL CHECK (nivel_jerarquia BETWEEN 1 AND 3),
  creado_en timestamptz NOT NULL DEFAULT now(),
  UNIQUE (id_campana, nombre)
);

CREATE INDEX roles_campana_jerarquia_idx ON roles (id_campana, nivel_jerarquia);

-- COMUNAS
CREATE TABLE comunas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_campana uuid NOT NULL REFERENCES campanas (id) ON DELETE CASCADE,
  nombre text NOT NULL,
  numero text,
  creado_en timestamptz NOT NULL DEFAULT now(),
  UNIQUE (id_campana, nombre)
);

-- BARRIOS
CREATE TABLE barrios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_comuna uuid NOT NULL REFERENCES comunas (id) ON DELETE CASCADE,
  nombre text NOT NULL,
  creado_en timestamptz NOT NULL DEFAULT now(),
  UNIQUE (id_comuna, nombre)
);

CREATE INDEX barrios_id_comuna_idx ON barrios (id_comuna);

-- PUESTOS DE VOTACIÓN (registraduría por campaña/año)
CREATE TABLE puestos_votacion (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_campana uuid NOT NULL REFERENCES campanas (id) ON DELETE CASCADE,
  id_comuna uuid REFERENCES comunas (id) ON DELETE SET NULL,
  id_barrio uuid REFERENCES barrios (id) ON DELETE SET NULL,
  codigo_registraduria text,
  nombre text NOT NULL,
  municipio text,
  direccion text,
  votantes_hombres_admite integer NOT NULL DEFAULT 0 CHECK (votantes_hombres_admite >= 0),
  votantes_mujeres_admite integer NOT NULL DEFAULT 0 CHECK (votantes_mujeres_admite >= 0),
  cantidad_mesas integer NOT NULL DEFAULT 0 CHECK (cantidad_mesas >= 0),
  fuente text NOT NULL DEFAULT 'registraduria',
  actualizado_registraduria_en timestamptz NOT NULL DEFAULT now(),
  creado_en timestamptz NOT NULL DEFAULT now(),
  actualizado_en timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX puestos_votacion_id_campana_idx ON puestos_votacion (id_campana);

-- TIPOS DE NOVEDAD
CREATE TABLE tipos_novedad (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_campana uuid NOT NULL REFERENCES campanas (id) ON DELETE CASCADE,
  novedad text NOT NULL,
  creado_en timestamptz NOT NULL DEFAULT now(),
  UNIQUE (id_campana, novedad)
);

-- VOTANTES (árbol vía id_lider_directo)
CREATE TABLE votantes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_campana uuid NOT NULL REFERENCES campanas (id) ON DELETE CASCADE,
  nombres text NOT NULL,
  apellidos text NOT NULL,
  documento text NOT NULL,
  tipo_documento tipo_documento NOT NULL DEFAULT 'CC',
  sexo tipo_sexo,
  fecha_nacimiento date,
  telefono text,
  direccion text,
  id_puesto_votacion uuid REFERENCES puestos_votacion (id) ON DELETE SET NULL,
  mesa text,
  id_rol uuid REFERENCES roles (id) ON DELETE SET NULL,
  id_lider_directo uuid REFERENCES votantes (id) ON DELETE SET NULL,
  estado estado_votante NOT NULL DEFAULT 'pendiente_verificacion',
  canal_origen canal_captura NOT NULL DEFAULT 'manual',
  creado_por uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  creado_en timestamptz NOT NULL DEFAULT now(),
  actualizado_en timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT votantes_sin_auto_lider CHECK (
    id_lider_directo IS NULL OR id_lider_directo <> id
  )
);

CREATE INDEX votantes_id_campana_idx ON votantes (id_campana);
CREATE INDEX votantes_documento_idx ON votantes (id_campana, documento);
CREATE INDEX votantes_id_lider_idx ON votantes (id_lider_directo);
CREATE INDEX votantes_id_puesto_idx ON votantes (id_puesto_votacion);

CREATE UNIQUE INDEX votantes_documento_activo_unico
  ON votantes (id_campana, documento, tipo_documento)
  WHERE estado IN ('activo', 'pendiente_verificacion');

CREATE OR REPLACE FUNCTION validar_lider_misma_campana()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.id_lider_directo IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1
      FROM votantes lider
      WHERE lider.id = NEW.id_lider_directo
        AND lider.id_campana = NEW.id_campana
    ) THEN
      RAISE EXCEPTION 'id_lider_directo debe pertenecer a la misma campaña';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER votantes_lider_misma_campana
  BEFORE INSERT OR UPDATE OF id_lider_directo, id_campana ON votantes
  FOR EACH ROW EXECUTE FUNCTION validar_lider_misma_campana();

CREATE OR REPLACE FUNCTION subarbol_votantes(id_votante_raiz uuid)
RETURNS TABLE (id_votante uuid, profundidad integer)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH RECURSIVE arbol AS (
    SELECT v.id, 0 AS profundidad
    FROM votantes v
    WHERE v.id = id_votante_raiz
    UNION ALL
    SELECT hijo.id, arbol.profundidad + 1
    FROM votantes hijo
    INNER JOIN arbol ON hijo.id_lider_directo = arbol.id
    WHERE hijo.id_campana = (SELECT id_campana FROM votantes WHERE id = id_votante_raiz)
  )
  SELECT arbol.id, arbol.profundidad
  FROM arbol
  WHERE arbol.profundidad > 0;
$$;

-- DATOS TRABAJADOR (extensión del votante)
CREATE TABLE datos_trabajador_votante (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_votante uuid NOT NULL REFERENCES votantes (id) ON DELETE CASCADE,
  lugar_trabajo text,
  direccion_trabajo text,
  id_comuna uuid REFERENCES comunas (id) ON DELETE SET NULL,
  id_barrio uuid REFERENCES barrios (id) ON DELETE SET NULL,
  creado_en timestamptz NOT NULL DEFAULT now(),
  actualizado_en timestamptz NOT NULL DEFAULT now(),
  UNIQUE (id_votante)
);

-- NOVEDADES
CREATE TABLE novedades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_votante uuid NOT NULL REFERENCES votantes (id) ON DELETE CASCADE,
  id_tipo_novedad uuid NOT NULL REFERENCES tipos_novedad (id) ON DELETE RESTRICT,
  detalle text,
  creado_por uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  creado_en timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX novedades_id_votante_idx ON novedades (id_votante);

CREATE TRIGGER puestos_votacion_actualizado_en
  BEFORE UPDATE ON puestos_votacion
  FOR EACH ROW EXECUTE FUNCTION establecer_actualizado_en();

CREATE TRIGGER votantes_actualizado_en
  BEFORE UPDATE ON votantes
  FOR EACH ROW EXECUTE FUNCTION establecer_actualizado_en();

CREATE TRIGGER datos_trabajador_actualizado_en
  BEFORE UPDATE ON datos_trabajador_votante
  FOR EACH ROW EXECUTE FUNCTION establecer_actualizado_en();

-- RLS
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE comunas ENABLE ROW LEVEL SECURITY;
ALTER TABLE barrios ENABLE ROW LEVEL SECURITY;
ALTER TABLE puestos_votacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE tipos_novedad ENABLE ROW LEVEL SECURITY;
ALTER TABLE votantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE datos_trabajador_votante ENABLE ROW LEVEL SECURITY;
ALTER TABLE novedades ENABLE ROW LEVEL SECURITY;

-- roles
CREATE POLICY roles_select ON roles
  FOR SELECT TO authenticated
  USING (puede_leer_campana(id_campana));

CREATE POLICY roles_insert ON roles
  FOR INSERT TO authenticated
  WITH CHECK (puede_editar_campana(id_campana));

CREATE POLICY roles_update ON roles
  FOR UPDATE TO authenticated
  USING (puede_editar_campana(id_campana))
  WITH CHECK (puede_editar_campana(id_campana));

CREATE POLICY roles_delete ON roles
  FOR DELETE TO authenticated
  USING (puede_administrar_campana(id_campana));

-- comunas
CREATE POLICY comunas_select ON comunas
  FOR SELECT TO authenticated
  USING (puede_leer_campana(id_campana));

CREATE POLICY comunas_insert ON comunas
  FOR INSERT TO authenticated
  WITH CHECK (puede_editar_campana(id_campana));

CREATE POLICY comunas_update ON comunas
  FOR UPDATE TO authenticated
  USING (puede_editar_campana(id_campana))
  WITH CHECK (puede_editar_campana(id_campana));

CREATE POLICY comunas_delete ON comunas
  FOR DELETE TO authenticated
  USING (puede_administrar_campana(id_campana));

-- barrios (hereda campaña vía comuna)
CREATE POLICY barrios_select ON barrios
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM comunas c
      WHERE c.id = barrios.id_comuna
        AND puede_leer_campana(c.id_campana)
    )
  );

CREATE POLICY barrios_insert ON barrios
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM comunas c
      WHERE c.id = barrios.id_comuna
        AND puede_editar_campana(c.id_campana)
    )
  );

CREATE POLICY barrios_update ON barrios
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM comunas c
      WHERE c.id = barrios.id_comuna
        AND puede_editar_campana(c.id_campana)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM comunas c
      WHERE c.id = barrios.id_comuna
        AND puede_editar_campana(c.id_campana)
    )
  );

CREATE POLICY barrios_delete ON barrios
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM comunas c
      WHERE c.id = barrios.id_comuna
        AND puede_administrar_campana(c.id_campana)
    )
  );

-- puestos de votación
CREATE POLICY puestos_select ON puestos_votacion
  FOR SELECT TO authenticated
  USING (puede_leer_campana(id_campana));

CREATE POLICY puestos_insert ON puestos_votacion
  FOR INSERT TO authenticated
  WITH CHECK (puede_editar_campana(id_campana));

CREATE POLICY puestos_update ON puestos_votacion
  FOR UPDATE TO authenticated
  USING (puede_editar_campana(id_campana))
  WITH CHECK (puede_editar_campana(id_campana));

CREATE POLICY puestos_delete ON puestos_votacion
  FOR DELETE TO authenticated
  USING (puede_administrar_campana(id_campana));

-- tipos de novedad
CREATE POLICY tipos_novedad_select ON tipos_novedad
  FOR SELECT TO authenticated
  USING (puede_leer_campana(id_campana));

CREATE POLICY tipos_novedad_insert ON tipos_novedad
  FOR INSERT TO authenticated
  WITH CHECK (puede_editar_campana(id_campana));

CREATE POLICY tipos_novedad_update ON tipos_novedad
  FOR UPDATE TO authenticated
  USING (puede_editar_campana(id_campana))
  WITH CHECK (puede_editar_campana(id_campana));

CREATE POLICY tipos_novedad_delete ON tipos_novedad
  FOR DELETE TO authenticated
  USING (puede_administrar_campana(id_campana));

-- votantes
CREATE POLICY votantes_select ON votantes
  FOR SELECT TO authenticated
  USING (puede_leer_campana(id_campana));

CREATE POLICY votantes_insert ON votantes
  FOR INSERT TO authenticated
  WITH CHECK (puede_editar_campana(id_campana));

CREATE POLICY votantes_update ON votantes
  FOR UPDATE TO authenticated
  USING (puede_editar_campana(id_campana))
  WITH CHECK (puede_editar_campana(id_campana));

CREATE POLICY votantes_delete ON votantes
  FOR DELETE TO authenticated
  USING (puede_administrar_campana(id_campana));

-- datos trabajador (1:1 con votante)
CREATE POLICY datos_trabajador_select ON datos_trabajador_votante
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM votantes v
      WHERE v.id = datos_trabajador_votante.id_votante
        AND puede_leer_campana(v.id_campana)
    )
  );

CREATE POLICY datos_trabajador_insert ON datos_trabajador_votante
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM votantes v
      WHERE v.id = datos_trabajador_votante.id_votante
        AND puede_editar_campana(v.id_campana)
    )
  );

CREATE POLICY datos_trabajador_update ON datos_trabajador_votante
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM votantes v
      WHERE v.id = datos_trabajador_votante.id_votante
        AND puede_editar_campana(v.id_campana)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM votantes v
      WHERE v.id = datos_trabajador_votante.id_votante
        AND puede_editar_campana(v.id_campana)
    )
  );

CREATE POLICY datos_trabajador_delete ON datos_trabajador_votante
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM votantes v
      WHERE v.id = datos_trabajador_votante.id_votante
        AND puede_administrar_campana(v.id_campana)
    )
  );

-- novedades
CREATE POLICY novedades_select ON novedades
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM votantes v
      WHERE v.id = novedades.id_votante
        AND puede_leer_campana(v.id_campana)
    )
  );

CREATE POLICY novedades_insert ON novedades
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM votantes v
      WHERE v.id = novedades.id_votante
        AND puede_editar_campana(v.id_campana)
    )
  );

CREATE POLICY novedades_update ON novedades
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM votantes v
      WHERE v.id = novedades.id_votante
        AND puede_editar_campana(v.id_campana)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM votantes v
      WHERE v.id = novedades.id_votante
        AND puede_editar_campana(v.id_campana)
    )
  );

CREATE POLICY novedades_delete ON novedades
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM votantes v
      WHERE v.id = novedades.id_votante
        AND puede_administrar_campana(v.id_campana)
    )
  );
