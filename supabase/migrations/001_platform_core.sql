-- Phase 1: núcleo de plataforma — tenants, campañas, integraciones, auditoría

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tipos enumerados
CREATE TYPE estado_campana AS ENUM ('activa', 'pausada', 'finalizada', 'purgada');
CREATE TYPE rol_plataforma AS ENUM ('dueno_plataforma');
CREATE TYPE rol_miembro_campana AS ENUM (
  'lector',
  'editor',
  'administrador_campana'
);
CREATE TYPE proveedor_integracion AS ENUM (
  'twilio',
  'resolutor_captcha',
  'telegram',
  'ia_e14'
);

-- Procesos electorales (agrupa campañas para E14 compartido)
CREATE TABLE procesos_electorales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  fecha_eleccion date,
  creado_en timestamptz NOT NULL DEFAULT now()
);

-- Clientes recurrentes (políticos)
CREATE TABLE clientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  documento text,
  telefono text,
  correo_contacto text,
  notas text,
  creado_en timestamptz NOT NULL DEFAULT now(),
  actualizado_en timestamptz NOT NULL DEFAULT now()
);

-- Campañas (silo operativo por elección)
CREATE TABLE campanas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_cliente uuid NOT NULL REFERENCES clientes (id) ON DELETE RESTRICT,
  id_proceso_electoral uuid NOT NULL REFERENCES procesos_electorales (id) ON DELETE RESTRICT,
  nombre text NOT NULL,
  estado estado_campana NOT NULL DEFAULT 'activa',
  iniciado_en timestamptz,
  finalizado_en timestamptz,
  purgado_en timestamptz,
  creado_en timestamptz NOT NULL DEFAULT now(),
  actualizado_en timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX campanas_id_cliente_idx ON campanas (id_cliente);
CREATE INDEX campanas_estado_idx ON campanas (estado);

-- Dueños del SaaS
CREATE TABLE miembros_plataforma (
  id_usuario uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  rol rol_plataforma NOT NULL DEFAULT 'dueno_plataforma',
  creado_en timestamptz NOT NULL DEFAULT now()
);

-- Usuarios asignados a campaña (permisos en la app)
CREATE TABLE miembros_campana (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_campana uuid NOT NULL REFERENCES campanas (id) ON DELETE CASCADE,
  id_usuario uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  rol rol_miembro_campana NOT NULL DEFAULT 'lector',
  creado_en timestamptz NOT NULL DEFAULT now(),
  UNIQUE (id_campana, id_usuario)
);

CREATE INDEX miembros_campana_id_usuario_idx ON miembros_campana (id_usuario);

-- Vínculo opcional usuario ↔ cliente
CREATE TABLE miembros_cliente (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_cliente uuid NOT NULL REFERENCES clientes (id) ON DELETE CASCADE,
  id_usuario uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  creado_en timestamptz NOT NULL DEFAULT now(),
  UNIQUE (id_cliente, id_usuario)
);

-- Módulos contratados por campaña
CREATE TABLE caracteristicas_campana (
  id_campana uuid PRIMARY KEY REFERENCES campanas (id) ON DELETE CASCADE,
  resolutor_captcha boolean NOT NULL DEFAULT false,
  auditoria_e14 boolean NOT NULL DEFAULT false,
  whatsapp boolean NOT NULL DEFAULT false,
  telegram boolean NOT NULL DEFAULT false,
  captura_web boolean NOT NULL DEFAULT true,
  actualizado_en timestamptz NOT NULL DEFAULT now()
);

-- Credenciales por campaña
CREATE TABLE integraciones_campana (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_campana uuid NOT NULL REFERENCES campanas (id) ON DELETE CASCADE,
  proveedor proveedor_integracion NOT NULL,
  configuracion_cifrada text NOT NULL DEFAULT '{}',
  activa boolean NOT NULL DEFAULT true,
  creado_en timestamptz NOT NULL DEFAULT now(),
  actualizado_en timestamptz NOT NULL DEFAULT now(),
  UNIQUE (id_campana, proveedor)
);

-- Consumo interno — solo dueños de plataforma
CREATE TABLE uso_campana (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_campana uuid NOT NULL REFERENCES campanas (id) ON DELETE CASCADE,
  proveedor proveedor_integracion NOT NULL,
  metrica text NOT NULL,
  cantidad numeric NOT NULL DEFAULT 0,
  periodo_inicio timestamptz,
  periodo_fin timestamptz,
  registrado_en timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX uso_campana_id_campana_idx ON uso_campana (id_campana);

-- Exportaciones al cierre
CREATE TABLE exportaciones_campana (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_campana uuid NOT NULL REFERENCES campanas (id) ON DELETE CASCADE,
  exportado_por uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  ruta_almacenamiento text NOT NULL,
  tamano_archivo bigint,
  creado_en timestamptz NOT NULL DEFAULT now()
);

-- Branding global (singleton)
CREATE TABLE configuracion_marca_plataforma (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  url_logo text,
  color_primario text DEFAULT '#1e40af',
  color_secundario text DEFAULT '#64748b',
  familia_fuente text DEFAULT 'Inter',
  actualizado_en timestamptz NOT NULL DEFAULT now()
);

INSERT INTO configuracion_marca_plataforma (id) VALUES (1);

-- Auditoría global
CREATE TABLE registro_auditoria (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_actor uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  accion text NOT NULL,
  tipo_entidad text NOT NULL,
  id_entidad uuid,
  id_campana uuid REFERENCES campanas (id) ON DELETE SET NULL,
  metadatos jsonb NOT NULL DEFAULT '{}',
  creado_en timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX registro_auditoria_id_campana_idx ON registro_auditoria (id_campana);
CREATE INDEX registro_auditoria_creado_en_idx ON registro_auditoria (creado_en DESC);

-- Triggers actualizado_en
CREATE OR REPLACE FUNCTION establecer_actualizado_en()
RETURNS trigger AS $$
BEGIN
  NEW.actualizado_en = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER clientes_actualizado_en
  BEFORE UPDATE ON clientes
  FOR EACH ROW EXECUTE FUNCTION establecer_actualizado_en();

CREATE TRIGGER campanas_actualizado_en
  BEFORE UPDATE ON campanas
  FOR EACH ROW EXECUTE FUNCTION establecer_actualizado_en();

CREATE TRIGGER caracteristicas_campana_actualizado_en
  BEFORE UPDATE ON caracteristicas_campana
  FOR EACH ROW EXECUTE FUNCTION establecer_actualizado_en();

CREATE TRIGGER integraciones_campana_actualizado_en
  BEFORE UPDATE ON integraciones_campana
  FOR EACH ROW EXECUTE FUNCTION establecer_actualizado_en();

CREATE TRIGGER configuracion_marca_actualizado_en
  BEFORE UPDATE ON configuracion_marca_plataforma
  FOR EACH ROW EXECUTE FUNCTION establecer_actualizado_en();

CREATE OR REPLACE FUNCTION crear_caracteristicas_campana()
RETURNS trigger AS $$
BEGIN
  INSERT INTO caracteristicas_campana (id_campana) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER campanas_crear_caracteristicas
  AFTER INSERT ON campanas
  FOR EACH ROW EXECUTE FUNCTION crear_caracteristicas_campana();

-- Helpers RLS
CREATE OR REPLACE FUNCTION es_dueno_plataforma()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM miembros_plataforma
    WHERE id_usuario = auth.uid()
      AND rol = 'dueno_plataforma'
  );
$$;

CREATE OR REPLACE FUNCTION ids_campanas_usuario()
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id_campana
  FROM miembros_campana
  WHERE id_usuario = auth.uid();
$$;

-- Lectura: cualquier miembro de la campaña (lector, editor, administrador_campana)
CREATE OR REPLACE FUNCTION puede_leer_campana(p_id_campana uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT es_dueno_plataforma()
    OR p_id_campana IN (SELECT ids_campanas_usuario());
$$;

-- Escritura operativa: editor o administrador de campaña
CREATE OR REPLACE FUNCTION puede_editar_campana(p_id_campana uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT es_dueno_plataforma()
    OR EXISTS (
      SELECT 1
      FROM miembros_campana
      WHERE id_campana = p_id_campana
        AND id_usuario = auth.uid()
        AND rol IN ('editor', 'administrador_campana')
    );
$$;

-- Administración de campaña: catálogos, borrados, miembros (futuro)
CREATE OR REPLACE FUNCTION puede_administrar_campana(p_id_campana uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT es_dueno_plataforma()
    OR EXISTS (
      SELECT 1
      FROM miembros_campana
      WHERE id_campana = p_id_campana
        AND id_usuario = auth.uid()
        AND rol = 'administrador_campana'
    );
$$;

-- RLS
ALTER TABLE procesos_electorales ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE campanas ENABLE ROW LEVEL SECURITY;
ALTER TABLE miembros_plataforma ENABLE ROW LEVEL SECURITY;
ALTER TABLE miembros_campana ENABLE ROW LEVEL SECURITY;
ALTER TABLE miembros_cliente ENABLE ROW LEVEL SECURITY;
ALTER TABLE caracteristicas_campana ENABLE ROW LEVEL SECURITY;
ALTER TABLE integraciones_campana ENABLE ROW LEVEL SECURITY;
ALTER TABLE uso_campana ENABLE ROW LEVEL SECURITY;
ALTER TABLE exportaciones_campana ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion_marca_plataforma ENABLE ROW LEVEL SECURITY;
ALTER TABLE registro_auditoria ENABLE ROW LEVEL SECURITY;

CREATE POLICY procesos_electorales_select ON procesos_electorales
  FOR SELECT TO authenticated
  USING (
    es_dueno_plataforma()
    OR EXISTS (
      SELECT 1
      FROM campanas c
      JOIN miembros_campana mc ON mc.id_campana = c.id
      WHERE c.id_proceso_electoral = procesos_electorales.id
        AND mc.id_usuario = auth.uid()
    )
  );

CREATE POLICY procesos_electorales_write ON procesos_electorales
  FOR ALL TO authenticated
  USING (es_dueno_plataforma())
  WITH CHECK (es_dueno_plataforma());

CREATE POLICY clientes_plataforma ON clientes
  FOR ALL TO authenticated
  USING (es_dueno_plataforma())
  WITH CHECK (es_dueno_plataforma());

CREATE POLICY campanas_select ON campanas
  FOR SELECT TO authenticated
  USING (
    es_dueno_plataforma()
    OR id IN (SELECT ids_campanas_usuario())
  );

CREATE POLICY campanas_write ON campanas
  FOR ALL TO authenticated
  USING (es_dueno_plataforma())
  WITH CHECK (es_dueno_plataforma());

CREATE POLICY miembros_plataforma_select ON miembros_plataforma
  FOR SELECT TO authenticated
  USING (id_usuario = auth.uid() OR es_dueno_plataforma());

CREATE POLICY miembros_plataforma_write ON miembros_plataforma
  FOR ALL TO authenticated
  USING (es_dueno_plataforma())
  WITH CHECK (es_dueno_plataforma());

CREATE POLICY miembros_campana_select ON miembros_campana
  FOR SELECT TO authenticated
  USING (
    es_dueno_plataforma()
    OR id_campana IN (SELECT ids_campanas_usuario())
  );

CREATE POLICY miembros_campana_write ON miembros_campana
  FOR ALL TO authenticated
  USING (es_dueno_plataforma())
  WITH CHECK (es_dueno_plataforma());

CREATE POLICY miembros_cliente_plataforma ON miembros_cliente
  FOR ALL TO authenticated
  USING (es_dueno_plataforma())
  WITH CHECK (es_dueno_plataforma());

CREATE POLICY caracteristicas_campana_select ON caracteristicas_campana
  FOR SELECT TO authenticated
  USING (
    es_dueno_plataforma()
    OR id_campana IN (SELECT ids_campanas_usuario())
  );

CREATE POLICY caracteristicas_campana_write ON caracteristicas_campana
  FOR ALL TO authenticated
  USING (es_dueno_plataforma())
  WITH CHECK (es_dueno_plataforma());

CREATE POLICY integraciones_campana_plataforma ON integraciones_campana
  FOR ALL TO authenticated
  USING (es_dueno_plataforma())
  WITH CHECK (es_dueno_plataforma());

CREATE POLICY uso_campana_plataforma ON uso_campana
  FOR ALL TO authenticated
  USING (es_dueno_plataforma())
  WITH CHECK (es_dueno_plataforma());

CREATE POLICY exportaciones_campana_select ON exportaciones_campana
  FOR SELECT TO authenticated
  USING (
    es_dueno_plataforma()
    OR (
      id_campana IN (SELECT ids_campanas_usuario())
      AND EXISTS (
        SELECT 1 FROM campanas c
        WHERE c.id = exportaciones_campana.id_campana
          AND c.estado IN ('finalizada', 'purgada')
      )
    )
  );

CREATE POLICY exportaciones_campana_write ON exportaciones_campana
  FOR ALL TO authenticated
  USING (es_dueno_plataforma())
  WITH CHECK (es_dueno_plataforma());

CREATE POLICY marca_plataforma_select ON configuracion_marca_plataforma
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY marca_plataforma_write ON configuracion_marca_plataforma
  FOR ALL TO authenticated
  USING (es_dueno_plataforma())
  WITH CHECK (es_dueno_plataforma());

CREATE POLICY registro_auditoria_select ON registro_auditoria
  FOR SELECT TO authenticated
  USING (
    es_dueno_plataforma()
    OR (
      id_campana IS NOT NULL
      AND id_campana IN (SELECT ids_campanas_usuario())
    )
  );

CREATE POLICY registro_auditoria_insert ON registro_auditoria
  FOR INSERT TO authenticated
  WITH CHECK (
    es_dueno_plataforma()
    OR (
      id_campana IS NOT NULL
      AND puede_editar_campana(id_campana)
    )
  );
