-- 029_uuid_to_int8.sql
-- Cambia todas las PKs de uuid a bigint con GENERATED ALWAYS AS IDENTITY.
-- Actualiza FKs, funciones y triggers para usar bigint.

BEGIN;

-- ============================================================================
-- PHASE 0: Drop ALL FK constraints (both changing and staying uuid)
-- ============================================================================

-- campanas
ALTER TABLE campanas DROP CONSTRAINT IF EXISTS campanas_id_cliente_fkey;
ALTER TABLE campanas DROP CONSTRAINT IF EXISTS campanas_id_proceso_electoral_fkey;

-- miembros_campana
ALTER TABLE miembros_campana DROP CONSTRAINT IF EXISTS miembros_campana_id_campana_fkey;
ALTER TABLE miembros_campana DROP CONSTRAINT IF EXISTS miembros_campana_id_usuario_fkey;

-- miembros_cliente
ALTER TABLE miembros_cliente DROP CONSTRAINT IF EXISTS miembros_cliente_id_cliente_fkey;
ALTER TABLE miembros_cliente DROP CONSTRAINT IF EXISTS miembros_cliente_id_usuario_fkey;
ALTER TABLE miembros_cliente DROP CONSTRAINT IF EXISTS miembros_cliente_pkey;
ALTER TABLE miembros_cliente DROP CONSTRAINT IF EXISTS miembros_cliente_id_cliente_id_usuario_key;

-- miembros_plataforma
ALTER TABLE miembros_plataforma DROP CONSTRAINT IF EXISTS miembros_plataforma_id_usuario_fkey;

-- caracteristicas_campana
ALTER TABLE caracteristicas_campana DROP CONSTRAINT IF EXISTS caracteristicas_campana_id_campana_fkey;
ALTER TABLE caracteristicas_campana DROP CONSTRAINT IF EXISTS caracteristicas_campana_pkey;

-- integraciones_campana
ALTER TABLE integraciones_campana DROP CONSTRAINT IF EXISTS integraciones_campana_id_campana_fkey;

-- uso_campana
ALTER TABLE uso_campana DROP CONSTRAINT IF EXISTS uso_campana_id_campana_fkey;

-- exportaciones_campana
ALTER TABLE exportaciones_campana DROP CONSTRAINT IF EXISTS exportaciones_campana_id_campana_fkey;
ALTER TABLE exportaciones_campana DROP CONSTRAINT IF EXISTS exportaciones_campana_exportado_por_fkey;

-- registro_auditoria
ALTER TABLE registro_auditoria DROP CONSTRAINT IF EXISTS registro_auditoria_id_campana_fkey;
ALTER TABLE registro_auditoria DROP CONSTRAINT IF EXISTS registro_auditoria_id_actor_fkey;

-- roles
ALTER TABLE roles DROP CONSTRAINT IF EXISTS roles_id_campana_fkey;

-- comunas
ALTER TABLE comunas DROP CONSTRAINT IF EXISTS comunas_id_campana_fkey;

-- barrios
ALTER TABLE barrios DROP CONSTRAINT IF EXISTS barrios_id_comuna_fkey;

-- puestos_votacion
ALTER TABLE puestos_votacion DROP CONSTRAINT IF EXISTS puestos_votacion_id_campana_fkey;
ALTER TABLE puestos_votacion DROP CONSTRAINT IF EXISTS puestos_votacion_id_comuna_fkey;
ALTER TABLE puestos_votacion DROP CONSTRAINT IF EXISTS puestos_votacion_id_barrio_fkey;

-- tipos_novedad
ALTER TABLE tipos_novedad DROP CONSTRAINT IF EXISTS tipos_novedad_id_campana_fkey;

-- votantes
ALTER TABLE votantes DROP CONSTRAINT IF EXISTS votantes_id_campana_fkey;
ALTER TABLE votantes DROP CONSTRAINT IF EXISTS votantes_id_puesto_votacion_fkey;
ALTER TABLE votantes DROP CONSTRAINT IF EXISTS votantes_id_rol_fkey;
ALTER TABLE votantes DROP CONSTRAINT IF EXISTS votantes_id_lider_directo_fkey;
ALTER TABLE votantes DROP CONSTRAINT IF EXISTS votantes_id_lugar_trabajo_fkey;
ALTER TABLE votantes DROP CONSTRAINT IF EXISTS votantes_id_tipo_novedad_fkey;
ALTER TABLE votantes DROP CONSTRAINT IF EXISTS votantes_creado_por_fkey;

-- datos_trabajador_votante
ALTER TABLE datos_trabajador_votante DROP CONSTRAINT IF EXISTS datos_trabajador_votante_id_votante_fkey;
ALTER TABLE datos_trabajador_votante DROP CONSTRAINT IF EXISTS datos_trabajador_votante_id_comuna_fkey;
ALTER TABLE datos_trabajador_votante DROP CONSTRAINT IF EXISTS datos_trabajador_votante_id_barrio_fkey;

-- novedades
ALTER TABLE novedades DROP CONSTRAINT IF EXISTS novedades_id_votante_fkey;
ALTER TABLE novedades DROP CONSTRAINT IF EXISTS novedades_id_tipo_novedad_fkey;
ALTER TABLE novedades DROP CONSTRAINT IF EXISTS novedades_creado_por_fkey;

-- cuarentena_votantes
ALTER TABLE cuarentena_votantes DROP CONSTRAINT IF EXISTS cuarentena_votantes_id_campana_fkey;
ALTER TABLE cuarentena_votantes DROP CONSTRAINT IF EXISTS cuarentena_votantes_id_puesto_votacion_fkey;
ALTER TABLE cuarentena_votantes DROP CONSTRAINT IF EXISTS cuarentena_votantes_id_rol_fkey;
ALTER TABLE cuarentena_votantes DROP CONSTRAINT IF EXISTS cuarentena_votantes_id_lider_directo_fkey;
ALTER TABLE cuarentena_votantes DROP CONSTRAINT IF EXISTS cuarentena_votantes_id_votante_conflicto_fkey;
ALTER TABLE cuarentena_votantes DROP CONSTRAINT IF EXISTS cuarentena_votantes_id_cuarentena_conflicto_fkey;
ALTER TABLE cuarentena_votantes DROP CONSTRAINT IF EXISTS cuarentena_votantes_id_lugar_trabajo_fkey;
ALTER TABLE cuarentena_votantes DROP CONSTRAINT IF EXISTS cuarentena_votantes_creado_por_fkey;
ALTER TABLE cuarentena_votantes DROP CONSTRAINT IF EXISTS cuarentena_votantes_resuelto_por_fkey;

-- lugares_trabajo
ALTER TABLE lugares_trabajo DROP CONSTRAINT IF EXISTS lugares_trabajo_id_campana_fkey;
ALTER TABLE lugares_trabajo DROP CONSTRAINT IF EXISTS lugares_trabajo_id_comuna_fkey;
ALTER TABLE lugares_trabajo DROP CONSTRAINT IF EXISTS lugares_trabajo_id_barrio_fkey;

-- recolectores_telegram
ALTER TABLE recolectores_telegram DROP CONSTRAINT IF EXISTS recolectores_telegram_id_campana_fkey;
ALTER TABLE recolectores_telegram DROP CONSTRAINT IF EXISTS recolectores_telegram_id_rol_fkey;
ALTER TABLE recolectores_telegram DROP CONSTRAINT IF EXISTS recolectores_telegram_id_usuario_fkey;

-- sesiones_captura_telegram
ALTER TABLE sesiones_captura_telegram DROP CONSTRAINT IF EXISTS sesiones_captura_telegram_id_campana_fkey;
ALTER TABLE sesiones_captura_telegram DROP CONSTRAINT IF EXISTS sesiones_captura_telegram_id_usuario_fkey;

-- verificaciones_registraduria
ALTER TABLE verificaciones_registraduria DROP CONSTRAINT IF EXISTS verificaciones_registraduria_id_campana_fkey;

-- sesiones_captura_whatsapp
ALTER TABLE sesiones_captura_whatsapp DROP CONSTRAINT IF EXISTS sesiones_captura_whatsapp_id_campana_fkey;
ALTER TABLE sesiones_captura_whatsapp DROP CONSTRAINT IF EXISTS sesiones_captura_whatsapp_id_usuario_fkey;

-- clientes (FK to auth.users — stays uuid, just recreated later)
ALTER TABLE clientes DROP CONSTRAINT IF EXISTS clientes_id_usuario_fkey;

-- ============================================================================
-- PHASE 1: Drop ALL RLS policies in public schema (depend on functions we'll recreate)
-- ============================================================================

DO $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN (
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', rec.policyname, rec.schemaname, rec.tablename);
  END LOOP;
END $$;

-- ============================================================================
-- PHASE 2: Drop triggers and functions that depend on uuid types
-- ============================================================================

DROP TRIGGER IF EXISTS votantes_lider_misma_campana ON votantes;
DROP TRIGGER IF EXISTS comunas_asignar_codigo ON comunas;
DROP TRIGGER IF EXISTS barrios_asignar_codigo ON barrios;
DROP TRIGGER IF EXISTS puestos_asignar_codigo ON puestos_votacion;
DROP TRIGGER IF EXISTS roles_asignar_codigo ON roles;
DROP TRIGGER IF EXISTS tipos_novedad_asignar_codigo ON tipos_novedad;
DROP TRIGGER IF EXISTS lugares_trabajo_asignar_codigo ON lugares_trabajo;
-- zonas table was dropped in migration 023; skip trigger drop
-- DROP TRIGGER IF EXISTS zonas_asignar_codigo ON zonas;
DROP TRIGGER IF EXISTS clientes_asignar_codigo ON clientes;
DROP TRIGGER IF EXISTS procesos_electorales_asignar_codigo ON procesos_electorales;
DROP TRIGGER IF EXISTS campanas_asignar_codigo ON campanas;

DROP FUNCTION IF EXISTS ids_campanas_usuario();
DROP FUNCTION IF EXISTS puede_leer_campana(uuid);
DROP FUNCTION IF EXISTS puede_editar_campana(uuid);
DROP FUNCTION IF EXISTS puede_administrar_campana(uuid);
DROP FUNCTION IF EXISTS subarbol_votantes(uuid);
DROP FUNCTION IF EXISTS asignar_codigo_serial();
DROP FUNCTION IF EXISTS validar_lider_misma_campana();
DROP FUNCTION IF EXISTS match_puestos_votacion(vector, integer, jsonb);
DROP FUNCTION IF EXISTS match_votantes(vector, integer, jsonb);

-- ============================================================================
-- PHASE 2: Migrate PKs — tables WITH data (procesos_electorales, clientes)
-- Campaigns tablas vacías: drop + recreate column con IDENTITY
-- ============================================================================

--- 2.1 procesos_electorales (2 rows con data) ---
DO $$
DECLARE
  seq_name text := 'procesos_electorales_id_seq';
  new_max bigint;
BEGIN
  ALTER TABLE procesos_electorales ADD COLUMN id_new bigint;
  CREATE SEQUENCE temp_pe_seq;
  UPDATE procesos_electorales t
  SET id_new = sub.rn
  FROM (
    SELECT id, row_number() OVER (ORDER BY creado_en, id) AS rn
    FROM procesos_electorales
  ) sub
  WHERE t.id = sub.id;
  PERFORM setval('temp_pe_seq', (SELECT COALESCE(MAX(id_new), 0) FROM procesos_electorales));
  new_max := currval('temp_pe_seq');
  DROP SEQUENCE temp_pe_seq;

  ALTER TABLE procesos_electorales DROP CONSTRAINT procesos_electorales_pkey CASCADE;
  ALTER TABLE procesos_electorales DROP COLUMN id;
  ALTER TABLE procesos_electorales RENAME COLUMN id_new TO id;
  ALTER TABLE procesos_electorales ADD PRIMARY KEY (id);

  EXECUTE 'CREATE SEQUENCE ' || seq_name || ' START WITH ' || (new_max + 1);
  EXECUTE format('ALTER TABLE procesos_electorales ALTER COLUMN id SET DEFAULT nextval(%L::regclass)', seq_name);
  EXECUTE format('ALTER SEQUENCE %I OWNED BY procesos_electorales.id', seq_name);
END $$;

--- 2.2 clientes (1 row con data) ---
DO $$
DECLARE
  seq_name text := 'clientes_id_seq';
  new_max bigint;
BEGIN
  ALTER TABLE clientes ADD COLUMN id_new bigint;
  CREATE SEQUENCE temp_cl_seq;
  UPDATE clientes t
  SET id_new = sub.rn
  FROM (
    SELECT id, row_number() OVER (ORDER BY creado_en, id) AS rn
    FROM clientes
  ) sub
  WHERE t.id = sub.id;
  PERFORM setval('temp_cl_seq', (SELECT COALESCE(MAX(id_new), 0) FROM clientes));
  new_max := currval('temp_cl_seq');
  DROP SEQUENCE temp_cl_seq;

  ALTER TABLE clientes DROP CONSTRAINT clientes_pkey CASCADE;
  ALTER TABLE clientes DROP COLUMN id;
  ALTER TABLE clientes RENAME COLUMN id_new TO id;
  ALTER TABLE clientes ADD PRIMARY KEY (id);

  EXECUTE 'CREATE SEQUENCE ' || seq_name || ' START WITH ' || (new_max + 1);
  EXECUTE format('ALTER TABLE clientes ALTER COLUMN id SET DEFAULT nextval(%L::regclass)', seq_name);
  EXECUTE format('ALTER SEQUENCE %I OWNED BY clientes.id', seq_name);
END $$;

--- 2.3 Tablas vacías (campanas, miembros_campana, etc.) ---

CREATE OR REPLACE FUNCTION _tmp_drop_recreate_pk(tbl text)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  pk_name text;
  seq_name text;
BEGIN
  SELECT con.conname INTO pk_name
  FROM pg_constraint con
  JOIN pg_class cl ON con.conrelid = cl.oid
  WHERE cl.relname = tbl
    AND con.contype = 'p';

  IF pk_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE %I DROP CONSTRAINT %I', tbl, pk_name);
  END IF;

  EXECUTE format('ALTER TABLE %I DROP COLUMN id CASCADE', tbl);
  EXECUTE format('ALTER TABLE %I ADD COLUMN id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY', tbl);
END;
$$;

SELECT _tmp_drop_recreate_pk('campanas');
SELECT _tmp_drop_recreate_pk('miembros_campana');
SELECT _tmp_drop_recreate_pk('integraciones_campana');
SELECT _tmp_drop_recreate_pk('uso_campana');
SELECT _tmp_drop_recreate_pk('exportaciones_campana');
SELECT _tmp_drop_recreate_pk('registro_auditoria');
SELECT _tmp_drop_recreate_pk('roles');
SELECT _tmp_drop_recreate_pk('comunas');
SELECT _tmp_drop_recreate_pk('barrios');
SELECT _tmp_drop_recreate_pk('puestos_votacion');
SELECT _tmp_drop_recreate_pk('tipos_novedad');
SELECT _tmp_drop_recreate_pk('datos_trabajador_votante');
SELECT _tmp_drop_recreate_pk('novedades');
SELECT _tmp_drop_recreate_pk('lugares_trabajo');
SELECT _tmp_drop_recreate_pk('recolectores_telegram');
SELECT _tmp_drop_recreate_pk('sesiones_captura_telegram');
SELECT _tmp_drop_recreate_pk('verificaciones_registraduria');
SELECT _tmp_drop_recreate_pk('sesiones_captura_whatsapp');

-- votantes y cuarentena_votantes (self-referencing, handle separately)
SELECT _tmp_drop_recreate_pk('votantes');
SELECT _tmp_drop_recreate_pk('cuarentena_votantes');

DROP FUNCTION _tmp_drop_recreate_pk;

--- 3.4 miembros_cliente (1 row with data) ---
-- handle similar to clientes but also migrate id_cliente FK
DO $$
DECLARE
  seq_name text := 'miembros_cliente_id_seq';
  new_max bigint;
BEGIN
  ALTER TABLE miembros_cliente ADD COLUMN id_new bigint;

  -- Migrate id_cliente FK to bigint (only 1 row, direct mapping)
  ALTER TABLE miembros_cliente ADD COLUMN id_cliente_new bigint;
  UPDATE miembros_cliente SET id_cliente_new = (SELECT id FROM clientes LIMIT 1);

  CREATE SEQUENCE temp_mc_seq;
  UPDATE miembros_cliente t
  SET id_new = sub.rn
  FROM (
    SELECT id, row_number() OVER (ORDER BY creado_en, id) AS rn
    FROM miembros_cliente
  ) sub
  WHERE t.id = sub.id;
  PERFORM setval('temp_mc_seq', (SELECT COALESCE(MAX(id_new), 0) FROM miembros_cliente));
  new_max := currval('temp_mc_seq');
  DROP SEQUENCE temp_mc_seq;

  ALTER TABLE miembros_cliente DROP COLUMN id;
  ALTER TABLE miembros_cliente DROP COLUMN id_cliente;
  ALTER TABLE miembros_cliente RENAME COLUMN id_new TO id;
  ALTER TABLE miembros_cliente RENAME COLUMN id_cliente_new TO id_cliente;
  ALTER TABLE miembros_cliente ADD PRIMARY KEY (id);

  EXECUTE 'CREATE SEQUENCE ' || seq_name || ' START WITH ' || (new_max + 1);
  EXECUTE format('ALTER TABLE miembros_cliente ALTER COLUMN id SET DEFAULT nextval(%L::regclass)', seq_name);
  EXECUTE format('ALTER SEQUENCE %I OWNED BY miembros_cliente.id', seq_name);
END $$;

-- ============================================================================
-- PHASE 3: Migrate FK columns — tables without data (all nulls —> type change)
-- ============================================================================

--- 3.1 campanas ---
ALTER TABLE campanas ALTER COLUMN id_cliente TYPE bigint USING NULL::bigint;
ALTER TABLE campanas ALTER COLUMN id_cliente SET NOT NULL;
ALTER TABLE campanas ALTER COLUMN id_proceso_electoral TYPE bigint USING NULL::bigint;
ALTER TABLE campanas ALTER COLUMN id_proceso_electoral SET NOT NULL;

--- 3.2 miembros_campana ---
ALTER TABLE miembros_campana ALTER COLUMN id_campana TYPE bigint USING NULL::bigint;
ALTER TABLE miembros_campana ALTER COLUMN id_campana SET NOT NULL;
-- id_usuario stays uuid

--- 3.3 caracteristicas_campana ---
ALTER TABLE caracteristicas_campana ALTER COLUMN id_campana TYPE bigint USING NULL::bigint;
ALTER TABLE caracteristicas_campana ALTER COLUMN id_campana SET NOT NULL;
ALTER TABLE caracteristicas_campana ADD PRIMARY KEY (id_campana);

--- 3.4 integraciones_campana ---
ALTER TABLE integraciones_campana ALTER COLUMN id_campana TYPE bigint USING NULL::bigint;
ALTER TABLE integraciones_campana ALTER COLUMN id_campana SET NOT NULL;

--- 3.5 uso_campana ---
ALTER TABLE uso_campana ALTER COLUMN id_campana TYPE bigint USING NULL::bigint;
ALTER TABLE uso_campana ALTER COLUMN id_campana SET NOT NULL;

--- 3.6 exportaciones_campana ---
ALTER TABLE exportaciones_campana ALTER COLUMN id_campana TYPE bigint USING NULL::bigint;
ALTER TABLE exportaciones_campana ALTER COLUMN id_campana SET NOT NULL;
-- exportado_por stays uuid

--- 3.7 registro_auditoria ---
ALTER TABLE registro_auditoria ALTER COLUMN id_campana TYPE bigint USING NULL::bigint;
-- id_actor stays uuid
-- id_entidad stays uuid (polymorphic reference, could be external UUID)

--- 3.8 roles ---
ALTER TABLE roles ALTER COLUMN id_campana TYPE bigint USING NULL::bigint;
ALTER TABLE roles ALTER COLUMN id_campana SET NOT NULL;

--- 3.9 comunas ---
ALTER TABLE comunas ALTER COLUMN id_campana TYPE bigint USING NULL::bigint;
ALTER TABLE comunas ALTER COLUMN id_campana SET NOT NULL;

--- 3.10 barrios ---
ALTER TABLE barrios ALTER COLUMN id_comuna TYPE bigint USING NULL::bigint;
ALTER TABLE barrios ALTER COLUMN id_comuna SET NOT NULL;

--- 3.11 puestos_votacion ---
ALTER TABLE puestos_votacion ALTER COLUMN id_campana TYPE bigint USING NULL::bigint;
ALTER TABLE puestos_votacion ALTER COLUMN id_campana SET NOT NULL;
ALTER TABLE puestos_votacion ALTER COLUMN id_comuna TYPE bigint USING NULL::bigint;
ALTER TABLE puestos_votacion ALTER COLUMN id_barrio TYPE bigint USING NULL::bigint;

--- 3.12 tipos_novedad ---
ALTER TABLE tipos_novedad ALTER COLUMN id_campana TYPE bigint USING NULL::bigint;
ALTER TABLE tipos_novedad ALTER COLUMN id_campana SET NOT NULL;

--- 3.13 votantes ---
ALTER TABLE votantes ALTER COLUMN id_campana TYPE bigint USING NULL::bigint;
ALTER TABLE votantes ALTER COLUMN id_campana SET NOT NULL;
ALTER TABLE votantes ALTER COLUMN id_puesto_votacion TYPE bigint USING NULL::bigint;
ALTER TABLE votantes ALTER COLUMN id_rol TYPE bigint USING NULL::bigint;
ALTER TABLE votantes ALTER COLUMN id_lider_directo TYPE bigint USING NULL::bigint;
ALTER TABLE votantes ALTER COLUMN id_lugar_trabajo TYPE bigint USING NULL::bigint;
ALTER TABLE votantes ALTER COLUMN id_tipo_novedad TYPE bigint USING NULL::bigint;
-- creado_por stays uuid

--- 3.14 datos_trabajador_votante ---
ALTER TABLE datos_trabajador_votante ALTER COLUMN id_votante TYPE bigint USING NULL::bigint;
ALTER TABLE datos_trabajador_votante ALTER COLUMN id_votante SET NOT NULL;
ALTER TABLE datos_trabajador_votante ALTER COLUMN id_comuna TYPE bigint USING NULL::bigint;
ALTER TABLE datos_trabajador_votante ALTER COLUMN id_barrio TYPE bigint USING NULL::bigint;

--- 3.15 novedades ---
ALTER TABLE novedades ALTER COLUMN id_votante TYPE bigint USING NULL::bigint;
ALTER TABLE novedades ALTER COLUMN id_votante SET NOT NULL;
ALTER TABLE novedades ALTER COLUMN id_tipo_novedad TYPE bigint USING NULL::bigint;
ALTER TABLE novedades ALTER COLUMN id_tipo_novedad SET NOT NULL;
-- creado_por stays uuid

--- 3.16 cuarentena_votantes ---
ALTER TABLE cuarentena_votantes ALTER COLUMN id_campana TYPE bigint USING NULL::bigint;
ALTER TABLE cuarentena_votantes ALTER COLUMN id_campana SET NOT NULL;
ALTER TABLE cuarentena_votantes ALTER COLUMN id_puesto_votacion TYPE bigint USING NULL::bigint;
ALTER TABLE cuarentena_votantes ALTER COLUMN id_rol TYPE bigint USING NULL::bigint;
ALTER TABLE cuarentena_votantes ALTER COLUMN id_lider_directo TYPE bigint USING NULL::bigint;
ALTER TABLE cuarentena_votantes ALTER COLUMN id_votante_conflicto TYPE bigint USING NULL::bigint;
ALTER TABLE cuarentena_votantes ALTER COLUMN id_cuarentena_conflicto TYPE bigint USING NULL::bigint;
ALTER TABLE cuarentena_votantes ALTER COLUMN id_lugar_trabajo TYPE bigint USING NULL::bigint;
-- creado_por, resuelto_por stay uuid

--- 3.17 lugares_trabajo ---
ALTER TABLE lugares_trabajo ALTER COLUMN id_campana TYPE bigint USING NULL::bigint;
ALTER TABLE lugares_trabajo ALTER COLUMN id_campana SET NOT NULL;
ALTER TABLE lugares_trabajo ALTER COLUMN id_comuna TYPE bigint USING NULL::bigint;
ALTER TABLE lugares_trabajo ALTER COLUMN id_barrio TYPE bigint USING NULL::bigint;

--- 3.18 recolectores_telegram ---
ALTER TABLE recolectores_telegram ALTER COLUMN id_campana TYPE bigint USING NULL::bigint;
ALTER TABLE recolectores_telegram ALTER COLUMN id_campana SET NOT NULL;
ALTER TABLE recolectores_telegram ALTER COLUMN id_rol TYPE bigint USING NULL::bigint;
-- id_usuario stays uuid

--- 3.19 sesiones_captura_telegram ---
ALTER TABLE sesiones_captura_telegram ALTER COLUMN id_campana TYPE bigint USING NULL::bigint;
ALTER TABLE sesiones_captura_telegram ALTER COLUMN id_campana SET NOT NULL;
-- id_usuario stays uuid

--- 3.20 verificaciones_registraduria ---
ALTER TABLE verificaciones_registraduria ALTER COLUMN id_campana TYPE bigint USING NULL::bigint;
ALTER TABLE verificaciones_registraduria ALTER COLUMN id_campana SET NOT NULL;

--- 3.21 sesiones_captura_whatsapp ---
ALTER TABLE sesiones_captura_whatsapp ALTER COLUMN id_campana TYPE bigint USING NULL::bigint;
ALTER TABLE sesiones_captura_whatsapp ALTER COLUMN id_campana SET NOT NULL;
-- id_usuario stays uuid

-- Recreate CHECK constraints that were dropped by CASCADE
-- Must be AFTER FK column type changes (now both sides are bigint)
ALTER TABLE votantes ADD CONSTRAINT votantes_sin_auto_lider
  CHECK (id_lider_directo IS NULL OR id_lider_directo <> id);
ALTER TABLE cuarentena_votantes ADD CONSTRAINT cuarentena_sin_auto_conflicto
  CHECK (id_cuarentena_conflicto IS NULL OR id_cuarentena_conflicto <> id);
ALTER TABLE cuarentena_votantes DROP CONSTRAINT IF EXISTS cuarentena_tiene_conflicto;
ALTER TABLE cuarentena_votantes ADD CONSTRAINT cuarentena_tiene_conflicto
  CHECK (id_votante_conflicto IS NOT NULL OR id_cuarentena_conflicto IS NOT NULL);

-- ============================================================================
-- PHASE 4: Recreate FK constraints
-- ============================================================================

--- 4.1 Referencias a procesos_electorales ---
ALTER TABLE campanas ADD CONSTRAINT campanas_id_proceso_electoral_fkey
  FOREIGN KEY (id_proceso_electoral) REFERENCES procesos_electorales(id) ON DELETE RESTRICT;

--- 4.2 Referencias a clientes ---
ALTER TABLE campanas ADD CONSTRAINT campanas_id_cliente_fkey
  FOREIGN KEY (id_cliente) REFERENCES clientes(id) ON DELETE RESTRICT;
ALTER TABLE miembros_cliente ADD CONSTRAINT miembros_cliente_id_cliente_fkey
  FOREIGN KEY (id_cliente) REFERENCES clientes(id) ON DELETE CASCADE;

--- 4.3 Referencias a campanas ---
ALTER TABLE miembros_campana ADD CONSTRAINT miembros_campana_id_campana_fkey
  FOREIGN KEY (id_campana) REFERENCES campanas(id) ON DELETE CASCADE;
ALTER TABLE caracteristicas_campana ADD CONSTRAINT caracteristicas_campana_id_campana_fkey
  FOREIGN KEY (id_campana) REFERENCES campanas(id) ON DELETE CASCADE;
ALTER TABLE integraciones_campana ADD CONSTRAINT integraciones_campana_id_campana_fkey
  FOREIGN KEY (id_campana) REFERENCES campanas(id) ON DELETE CASCADE;
ALTER TABLE uso_campana ADD CONSTRAINT uso_campana_id_campana_fkey
  FOREIGN KEY (id_campana) REFERENCES campanas(id) ON DELETE CASCADE;
ALTER TABLE exportaciones_campana ADD CONSTRAINT exportaciones_campana_id_campana_fkey
  FOREIGN KEY (id_campana) REFERENCES campanas(id) ON DELETE CASCADE;
ALTER TABLE registro_auditoria ADD CONSTRAINT registro_auditoria_id_campana_fkey
  FOREIGN KEY (id_campana) REFERENCES campanas(id) ON DELETE SET NULL;
ALTER TABLE roles ADD CONSTRAINT roles_id_campana_fkey
  FOREIGN KEY (id_campana) REFERENCES campanas(id) ON DELETE CASCADE;
ALTER TABLE comunas ADD CONSTRAINT comunas_id_campana_fkey
  FOREIGN KEY (id_campana) REFERENCES campanas(id) ON DELETE CASCADE;
ALTER TABLE puestos_votacion ADD CONSTRAINT puestos_votacion_id_campana_fkey
  FOREIGN KEY (id_campana) REFERENCES campanas(id) ON DELETE CASCADE;
ALTER TABLE tipos_novedad ADD CONSTRAINT tipos_novedad_id_campana_fkey
  FOREIGN KEY (id_campana) REFERENCES campanas(id) ON DELETE CASCADE;
ALTER TABLE votantes ADD CONSTRAINT votantes_id_campana_fkey
  FOREIGN KEY (id_campana) REFERENCES campanas(id) ON DELETE CASCADE;
ALTER TABLE cuarentena_votantes ADD CONSTRAINT cuarentena_votantes_id_campana_fkey
  FOREIGN KEY (id_campana) REFERENCES campanas(id) ON DELETE CASCADE;
ALTER TABLE lugares_trabajo ADD CONSTRAINT lugares_trabajo_id_campana_fkey
  FOREIGN KEY (id_campana) REFERENCES campanas(id) ON DELETE CASCADE;
ALTER TABLE recolectores_telegram ADD CONSTRAINT recolectores_telegram_id_campana_fkey
  FOREIGN KEY (id_campana) REFERENCES campanas(id) ON DELETE CASCADE;
ALTER TABLE sesiones_captura_telegram ADD CONSTRAINT sesiones_captura_telegram_id_campana_fkey
  FOREIGN KEY (id_campana) REFERENCES campanas(id) ON DELETE CASCADE;
ALTER TABLE verificaciones_registraduria ADD CONSTRAINT verificaciones_registraduria_id_campana_fkey
  FOREIGN KEY (id_campana) REFERENCES campanas(id) ON DELETE CASCADE;
ALTER TABLE sesiones_captura_whatsapp ADD CONSTRAINT sesiones_captura_whatsapp_id_campana_fkey
  FOREIGN KEY (id_campana) REFERENCES campanas(id) ON DELETE CASCADE;

--- 4.4 Referencias a comunas ---
ALTER TABLE barrios ADD CONSTRAINT barrios_id_comuna_fkey
  FOREIGN KEY (id_comuna) REFERENCES comunas(id) ON DELETE CASCADE;
ALTER TABLE puestos_votacion ADD CONSTRAINT puestos_votacion_id_comuna_fkey
  FOREIGN KEY (id_comuna) REFERENCES comunas(id) ON DELETE SET NULL;
ALTER TABLE datos_trabajador_votante ADD CONSTRAINT datos_trabajador_votante_id_comuna_fkey
  FOREIGN KEY (id_comuna) REFERENCES comunas(id) ON DELETE SET NULL;
ALTER TABLE lugares_trabajo ADD CONSTRAINT lugares_trabajo_id_comuna_fkey
  FOREIGN KEY (id_comuna) REFERENCES comunas(id) ON DELETE SET NULL;

--- 4.5 Referencias a barrios ---
ALTER TABLE puestos_votacion ADD CONSTRAINT puestos_votacion_id_barrio_fkey
  FOREIGN KEY (id_barrio) REFERENCES barrios(id) ON DELETE SET NULL;
ALTER TABLE datos_trabajador_votante ADD CONSTRAINT datos_trabajador_votante_id_barrio_fkey
  FOREIGN KEY (id_barrio) REFERENCES barrios(id) ON DELETE SET NULL;
ALTER TABLE lugares_trabajo ADD CONSTRAINT lugares_trabajo_id_barrio_fkey
  FOREIGN KEY (id_barrio) REFERENCES barrios(id) ON DELETE SET NULL;

--- 4.6 Referencias a puestos_votacion ---
ALTER TABLE votantes ADD CONSTRAINT votantes_id_puesto_votacion_fkey
  FOREIGN KEY (id_puesto_votacion) REFERENCES puestos_votacion(id) ON DELETE SET NULL;
ALTER TABLE cuarentena_votantes ADD CONSTRAINT cuarentena_votantes_id_puesto_votacion_fkey
  FOREIGN KEY (id_puesto_votacion) REFERENCES puestos_votacion(id) ON DELETE SET NULL;

--- 4.7 Referencias a roles ---
ALTER TABLE votantes ADD CONSTRAINT votantes_id_rol_fkey
  FOREIGN KEY (id_rol) REFERENCES roles(id) ON DELETE SET NULL;
ALTER TABLE cuarentena_votantes ADD CONSTRAINT cuarentena_votantes_id_rol_fkey
  FOREIGN KEY (id_rol) REFERENCES roles(id) ON DELETE SET NULL;
ALTER TABLE recolectores_telegram ADD CONSTRAINT recolectores_telegram_id_rol_fkey
  FOREIGN KEY (id_rol) REFERENCES roles(id) ON DELETE SET NULL;

--- 4.8 Referencias a tipos_novedad ---
ALTER TABLE votantes ADD CONSTRAINT votantes_id_tipo_novedad_fkey
  FOREIGN KEY (id_tipo_novedad) REFERENCES tipos_novedad(id) ON DELETE SET NULL;
ALTER TABLE novedades ADD CONSTRAINT novedades_id_tipo_novedad_fkey
  FOREIGN KEY (id_tipo_novedad) REFERENCES tipos_novedad(id) ON DELETE RESTRICT;

--- 4.9 Referencias a votantes (incluye self-ref) ---
ALTER TABLE votantes ADD CONSTRAINT votantes_id_lider_directo_fkey
  FOREIGN KEY (id_lider_directo) REFERENCES votantes(id) ON DELETE SET NULL;
ALTER TABLE datos_trabajador_votante ADD CONSTRAINT datos_trabajador_votante_id_votante_fkey
  FOREIGN KEY (id_votante) REFERENCES votantes(id) ON DELETE CASCADE;
ALTER TABLE novedades ADD CONSTRAINT novedades_id_votante_fkey
  FOREIGN KEY (id_votante) REFERENCES votantes(id) ON DELETE CASCADE;
ALTER TABLE cuarentena_votantes ADD CONSTRAINT cuarentena_votantes_id_lider_directo_fkey
  FOREIGN KEY (id_lider_directo) REFERENCES votantes(id) ON DELETE SET NULL;
ALTER TABLE cuarentena_votantes ADD CONSTRAINT cuarentena_votantes_id_votante_conflicto_fkey
  FOREIGN KEY (id_votante_conflicto) REFERENCES votantes(id) ON DELETE SET NULL;

--- 4.10 Self-ref cuarentena_votantes ---
ALTER TABLE cuarentena_votantes ADD CONSTRAINT cuarentena_votantes_id_cuarentena_conflicto_fkey
  FOREIGN KEY (id_cuarentena_conflicto) REFERENCES cuarentena_votantes(id) ON DELETE SET NULL;

--- 4.11 Referencias a lugares_trabajo ---
ALTER TABLE votantes ADD CONSTRAINT votantes_id_lugar_trabajo_fkey
  FOREIGN KEY (id_lugar_trabajo) REFERENCES lugares_trabajo(id) ON DELETE SET NULL;
ALTER TABLE cuarentena_votantes ADD CONSTRAINT cuarentena_votantes_id_lugar_trabajo_fkey
  FOREIGN KEY (id_lugar_trabajo) REFERENCES lugares_trabajo(id) ON DELETE SET NULL;

--- 4.12 Referencias a auth.users (se mantienen uuid) ---
ALTER TABLE miembros_plataforma ADD CONSTRAINT miembros_plataforma_id_usuario_fkey
  FOREIGN KEY (id_usuario) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE clientes ADD CONSTRAINT clientes_id_usuario_fkey
  FOREIGN KEY (id_usuario) REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE miembros_campana ADD CONSTRAINT miembros_campana_id_usuario_fkey
  FOREIGN KEY (id_usuario) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE miembros_cliente ADD CONSTRAINT miembros_cliente_id_usuario_fkey
  FOREIGN KEY (id_usuario) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE miembros_cliente ADD CONSTRAINT miembros_cliente_id_cliente_id_usuario_key
  UNIQUE (id_cliente, id_usuario);
ALTER TABLE exportaciones_campana ADD CONSTRAINT exportaciones_campana_exportado_por_fkey
  FOREIGN KEY (exportado_por) REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE registro_auditoria ADD CONSTRAINT registro_auditoria_id_actor_fkey
  FOREIGN KEY (id_actor) REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE votantes ADD CONSTRAINT votantes_creado_por_fkey
  FOREIGN KEY (creado_por) REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE novedades ADD CONSTRAINT novedades_creado_por_fkey
  FOREIGN KEY (creado_por) REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE cuarentena_votantes ADD CONSTRAINT cuarentena_votantes_creado_por_fkey
  FOREIGN KEY (creado_por) REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE cuarentena_votantes ADD CONSTRAINT cuarentena_votantes_resuelto_por_fkey
  FOREIGN KEY (resuelto_por) REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE recolectores_telegram ADD CONSTRAINT recolectores_telegram_id_usuario_fkey
  FOREIGN KEY (id_usuario) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE sesiones_captura_telegram ADD CONSTRAINT sesiones_captura_telegram_id_usuario_fkey
  FOREIGN KEY (id_usuario) REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE sesiones_captura_whatsapp ADD CONSTRAINT sesiones_captura_whatsapp_id_usuario_fkey
  FOREIGN KEY (id_usuario) REFERENCES auth.users(id) ON DELETE SET NULL;

-- ============================================================================
-- PHASE 5: Recreate functions with bigint signatures
-- ============================================================================

--- 5.1 ids_campanas_usuario — returns SETOF bigint ---
CREATE OR REPLACE FUNCTION ids_campanas_usuario()
RETURNS SETOF bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id_campana
  FROM miembros_campana
  WHERE id_usuario = auth.uid();
$$;

--- 5.2 Helper RLS functions with bigint params ---
CREATE OR REPLACE FUNCTION puede_leer_campana(p_id_campana bigint)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT es_dueno_plataforma()
    OR p_id_campana IN (SELECT ids_campanas_usuario());
$$;

CREATE OR REPLACE FUNCTION puede_editar_campana(p_id_campana bigint)
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

CREATE OR REPLACE FUNCTION puede_administrar_campana(p_id_campana bigint)
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

--- 5.3 subarbol_votantes — bigint param, returns TABLE(id_votante bigint) ---
CREATE OR REPLACE FUNCTION subarbol_votantes(id_votante_raiz bigint)
RETURNS TABLE (id_votante bigint, profundidad integer)
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

--- 5.4 asignar_codigo_serial — updated to use bigint scope ---
CREATE OR REPLACE FUNCTION asignar_codigo_serial()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  scope_col text := TG_ARGV[0];
BEGIN
  IF NEW.codigo IS NOT NULL THEN
    RETURN NEW;
  END IF;

  IF scope_col IS NULL OR scope_col = '' THEN
    EXECUTE format(
      'SELECT COALESCE(MAX(codigo), 0) + 1 FROM %I',
      TG_TABLE_NAME
    )
    INTO NEW.codigo;
  ELSE
    EXECUTE format(
      'SELECT COALESCE(MAX(codigo), 0) + 1 FROM %I WHERE %I = $1',
      TG_TABLE_NAME,
      scope_col
    )
    INTO NEW.codigo
    USING (to_jsonb(NEW) ->> scope_col)::bigint;
  END IF;

  RETURN NEW;
END;
$$;

--- 5.5 validar_lider_misma_campana ---
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

--- 5.6 match_puestos_votacion — returns bigint ---
CREATE OR REPLACE FUNCTION match_puestos_votacion(
  query_embedding vector,
  match_count integer DEFAULT NULL::integer,
  filter jsonb DEFAULT '{}'::jsonb
)
RETURNS TABLE(id bigint, content text, metadata jsonb, similarity double precision)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.nombre || ' - ' || COALESCE(p.municipio, '') || ' - ' || COALESCE(p.direccion, '') AS content,
    jsonb_build_object(
      'id_campana', p.id_campana,
      'nombre', p.nombre,
      'municipio', p.municipio,
      'direccion', p.direccion,
      'codigo', p.codigo
    ) AS metadata,
    1 - (p.embedding <=> query_embedding) AS similarity
  FROM puestos_votacion p
  WHERE p.embedding IS NOT NULL
    AND (filter = '{}'::jsonb OR p.id_campana = (filter->>'id_campana')::bigint)
  ORDER BY p.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

--- 5.7 match_votantes — returns bigint ---
CREATE OR REPLACE FUNCTION match_votantes(
  query_embedding vector,
  match_count integer DEFAULT NULL::integer,
  filter jsonb DEFAULT '{}'::jsonb
)
RETURNS TABLE(id bigint, content text, metadata jsonb, similarity double precision)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    v.id,
    v.nombres || ' ' || v.apellidos || ' - ' || v.documento AS content,
    jsonb_build_object(
      'id_campana', v.id_campana,
      'nombres', v.nombres,
      'apellidos', v.apellidos,
      'documento', v.documento,
      'id_rol', v.id_rol,
      'id_puesto_votacion', v.id_puesto_votacion
    ) AS metadata,
    1 - (v.embedding <=> query_embedding) AS similarity
  FROM votantes v
  WHERE v.embedding IS NOT NULL
    AND (filter = '{}'::jsonb OR v.id_campana = (filter->>'id_campana')::bigint)
  ORDER BY v.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- ============================================================================
-- PHASE 6: Recreate triggers
-- ============================================================================

--- 6.1 asignar_codigo_serial triggers ---
DROP TRIGGER IF EXISTS comunas_asignar_codigo ON comunas;
CREATE TRIGGER comunas_asignar_codigo
  BEFORE INSERT ON comunas
  FOR EACH ROW EXECUTE FUNCTION asignar_codigo_serial('id_campana');

DROP TRIGGER IF EXISTS barrios_asignar_codigo ON barrios;
CREATE TRIGGER barrios_asignar_codigo
  BEFORE INSERT ON barrios
  FOR EACH ROW EXECUTE FUNCTION asignar_codigo_serial('id_comuna');

DROP TRIGGER IF EXISTS puestos_asignar_codigo ON puestos_votacion;
CREATE TRIGGER puestos_asignar_codigo
  BEFORE INSERT ON puestos_votacion
  FOR EACH ROW EXECUTE FUNCTION asignar_codigo_serial('id_campana');

DROP TRIGGER IF EXISTS roles_asignar_codigo ON roles;
CREATE TRIGGER roles_asignar_codigo
  BEFORE INSERT ON roles
  FOR EACH ROW EXECUTE FUNCTION asignar_codigo_serial('id_campana');

DROP TRIGGER IF EXISTS tipos_novedad_asignar_codigo ON tipos_novedad;
CREATE TRIGGER tipos_novedad_asignar_codigo
  BEFORE INSERT ON tipos_novedad
  FOR EACH ROW EXECUTE FUNCTION asignar_codigo_serial('id_campana');

DROP TRIGGER IF EXISTS lugares_trabajo_asignar_codigo ON lugares_trabajo;
CREATE TRIGGER lugares_trabajo_asignar_codigo
  BEFORE INSERT ON lugares_trabajo
  FOR EACH ROW EXECUTE FUNCTION asignar_codigo_serial('id_campana');

DROP TRIGGER IF EXISTS clientes_asignar_codigo ON clientes;
CREATE TRIGGER clientes_asignar_codigo
  BEFORE INSERT ON clientes
  FOR EACH ROW EXECUTE FUNCTION asignar_codigo_serial('');

DROP TRIGGER IF EXISTS procesos_electorales_asignar_codigo ON procesos_electorales;
CREATE TRIGGER procesos_electorales_asignar_codigo
  BEFORE INSERT ON procesos_electorales
  FOR EACH ROW EXECUTE FUNCTION asignar_codigo_serial('');

DROP TRIGGER IF EXISTS campanas_asignar_codigo ON campanas;
CREATE TRIGGER campanas_asignar_codigo
  BEFORE INSERT ON campanas
  FOR EACH ROW EXECUTE FUNCTION asignar_codigo_serial('');

--- 6.2 validar_lider_misma_campana ---
DROP TRIGGER IF EXISTS votantes_lider_misma_campana ON votantes;
CREATE TRIGGER votantes_lider_misma_campana
  BEFORE INSERT OR UPDATE OF id_lider_directo, id_campana ON votantes
  FOR EACH ROW EXECUTE FUNCTION validar_lider_misma_campana();

-- ============================================================================
-- PHASE 7: Recreate RLS policies (dropped in Phase 1)
-- ============================================================================

-- procesos_electorales
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

-- clientes
CREATE POLICY clientes_plataforma ON clientes
  FOR ALL TO authenticated
  USING (es_dueno_plataforma())
  WITH CHECK (es_dueno_plataforma());

-- campanas
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

-- miembros_plataforma
CREATE POLICY miembros_plataforma_select ON miembros_plataforma
  FOR SELECT TO authenticated
  USING (id_usuario = auth.uid() OR es_dueno_plataforma());
CREATE POLICY miembros_plataforma_write ON miembros_plataforma
  FOR ALL TO authenticated
  USING (es_dueno_plataforma())
  WITH CHECK (es_dueno_plataforma());

-- miembros_campana
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

-- miembros_cliente
CREATE POLICY miembros_cliente_plataforma ON miembros_cliente
  FOR ALL TO authenticated
  USING (es_dueno_plataforma())
  WITH CHECK (es_dueno_plataforma());

-- caracteristicas_campana
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

-- integraciones_campana
CREATE POLICY integraciones_campana_plataforma ON integraciones_campana
  FOR ALL TO authenticated
  USING (es_dueno_plataforma())
  WITH CHECK (es_dueno_plataforma());

-- uso_campana
CREATE POLICY uso_campana_plataforma ON uso_campana
  FOR ALL TO authenticated
  USING (es_dueno_plataforma())
  WITH CHECK (es_dueno_plataforma());

-- exportaciones_campana
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

-- configuracion_marca_plataforma
CREATE POLICY marca_plataforma_select ON configuracion_marca_plataforma
  FOR SELECT TO authenticated
  USING (true);
CREATE POLICY marca_plataforma_select_anon ON configuracion_marca_plataforma
  FOR SELECT TO anon
  USING (true);
CREATE POLICY marca_plataforma_write ON configuracion_marca_plataforma
  FOR ALL TO authenticated
  USING (es_dueno_plataforma())
  WITH CHECK (es_dueno_plataforma());

-- configuracion_integracion_plataforma
CREATE POLICY configuracion_integracion_plataforma_select
  ON configuracion_integracion_plataforma
  FOR SELECT TO authenticated
  USING (es_dueno_plataforma());
CREATE POLICY configuracion_integracion_plataforma_write
  ON configuracion_integracion_plataforma
  FOR ALL TO authenticated
  USING (es_dueno_plataforma())
  WITH CHECK (es_dueno_plataforma());

-- registro_auditoria
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

-- barrios
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

-- puestos_votacion
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

-- tipos_novedad
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

-- datos_trabajador_votante
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

-- cuarentena_votantes
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

-- lugares_trabajo
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

-- recolectores_telegram
CREATE POLICY recolectores_telegram_select ON recolectores_telegram
  FOR SELECT TO authenticated
  USING (puede_leer_campana(id_campana));
CREATE POLICY recolectores_telegram_plataforma_write ON recolectores_telegram
  FOR ALL TO authenticated
  USING (es_dueno_plataforma())
  WITH CHECK (es_dueno_plataforma());

-- sesiones_captura_telegram
CREATE POLICY sesiones_captura_telegram_select ON sesiones_captura_telegram
  FOR SELECT TO authenticated
  USING (puede_leer_campana(id_campana));
CREATE POLICY sesiones_captura_telegram_plataforma_write ON sesiones_captura_telegram
  FOR ALL TO authenticated
  USING (es_dueno_plataforma())
  WITH CHECK (es_dueno_plataforma());

-- verificaciones_registraduria
CREATE POLICY verificaciones_registraduria_select ON verificaciones_registraduria
  FOR SELECT TO authenticated
  USING (puede_leer_campana(id_campana));
CREATE POLICY verificaciones_registraduria_write ON verificaciones_registraduria
  FOR ALL TO authenticated
  USING (puede_administrar_campana(id_campana))
  WITH CHECK (puede_administrar_campana(id_campana));

-- sesiones_captura_whatsapp (added outside migration system)
CREATE POLICY sesiones_captura_whatsapp_select ON sesiones_captura_whatsapp
  FOR SELECT TO authenticated
  USING (puede_leer_campana(id_campana));

COMMIT;
