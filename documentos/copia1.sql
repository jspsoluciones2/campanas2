--
-- PostgreSQL database dump
--

\restrict yI56ORYt5V4stQ6GPG4jZWkDLVcstu8WXPLHQeu99tzoRaKfUq9725kCBe1faW1

-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: auth; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA auth;


ALTER SCHEMA auth OWNER TO supabase_admin;

--
-- Name: extensions; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA extensions;


ALTER SCHEMA extensions OWNER TO postgres;

--
-- Name: graphql; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA graphql;


ALTER SCHEMA graphql OWNER TO supabase_admin;

--
-- Name: graphql_public; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA graphql_public;


ALTER SCHEMA graphql_public OWNER TO supabase_admin;

--
-- Name: pgbouncer; Type: SCHEMA; Schema: -; Owner: pgbouncer
--

CREATE SCHEMA pgbouncer;


ALTER SCHEMA pgbouncer OWNER TO pgbouncer;

--
-- Name: realtime; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA realtime;


ALTER SCHEMA realtime OWNER TO supabase_admin;

--
-- Name: storage; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA storage;


ALTER SCHEMA storage OWNER TO supabase_admin;

--
-- Name: supabase_migrations; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA supabase_migrations;


ALTER SCHEMA supabase_migrations OWNER TO postgres;

--
-- Name: vault; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA vault;


ALTER SCHEMA vault OWNER TO supabase_admin;

--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA extensions;


--
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: supabase_vault; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS supabase_vault WITH SCHEMA vault;


--
-- Name: EXTENSION supabase_vault; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION supabase_vault IS 'Supabase Vault Extension';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: vector; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA public;


--
-- Name: EXTENSION vector; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION vector IS 'vector data type and ivfflat and hnsw access methods';


--
-- Name: aal_level; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.aal_level AS ENUM (
    'aal1',
    'aal2',
    'aal3'
);


ALTER TYPE auth.aal_level OWNER TO supabase_auth_admin;

--
-- Name: code_challenge_method; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.code_challenge_method AS ENUM (
    's256',
    'plain'
);


ALTER TYPE auth.code_challenge_method OWNER TO supabase_auth_admin;

--
-- Name: factor_status; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.factor_status AS ENUM (
    'unverified',
    'verified'
);


ALTER TYPE auth.factor_status OWNER TO supabase_auth_admin;

--
-- Name: factor_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.factor_type AS ENUM (
    'totp',
    'webauthn',
    'phone'
);


ALTER TYPE auth.factor_type OWNER TO supabase_auth_admin;

--
-- Name: oauth_authorization_status; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.oauth_authorization_status AS ENUM (
    'pending',
    'approved',
    'denied',
    'expired'
);


ALTER TYPE auth.oauth_authorization_status OWNER TO supabase_auth_admin;

--
-- Name: oauth_client_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.oauth_client_type AS ENUM (
    'public',
    'confidential'
);


ALTER TYPE auth.oauth_client_type OWNER TO supabase_auth_admin;

--
-- Name: oauth_registration_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.oauth_registration_type AS ENUM (
    'dynamic',
    'manual'
);


ALTER TYPE auth.oauth_registration_type OWNER TO supabase_auth_admin;

--
-- Name: oauth_response_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.oauth_response_type AS ENUM (
    'code'
);


ALTER TYPE auth.oauth_response_type OWNER TO supabase_auth_admin;

--
-- Name: one_time_token_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.one_time_token_type AS ENUM (
    'confirmation_token',
    'reauthentication_token',
    'recovery_token',
    'email_change_token_new',
    'email_change_token_current',
    'phone_change_token'
);


ALTER TYPE auth.one_time_token_type OWNER TO supabase_auth_admin;

--
-- Name: canal_captura; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.canal_captura AS ENUM (
    'whatsapp',
    'telegram',
    'web',
    'web_publico',
    'manual'
);


ALTER TYPE public.canal_captura OWNER TO postgres;

--
-- Name: estado_campana; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.estado_campana AS ENUM (
    'activa',
    'pausada',
    'finalizada',
    'purgada'
);


ALTER TYPE public.estado_campana OWNER TO postgres;

--
-- Name: estado_cuarentena; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.estado_cuarentena AS ENUM (
    'pendiente',
    'resuelto',
    'descartado',
    'escalado'
);


ALTER TYPE public.estado_cuarentena OWNER TO postgres;

--
-- Name: estado_verificacion_registraduria; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.estado_verificacion_registraduria AS ENUM (
    'pendiente',
    'en_proceso',
    'exitoso',
    'error',
    'discrepancia_nombre'
);


ALTER TYPE public.estado_verificacion_registraduria OWNER TO postgres;

--
-- Name: estado_votante; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.estado_votante AS ENUM (
    'activo',
    'en_cuarentena',
    'pendiente_verificacion',
    'rechazado'
);


ALTER TYPE public.estado_votante OWNER TO postgres;

--
-- Name: proveedor_integracion; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.proveedor_integracion AS ENUM (
    'twilio',
    'resolutor_captcha',
    'telegram',
    'ia_e14',
    'supabase'
);


ALTER TYPE public.proveedor_integracion OWNER TO postgres;

--
-- Name: rol_miembro_campana; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.rol_miembro_campana AS ENUM (
    'lector',
    'editor',
    'administrador_campana'
);


ALTER TYPE public.rol_miembro_campana OWNER TO postgres;

--
-- Name: rol_plataforma; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.rol_plataforma AS ENUM (
    'dueno_plataforma'
);


ALTER TYPE public.rol_plataforma OWNER TO postgres;

--
-- Name: tipo_coincidencia_cuarentena; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.tipo_coincidencia_cuarentena AS ENUM (
    'cedula_exacta',
    'telefono_similitud_nombre'
);


ALTER TYPE public.tipo_coincidencia_cuarentena OWNER TO postgres;

--
-- Name: tipo_documento; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.tipo_documento AS ENUM (
    'CC',
    'TI',
    'CE',
    'PA',
    'PEP',
    'PPT'
);


ALTER TYPE public.tipo_documento OWNER TO postgres;

--
-- Name: tipo_sexo; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.tipo_sexo AS ENUM (
    'Masculino',
    'Femenino'
);


ALTER TYPE public.tipo_sexo OWNER TO postgres;

--
-- Name: action; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.action AS ENUM (
    'INSERT',
    'UPDATE',
    'DELETE',
    'TRUNCATE',
    'ERROR'
);


ALTER TYPE realtime.action OWNER TO supabase_admin;

--
-- Name: equality_op; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.equality_op AS ENUM (
    'eq',
    'neq',
    'lt',
    'lte',
    'gt',
    'gte',
    'in',
    'like',
    'ilike',
    'is',
    'match',
    'imatch',
    'isdistinct'
);


ALTER TYPE realtime.equality_op OWNER TO supabase_admin;

--
-- Name: user_defined_filter; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.user_defined_filter AS (
	column_name text,
	op realtime.equality_op,
	value text,
	negate boolean
);


ALTER TYPE realtime.user_defined_filter OWNER TO supabase_admin;

--
-- Name: wal_column; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.wal_column AS (
	name text,
	type_name text,
	type_oid oid,
	value jsonb,
	is_pkey boolean,
	is_selectable boolean
);


ALTER TYPE realtime.wal_column OWNER TO supabase_admin;

--
-- Name: wal_rls; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.wal_rls AS (
	wal jsonb,
	is_rls_enabled boolean,
	subscription_ids uuid[],
	errors text[]
);


ALTER TYPE realtime.wal_rls OWNER TO supabase_admin;

--
-- Name: buckettype; Type: TYPE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TYPE storage.buckettype AS ENUM (
    'STANDARD',
    'ANALYTICS',
    'VECTOR'
);


ALTER TYPE storage.buckettype OWNER TO supabase_storage_admin;

--
-- Name: email(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.email() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.email', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
  )::text
$$;


ALTER FUNCTION auth.email() OWNER TO supabase_auth_admin;

--
-- Name: FUNCTION email(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.email() IS 'Deprecated. Use auth.jwt() -> ''email'' instead.';


--
-- Name: jwt(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.jwt() RETURNS jsonb
    LANGUAGE sql STABLE
    AS $$
  select 
    coalesce(
        nullif(current_setting('request.jwt.claim', true), ''),
        nullif(current_setting('request.jwt.claims', true), '')
    )::jsonb
$$;


ALTER FUNCTION auth.jwt() OWNER TO supabase_auth_admin;

--
-- Name: role(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.role() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text
$$;


ALTER FUNCTION auth.role() OWNER TO supabase_auth_admin;

--
-- Name: FUNCTION role(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.role() IS 'Deprecated. Use auth.jwt() -> ''role'' instead.';


--
-- Name: uid(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.uid() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;


ALTER FUNCTION auth.uid() OWNER TO supabase_auth_admin;

--
-- Name: FUNCTION uid(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.uid() IS 'Deprecated. Use auth.jwt() -> ''sub'' instead.';


--
-- Name: grant_pg_cron_access(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.grant_pg_cron_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_cron'
  )
  THEN
    grant usage on schema cron to postgres with grant option;

    alter default privileges in schema cron grant all on tables to postgres with grant option;
    alter default privileges in schema cron grant all on functions to postgres with grant option;
    alter default privileges in schema cron grant all on sequences to postgres with grant option;

    alter default privileges for user supabase_admin in schema cron grant all
        on sequences to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on tables to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on functions to postgres with grant option;

    grant all privileges on all tables in schema cron to postgres with grant option;
    revoke all on table cron.job from postgres;
    grant select on table cron.job to postgres with grant option;
  END IF;
END;
$$;


ALTER FUNCTION extensions.grant_pg_cron_access() OWNER TO supabase_admin;

--
-- Name: FUNCTION grant_pg_cron_access(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.grant_pg_cron_access() IS 'Grants access to pg_cron';


--
-- Name: grant_pg_graphql_access(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.grant_pg_graphql_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
begin
    if not exists (
        select 1
        from pg_event_trigger_ddl_commands() ev
        join pg_catalog.pg_extension e on ev.objid = e.oid
        where e.extname = 'pg_graphql'
    ) then
        return;
    end if;

    drop function if exists graphql_public.graphql;
    create or replace function graphql_public.graphql(
        "operationName" text default null,
        query text default null,
        variables jsonb default null,
        extensions jsonb default null
    )
        returns jsonb
        language sql
    as $$
        select graphql.resolve(
            query := query,
            variables := coalesce(variables, '{}'),
            "operationName" := "operationName",
            extensions := extensions
        );
    $$;

    -- Attach the wrapper to the extension so DROP EXTENSION cascades to it,
    -- which in turn triggers set_graphql_placeholder to reinstall the "not enabled" stub.
    alter extension pg_graphql add function graphql_public.graphql(text, text, jsonb, jsonb);

    grant usage on schema graphql to postgres, anon, authenticated, service_role;
    grant execute on function graphql.resolve to postgres, anon, authenticated, service_role;
    grant usage on schema graphql to postgres with grant option;
    grant usage on schema graphql_public to postgres with grant option;
end;
$_$;


ALTER FUNCTION extensions.grant_pg_graphql_access() OWNER TO supabase_admin;

--
-- Name: FUNCTION grant_pg_graphql_access(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.grant_pg_graphql_access() IS 'Grants access to pg_graphql';


--
-- Name: grant_pg_net_access(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.grant_pg_net_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_net'
  )
  THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_roles
      WHERE rolname = 'supabase_functions_admin'
    )
    THEN
      CREATE USER supabase_functions_admin NOINHERIT CREATEROLE LOGIN NOREPLICATION;
    END IF;

    GRANT USAGE ON SCHEMA net TO supabase_functions_admin, postgres, anon, authenticated, service_role;

    IF EXISTS (
      SELECT FROM pg_extension
      WHERE extname = 'pg_net'
      -- all versions in use on existing projects as of 2025-02-20
      -- version 0.12.0 onwards don't need these applied
      AND extversion IN ('0.2', '0.6', '0.7', '0.7.1', '0.8', '0.10.0', '0.11.0')
    ) THEN
      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;

      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;

      REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
      REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;

      GRANT EXECUTE ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
      GRANT EXECUTE ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
    END IF;
  END IF;
END;
$$;


ALTER FUNCTION extensions.grant_pg_net_access() OWNER TO supabase_admin;

--
-- Name: FUNCTION grant_pg_net_access(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.grant_pg_net_access() IS 'Grants access to pg_net';


--
-- Name: pgrst_ddl_watch(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.pgrst_ddl_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN SELECT * FROM pg_event_trigger_ddl_commands()
  LOOP
    IF cmd.command_tag IN (
      'CREATE SCHEMA', 'ALTER SCHEMA'
    , 'CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO', 'ALTER TABLE'
    , 'CREATE FOREIGN TABLE', 'ALTER FOREIGN TABLE'
    , 'CREATE VIEW', 'ALTER VIEW'
    , 'CREATE MATERIALIZED VIEW', 'ALTER MATERIALIZED VIEW'
    , 'CREATE FUNCTION', 'ALTER FUNCTION'
    , 'CREATE TRIGGER'
    , 'CREATE TYPE', 'ALTER TYPE'
    , 'CREATE RULE'
    , 'COMMENT'
    )
    -- don't notify in case of CREATE TEMP table or other objects created on pg_temp
    AND cmd.schema_name is distinct from 'pg_temp'
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


ALTER FUNCTION extensions.pgrst_ddl_watch() OWNER TO supabase_admin;

--
-- Name: pgrst_drop_watch(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.pgrst_drop_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  obj record;
BEGIN
  FOR obj IN SELECT * FROM pg_event_trigger_dropped_objects()
  LOOP
    IF obj.object_type IN (
      'schema'
    , 'table'
    , 'foreign table'
    , 'view'
    , 'materialized view'
    , 'function'
    , 'trigger'
    , 'type'
    , 'rule'
    )
    AND obj.is_temporary IS false -- no pg_temp objects
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


ALTER FUNCTION extensions.pgrst_drop_watch() OWNER TO supabase_admin;

--
-- Name: set_graphql_placeholder(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.set_graphql_placeholder() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
    DECLARE
    graphql_is_dropped bool;
    BEGIN
    graphql_is_dropped = (
        SELECT ev.schema_name = 'graphql_public'
        FROM pg_event_trigger_dropped_objects() AS ev
        WHERE ev.schema_name = 'graphql_public'
    );

    IF graphql_is_dropped
    THEN
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language plpgsql
        as $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;
    END IF;

    END;
$_$;


ALTER FUNCTION extensions.set_graphql_placeholder() OWNER TO supabase_admin;

--
-- Name: FUNCTION set_graphql_placeholder(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.set_graphql_placeholder() IS 'Reintroduces placeholder function for graphql_public.graphql';


--
-- Name: graphql(text, text, jsonb, jsonb); Type: FUNCTION; Schema: graphql_public; Owner: supabase_admin
--

CREATE FUNCTION graphql_public.graphql("operationName" text DEFAULT NULL::text, query text DEFAULT NULL::text, variables jsonb DEFAULT NULL::jsonb, extensions jsonb DEFAULT NULL::jsonb) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;


ALTER FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) OWNER TO supabase_admin;

--
-- Name: get_auth(text); Type: FUNCTION; Schema: pgbouncer; Owner: supabase_admin
--

CREATE FUNCTION pgbouncer.get_auth(p_usename text) RETURNS TABLE(username text, password text)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $_$
  BEGIN
      RAISE DEBUG 'PgBouncer auth request: %', p_usename;

      RETURN QUERY
      SELECT
          rolname::text,
          CASE WHEN rolvaliduntil < now()
              THEN null
              ELSE rolpassword::text
          END
      FROM pg_authid
      WHERE rolname=$1 and rolcanlogin;
  END;
  $_$;


ALTER FUNCTION pgbouncer.get_auth(p_usename text) OWNER TO supabase_admin;

--
-- Name: actualizar_verificacion_registraduria_ts(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.actualizar_verificacion_registraduria_ts() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.actualizado_en = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.actualizar_verificacion_registraduria_ts() OWNER TO postgres;

--
-- Name: crear_caracteristicas_campana(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.crear_caracteristicas_campana() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO caracteristicas_campana (id_campana) VALUES (NEW.id);
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.crear_caracteristicas_campana() OWNER TO postgres;

--
-- Name: es_dueno_plataforma(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.es_dueno_plataforma() RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM miembros_plataforma
    WHERE id_usuario = auth.uid()
      AND rol = 'dueno_plataforma'
  );
$$;


ALTER FUNCTION public.es_dueno_plataforma() OWNER TO postgres;

--
-- Name: establecer_actualizado_en(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.establecer_actualizado_en() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.actualizado_en = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.establecer_actualizado_en() OWNER TO postgres;

--
-- Name: ids_campanas_usuario(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.ids_campanas_usuario() RETURNS SETOF bigint
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT id_campana
  FROM miembros_campana
  WHERE id_usuario = auth.uid();
$$;


ALTER FUNCTION public.ids_campanas_usuario() OWNER TO postgres;

--
-- Name: match_puestos_votacion(public.vector, integer, jsonb); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.match_puestos_votacion(query_embedding public.vector, match_count integer DEFAULT NULL::integer, filter jsonb DEFAULT '{}'::jsonb) RETURNS TABLE(id bigint, content text, metadata jsonb, similarity double precision)
    LANGUAGE plpgsql STABLE
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


ALTER FUNCTION public.match_puestos_votacion(query_embedding public.vector, match_count integer, filter jsonb) OWNER TO postgres;

--
-- Name: match_votantes(public.vector, integer, jsonb); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.match_votantes(query_embedding public.vector, match_count integer DEFAULT NULL::integer, filter jsonb DEFAULT '{}'::jsonb) RETURNS TABLE(id bigint, content text, metadata jsonb, similarity double precision)
    LANGUAGE plpgsql STABLE
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


ALTER FUNCTION public.match_votantes(query_embedding public.vector, match_count integer, filter jsonb) OWNER TO postgres;

--
-- Name: puede_administrar_campana(bigint); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.puede_administrar_campana(p_id_campana bigint) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
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


ALTER FUNCTION public.puede_administrar_campana(p_id_campana bigint) OWNER TO postgres;

--
-- Name: puede_editar_campana(bigint); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.puede_editar_campana(p_id_campana bigint) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
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


ALTER FUNCTION public.puede_editar_campana(p_id_campana bigint) OWNER TO postgres;

--
-- Name: puede_leer_campana(bigint); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.puede_leer_campana(p_id_campana bigint) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT es_dueno_plataforma()
    OR p_id_campana IN (SELECT ids_campanas_usuario());
$$;


ALTER FUNCTION public.puede_leer_campana(p_id_campana bigint) OWNER TO postgres;

--
-- Name: subarbol_votantes(bigint); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.subarbol_votantes(id_votante_raiz bigint) RETURNS TABLE(id_votante bigint, profundidad integer)
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
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


ALTER FUNCTION public.subarbol_votantes(id_votante_raiz bigint) OWNER TO postgres;

--
-- Name: validar_lider_misma_campana(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.validar_lider_misma_campana() RETURNS trigger
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


ALTER FUNCTION public.validar_lider_misma_campana() OWNER TO postgres;

--
-- Name: apply_rls(jsonb, integer); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer DEFAULT (1024 * 1024)) RETURNS SETOF realtime.wal_rls
    LANGUAGE plpgsql
    AS $$
declare
    -- Regclass of the table e.g. public.notes
    entity_ regclass = (quote_ident(wal ->> 'schema') || '.' || quote_ident(wal ->> 'table'))::regclass;

    -- I, U, D, T: insert, update ...
    action realtime.action = (
        case wal ->> 'action'
            when 'I' then 'INSERT'
            when 'U' then 'UPDATE'
            when 'D' then 'DELETE'
            else 'ERROR'
        end
    );

    -- Is row level security enabled for the table
    is_rls_enabled bool = relrowsecurity from pg_class where oid = entity_;

    subscriptions realtime.subscription[] = array_agg(subs)
        from
            realtime.subscription subs
        where
            subs.entity = entity_
            -- Filter by action early - only get subscriptions interested in this action
            -- action_filter column can be: '*' (all), 'INSERT', 'UPDATE', or 'DELETE'
            and (subs.action_filter = '*' or subs.action_filter = action::text);

    -- Subscription vars
    working_role regrole;
    working_selected_columns text[];
    claimed_role regrole;
    claims jsonb;

    subscription_id uuid;
    subscription_has_access bool;
    visible_to_subscription_ids uuid[] = '{}';

    -- structured info for wal's columns
    columns realtime.wal_column[];
    -- previous identity values for update/delete
    old_columns realtime.wal_column[];

    error_record_exceeds_max_size boolean = octet_length(wal::text) > max_record_bytes;

    -- Primary jsonb output for record
    output jsonb;

    -- Loop record for iterating unique roles (outer loop)
    role_record record;
    -- Loop record for iterating unique selected_columns within a role (inner loop)
    cols_record record;
    -- Subscription ids visible at the role level (before fanning out by selected_columns)
    visible_role_sub_ids uuid[] = '{}';

begin
    perform set_config('role', null, true);

    columns =
        array_agg(
            (
                x->>'name',
                x->>'type',
                x->>'typeoid',
                realtime.cast(
                    (x->'value') #>> '{}',
                    coalesce(
                        (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                        (x->>'type')::regtype
                    )
                ),
                (pks ->> 'name') is not null,
                true
            )::realtime.wal_column
        )
        from
            jsonb_array_elements(wal -> 'columns') x
            left join jsonb_array_elements(wal -> 'pk') pks
                on (x ->> 'name') = (pks ->> 'name');

    old_columns =
        array_agg(
            (
                x->>'name',
                x->>'type',
                x->>'typeoid',
                realtime.cast(
                    (x->'value') #>> '{}',
                    coalesce(
                        (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                        (x->>'type')::regtype
                    )
                ),
                (pks ->> 'name') is not null,
                true
            )::realtime.wal_column
        )
        from
            jsonb_array_elements(wal -> 'identity') x
            left join jsonb_array_elements(wal -> 'pk') pks
                on (x ->> 'name') = (pks ->> 'name');

    for role_record in
        select claims_role
        from (select distinct claims_role from unnest(subscriptions)) t
        order by claims_role::text
    loop
        working_role := role_record.claims_role;

        -- Update `is_selectable` for columns and old_columns (once per role)
        columns =
            array_agg(
                (
                    c.name,
                    c.type_name,
                    c.type_oid,
                    c.value,
                    c.is_pkey,
                    pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
                )::realtime.wal_column
            )
            from
                unnest(columns) c;

        old_columns =
                array_agg(
                    (
                        c.name,
                        c.type_name,
                        c.type_oid,
                        c.value,
                        c.is_pkey,
                        pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
                    )::realtime.wal_column
                )
                from
                    unnest(old_columns) c;

        if action <> 'DELETE' and count(1) = 0 from unnest(columns) c where c.is_pkey then
            -- Fan out 400 error per distinct selected_columns for this role
            for cols_record in
                select selected_columns
                from (select distinct selected_columns from unnest(subscriptions) s where s.claims_role = working_role) t
                order by coalesce(array_to_string(selected_columns, ','), '')
            loop
                working_selected_columns := cols_record.selected_columns;
                return next (
                    jsonb_build_object(
                        'schema', wal ->> 'schema',
                        'table', wal ->> 'table',
                        'type', action
                    ),
                    is_rls_enabled,
                    (select array_agg(s.subscription_id) from unnest(subscriptions) as s where s.claims_role = working_role and (s.selected_columns is not distinct from working_selected_columns)),
                    array['Error 400: Bad Request, no primary key']
                )::realtime.wal_rls;
            end loop;

        -- The claims role does not have SELECT permission to the primary key of entity
        elsif action <> 'DELETE' and sum(c.is_selectable::int) <> count(1) from unnest(columns) c where c.is_pkey then
            -- Fan out 401 error per distinct selected_columns for this role
            for cols_record in
                select selected_columns
                from (select distinct selected_columns from unnest(subscriptions) s where s.claims_role = working_role) t
                order by coalesce(array_to_string(selected_columns, ','), '')
            loop
                working_selected_columns := cols_record.selected_columns;
                return next (
                    jsonb_build_object(
                        'schema', wal ->> 'schema',
                        'table', wal ->> 'table',
                        'type', action
                    ),
                    is_rls_enabled,
                    (select array_agg(s.subscription_id) from unnest(subscriptions) as s where s.claims_role = working_role and (s.selected_columns is not distinct from working_selected_columns)),
                    array['Error 401: Unauthorized']
                )::realtime.wal_rls;
            end loop;

        else
            -- Create the prepared statement (once per role)
            if is_rls_enabled and action <> 'DELETE' then
                if (select 1 from pg_prepared_statements where name = 'walrus_rls_stmt' limit 1) > 0 then
                    deallocate walrus_rls_stmt;
                end if;
                execute realtime.build_prepared_statement_sql('walrus_rls_stmt', entity_, columns);
            end if;

            -- Collect all visible subscription IDs for this role (filter check + RLS check)
            visible_role_sub_ids = '{}';

            for subscription_id, claims in (
                    select
                        subs.subscription_id,
                        subs.claims
                    from
                        unnest(subscriptions) subs
                    where
                        subs.entity = entity_
                        and subs.claims_role = working_role
                        and (
                            realtime.is_visible_through_filters(columns, subs.filters)
                            or (
                              action = 'DELETE'
                              and realtime.is_visible_through_filters(old_columns, subs.filters)
                            )
                        )
            ) loop

                if not is_rls_enabled or action = 'DELETE' then
                    visible_role_sub_ids = visible_role_sub_ids || subscription_id;
                else
                    -- Check if RLS allows the role to see the record
                    perform
                        -- Trim leading and trailing quotes from working_role because set_config
                        -- doesn't recognize the role as valid if they are included
                        set_config('role', trim(both '"' from working_role::text), true),
                        set_config('request.jwt.claims', claims::text, true);

                    execute 'execute walrus_rls_stmt' into subscription_has_access;

                    if subscription_has_access then
                        visible_role_sub_ids = visible_role_sub_ids || subscription_id;
                    end if;
                end if;
            end loop;

            perform set_config('role', null, true);

            -- Inner loop: per distinct selected_columns for this role
            for cols_record in
                select selected_columns
                from (select distinct selected_columns from unnest(subscriptions) s where s.claims_role = working_role) t
                order by coalesce(array_to_string(selected_columns, ','), '')
            loop
                working_selected_columns := cols_record.selected_columns;

                output = jsonb_build_object(
                    'schema', wal ->> 'schema',
                    'table', wal ->> 'table',
                    'type', action,
                    'commit_timestamp', to_char(
                        ((wal ->> 'timestamp')::timestamptz at time zone 'utc'),
                        'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
                    ),
                    'columns', (
                        select
                            jsonb_agg(
                                jsonb_build_object(
                                    'name', pa.attname,
                                    'type', pt.typname
                                )
                                order by pa.attnum asc
                            )
                        from
                            pg_attribute pa
                            join pg_type pt
                                on pa.atttypid = pt.oid
                            left join (
                                select unnest(conkey) as pkey_attnum
                                from pg_constraint
                                where conrelid = entity_ and contype = 'p'
                            ) pk on pk.pkey_attnum = pa.attnum
                        where
                            attrelid = entity_
                            and attnum > 0
                            and pg_catalog.has_column_privilege(working_role, entity_, pa.attname, 'SELECT')
                            and (working_selected_columns is null or pa.attname = any(working_selected_columns) or pk.pkey_attnum is not null)
                    )
                )
                -- Add "record" key for insert and update
                || case
                    when action in ('INSERT', 'UPDATE') then
                        jsonb_build_object(
                            'record',
                            (
                                select
                                    jsonb_object_agg(
                                        -- if unchanged toast, get column name and value from old record
                                        coalesce((c).name, (oc).name),
                                        case
                                            when (c).name is null then (oc).value
                                            else (c).value
                                        end
                                    )
                                from
                                    unnest(columns) c
                                    full outer join unnest(old_columns) oc
                                        on (c).name = (oc).name
                                where
                                    coalesce((c).is_selectable, (oc).is_selectable)
                                    and (working_selected_columns is null or coalesce((c).name, (oc).name) = any(working_selected_columns) or coalesce((c).is_pkey, (oc).is_pkey))
                                    and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                            )
                        )
                    else '{}'::jsonb
                end
                -- Add "old_record" key for update and delete
                || case
                    when action = 'UPDATE' then
                        jsonb_build_object(
                                'old_record',
                                (
                                    select jsonb_object_agg((c).name, (c).value)
                                    from unnest(old_columns) c
                                    where
                                        (c).is_selectable
                                        and (working_selected_columns is null or (c).name = any(working_selected_columns) or (c).is_pkey)
                                        and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                                )
                            )
                    when action = 'DELETE' then
                        jsonb_build_object(
                            'old_record',
                            (
                                select jsonb_object_agg((c).name, (c).value)
                                from unnest(old_columns) c
                                where
                                    (c).is_selectable
                                    and (working_selected_columns is null or (c).name = any(working_selected_columns) or (c).is_pkey)
                                    and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                                    and ( not is_rls_enabled or (c).is_pkey ) -- if RLS enabled, we can't secure deletes so filter to pkey
                            )
                        )
                    else '{}'::jsonb
                end;

                -- Filter visible_role_sub_ids to those matching the current selected_columns group
                visible_to_subscription_ids = coalesce(
                    (
                        select array_agg(s.subscription_id)
                        from unnest(subscriptions) s
                        where s.claims_role = working_role
                          and (s.selected_columns is not distinct from working_selected_columns)
                          and s.subscription_id = any(visible_role_sub_ids)
                    ),
                    '{}'::uuid[]
                );

                return next (
                    output,
                    is_rls_enabled,
                    visible_to_subscription_ids,
                    case
                        when error_record_exceeds_max_size then array['Error 413: Payload Too Large']
                        else '{}'
                    end
                )::realtime.wal_rls;
            end loop;

        end if;
    end loop;

    perform set_config('role', null, true);
end;
$$;


ALTER FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) OWNER TO supabase_admin;

--
-- Name: broadcast_changes(text, text, text, text, text, record, record, text); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text DEFAULT 'ROW'::text) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    -- Declare a variable to hold the JSONB representation of the row
    row_data jsonb := '{}'::jsonb;
BEGIN
    IF level = 'STATEMENT' THEN
        RAISE EXCEPTION 'function can only be triggered for each row, not for each statement';
    END IF;
    -- Check the operation type and handle accordingly
    IF operation = 'INSERT' OR operation = 'UPDATE' OR operation = 'DELETE' THEN
        row_data := jsonb_build_object('old_record', OLD, 'record', NEW, 'operation', operation, 'table', table_name, 'schema', table_schema);
        PERFORM realtime.send (row_data, event_name, topic_name);
    ELSE
        RAISE EXCEPTION 'Unexpected operation type: %', operation;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to process the row: %', SQLERRM;
END;

$$;


ALTER FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) OWNER TO supabase_admin;

--
-- Name: build_prepared_statement_sql(text, regclass, realtime.wal_column[]); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) RETURNS text
    LANGUAGE sql
    AS $$
      /*
      Builds a sql string that, if executed, creates a prepared statement to
      tests retrive a row from *entity* by its primary key columns.
      Example
          select realtime.build_prepared_statement_sql('public.notes', '{"id"}'::text[], '{"bigint"}'::text[])
      */
          select
      'prepare ' || prepared_statement_name || ' as
          select
              exists(
                  select
                      1
                  from
                      ' || entity || '
                  where
                      ' || string_agg(quote_ident(pkc.name) || '=' || quote_nullable(pkc.value #>> '{}') , ' and ') || '
              )'
          from
              unnest(columns) pkc
          where
              pkc.is_pkey
          group by
              entity
      $$;


ALTER FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) OWNER TO supabase_admin;

--
-- Name: cast(text, regtype); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime."cast"(val text, type_ regtype) RETURNS jsonb
    LANGUAGE plpgsql IMMUTABLE
    AS $$
declare
  res jsonb;
begin
  if type_::text = 'bytea' then
    return to_jsonb(val);
  end if;
  execute format('select to_jsonb(%L::'|| type_::text || ')', val) into res;
  return res;
end
$$;


ALTER FUNCTION realtime."cast"(val text, type_ regtype) OWNER TO supabase_admin;

--
-- Name: check_equality_op(realtime.equality_op, regtype, text, text); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) RETURNS boolean
    LANGUAGE plpgsql IMMUTABLE
    AS $$
/*
Casts *val_1* and *val_2* as type *type_* and check the *op* condition for truthiness
*/
declare
    op_symbol text = (
        case
            when op = 'eq' then '='
            when op = 'neq' then '!='
            when op = 'lt' then '<'
            when op = 'lte' then '<='
            when op = 'gt' then '>'
            when op = 'gte' then '>='
            when op = 'in' then '= any'
            else 'UNKNOWN OP'
        end
    );
    res boolean;
begin
    execute format(
        'select %L::'|| type_::text || ' ' || op_symbol
        || ' ( %L::'
        || (
            case
                when op = 'in' then type_::text || '[]'
                else type_::text end
        )
        || ')', val_1, val_2) into res;
    return res;
end;
$$;


ALTER FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) OWNER TO supabase_admin;

--
-- Name: check_equality_op(realtime.equality_op, regtype, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text, negate boolean) RETURNS boolean
    LANGUAGE plpgsql STABLE
    AS $$
declare
    op_symbol text;
    res boolean;
begin
    -- IS DISTINCT FROM / IS NOT DISTINCT FROM: infix, both sides typed literals
    if op = 'isdistinct' then
        execute format(
            'select %L::%s %s %L::%s',
            val_1,
            type_::text,
            case when negate then 'IS NOT DISTINCT FROM' else 'IS DISTINCT FROM' end,
            val_2,
            type_::text
        ) into res;
        return res;
    end if;

    -- IS requires a keyword RHS (NULL, TRUE, FALSE, UNKNOWN), not a typed literal
    if op = 'is' then
        if val_2 not in ('null', 'true', 'false', 'unknown') then
            raise exception 'invalid value for is filter: must be null, true, false, or unknown';
        end if;
        execute format(
            'select %L::%s %s %s',
            val_1,
            type_::text,
            case when negate then 'IS NOT' else 'IS' end,
            upper(val_2)
        ) into res;
        return res;
    end if;

    op_symbol = case
        when op = 'eq'    then '='
        when op = 'neq'   then '!='
        when op = 'lt'    then '<'
        when op = 'lte'   then '<='
        when op = 'gt'    then '>'
        when op = 'gte'   then '>='
        when op = 'in'    then '= any'
        when op = 'like'   then 'LIKE'
        when op = 'ilike'  then 'ILIKE'
        when op = 'match'  then '~'
        when op = 'imatch' then '~*'
        else null
    end;

    if op_symbol is null then
        raise exception 'unsupported equality operator: %', op::text;
    end if;

    execute format(
        'select %L::%s %s (%L::%s)',
        val_1,
        type_::text,
        op_symbol,
        val_2,
        case when op = 'in' then type_::text || '[]' else type_::text end
    ) into res;

    return case when negate then not res else res end;
end;
$$;


ALTER FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text, negate boolean) OWNER TO supabase_admin;

--
-- Name: is_visible_through_filters(realtime.wal_column[], realtime.user_defined_filter[]); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) RETURNS boolean
    LANGUAGE sql STABLE
    AS $$
    select
        filters is null
        or array_length(filters, 1) is null
        or coalesce(
            count(col.name) = count(1)
            and sum(
                realtime.check_equality_op(
                    op:=f.op,
                    type_:=coalesce(col.type_oid::regtype, col.type_name::regtype),
                    val_1:=col.value #>> '{}',
                    val_2:=f.value,
                    negate:=coalesce(f.negate, false)
                )::int
            ) filter (where col.name is not null) = count(col.name),
            false
        )
    from
        unnest(filters) f
        left join unnest(columns) col
            on f.column_name = col.name;
$$;


ALTER FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) OWNER TO supabase_admin;

--
-- Name: list_changes(name, name, integer, integer); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) RETURNS TABLE(wal jsonb, is_rls_enabled boolean, subscription_ids uuid[], errors text[], slot_changes_count bigint)
    LANGUAGE sql
    SET log_min_messages TO 'fatal'
    AS $$
  WITH pub AS (
    SELECT
      concat_ws(
        ',',
        CASE WHEN bool_or(pubinsert) THEN 'insert' ELSE NULL END,
        CASE WHEN bool_or(pubupdate) THEN 'update' ELSE NULL END,
        CASE WHEN bool_or(pubdelete) THEN 'delete' ELSE NULL END
      ) AS w2j_actions,
      coalesce(
        string_agg(
          realtime.quote_wal2json(format('%I.%I', schemaname, tablename)::regclass),
          ','
        ) filter (WHERE ppt.tablename IS NOT NULL),
        ''
      ) AS w2j_add_tables
    FROM pg_publication pp
    LEFT JOIN pg_publication_tables ppt ON pp.pubname = ppt.pubname
    WHERE pp.pubname = publication
    GROUP BY pp.pubname
    LIMIT 1
  ),
  -- MATERIALIZED ensures pg_logical_slot_get_changes is called exactly once
  w2j AS MATERIALIZED (
    SELECT x.*, pub.w2j_add_tables
    FROM pub,
         pg_logical_slot_get_changes(
           slot_name, null, max_changes,
           'include-pk', 'true',
           'include-transaction', 'false',
           'include-timestamp', 'true',
           'include-type-oids', 'true',
           'format-version', '2',
           'actions', pub.w2j_actions,
           'add-tables', pub.w2j_add_tables
         ) x
  ),
  slot_count AS (
    SELECT count(*)::bigint AS cnt
    FROM w2j
    WHERE w2j.w2j_add_tables <> ''
  ),
  rls_filtered AS (
    SELECT xyz.wal, xyz.is_rls_enabled, xyz.subscription_ids, xyz.errors
    FROM w2j,
         realtime.apply_rls(
           wal := w2j.data::jsonb,
           max_record_bytes := max_record_bytes
         ) xyz(wal, is_rls_enabled, subscription_ids, errors)
    WHERE w2j.w2j_add_tables <> ''
      AND xyz.subscription_ids[1] IS NOT NULL
  )
  SELECT rf.wal, rf.is_rls_enabled, rf.subscription_ids, rf.errors, sc.cnt
  FROM rls_filtered rf, slot_count sc

  UNION ALL

  SELECT null, null, null, null, sc.cnt
  FROM slot_count sc
  WHERE NOT EXISTS (SELECT 1 FROM rls_filtered)
$$;


ALTER FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) OWNER TO supabase_admin;

--
-- Name: quote_wal2json(regclass); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.quote_wal2json(entity regclass) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
  SELECT
    realtime.wal2json_escape_identifier(nsp.nspname::text)
    || '.'
    || realtime.wal2json_escape_identifier(pc.relname::text)
  FROM pg_class pc
  JOIN pg_namespace nsp ON pc.relnamespace = nsp.oid
  WHERE pc.oid = entity
$$;


ALTER FUNCTION realtime.quote_wal2json(entity regclass) OWNER TO supabase_admin;

--
-- Name: send(jsonb, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean DEFAULT true) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
  generated_id uuid;
  final_payload jsonb;
BEGIN
  BEGIN
    generated_id := gen_random_uuid();

    -- Check if payload has an 'id' key, if not, add the generated UUID
    IF payload ? 'id' THEN
      final_payload := payload;
    ELSE
      final_payload := jsonb_set(payload, '{id}', to_jsonb(generated_id));
    END IF;

    -- Set the topic configuration
    EXECUTE format('SET LOCAL realtime.topic TO %L', topic);

    INSERT INTO realtime.messages (id, payload, event, topic, private, extension)
    VALUES (generated_id, final_payload, event, topic, private, 'broadcast');
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'WarnSendingBroadcastMessage: %', SQLERRM;
  END;
END;
$$;


ALTER FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) OWNER TO supabase_admin;

--
-- Name: send_binary(bytea, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.send_binary(payload bytea, event text, topic text, private boolean DEFAULT true) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
  generated_id uuid;
BEGIN
  BEGIN
    generated_id := gen_random_uuid();

    EXECUTE format('SET LOCAL realtime.topic TO %L', topic);

    INSERT INTO realtime.messages (id, binary_payload, event, topic, private, extension)
    VALUES (generated_id, payload, event, topic, private, 'broadcast');
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'WarnSendingBroadcastMessage: %', SQLERRM;
  END;
END;
$$;


ALTER FUNCTION realtime.send_binary(payload bytea, event text, topic text, private boolean) OWNER TO supabase_admin;

--
-- Name: subscription_check_filters(); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.subscription_check_filters() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
declare
    col_names text[] = coalesce(
            array_agg(a.attname order by a.attnum),
            '{}'::text[]
        )
        from
            pg_catalog.pg_attribute a
        where
            a.attrelid = new.entity
            and a.attnum > 0
            and not a.attisdropped
            and pg_catalog.has_column_privilege(
                (new.claims ->> 'role'),
                a.attrelid,
                a.attnum,
                'SELECT'
            );
    filter realtime.user_defined_filter;
    col_type regtype;
    in_val jsonb;
    selected_col text;
begin
    for filter in select * from unnest(new.filters) loop
        if not filter.column_name = any(col_names) then
            raise exception 'invalid column for filter %', filter.column_name;
        end if;

        col_type = (
            select atttypid::regtype
            from pg_catalog.pg_attribute
            where attrelid = new.entity
                  and attname = filter.column_name
        );
        if col_type is null then
            raise exception 'failed to lookup type for column %', filter.column_name;
        end if;

        if filter.op = 'in'::realtime.equality_op then
            in_val = realtime.cast(filter.value, (col_type::text || '[]')::regtype);
            if coalesce(jsonb_array_length(in_val), 0) > 100 then
                raise exception 'too many values for `in` filter. Maximum 100';
            end if;
        elsif filter.op = 'is'::realtime.equality_op then
            -- `is` requires a keyword RHS rather than a typed literal
            if filter.value not in ('null', 'true', 'false', 'unknown') then
                raise exception 'invalid value for is filter: must be null, true, false, or unknown';
            end if;
            -- IS NULL works for any type, but IS TRUE/FALSE/UNKNOWN require a boolean
            -- operand. Reject the non-null keywords on non-boolean columns here so they
            -- don't abort apply_rls at WAL time.
            if filter.value <> 'null' and col_type <> 'boolean'::regtype then
                raise exception 'is % filter requires a boolean column, got %', filter.value, col_type::text;
            end if;
        elsif filter.op in ('like'::realtime.equality_op, 'ilike'::realtime.equality_op) then
            -- like/ilike apply the text pattern operator (~~); reject column types that
            -- have no such operator instead of failing at WAL time
            if not exists (
                select 1 from pg_catalog.pg_operator
                where oprname = '~~' and oprleft = col_type
            ) then
                raise exception 'operator % requires a text-compatible column type, got %', filter.op::text, col_type::text;
            end if;
        elsif filter.op in ('match'::realtime.equality_op, 'imatch'::realtime.equality_op) then
            -- match/imatch apply the regex operators ~ / ~*; reject column types that have
            -- no such operator (e.g. integer) instead of failing at WAL time, mirroring the
            -- like/ilike guard above.
            if not exists (
                select 1 from pg_catalog.pg_operator
                where oprname = case when filter.op = 'imatch'::realtime.equality_op then '~*' else '~' end
                  and oprleft = col_type
                  and oprright = col_type
                  and oprresult = 'boolean'::regtype
            ) then
                raise exception 'operator % requires a text-compatible column type, got %', filter.op::text, col_type::text;
            end if;
            -- validate the regex eagerly so a bad pattern is rejected here, not inside
            -- apply_rls where it would abort the WAL stream for the entity
            begin
                perform '' ~ filter.value;
            exception when others then
                raise exception 'invalid regular expression for % filter: %', filter.op::text, sqlerrm;
            end;
        else
            -- eq/neq/lt/lte/gt/gte: value must be coercable to the type
            perform realtime.cast(filter.value, col_type);
        end if;
    end loop;

    if new.selected_columns is not null then
        for selected_col in select * from unnest(new.selected_columns) loop
            if not selected_col = any(col_names) then
                raise exception 'invalid column for select %', selected_col;
            end if;
        end loop;
    end if;

    -- Apply consistent order to filters so the unique constraint can't be tricked by a
    -- different filter order. negate is part of the sort key.
    new.filters = coalesce(
        array_agg(f order by f.column_name, f.op, f.value, f.negate),
        '{}'
    ) from unnest(new.filters) f;

    new.selected_columns = (
        select array_agg(c order by c)
        from unnest(new.selected_columns) c
    );

    return new;
end;
$$;


ALTER FUNCTION realtime.subscription_check_filters() OWNER TO supabase_admin;

--
-- Name: to_regrole(text); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.to_regrole(role_name text) RETURNS regrole
    LANGUAGE sql IMMUTABLE
    AS $$ select role_name::regrole $$;


ALTER FUNCTION realtime.to_regrole(role_name text) OWNER TO supabase_admin;

--
-- Name: topic(); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.topic() RETURNS text
    LANGUAGE sql STABLE
    AS $$
select nullif(current_setting('realtime.topic', true), '')::text;
$$;


ALTER FUNCTION realtime.topic() OWNER TO supabase_realtime_admin;

--
-- Name: wal2json_escape_identifier(text); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.wal2json_escape_identifier(name text) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
  -- Prefix `\`, `,`, `.`, and any whitespace with `\`
  SELECT regexp_replace(name, '([\\,.[:space:]])', '\\\1', 'g')
$$;


ALTER FUNCTION realtime.wal2json_escape_identifier(name text) OWNER TO supabase_admin;

--
-- Name: allow_any_operation(text[]); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.allow_any_operation(expected_operations text[]) RETURNS boolean
    LANGUAGE sql STABLE
    AS $$
  WITH current_operation AS (
    SELECT storage.operation() AS raw_operation
  ),
  normalized AS (
    SELECT CASE
      WHEN raw_operation LIKE 'storage.%' THEN substr(raw_operation, 9)
      ELSE raw_operation
    END AS current_operation
    FROM current_operation
  )
  SELECT EXISTS (
    SELECT 1
    FROM normalized n
    CROSS JOIN LATERAL unnest(expected_operations) AS expected_operation
    WHERE expected_operation IS NOT NULL
      AND expected_operation <> ''
      AND n.current_operation = CASE
        WHEN expected_operation LIKE 'storage.%' THEN substr(expected_operation, 9)
        ELSE expected_operation
      END
  );
$$;


ALTER FUNCTION storage.allow_any_operation(expected_operations text[]) OWNER TO supabase_storage_admin;

--
-- Name: allow_only_operation(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.allow_only_operation(expected_operation text) RETURNS boolean
    LANGUAGE sql STABLE
    AS $$
  WITH current_operation AS (
    SELECT storage.operation() AS raw_operation
  ),
  normalized AS (
    SELECT
      CASE
        WHEN raw_operation LIKE 'storage.%' THEN substr(raw_operation, 9)
        ELSE raw_operation
      END AS current_operation,
      CASE
        WHEN expected_operation LIKE 'storage.%' THEN substr(expected_operation, 9)
        ELSE expected_operation
      END AS requested_operation
    FROM current_operation
  )
  SELECT CASE
    WHEN requested_operation IS NULL OR requested_operation = '' THEN FALSE
    ELSE COALESCE(current_operation = requested_operation, FALSE)
  END
  FROM normalized;
$$;


ALTER FUNCTION storage.allow_only_operation(expected_operation text) OWNER TO supabase_storage_admin;

--
-- Name: can_insert_object(text, text, uuid, jsonb); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO "storage"."objects" ("bucket_id", "name", "owner", "metadata") VALUES (bucketid, name, owner, metadata);
  -- hack to rollback the successful insert
  RAISE sqlstate 'PT200' using
  message = 'ROLLBACK',
  detail = 'rollback successful insert';
END
$$;


ALTER FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) OWNER TO supabase_storage_admin;

--
-- Name: enforce_bucket_name_length(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.enforce_bucket_name_length() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
    if length(new.name) > 100 then
        raise exception 'bucket name "%" is too long (% characters). Max is 100.', new.name, length(new.name);
    end if;
    return new;
end;
$$;


ALTER FUNCTION storage.enforce_bucket_name_length() OWNER TO supabase_storage_admin;

--
-- Name: extension(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.extension(name text) RETURNS text
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
    _filename text;
BEGIN
    -- Split on "/" to get path segments
    SELECT string_to_array(name, '/') INTO _parts;
    -- Get the last path segment (the actual filename)
    SELECT _parts[array_length(_parts, 1)] INTO _filename;
    -- Extract extension: reverse, split on '.', then reverse again
    RETURN reverse(split_part(reverse(_filename), '.', 1));
END
$$;


ALTER FUNCTION storage.extension(name text) OWNER TO supabase_storage_admin;

--
-- Name: filename(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.filename(name text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[array_length(_parts,1)];
END
$$;


ALTER FUNCTION storage.filename(name text) OWNER TO supabase_storage_admin;

--
-- Name: foldername(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.foldername(name text) RETURNS text[]
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
BEGIN
    -- Split on "/" to get path segments
    SELECT string_to_array(name, '/') INTO _parts;
    -- Return everything except the last segment
    RETURN _parts[1 : array_length(_parts,1) - 1];
END
$$;


ALTER FUNCTION storage.foldername(name text) OWNER TO supabase_storage_admin;

--
-- Name: get_common_prefix(text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.get_common_prefix(p_key text, p_prefix text, p_delimiter text) RETURNS text
    LANGUAGE sql IMMUTABLE
    AS $$
SELECT CASE
    WHEN position(p_delimiter IN substring(p_key FROM length(p_prefix) + 1)) > 0
    THEN left(p_key, length(p_prefix) + position(p_delimiter IN substring(p_key FROM length(p_prefix) + 1)))
    ELSE NULL
END;
$$;


ALTER FUNCTION storage.get_common_prefix(p_key text, p_prefix text, p_delimiter text) OWNER TO supabase_storage_admin;

--
-- Name: get_size_by_bucket(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.get_size_by_bucket() RETURNS TABLE(size bigint, bucket_id text)
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    return query
        select sum((metadata->>'size')::bigint)::bigint as size, obj.bucket_id
        from "storage".objects as obj
        group by obj.bucket_id;
END
$$;


ALTER FUNCTION storage.get_size_by_bucket() OWNER TO supabase_storage_admin;

--
-- Name: list_multipart_uploads_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, next_key_token text DEFAULT ''::text, next_upload_token text DEFAULT ''::text) RETURNS TABLE(key text, id text, created_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(key COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                        substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1)))
                    ELSE
                        key
                END AS key, id, created_at
            FROM
                storage.s3_multipart_uploads
            WHERE
                bucket_id = $5 AND
                key ILIKE $1 || ''%'' AND
                CASE
                    WHEN $4 != '''' AND $6 = '''' THEN
                        CASE
                            WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                                substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                key COLLATE "C" > $4
                            END
                    ELSE
                        true
                END AND
                CASE
                    WHEN $6 != '''' THEN
                        id COLLATE "C" > $6
                    ELSE
                        true
                    END
            ORDER BY
                key COLLATE "C" ASC, created_at ASC) as e order by key COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_key_token, bucket_id, next_upload_token;
END;
$_$;


ALTER FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer, next_key_token text, next_upload_token text) OWNER TO supabase_storage_admin;

--
-- Name: list_objects_with_delimiter(text, text, text, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.list_objects_with_delimiter(_bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, start_after text DEFAULT ''::text, next_token text DEFAULT ''::text, sort_order text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, metadata jsonb, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    v_peek_name TEXT;
    v_current RECORD;
    v_common_prefix TEXT;

    -- Configuration
    v_is_asc BOOLEAN;
    v_prefix TEXT;
    v_start TEXT;
    v_upper_bound TEXT;
    v_file_batch_size INT;

    -- Seek state
    v_next_seek TEXT;
    v_count INT := 0;

    -- Dynamic SQL for batch query only
    v_batch_query TEXT;

BEGIN
    -- ========================================================================
    -- INITIALIZATION
    -- ========================================================================
    v_is_asc := lower(coalesce(sort_order, 'asc')) = 'asc';
    v_prefix := coalesce(prefix_param, '');
    v_start := CASE WHEN coalesce(next_token, '') <> '' THEN next_token ELSE coalesce(start_after, '') END;
    v_file_batch_size := LEAST(GREATEST(max_keys * 2, 100), 1000);

    -- Calculate upper bound for prefix filtering (bytewise, using COLLATE "C")
    IF v_prefix = '' THEN
        v_upper_bound := NULL;
    ELSIF right(v_prefix, 1) = delimiter_param THEN
        v_upper_bound := left(v_prefix, -1) || chr(ascii(delimiter_param) + 1);
    ELSE
        v_upper_bound := left(v_prefix, -1) || chr(ascii(right(v_prefix, 1)) + 1);
    END IF;

    -- Build batch query (dynamic SQL - called infrequently, amortized over many rows)
    IF v_is_asc THEN
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" >= $2 ' ||
                'AND o.name COLLATE "C" < $3 ORDER BY o.name COLLATE "C" ASC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" >= $2 ' ||
                'ORDER BY o.name COLLATE "C" ASC LIMIT $4';
        END IF;
    ELSE
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" < $2 ' ||
                'AND o.name COLLATE "C" >= $3 ORDER BY o.name COLLATE "C" DESC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" < $2 ' ||
                'ORDER BY o.name COLLATE "C" DESC LIMIT $4';
        END IF;
    END IF;

    -- ========================================================================
    -- SEEK INITIALIZATION: Determine starting position
    -- ========================================================================
    IF v_start = '' THEN
        IF v_is_asc THEN
            v_next_seek := v_prefix;
        ELSE
            -- DESC without cursor: find the last item in range
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_next_seek FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_prefix AND o.name COLLATE "C" < v_upper_bound
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSIF v_prefix <> '' THEN
                SELECT o.name INTO v_next_seek FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_prefix
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSE
                SELECT o.name INTO v_next_seek FROM storage.objects o
                WHERE o.bucket_id = _bucket_id
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            END IF;

            IF v_next_seek IS NOT NULL THEN
                v_next_seek := v_next_seek || delimiter_param;
            ELSE
                RETURN;
            END IF;
        END IF;
    ELSE
        -- Cursor provided: determine if it refers to a folder or leaf
        IF EXISTS (
            SELECT 1 FROM storage.objects o
            WHERE o.bucket_id = _bucket_id
              AND o.name COLLATE "C" LIKE v_start || delimiter_param || '%'
            LIMIT 1
        ) THEN
            -- Cursor refers to a folder
            IF v_is_asc THEN
                v_next_seek := v_start || chr(ascii(delimiter_param) + 1);
            ELSE
                v_next_seek := v_start || delimiter_param;
            END IF;
        ELSE
            -- Cursor refers to a leaf object
            IF v_is_asc THEN
                v_next_seek := v_start || delimiter_param;
            ELSE
                v_next_seek := v_start;
            END IF;
        END IF;
    END IF;

    -- ========================================================================
    -- MAIN LOOP: Hybrid peek-then-batch algorithm
    -- Uses STATIC SQL for peek (hot path) and DYNAMIC SQL for batch
    -- ========================================================================
    LOOP
        EXIT WHEN v_count >= max_keys;

        -- STEP 1: PEEK using STATIC SQL (plan cached, very fast)
        IF v_is_asc THEN
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_next_seek AND o.name COLLATE "C" < v_upper_bound
                ORDER BY o.name COLLATE "C" ASC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_next_seek
                ORDER BY o.name COLLATE "C" ASC LIMIT 1;
            END IF;
        ELSE
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" < v_next_seek AND o.name COLLATE "C" >= v_prefix
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSIF v_prefix <> '' THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" < v_next_seek AND o.name COLLATE "C" >= v_prefix
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" < v_next_seek
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            END IF;
        END IF;

        EXIT WHEN v_peek_name IS NULL;

        -- STEP 2: Check if this is a FOLDER or FILE
        v_common_prefix := storage.get_common_prefix(v_peek_name, v_prefix, delimiter_param);

        IF v_common_prefix IS NOT NULL THEN
            -- FOLDER: Emit and skip to next folder (no heap access needed)
            name := rtrim(v_common_prefix, delimiter_param);
            id := NULL;
            updated_at := NULL;
            created_at := NULL;
            last_accessed_at := NULL;
            metadata := NULL;
            RETURN NEXT;
            v_count := v_count + 1;

            -- Advance seek past the folder range
            IF v_is_asc THEN
                v_next_seek := left(v_common_prefix, -1) || chr(ascii(delimiter_param) + 1);
            ELSE
                v_next_seek := v_common_prefix;
            END IF;
        ELSE
            -- FILE: Batch fetch using DYNAMIC SQL (overhead amortized over many rows)
            -- For ASC: upper_bound is the exclusive upper limit (< condition)
            -- For DESC: prefix is the inclusive lower limit (>= condition)
            FOR v_current IN EXECUTE v_batch_query USING _bucket_id, v_next_seek,
                CASE WHEN v_is_asc THEN COALESCE(v_upper_bound, v_prefix) ELSE v_prefix END, v_file_batch_size
            LOOP
                v_common_prefix := storage.get_common_prefix(v_current.name, v_prefix, delimiter_param);

                IF v_common_prefix IS NOT NULL THEN
                    -- Hit a folder: exit batch, let peek handle it
                    v_next_seek := v_current.name;
                    EXIT;
                END IF;

                -- Emit file
                name := v_current.name;
                id := v_current.id;
                updated_at := v_current.updated_at;
                created_at := v_current.created_at;
                last_accessed_at := v_current.last_accessed_at;
                metadata := v_current.metadata;
                RETURN NEXT;
                v_count := v_count + 1;

                -- Advance seek past this file
                IF v_is_asc THEN
                    v_next_seek := v_current.name || delimiter_param;
                ELSE
                    v_next_seek := v_current.name;
                END IF;

                EXIT WHEN v_count >= max_keys;
            END LOOP;
        END IF;
    END LOOP;
END;
$_$;


ALTER FUNCTION storage.list_objects_with_delimiter(_bucket_id text, prefix_param text, delimiter_param text, max_keys integer, start_after text, next_token text, sort_order text) OWNER TO supabase_storage_admin;

--
-- Name: operation(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.operation() RETURNS text
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    RETURN current_setting('storage.operation', true);
END;
$$;


ALTER FUNCTION storage.operation() OWNER TO supabase_storage_admin;

--
-- Name: protect_delete(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.protect_delete() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Check if storage.allow_delete_query is set to 'true'
    IF COALESCE(current_setting('storage.allow_delete_query', true), 'false') != 'true' THEN
        RAISE EXCEPTION 'Direct deletion from storage tables is not allowed. Use the Storage API instead.'
            USING HINT = 'This prevents accidental data loss from orphaned objects.',
                  ERRCODE = '42501';
    END IF;
    RETURN NULL;
END;
$$;


ALTER FUNCTION storage.protect_delete() OWNER TO supabase_storage_admin;

--
-- Name: search(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    v_peek_name TEXT;
    v_current RECORD;
    v_common_prefix TEXT;
    v_delimiter CONSTANT TEXT := '/';

    -- Configuration
    v_limit INT;
    v_prefix TEXT;
    v_prefix_lower TEXT;
    v_is_asc BOOLEAN;
    v_order_by TEXT;
    v_sort_order TEXT;
    v_upper_bound TEXT;
    v_file_batch_size INT;

    -- Dynamic SQL for batch query only
    v_batch_query TEXT;

    -- Seek state
    v_next_seek TEXT;
    v_count INT := 0;
    v_skipped INT := 0;
BEGIN
    -- ========================================================================
    -- INITIALIZATION
    -- ========================================================================
    v_limit := LEAST(coalesce(limits, 100), 1500);
    v_prefix := coalesce(prefix, '') || coalesce(search, '');
    v_prefix_lower := lower(v_prefix);
    v_is_asc := lower(coalesce(sortorder, 'asc')) = 'asc';
    v_file_batch_size := LEAST(GREATEST(v_limit * 2, 100), 1000);

    -- Validate sort column
    CASE lower(coalesce(sortcolumn, 'name'))
        WHEN 'name' THEN v_order_by := 'name';
        WHEN 'updated_at' THEN v_order_by := 'updated_at';
        WHEN 'created_at' THEN v_order_by := 'created_at';
        WHEN 'last_accessed_at' THEN v_order_by := 'last_accessed_at';
        ELSE v_order_by := 'name';
    END CASE;

    v_sort_order := CASE WHEN v_is_asc THEN 'asc' ELSE 'desc' END;

    -- ========================================================================
    -- NON-NAME SORTING: Use path_tokens approach (unchanged)
    -- ========================================================================
    IF v_order_by != 'name' THEN
        RETURN QUERY EXECUTE format(
            $sql$
            WITH folders AS (
                SELECT path_tokens[$1] AS folder
                FROM storage.objects
                WHERE objects.name ILIKE $2 || '%%'
                  AND bucket_id = $3
                  AND array_length(objects.path_tokens, 1) <> $1
                GROUP BY folder
                ORDER BY folder %s
            )
            (SELECT folder AS "name",
                   NULL::uuid AS id,
                   NULL::timestamptz AS updated_at,
                   NULL::timestamptz AS created_at,
                   NULL::timestamptz AS last_accessed_at,
                   NULL::jsonb AS metadata FROM folders)
            UNION ALL
            (SELECT path_tokens[$1] AS "name",
                   id, updated_at, created_at, last_accessed_at, metadata
             FROM storage.objects
             WHERE objects.name ILIKE $2 || '%%'
               AND bucket_id = $3
               AND array_length(objects.path_tokens, 1) = $1
             ORDER BY %I %s)
            LIMIT $4 OFFSET $5
            $sql$, v_sort_order, v_order_by, v_sort_order
        ) USING levels, v_prefix, bucketname, v_limit, offsets;
        RETURN;
    END IF;

    -- ========================================================================
    -- NAME SORTING: Hybrid skip-scan with batch optimization
    -- ========================================================================

    -- Calculate upper bound for prefix filtering
    IF v_prefix_lower = '' THEN
        v_upper_bound := NULL;
    ELSIF right(v_prefix_lower, 1) = v_delimiter THEN
        v_upper_bound := left(v_prefix_lower, -1) || chr(ascii(v_delimiter) + 1);
    ELSE
        v_upper_bound := left(v_prefix_lower, -1) || chr(ascii(right(v_prefix_lower, 1)) + 1);
    END IF;

    -- Build batch query (dynamic SQL - called infrequently, amortized over many rows)
    IF v_is_asc THEN
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" >= $2 ' ||
                'AND lower(o.name) COLLATE "C" < $3 ORDER BY lower(o.name) COLLATE "C" ASC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" >= $2 ' ||
                'ORDER BY lower(o.name) COLLATE "C" ASC LIMIT $4';
        END IF;
    ELSE
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" < $2 ' ||
                'AND lower(o.name) COLLATE "C" >= $3 ORDER BY lower(o.name) COLLATE "C" DESC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" < $2 ' ||
                'ORDER BY lower(o.name) COLLATE "C" DESC LIMIT $4';
        END IF;
    END IF;

    -- Initialize seek position
    IF v_is_asc THEN
        v_next_seek := v_prefix_lower;
    ELSE
        -- DESC: find the last item in range first (static SQL)
        IF v_upper_bound IS NOT NULL THEN
            SELECT o.name INTO v_peek_name FROM storage.objects o
            WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_prefix_lower AND lower(o.name) COLLATE "C" < v_upper_bound
            ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
        ELSIF v_prefix_lower <> '' THEN
            SELECT o.name INTO v_peek_name FROM storage.objects o
            WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_prefix_lower
            ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
        ELSE
            SELECT o.name INTO v_peek_name FROM storage.objects o
            WHERE o.bucket_id = bucketname
            ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
        END IF;

        IF v_peek_name IS NOT NULL THEN
            v_next_seek := lower(v_peek_name) || v_delimiter;
        ELSE
            RETURN;
        END IF;
    END IF;

    -- ========================================================================
    -- MAIN LOOP: Hybrid peek-then-batch algorithm
    -- Uses STATIC SQL for peek (hot path) and DYNAMIC SQL for batch
    -- ========================================================================
    LOOP
        EXIT WHEN v_count >= v_limit;

        -- STEP 1: PEEK using STATIC SQL (plan cached, very fast)
        IF v_is_asc THEN
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_next_seek AND lower(o.name) COLLATE "C" < v_upper_bound
                ORDER BY lower(o.name) COLLATE "C" ASC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_next_seek
                ORDER BY lower(o.name) COLLATE "C" ASC LIMIT 1;
            END IF;
        ELSE
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" < v_next_seek AND lower(o.name) COLLATE "C" >= v_prefix_lower
                ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
            ELSIF v_prefix_lower <> '' THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" < v_next_seek AND lower(o.name) COLLATE "C" >= v_prefix_lower
                ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" < v_next_seek
                ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
            END IF;
        END IF;

        EXIT WHEN v_peek_name IS NULL;

        -- STEP 2: Check if this is a FOLDER or FILE
        v_common_prefix := storage.get_common_prefix(lower(v_peek_name), v_prefix_lower, v_delimiter);

        IF v_common_prefix IS NOT NULL THEN
            -- FOLDER: Handle offset, emit if needed, skip to next folder
            IF v_skipped < offsets THEN
                v_skipped := v_skipped + 1;
            ELSE
                name := split_part(rtrim(storage.get_common_prefix(v_peek_name, v_prefix, v_delimiter), v_delimiter), v_delimiter, levels);
                id := NULL;
                updated_at := NULL;
                created_at := NULL;
                last_accessed_at := NULL;
                metadata := NULL;
                RETURN NEXT;
                v_count := v_count + 1;
            END IF;

            -- Advance seek past the folder range
            IF v_is_asc THEN
                v_next_seek := lower(left(v_common_prefix, -1)) || chr(ascii(v_delimiter) + 1);
            ELSE
                v_next_seek := lower(v_common_prefix);
            END IF;
        ELSE
            -- FILE: Batch fetch using DYNAMIC SQL (overhead amortized over many rows)
            -- For ASC: upper_bound is the exclusive upper limit (< condition)
            -- For DESC: prefix_lower is the inclusive lower limit (>= condition)
            FOR v_current IN EXECUTE v_batch_query
                USING bucketname, v_next_seek,
                    CASE WHEN v_is_asc THEN COALESCE(v_upper_bound, v_prefix_lower) ELSE v_prefix_lower END, v_file_batch_size
            LOOP
                v_common_prefix := storage.get_common_prefix(lower(v_current.name), v_prefix_lower, v_delimiter);

                IF v_common_prefix IS NOT NULL THEN
                    -- Hit a folder: exit batch, let peek handle it
                    v_next_seek := lower(v_current.name);
                    EXIT;
                END IF;

                -- Handle offset skipping
                IF v_skipped < offsets THEN
                    v_skipped := v_skipped + 1;
                ELSE
                    -- Emit file
                    name := split_part(v_current.name, v_delimiter, levels);
                    id := v_current.id;
                    updated_at := v_current.updated_at;
                    created_at := v_current.created_at;
                    last_accessed_at := v_current.last_accessed_at;
                    metadata := v_current.metadata;
                    RETURN NEXT;
                    v_count := v_count + 1;
                END IF;

                -- Advance seek past this file
                IF v_is_asc THEN
                    v_next_seek := lower(v_current.name) || v_delimiter;
                ELSE
                    v_next_seek := lower(v_current.name);
                END IF;

                EXIT WHEN v_count >= v_limit;
            END LOOP;
        END IF;
    END LOOP;
END;
$_$;


ALTER FUNCTION storage.search(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text) OWNER TO supabase_storage_admin;

--
-- Name: search_by_timestamp(text, text, integer, integer, text, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search_by_timestamp(p_prefix text, p_bucket_id text, p_limit integer, p_level integer, p_start_after text, p_sort_order text, p_sort_column text, p_sort_column_after text) RETURNS TABLE(key text, name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    v_cursor_op text;
    v_query text;
    v_prefix text;
BEGIN
    v_prefix := coalesce(p_prefix, '');

    IF p_sort_order = 'asc' THEN
        v_cursor_op := '>';
    ELSE
        v_cursor_op := '<';
    END IF;

    v_query := format($sql$
        WITH raw_objects AS (
            SELECT
                o.name AS obj_name,
                o.id AS obj_id,
                o.updated_at AS obj_updated_at,
                o.created_at AS obj_created_at,
                o.last_accessed_at AS obj_last_accessed_at,
                o.metadata AS obj_metadata,
                storage.get_common_prefix(o.name, $1, '/') AS common_prefix
            FROM storage.objects o
            WHERE o.bucket_id = $2
              AND o.name COLLATE "C" LIKE $1 || '%%'
        ),
        -- Aggregate common prefixes (folders)
        -- Both created_at and updated_at use MIN(obj_created_at) to match the old prefixes table behavior
        aggregated_prefixes AS (
            SELECT
                rtrim(common_prefix, '/') AS name,
                NULL::uuid AS id,
                MIN(obj_created_at) AS updated_at,
                MIN(obj_created_at) AS created_at,
                NULL::timestamptz AS last_accessed_at,
                NULL::jsonb AS metadata,
                TRUE AS is_prefix
            FROM raw_objects
            WHERE common_prefix IS NOT NULL
            GROUP BY common_prefix
        ),
        leaf_objects AS (
            SELECT
                obj_name AS name,
                obj_id AS id,
                obj_updated_at AS updated_at,
                obj_created_at AS created_at,
                obj_last_accessed_at AS last_accessed_at,
                obj_metadata AS metadata,
                FALSE AS is_prefix
            FROM raw_objects
            WHERE common_prefix IS NULL
        ),
        combined AS (
            SELECT * FROM aggregated_prefixes
            UNION ALL
            SELECT * FROM leaf_objects
        ),
        filtered AS (
            SELECT *
            FROM combined
            WHERE (
                $5 = ''
                OR ROW(
                    date_trunc('milliseconds', %I),
                    name COLLATE "C"
                ) %s ROW(
                    COALESCE(NULLIF($6, '')::timestamptz, 'epoch'::timestamptz),
                    $5
                )
            )
        )
        SELECT
            split_part(name, '/', $3) AS key,
            name,
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
        FROM filtered
        ORDER BY
            COALESCE(date_trunc('milliseconds', %I), 'epoch'::timestamptz) %s,
            name COLLATE "C" %s
        LIMIT $4
    $sql$,
        p_sort_column,
        v_cursor_op,
        p_sort_column,
        p_sort_order,
        p_sort_order
    );

    RETURN QUERY EXECUTE v_query
    USING v_prefix, p_bucket_id, p_level, p_limit, p_start_after, p_sort_column_after;
END;
$_$;


ALTER FUNCTION storage.search_by_timestamp(p_prefix text, p_bucket_id text, p_limit integer, p_level integer, p_start_after text, p_sort_order text, p_sort_column text, p_sort_column_after text) OWNER TO supabase_storage_admin;

--
-- Name: search_v2(text, text, integer, integer, text, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search_v2(prefix text, bucket_name text, limits integer DEFAULT 100, levels integer DEFAULT 1, start_after text DEFAULT ''::text, sort_order text DEFAULT 'asc'::text, sort_column text DEFAULT 'name'::text, sort_column_after text DEFAULT ''::text) RETURNS TABLE(key text, name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    v_sort_col text;
    v_sort_ord text;
    v_limit int;
BEGIN
    -- Cap limit to maximum of 1500 records
    v_limit := LEAST(coalesce(limits, 100), 1500);

    -- Validate and normalize sort_order
    v_sort_ord := lower(coalesce(sort_order, 'asc'));
    IF v_sort_ord NOT IN ('asc', 'desc') THEN
        v_sort_ord := 'asc';
    END IF;

    -- Validate and normalize sort_column
    v_sort_col := lower(coalesce(sort_column, 'name'));
    IF v_sort_col NOT IN ('name', 'updated_at', 'created_at') THEN
        v_sort_col := 'name';
    END IF;

    -- Route to appropriate implementation
    IF v_sort_col = 'name' THEN
        -- Use list_objects_with_delimiter for name sorting (most efficient: O(k * log n))
        RETURN QUERY
        SELECT
            split_part(l.name, '/', levels) AS key,
            l.name AS name,
            l.id,
            l.updated_at,
            l.created_at,
            l.last_accessed_at,
            l.metadata
        FROM storage.list_objects_with_delimiter(
            bucket_name,
            coalesce(prefix, ''),
            '/',
            v_limit,
            start_after,
            '',
            v_sort_ord
        ) l;
    ELSE
        -- Use aggregation approach for timestamp sorting
        -- Not efficient for large datasets but supports correct pagination
        RETURN QUERY SELECT * FROM storage.search_by_timestamp(
            prefix, bucket_name, v_limit, levels, start_after,
            v_sort_ord, v_sort_col, sort_column_after
        );
    END IF;
END;
$$;


ALTER FUNCTION storage.search_v2(prefix text, bucket_name text, limits integer, levels integer, start_after text, sort_order text, sort_column text, sort_column_after text) OWNER TO supabase_storage_admin;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$$;


ALTER FUNCTION storage.update_updated_at_column() OWNER TO supabase_storage_admin;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: audit_log_entries; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.audit_log_entries (
    instance_id uuid,
    id uuid NOT NULL,
    payload json,
    created_at timestamp with time zone,
    ip_address character varying(64) DEFAULT ''::character varying NOT NULL
);


ALTER TABLE auth.audit_log_entries OWNER TO supabase_auth_admin;

--
-- Name: TABLE audit_log_entries; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.audit_log_entries IS 'Auth: Audit trail for user actions.';


--
-- Name: custom_oauth_providers; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.custom_oauth_providers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    provider_type text NOT NULL,
    identifier text NOT NULL,
    name text NOT NULL,
    client_id text NOT NULL,
    client_secret text NOT NULL,
    acceptable_client_ids text[] DEFAULT '{}'::text[] NOT NULL,
    scopes text[] DEFAULT '{}'::text[] NOT NULL,
    pkce_enabled boolean DEFAULT true NOT NULL,
    attribute_mapping jsonb DEFAULT '{}'::jsonb NOT NULL,
    authorization_params jsonb DEFAULT '{}'::jsonb NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    email_optional boolean DEFAULT false NOT NULL,
    issuer text,
    discovery_url text,
    skip_nonce_check boolean DEFAULT false NOT NULL,
    cached_discovery jsonb,
    discovery_cached_at timestamp with time zone,
    authorization_url text,
    token_url text,
    userinfo_url text,
    jwks_uri text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    custom_claims_allowlist text[] DEFAULT '{}'::text[] NOT NULL,
    CONSTRAINT custom_oauth_providers_authorization_url_https CHECK (((authorization_url IS NULL) OR (authorization_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_authorization_url_length CHECK (((authorization_url IS NULL) OR (char_length(authorization_url) <= 2048))),
    CONSTRAINT custom_oauth_providers_client_id_length CHECK (((char_length(client_id) >= 1) AND (char_length(client_id) <= 512))),
    CONSTRAINT custom_oauth_providers_discovery_url_length CHECK (((discovery_url IS NULL) OR (char_length(discovery_url) <= 2048))),
    CONSTRAINT custom_oauth_providers_identifier_format CHECK ((identifier ~ '^[a-z0-9][a-z0-9:-]{0,48}[a-z0-9]$'::text)),
    CONSTRAINT custom_oauth_providers_issuer_length CHECK (((issuer IS NULL) OR ((char_length(issuer) >= 1) AND (char_length(issuer) <= 2048)))),
    CONSTRAINT custom_oauth_providers_jwks_uri_https CHECK (((jwks_uri IS NULL) OR (jwks_uri ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_jwks_uri_length CHECK (((jwks_uri IS NULL) OR (char_length(jwks_uri) <= 2048))),
    CONSTRAINT custom_oauth_providers_name_length CHECK (((char_length(name) >= 1) AND (char_length(name) <= 100))),
    CONSTRAINT custom_oauth_providers_oauth2_requires_endpoints CHECK (((provider_type <> 'oauth2'::text) OR ((authorization_url IS NOT NULL) AND (token_url IS NOT NULL) AND (userinfo_url IS NOT NULL)))),
    CONSTRAINT custom_oauth_providers_oidc_discovery_url_https CHECK (((provider_type <> 'oidc'::text) OR (discovery_url IS NULL) OR (discovery_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_oidc_issuer_https CHECK (((provider_type <> 'oidc'::text) OR (issuer IS NULL) OR (issuer ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_oidc_requires_issuer CHECK (((provider_type <> 'oidc'::text) OR (issuer IS NOT NULL))),
    CONSTRAINT custom_oauth_providers_provider_type_check CHECK ((provider_type = ANY (ARRAY['oauth2'::text, 'oidc'::text]))),
    CONSTRAINT custom_oauth_providers_token_url_https CHECK (((token_url IS NULL) OR (token_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_token_url_length CHECK (((token_url IS NULL) OR (char_length(token_url) <= 2048))),
    CONSTRAINT custom_oauth_providers_userinfo_url_https CHECK (((userinfo_url IS NULL) OR (userinfo_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_userinfo_url_length CHECK (((userinfo_url IS NULL) OR (char_length(userinfo_url) <= 2048)))
);


ALTER TABLE auth.custom_oauth_providers OWNER TO supabase_auth_admin;

--
-- Name: flow_state; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.flow_state (
    id uuid NOT NULL,
    user_id uuid,
    auth_code text,
    code_challenge_method auth.code_challenge_method,
    code_challenge text,
    provider_type text NOT NULL,
    provider_access_token text,
    provider_refresh_token text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    authentication_method text NOT NULL,
    auth_code_issued_at timestamp with time zone,
    invite_token text,
    referrer text,
    oauth_client_state_id uuid,
    linking_target_id uuid,
    email_optional boolean DEFAULT false NOT NULL
);


ALTER TABLE auth.flow_state OWNER TO supabase_auth_admin;

--
-- Name: TABLE flow_state; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.flow_state IS 'Stores metadata for all OAuth/SSO login flows';


--
-- Name: identities; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.identities (
    provider_id text NOT NULL,
    user_id uuid NOT NULL,
    identity_data jsonb NOT NULL,
    provider text NOT NULL,
    last_sign_in_at timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    email text GENERATED ALWAYS AS (lower((identity_data ->> 'email'::text))) STORED,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE auth.identities OWNER TO supabase_auth_admin;

--
-- Name: TABLE identities; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.identities IS 'Auth: Stores identities associated to a user.';


--
-- Name: COLUMN identities.email; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.identities.email IS 'Auth: Email is a generated column that references the optional email property in the identity_data';


--
-- Name: instances; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.instances (
    id uuid NOT NULL,
    uuid uuid,
    raw_base_config text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE auth.instances OWNER TO supabase_auth_admin;

--
-- Name: TABLE instances; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.instances IS 'Auth: Manages users across multiple sites.';


--
-- Name: mfa_amr_claims; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_amr_claims (
    session_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    authentication_method text NOT NULL,
    id uuid NOT NULL
);


ALTER TABLE auth.mfa_amr_claims OWNER TO supabase_auth_admin;

--
-- Name: TABLE mfa_amr_claims; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_amr_claims IS 'auth: stores authenticator method reference claims for multi factor authentication';


--
-- Name: mfa_challenges; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_challenges (
    id uuid NOT NULL,
    factor_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    verified_at timestamp with time zone,
    ip_address inet NOT NULL,
    otp_code text,
    web_authn_session_data jsonb
);


ALTER TABLE auth.mfa_challenges OWNER TO supabase_auth_admin;

--
-- Name: TABLE mfa_challenges; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_challenges IS 'auth: stores metadata about challenge requests made';


--
-- Name: mfa_factors; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_factors (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    friendly_name text,
    factor_type auth.factor_type NOT NULL,
    status auth.factor_status NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    secret text,
    phone text,
    last_challenged_at timestamp with time zone,
    web_authn_credential jsonb,
    web_authn_aaguid uuid,
    last_webauthn_challenge_data jsonb
);


ALTER TABLE auth.mfa_factors OWNER TO supabase_auth_admin;

--
-- Name: TABLE mfa_factors; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_factors IS 'auth: stores metadata about factors';


--
-- Name: COLUMN mfa_factors.last_webauthn_challenge_data; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.mfa_factors.last_webauthn_challenge_data IS 'Stores the latest WebAuthn challenge data including attestation/assertion for customer verification';


--
-- Name: oauth_authorizations; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.oauth_authorizations (
    id uuid NOT NULL,
    authorization_id text NOT NULL,
    client_id uuid NOT NULL,
    user_id uuid,
    redirect_uri text NOT NULL,
    scope text NOT NULL,
    state text,
    resource text,
    code_challenge text,
    code_challenge_method auth.code_challenge_method,
    response_type auth.oauth_response_type DEFAULT 'code'::auth.oauth_response_type NOT NULL,
    status auth.oauth_authorization_status DEFAULT 'pending'::auth.oauth_authorization_status NOT NULL,
    authorization_code text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone DEFAULT (now() + '00:03:00'::interval) NOT NULL,
    approved_at timestamp with time zone,
    nonce text,
    CONSTRAINT oauth_authorizations_authorization_code_length CHECK ((char_length(authorization_code) <= 255)),
    CONSTRAINT oauth_authorizations_code_challenge_length CHECK ((char_length(code_challenge) <= 128)),
    CONSTRAINT oauth_authorizations_expires_at_future CHECK ((expires_at > created_at)),
    CONSTRAINT oauth_authorizations_nonce_length CHECK ((char_length(nonce) <= 255)),
    CONSTRAINT oauth_authorizations_redirect_uri_length CHECK ((char_length(redirect_uri) <= 2048)),
    CONSTRAINT oauth_authorizations_resource_length CHECK ((char_length(resource) <= 2048)),
    CONSTRAINT oauth_authorizations_scope_length CHECK ((char_length(scope) <= 4096)),
    CONSTRAINT oauth_authorizations_state_length CHECK ((char_length(state) <= 4096))
);


ALTER TABLE auth.oauth_authorizations OWNER TO supabase_auth_admin;

--
-- Name: oauth_client_states; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.oauth_client_states (
    id uuid NOT NULL,
    provider_type text NOT NULL,
    code_verifier text,
    created_at timestamp with time zone NOT NULL
);


ALTER TABLE auth.oauth_client_states OWNER TO supabase_auth_admin;

--
-- Name: TABLE oauth_client_states; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.oauth_client_states IS 'Stores OAuth states for third-party provider authentication flows where Supabase acts as the OAuth client.';


--
-- Name: oauth_clients; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.oauth_clients (
    id uuid NOT NULL,
    client_secret_hash text,
    registration_type auth.oauth_registration_type NOT NULL,
    redirect_uris text NOT NULL,
    grant_types text NOT NULL,
    client_name text,
    client_uri text,
    logo_uri text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    client_type auth.oauth_client_type DEFAULT 'confidential'::auth.oauth_client_type NOT NULL,
    token_endpoint_auth_method text NOT NULL,
    CONSTRAINT oauth_clients_client_name_length CHECK ((char_length(client_name) <= 1024)),
    CONSTRAINT oauth_clients_client_uri_length CHECK ((char_length(client_uri) <= 2048)),
    CONSTRAINT oauth_clients_logo_uri_length CHECK ((char_length(logo_uri) <= 2048)),
    CONSTRAINT oauth_clients_token_endpoint_auth_method_check CHECK ((token_endpoint_auth_method = ANY (ARRAY['client_secret_basic'::text, 'client_secret_post'::text, 'none'::text])))
);


ALTER TABLE auth.oauth_clients OWNER TO supabase_auth_admin;

--
-- Name: oauth_consents; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.oauth_consents (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    client_id uuid NOT NULL,
    scopes text NOT NULL,
    granted_at timestamp with time zone DEFAULT now() NOT NULL,
    revoked_at timestamp with time zone,
    CONSTRAINT oauth_consents_revoked_after_granted CHECK (((revoked_at IS NULL) OR (revoked_at >= granted_at))),
    CONSTRAINT oauth_consents_scopes_length CHECK ((char_length(scopes) <= 2048)),
    CONSTRAINT oauth_consents_scopes_not_empty CHECK ((char_length(TRIM(BOTH FROM scopes)) > 0))
);


ALTER TABLE auth.oauth_consents OWNER TO supabase_auth_admin;

--
-- Name: one_time_tokens; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.one_time_tokens (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    token_type auth.one_time_token_type NOT NULL,
    token_hash text NOT NULL,
    relates_to text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT one_time_tokens_token_hash_check CHECK ((char_length(token_hash) > 0))
);


ALTER TABLE auth.one_time_tokens OWNER TO supabase_auth_admin;

--
-- Name: refresh_tokens; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.refresh_tokens (
    instance_id uuid,
    id bigint NOT NULL,
    token character varying(255),
    user_id character varying(255),
    revoked boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    parent character varying(255),
    session_id uuid
);


ALTER TABLE auth.refresh_tokens OWNER TO supabase_auth_admin;

--
-- Name: TABLE refresh_tokens; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.refresh_tokens IS 'Auth: Store of tokens used to refresh JWT tokens once they expire.';


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: auth; Owner: supabase_auth_admin
--

CREATE SEQUENCE auth.refresh_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE auth.refresh_tokens_id_seq OWNER TO supabase_auth_admin;

--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: supabase_auth_admin
--

ALTER SEQUENCE auth.refresh_tokens_id_seq OWNED BY auth.refresh_tokens.id;


--
-- Name: saml_providers; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.saml_providers (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    entity_id text NOT NULL,
    metadata_xml text NOT NULL,
    metadata_url text,
    attribute_mapping jsonb,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    name_id_format text,
    CONSTRAINT "entity_id not empty" CHECK ((char_length(entity_id) > 0)),
    CONSTRAINT "metadata_url not empty" CHECK (((metadata_url = NULL::text) OR (char_length(metadata_url) > 0))),
    CONSTRAINT "metadata_xml not empty" CHECK ((char_length(metadata_xml) > 0))
);


ALTER TABLE auth.saml_providers OWNER TO supabase_auth_admin;

--
-- Name: TABLE saml_providers; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.saml_providers IS 'Auth: Manages SAML Identity Provider connections.';


--
-- Name: saml_relay_states; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.saml_relay_states (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    request_id text NOT NULL,
    for_email text,
    redirect_to text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    flow_state_id uuid,
    CONSTRAINT "request_id not empty" CHECK ((char_length(request_id) > 0))
);


ALTER TABLE auth.saml_relay_states OWNER TO supabase_auth_admin;

--
-- Name: TABLE saml_relay_states; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.saml_relay_states IS 'Auth: Contains SAML Relay State information for each Service Provider initiated login.';


--
-- Name: schema_migrations; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.schema_migrations (
    version character varying(255) NOT NULL
);


ALTER TABLE auth.schema_migrations OWNER TO supabase_auth_admin;

--
-- Name: TABLE schema_migrations; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.schema_migrations IS 'Auth: Manages updates to the auth system.';


--
-- Name: sessions; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sessions (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    factor_id uuid,
    aal auth.aal_level,
    not_after timestamp with time zone,
    refreshed_at timestamp without time zone,
    user_agent text,
    ip inet,
    tag text,
    oauth_client_id uuid,
    refresh_token_hmac_key text,
    refresh_token_counter bigint,
    scopes text,
    CONSTRAINT sessions_scopes_length CHECK ((char_length(scopes) <= 4096))
);


ALTER TABLE auth.sessions OWNER TO supabase_auth_admin;

--
-- Name: TABLE sessions; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sessions IS 'Auth: Stores session data associated to a user.';


--
-- Name: COLUMN sessions.not_after; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sessions.not_after IS 'Auth: Not after is a nullable column that contains a timestamp after which the session should be regarded as expired.';


--
-- Name: COLUMN sessions.refresh_token_hmac_key; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sessions.refresh_token_hmac_key IS 'Holds a HMAC-SHA256 key used to sign refresh tokens for this session.';


--
-- Name: COLUMN sessions.refresh_token_counter; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sessions.refresh_token_counter IS 'Holds the ID (counter) of the last issued refresh token.';


--
-- Name: sso_domains; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sso_domains (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    domain text NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT "domain not empty" CHECK ((char_length(domain) > 0))
);


ALTER TABLE auth.sso_domains OWNER TO supabase_auth_admin;

--
-- Name: TABLE sso_domains; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sso_domains IS 'Auth: Manages SSO email address domain mapping to an SSO Identity Provider.';


--
-- Name: sso_providers; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sso_providers (
    id uuid NOT NULL,
    resource_id text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    disabled boolean,
    CONSTRAINT "resource_id not empty" CHECK (((resource_id = NULL::text) OR (char_length(resource_id) > 0)))
);


ALTER TABLE auth.sso_providers OWNER TO supabase_auth_admin;

--
-- Name: TABLE sso_providers; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sso_providers IS 'Auth: Manages SSO identity provider information; see saml_providers for SAML.';


--
-- Name: COLUMN sso_providers.resource_id; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sso_providers.resource_id IS 'Auth: Uniquely identifies a SSO provider according to a user-chosen resource ID (case insensitive), useful in infrastructure as code.';


--
-- Name: users; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.users (
    instance_id uuid,
    id uuid NOT NULL,
    aud character varying(255),
    role character varying(255),
    email character varying(255),
    encrypted_password character varying(255),
    email_confirmed_at timestamp with time zone,
    invited_at timestamp with time zone,
    confirmation_token character varying(255),
    confirmation_sent_at timestamp with time zone,
    recovery_token character varying(255),
    recovery_sent_at timestamp with time zone,
    email_change_token_new character varying(255),
    email_change character varying(255),
    email_change_sent_at timestamp with time zone,
    last_sign_in_at timestamp with time zone,
    raw_app_meta_data jsonb,
    raw_user_meta_data jsonb,
    is_super_admin boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    phone text DEFAULT NULL::character varying,
    phone_confirmed_at timestamp with time zone,
    phone_change text DEFAULT ''::character varying,
    phone_change_token character varying(255) DEFAULT ''::character varying,
    phone_change_sent_at timestamp with time zone,
    confirmed_at timestamp with time zone GENERATED ALWAYS AS (LEAST(email_confirmed_at, phone_confirmed_at)) STORED,
    email_change_token_current character varying(255) DEFAULT ''::character varying,
    email_change_confirm_status smallint DEFAULT 0,
    banned_until timestamp with time zone,
    reauthentication_token character varying(255) DEFAULT ''::character varying,
    reauthentication_sent_at timestamp with time zone,
    is_sso_user boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    is_anonymous boolean DEFAULT false NOT NULL,
    CONSTRAINT users_email_change_confirm_status_check CHECK (((email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2)))
);


ALTER TABLE auth.users OWNER TO supabase_auth_admin;

--
-- Name: TABLE users; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.users IS 'Auth: Stores user login data within a secure schema.';


--
-- Name: COLUMN users.is_sso_user; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.users.is_sso_user IS 'Auth: Set this column to true when the account comes from SSO. These accounts can have duplicate emails.';


--
-- Name: webauthn_challenges; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.webauthn_challenges (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    challenge_type text NOT NULL,
    session_data jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    CONSTRAINT webauthn_challenges_challenge_type_check CHECK ((challenge_type = ANY (ARRAY['signup'::text, 'registration'::text, 'authentication'::text])))
);


ALTER TABLE auth.webauthn_challenges OWNER TO supabase_auth_admin;

--
-- Name: webauthn_credentials; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.webauthn_credentials (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    credential_id bytea NOT NULL,
    public_key bytea NOT NULL,
    attestation_type text DEFAULT ''::text NOT NULL,
    aaguid uuid,
    sign_count bigint DEFAULT 0 NOT NULL,
    transports jsonb DEFAULT '[]'::jsonb NOT NULL,
    backup_eligible boolean DEFAULT false NOT NULL,
    backed_up boolean DEFAULT false NOT NULL,
    friendly_name text DEFAULT ''::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    last_used_at timestamp with time zone
);


ALTER TABLE auth.webauthn_credentials OWNER TO supabase_auth_admin;

--
-- Name: barrios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.barrios (
    id_comuna bigint NOT NULL,
    nombre text NOT NULL,
    creado_en timestamp with time zone DEFAULT now() NOT NULL,
    id bigint NOT NULL
);


ALTER TABLE public.barrios OWNER TO postgres;

--
-- Name: barrios_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.barrios ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.barrios_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: campanas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.campanas (
    id_cliente bigint NOT NULL,
    id_proceso_electoral bigint NOT NULL,
    nombre text NOT NULL,
    estado public.estado_campana DEFAULT 'activa'::public.estado_campana NOT NULL,
    iniciado_en timestamp with time zone,
    finalizado_en timestamp with time zone,
    purgado_en timestamp with time zone,
    creado_en timestamp with time zone DEFAULT now() NOT NULL,
    actualizado_en timestamp with time zone DEFAULT now() NOT NULL,
    id bigint NOT NULL
);


ALTER TABLE public.campanas OWNER TO postgres;

--
-- Name: campanas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.campanas ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.campanas_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: caracteristicas_campana; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.caracteristicas_campana (
    id_campana bigint NOT NULL,
    resolutor_captcha boolean DEFAULT false NOT NULL,
    auditoria_e14 boolean DEFAULT false NOT NULL,
    whatsapp boolean DEFAULT false NOT NULL,
    telegram boolean DEFAULT false NOT NULL,
    captura_web boolean DEFAULT true NOT NULL,
    actualizado_en timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.caracteristicas_campana OWNER TO postgres;

--
-- Name: clientes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clientes (
    nombre text NOT NULL,
    documento text,
    telefono text,
    correo_contacto text,
    notas text,
    creado_en timestamp with time zone DEFAULT now() NOT NULL,
    actualizado_en timestamp with time zone DEFAULT now() NOT NULL,
    id_usuario uuid,
    id bigint NOT NULL
);


ALTER TABLE public.clientes OWNER TO postgres;

--
-- Name: clientes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.clientes_id_seq
    START WITH 2
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.clientes_id_seq OWNER TO postgres;

--
-- Name: clientes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.clientes_id_seq OWNED BY public.clientes.id;


--
-- Name: comunas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.comunas (
    id_campana bigint NOT NULL,
    nombre text NOT NULL,
    creado_en timestamp with time zone DEFAULT now() NOT NULL,
    id bigint NOT NULL
);


ALTER TABLE public.comunas OWNER TO postgres;

--
-- Name: comunas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.comunas ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.comunas_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: configuracion_integracion_plataforma; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.configuracion_integracion_plataforma (
    proveedor public.proveedor_integracion NOT NULL,
    configuracion jsonb DEFAULT '{}'::jsonb NOT NULL,
    activa boolean DEFAULT true NOT NULL,
    creado_en timestamp with time zone DEFAULT now() NOT NULL,
    actualizado_en timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT configuracion_integracion_plataforma_proveedor_check CHECK ((proveedor = ANY (ARRAY['twilio'::public.proveedor_integracion, 'resolutor_captcha'::public.proveedor_integracion, 'ia_e14'::public.proveedor_integracion])))
);


ALTER TABLE public.configuracion_integracion_plataforma OWNER TO postgres;

--
-- Name: configuracion_marca_plataforma; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.configuracion_marca_plataforma (
    id integer DEFAULT 1 NOT NULL,
    url_logo text,
    color_primario text DEFAULT '#1e40af'::text,
    color_secundario text DEFAULT '#64748b'::text,
    familia_fuente text DEFAULT 'Inter'::text,
    actualizado_en timestamp with time zone DEFAULT now() NOT NULL,
    color_acento text DEFAULT '#1e40af'::text,
    color_fondo_sidebar text DEFAULT '#111827'::text,
    color_fondo_pagina text DEFAULT '#f3f4f6'::text,
    nombre_plataforma text DEFAULT 'Plataforma'::text,
    etiqueta_panel text DEFAULT 'Panel Administrador'::text,
    texto_alt_logo text DEFAULT 'Plataforma de campañas'::text,
    url_favicon text,
    subtitulo_login text DEFAULT 'Accede con tu usuario y contraseña'::text,
    texto_boton_login text DEFAULT 'INICIAR SESIÓN'::text,
    login_fondo_exterior text DEFAULT '#4b5563'::text,
    login_fondo_centro text DEFAULT '#9ca3af'::text,
    login_panel_fondo text DEFAULT 'rgba(31, 41, 55, 0.55)'::text,
    login_boton_fondo text DEFAULT '#111827'::text,
    fuente_titulos text,
    fuente_subtitulos text,
    fuente_cuerpo text,
    color_titulo text DEFAULT '#111827'::text,
    color_subtitulo text DEFAULT '#6b7280'::text,
    color_texto text DEFAULT '#374151'::text,
    color_etiqueta text DEFAULT '#525252'::text,
    peso_titulo integer DEFAULT 600,
    peso_subtitulo integer DEFAULT 400,
    peso_texto integer DEFAULT 400,
    peso_etiqueta integer DEFAULT 500,
    CONSTRAINT configuracion_marca_plataforma_id_check CHECK ((id = 1))
);


ALTER TABLE public.configuracion_marca_plataforma OWNER TO postgres;

--
-- Name: cuarentena_votantes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cuarentena_votantes (
    id_campana bigint NOT NULL,
    nombres text NOT NULL,
    apellidos text NOT NULL,
    documento text NOT NULL,
    tipo_documento public.tipo_documento DEFAULT 'CC'::public.tipo_documento NOT NULL,
    sexo public.tipo_sexo,
    telefono text,
    direccion text,
    id_puesto_votacion bigint,
    mesa text,
    id_rol bigint,
    id_lider_directo bigint,
    id_votante_conflicto bigint,
    id_cuarentena_conflicto bigint,
    tipo_coincidencia public.tipo_coincidencia_cuarentena NOT NULL,
    similitud_nombre numeric(5,4),
    estado public.estado_cuarentena DEFAULT 'pendiente'::public.estado_cuarentena NOT NULL,
    canal_origen public.canal_captura DEFAULT 'manual'::public.canal_captura NOT NULL,
    creado_por uuid,
    resuelto_por uuid,
    resuelto_en timestamp with time zone,
    notas_resolucion text,
    creado_en timestamp with time zone DEFAULT now() NOT NULL,
    actualizado_en timestamp with time zone DEFAULT now() NOT NULL,
    fecha_nacimiento date,
    id_lugar_trabajo bigint,
    id bigint NOT NULL,
    CONSTRAINT cuarentena_sin_auto_conflicto CHECK (((id_cuarentena_conflicto IS NULL) OR (id_cuarentena_conflicto <> id))),
    CONSTRAINT cuarentena_tiene_conflicto CHECK (((id_votante_conflicto IS NOT NULL) OR (id_cuarentena_conflicto IS NOT NULL))),
    CONSTRAINT cuarentena_votantes_similitud_nombre_check CHECK (((similitud_nombre IS NULL) OR ((similitud_nombre >= (0)::numeric) AND (similitud_nombre <= (1)::numeric))))
);


ALTER TABLE public.cuarentena_votantes OWNER TO postgres;

--
-- Name: cuarentena_votantes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.cuarentena_votantes ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.cuarentena_votantes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: datos_trabajador_votante; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.datos_trabajador_votante (
    id_votante bigint NOT NULL,
    lugar_trabajo text,
    direccion_trabajo text,
    id_comuna bigint,
    id_barrio bigint,
    creado_en timestamp with time zone DEFAULT now() NOT NULL,
    actualizado_en timestamp with time zone DEFAULT now() NOT NULL,
    id bigint NOT NULL
);


ALTER TABLE public.datos_trabajador_votante OWNER TO postgres;

--
-- Name: datos_trabajador_votante_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.datos_trabajador_votante ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.datos_trabajador_votante_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: exportaciones_campana; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.exportaciones_campana (
    id_campana bigint NOT NULL,
    exportado_por uuid,
    ruta_almacenamiento text NOT NULL,
    tamano_archivo bigint,
    creado_en timestamp with time zone DEFAULT now() NOT NULL,
    id bigint NOT NULL
);


ALTER TABLE public.exportaciones_campana OWNER TO postgres;

--
-- Name: exportaciones_campana_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.exportaciones_campana ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.exportaciones_campana_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: integraciones_campana; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.integraciones_campana (
    id_campana bigint NOT NULL,
    proveedor public.proveedor_integracion NOT NULL,
    configuracion_cifrada text DEFAULT '{}'::text NOT NULL,
    activa boolean DEFAULT true NOT NULL,
    creado_en timestamp with time zone DEFAULT now() NOT NULL,
    actualizado_en timestamp with time zone DEFAULT now() NOT NULL,
    id bigint NOT NULL
);


ALTER TABLE public.integraciones_campana OWNER TO postgres;

--
-- Name: integraciones_campana_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.integraciones_campana ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.integraciones_campana_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: lugares_trabajo; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lugares_trabajo (
    id_campana bigint NOT NULL,
    nombre text NOT NULL,
    direccion text,
    id_comuna bigint,
    id_barrio bigint,
    creado_en timestamp with time zone DEFAULT now() NOT NULL,
    actualizado_en timestamp with time zone DEFAULT now() NOT NULL,
    id bigint NOT NULL
);


ALTER TABLE public.lugares_trabajo OWNER TO postgres;

--
-- Name: lugares_trabajo_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.lugares_trabajo ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.lugares_trabajo_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: miembros_campana; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.miembros_campana (
    id_campana bigint NOT NULL,
    id_usuario uuid NOT NULL,
    rol public.rol_miembro_campana DEFAULT 'lector'::public.rol_miembro_campana NOT NULL,
    creado_en timestamp with time zone DEFAULT now() NOT NULL,
    id bigint NOT NULL
);


ALTER TABLE public.miembros_campana OWNER TO postgres;

--
-- Name: miembros_campana_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.miembros_campana ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.miembros_campana_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: miembros_cliente; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.miembros_cliente (
    id_usuario uuid NOT NULL,
    creado_en timestamp with time zone DEFAULT now() NOT NULL,
    id bigint NOT NULL,
    id_cliente bigint
);


ALTER TABLE public.miembros_cliente OWNER TO postgres;

--
-- Name: miembros_cliente_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.miembros_cliente_id_seq
    START WITH 2
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.miembros_cliente_id_seq OWNER TO postgres;

--
-- Name: miembros_cliente_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.miembros_cliente_id_seq OWNED BY public.miembros_cliente.id;


--
-- Name: miembros_plataforma; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.miembros_plataforma (
    id_usuario uuid NOT NULL,
    rol public.rol_plataforma DEFAULT 'dueno_plataforma'::public.rol_plataforma NOT NULL,
    creado_en timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.miembros_plataforma OWNER TO postgres;

--
-- Name: novedades; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.novedades (
    id_votante bigint NOT NULL,
    id_tipo_novedad bigint NOT NULL,
    detalle text,
    creado_por uuid,
    creado_en timestamp with time zone DEFAULT now() NOT NULL,
    id bigint NOT NULL
);


ALTER TABLE public.novedades OWNER TO postgres;

--
-- Name: novedades_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.novedades ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.novedades_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: procesos_electorales; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.procesos_electorales (
    nombre text NOT NULL,
    fecha_eleccion date,
    creado_en timestamp with time zone DEFAULT now() NOT NULL,
    id bigint NOT NULL
);


ALTER TABLE public.procesos_electorales OWNER TO postgres;

--
-- Name: procesos_electorales_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.procesos_electorales_id_seq
    START WITH 3
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.procesos_electorales_id_seq OWNER TO postgres;

--
-- Name: procesos_electorales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.procesos_electorales_id_seq OWNED BY public.procesos_electorales.id;


--
-- Name: puestos_votacion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.puestos_votacion (
    id_campana bigint NOT NULL,
    id_comuna bigint,
    id_barrio bigint,
    nombre text NOT NULL,
    municipio text,
    direccion text,
    votantes_hombres_admite integer DEFAULT 0 NOT NULL,
    votantes_mujeres_admite integer DEFAULT 0 NOT NULL,
    cantidad_mesas integer DEFAULT 0 NOT NULL,
    fuente text DEFAULT 'registraduria'::text NOT NULL,
    actualizado_registraduria_en timestamp with time zone DEFAULT now() NOT NULL,
    creado_en timestamp with time zone DEFAULT now() NOT NULL,
    actualizado_en timestamp with time zone DEFAULT now() NOT NULL,
    embedding public.vector(2048),
    id bigint NOT NULL,
    CONSTRAINT puestos_votacion_cantidad_mesas_check CHECK ((cantidad_mesas >= 0)),
    CONSTRAINT puestos_votacion_votantes_hombres_admite_check CHECK ((votantes_hombres_admite >= 0)),
    CONSTRAINT puestos_votacion_votantes_mujeres_admite_check CHECK ((votantes_mujeres_admite >= 0))
);


ALTER TABLE public.puestos_votacion OWNER TO postgres;

--
-- Name: puestos_votacion_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.puestos_votacion ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.puestos_votacion_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: recolectores_telegram; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.recolectores_telegram (
    id_campana bigint NOT NULL,
    id_usuario uuid,
    telegram_user_id bigint NOT NULL,
    telegram_username text,
    creado_en timestamp with time zone DEFAULT now() NOT NULL,
    id_rol bigint,
    id bigint NOT NULL
);


ALTER TABLE public.recolectores_telegram OWNER TO postgres;

--
-- Name: COLUMN recolectores_telegram.id_usuario; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.recolectores_telegram.id_usuario IS 'Usuario de plataforma opcional; los recolectores por Telegram suelen usar solo telegram_user_id.';


--
-- Name: COLUMN recolectores_telegram.id_rol; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.recolectores_telegram.id_rol IS 'Cargo del recolector en la campaña. Solo puede registrar votantes con jerarquía inferior.';


--
-- Name: recolectores_telegram_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.recolectores_telegram ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.recolectores_telegram_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: registro_auditoria; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.registro_auditoria (
    id_actor uuid,
    accion text NOT NULL,
    tipo_entidad text NOT NULL,
    id_entidad uuid,
    id_campana bigint,
    metadatos jsonb DEFAULT '{}'::jsonb NOT NULL,
    creado_en timestamp with time zone DEFAULT now() NOT NULL,
    id bigint NOT NULL
);


ALTER TABLE public.registro_auditoria OWNER TO postgres;

--
-- Name: registro_auditoria_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.registro_auditoria ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.registro_auditoria_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id_campana bigint NOT NULL,
    nombre text NOT NULL,
    nivel_jerarquia smallint NOT NULL,
    creado_en timestamp with time zone DEFAULT now() NOT NULL,
    id bigint NOT NULL,
    CONSTRAINT roles_nivel_jerarquia_check CHECK ((nivel_jerarquia >= 1))
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- Name: COLUMN roles.nivel_jerarquia; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.roles.nivel_jerarquia IS 'Nivel en el árbol organizacional: 1 = más alto. Sin tope fijo; cada campaña puede extender la jerarquía.';


--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.roles ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.roles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: sesiones_captura_telegram; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sesiones_captura_telegram (
    id_campana bigint NOT NULL,
    chat_id bigint NOT NULL,
    telegram_user_id bigint NOT NULL,
    id_usuario uuid,
    paso text DEFAULT 'inicio'::text NOT NULL,
    datos_parciales jsonb DEFAULT '{}'::jsonb NOT NULL,
    creado_en timestamp with time zone DEFAULT now() NOT NULL,
    actualizado_en timestamp with time zone DEFAULT now() NOT NULL,
    id bigint NOT NULL
);


ALTER TABLE public.sesiones_captura_telegram OWNER TO postgres;

--
-- Name: sesiones_captura_telegram_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.sesiones_captura_telegram ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.sesiones_captura_telegram_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: sesiones_captura_whatsapp; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sesiones_captura_whatsapp (
    id_campana bigint NOT NULL,
    telefono text NOT NULL,
    perfil_nombre text,
    id_usuario uuid,
    paso text DEFAULT 'inicio'::text NOT NULL,
    datos_parciales jsonb DEFAULT '{}'::jsonb NOT NULL,
    creado_en timestamp with time zone DEFAULT now() NOT NULL,
    actualizado_en timestamp with time zone DEFAULT now() NOT NULL,
    id bigint NOT NULL,
    CONSTRAINT sesiones_whatsapp_telefono_normalizado CHECK ((telefono ~ '^[0-9]{10,15}$'::text))
);


ALTER TABLE public.sesiones_captura_whatsapp OWNER TO postgres;

--
-- Name: TABLE sesiones_captura_whatsapp; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.sesiones_captura_whatsapp IS 'Estado conversacional del bot WhatsApp (Twilio) por número de teléfono.';


--
-- Name: sesiones_captura_whatsapp_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.sesiones_captura_whatsapp ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.sesiones_captura_whatsapp_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: tipos_novedad; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tipos_novedad (
    id_campana bigint NOT NULL,
    novedad text NOT NULL,
    creado_en timestamp with time zone DEFAULT now() NOT NULL,
    id bigint NOT NULL
);


ALTER TABLE public.tipos_novedad OWNER TO postgres;

--
-- Name: tipos_novedad_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.tipos_novedad ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.tipos_novedad_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: uso_campana; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.uso_campana (
    id_campana bigint NOT NULL,
    proveedor public.proveedor_integracion NOT NULL,
    metrica text NOT NULL,
    cantidad numeric DEFAULT 0 NOT NULL,
    periodo_inicio timestamp with time zone,
    periodo_fin timestamp with time zone,
    registrado_en timestamp with time zone DEFAULT now() NOT NULL,
    id bigint NOT NULL
);


ALTER TABLE public.uso_campana OWNER TO postgres;

--
-- Name: uso_campana_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.uso_campana ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.uso_campana_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: verificaciones_registraduria; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.verificaciones_registraduria (
    id_campana bigint NOT NULL,
    documento text NOT NULL,
    tipo_documento public.tipo_documento DEFAULT 'CC'::public.tipo_documento NOT NULL,
    estado public.estado_verificacion_registraduria DEFAULT 'pendiente'::public.estado_verificacion_registraduria NOT NULL,
    nombres_oficial text,
    apellidos_oficial text,
    departamento text,
    municipio text,
    puesto_votacion text,
    mesa text,
    mensaje_error text,
    datos_crudos jsonb,
    id_corrida text,
    intentos smallint DEFAULT 0 NOT NULL,
    consultado_en timestamp with time zone,
    creado_en timestamp with time zone DEFAULT now() NOT NULL,
    actualizado_en timestamp with time zone DEFAULT now() NOT NULL,
    id bigint NOT NULL,
    CONSTRAINT verificaciones_documento_normalizado CHECK ((documento ~ '^[0-9]{5,}$'::text)),
    CONSTRAINT verificaciones_registraduria_intentos_check CHECK ((intentos >= 0))
);


ALTER TABLE public.verificaciones_registraduria OWNER TO postgres;

--
-- Name: TABLE verificaciones_registraduria; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.verificaciones_registraduria IS 'Resultados de consulta registraduría por documento. La miniapp worker hace upsert; la UI hace JOIN con votantes.';


--
-- Name: COLUMN verificaciones_registraduria.documento; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.verificaciones_registraduria.documento IS 'Documento normalizado (solo dígitos). Join: votantes.documento + votantes.tipo_documento.';


--
-- Name: COLUMN verificaciones_registraduria.id_corrida; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.verificaciones_registraduria.id_corrida IS 'Identificador de lote opcional (texto libre) generado por la miniapp para agrupar una corrida.';


--
-- Name: verificaciones_registraduria_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.verificaciones_registraduria ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.verificaciones_registraduria_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: votantes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.votantes (
    id_campana bigint NOT NULL,
    nombres text NOT NULL,
    apellidos text NOT NULL,
    documento text NOT NULL,
    tipo_documento public.tipo_documento DEFAULT 'CC'::public.tipo_documento NOT NULL,
    sexo public.tipo_sexo,
    fecha_nacimiento date,
    telefono text,
    direccion text,
    id_puesto_votacion bigint,
    mesa text,
    id_rol bigint,
    id_lider_directo bigint,
    estado public.estado_votante DEFAULT 'pendiente_verificacion'::public.estado_votante NOT NULL,
    canal_origen public.canal_captura DEFAULT 'manual'::public.canal_captura NOT NULL,
    creado_por uuid,
    creado_en timestamp with time zone DEFAULT now() NOT NULL,
    actualizado_en timestamp with time zone DEFAULT now() NOT NULL,
    id_lugar_trabajo bigint,
    id_tipo_novedad bigint,
    detalle_novedad text,
    embedding public.vector(2048),
    id bigint NOT NULL,
    CONSTRAINT votantes_sin_auto_lider CHECK (((id_lider_directo IS NULL) OR (id_lider_directo <> id)))
);


ALTER TABLE public.votantes OWNER TO postgres;

--
-- Name: COLUMN votantes.fecha_nacimiento; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.votantes.fecha_nacimiento IS 'Fecha de nacimiento del votante.';


--
-- Name: COLUMN votantes.direccion; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.votantes.direccion IS 'Dirección de residencia del votante.';


--
-- Name: COLUMN votantes.id_lugar_trabajo; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.votantes.id_lugar_trabajo IS 'Lugar de trabajo (catálogo lugares_trabajo).';


--
-- Name: COLUMN votantes.id_tipo_novedad; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.votantes.id_tipo_novedad IS 'Tipo de novedad asignado por gestión web ante irregularidades en el votante.';


--
-- Name: COLUMN votantes.detalle_novedad; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.votantes.detalle_novedad IS 'Detalle libre de la novedad; lo completa el gestor en la web.';


--
-- Name: votantes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.votantes ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.votantes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: messages; Type: TABLE; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE TABLE realtime.messages (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    binary_payload bytea
)
PARTITION BY RANGE (inserted_at);


ALTER TABLE realtime.messages OWNER TO supabase_realtime_admin;

--
-- Name: schema_migrations; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.schema_migrations (
    version bigint NOT NULL,
    inserted_at timestamp(0) without time zone
);


ALTER TABLE realtime.schema_migrations OWNER TO supabase_admin;

--
-- Name: subscription; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.subscription (
    id bigint NOT NULL,
    subscription_id uuid NOT NULL,
    entity regclass NOT NULL,
    filters realtime.user_defined_filter[] DEFAULT '{}'::realtime.user_defined_filter[] NOT NULL,
    claims jsonb NOT NULL,
    claims_role regrole GENERATED ALWAYS AS (realtime.to_regrole((claims ->> 'role'::text))) STORED NOT NULL,
    created_at timestamp without time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    action_filter text DEFAULT '*'::text,
    selected_columns text[],
    CONSTRAINT subscription_action_filter_check CHECK ((action_filter = ANY (ARRAY['*'::text, 'INSERT'::text, 'UPDATE'::text, 'DELETE'::text])))
);


ALTER TABLE realtime.subscription OWNER TO supabase_admin;

--
-- Name: subscription_id_seq; Type: SEQUENCE; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE realtime.subscription ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME realtime.subscription_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: buckets; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.buckets (
    id text NOT NULL,
    name text NOT NULL,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    public boolean DEFAULT false,
    avif_autodetection boolean DEFAULT false,
    file_size_limit bigint,
    allowed_mime_types text[],
    owner_id text,
    type storage.buckettype DEFAULT 'STANDARD'::storage.buckettype NOT NULL
);


ALTER TABLE storage.buckets OWNER TO supabase_storage_admin;

--
-- Name: COLUMN buckets.owner; Type: COMMENT; Schema: storage; Owner: supabase_storage_admin
--

COMMENT ON COLUMN storage.buckets.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: buckets_analytics; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.buckets_analytics (
    name text NOT NULL,
    type storage.buckettype DEFAULT 'ANALYTICS'::storage.buckettype NOT NULL,
    format text DEFAULT 'ICEBERG'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE storage.buckets_analytics OWNER TO supabase_storage_admin;

--
-- Name: buckets_vectors; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.buckets_vectors (
    id text NOT NULL,
    type storage.buckettype DEFAULT 'VECTOR'::storage.buckettype NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE storage.buckets_vectors OWNER TO supabase_storage_admin;

--
-- Name: migrations; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.migrations (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    hash character varying(40) NOT NULL,
    executed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE storage.migrations OWNER TO supabase_storage_admin;

--
-- Name: objects; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.objects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bucket_id text,
    name text,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    last_accessed_at timestamp with time zone DEFAULT now(),
    metadata jsonb,
    path_tokens text[] GENERATED ALWAYS AS (string_to_array(name, '/'::text)) STORED,
    version text,
    owner_id text,
    user_metadata jsonb
);


ALTER TABLE storage.objects OWNER TO supabase_storage_admin;

--
-- Name: COLUMN objects.owner; Type: COMMENT; Schema: storage; Owner: supabase_storage_admin
--

COMMENT ON COLUMN storage.objects.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: s3_multipart_uploads; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.s3_multipart_uploads (
    id text NOT NULL,
    in_progress_size bigint DEFAULT 0 NOT NULL,
    upload_signature text NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    version text NOT NULL,
    owner_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_metadata jsonb,
    metadata jsonb
);


ALTER TABLE storage.s3_multipart_uploads OWNER TO supabase_storage_admin;

--
-- Name: s3_multipart_uploads_parts; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.s3_multipart_uploads_parts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    upload_id text NOT NULL,
    size bigint DEFAULT 0 NOT NULL,
    part_number integer NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    etag text NOT NULL,
    owner_id text,
    version text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE storage.s3_multipart_uploads_parts OWNER TO supabase_storage_admin;

--
-- Name: vector_indexes; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.vector_indexes (
    id text DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL COLLATE pg_catalog."C",
    bucket_id text NOT NULL,
    data_type text NOT NULL,
    dimension integer NOT NULL,
    distance_metric text NOT NULL,
    metadata_configuration jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE storage.vector_indexes OWNER TO supabase_storage_admin;

--
-- Name: schema_migrations; Type: TABLE; Schema: supabase_migrations; Owner: postgres
--

CREATE TABLE supabase_migrations.schema_migrations (
    version text NOT NULL,
    statements text[],
    name text,
    created_by text,
    idempotency_key text,
    rollback text[]
);


ALTER TABLE supabase_migrations.schema_migrations OWNER TO postgres;

--
-- Name: refresh_tokens id; Type: DEFAULT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('auth.refresh_tokens_id_seq'::regclass);


--
-- Name: clientes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clientes ALTER COLUMN id SET DEFAULT nextval('public.clientes_id_seq'::regclass);


--
-- Name: miembros_cliente id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.miembros_cliente ALTER COLUMN id SET DEFAULT nextval('public.miembros_cliente_id_seq'::regclass);


--
-- Name: procesos_electorales id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.procesos_electorales ALTER COLUMN id SET DEFAULT nextval('public.procesos_electorales_id_seq'::regclass);


--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.audit_log_entries (instance_id, id, payload, created_at, ip_address) FROM stdin;
\.


--
-- Data for Name: custom_oauth_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.custom_oauth_providers (id, provider_type, identifier, name, client_id, client_secret, acceptable_client_ids, scopes, pkce_enabled, attribute_mapping, authorization_params, enabled, email_optional, issuer, discovery_url, skip_nonce_check, cached_discovery, discovery_cached_at, authorization_url, token_url, userinfo_url, jwks_uri, created_at, updated_at, custom_claims_allowlist) FROM stdin;
\.


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.flow_state (id, user_id, auth_code, code_challenge_method, code_challenge, provider_type, provider_access_token, provider_refresh_token, created_at, updated_at, authentication_method, auth_code_issued_at, invite_token, referrer, oauth_client_state_id, linking_target_id, email_optional) FROM stdin;
\.


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, id) FROM stdin;
1a9105d7-e0d8-4d02-9a88-b34ec796f1c7	1a9105d7-e0d8-4d02-9a88-b34ec796f1c7	{"sub": "1a9105d7-e0d8-4d02-9a88-b34ec796f1c7", "email": "anamariagarcia093@gmail.com", "email_verified": false, "phone_verified": false}	email	2026-06-14 23:13:03.429816+00	2026-06-14 23:13:03.42987+00	2026-06-14 23:13:03.42987+00	ce02d009-f329-4007-9c88-16639922a442
dfb79c19-84a3-4ddc-890d-854173a7e13e	dfb79c19-84a3-4ddc-890d-854173a7e13e	{"sub": "dfb79c19-84a3-4ddc-890d-854173a7e13e", "email": "nany931007@gmail.com", "email_verified": false, "phone_verified": false}	email	2026-06-15 00:58:00.884628+00	2026-06-15 00:58:00.884683+00	2026-06-15 00:58:00.884683+00	ff3e4dd2-dd34-4e87-9355-b0d7b6cae21a
2363da67-5223-4fd2-96bf-0fa415ecacf6	2363da67-5223-4fd2-96bf-0fa415ecacf6	{"sub": "2363da67-5223-4fd2-96bf-0fa415ecacf6", "email": "rigoramirez1313@gmail.com", "email_verified": false, "phone_verified": false}	email	2026-06-24 21:48:02.37185+00	2026-06-24 21:48:02.371906+00	2026-06-24 21:48:02.371906+00	ce08d62d-528b-447d-82e6-be1639af1af0
\.


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.instances (id, uuid, raw_base_config, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.mfa_amr_claims (session_id, created_at, updated_at, authentication_method, id) FROM stdin;
18e51522-c726-494d-84ce-4036e41fdb0e	2026-06-15 16:15:01.401901+00	2026-06-15 16:15:01.401901+00	password	064e1f56-da96-420e-be36-aea1687c726d
c92f7942-7b7e-4425-b997-4d755798511e	2026-06-15 21:20:06.922179+00	2026-06-15 21:20:06.922179+00	password	cd22eace-29da-4555-bad7-4ac924aee47a
b8884462-da80-49a1-b515-9b808a4b1890	2026-06-24 22:06:33.174073+00	2026-06-24 22:06:33.174073+00	password	a31e748c-9634-4b14-a9a8-f69725092216
a5c56ee2-14c0-4275-9449-0a6ad5f6896e	2026-06-24 22:47:52.852559+00	2026-06-24 22:47:52.852559+00	password	4a72fa71-bd08-4d04-81d6-d95ed085ca8f
2efeef57-4a7d-4b50-8f8c-2dbd9d68dabd	2026-07-10 03:21:55.985639+00	2026-07-10 03:21:55.985639+00	password	f3ca2a76-e113-4f23-b7c5-780cc9dfea18
\.


--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.mfa_challenges (id, factor_id, created_at, verified_at, ip_address, otp_code, web_authn_session_data) FROM stdin;
\.


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.mfa_factors (id, user_id, friendly_name, factor_type, status, created_at, updated_at, secret, phone, last_challenged_at, web_authn_credential, web_authn_aaguid, last_webauthn_challenge_data) FROM stdin;
\.


--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.oauth_authorizations (id, authorization_id, client_id, user_id, redirect_uri, scope, state, resource, code_challenge, code_challenge_method, response_type, status, authorization_code, created_at, expires_at, approved_at, nonce) FROM stdin;
\.


--
-- Data for Name: oauth_client_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.oauth_client_states (id, provider_type, code_verifier, created_at) FROM stdin;
\.


--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.oauth_clients (id, client_secret_hash, registration_type, redirect_uris, grant_types, client_name, client_uri, logo_uri, created_at, updated_at, deleted_at, client_type, token_endpoint_auth_method) FROM stdin;
\.


--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.oauth_consents (id, user_id, client_id, scopes, granted_at, revoked_at) FROM stdin;
\.


--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.one_time_tokens (id, user_id, token_type, token_hash, relates_to, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.refresh_tokens (instance_id, id, token, user_id, revoked, created_at, updated_at, parent, session_id) FROM stdin;
00000000-0000-0000-0000-000000000000	7	7w2a26pwx2d6	1a9105d7-e0d8-4d02-9a88-b34ec796f1c7	t	2026-06-15 16:15:01.384431+00	2026-06-15 17:19:07.826104+00	\N	18e51522-c726-494d-84ce-4036e41fdb0e
00000000-0000-0000-0000-000000000000	8	3mud7k7grkrw	1a9105d7-e0d8-4d02-9a88-b34ec796f1c7	t	2026-06-15 17:19:07.835118+00	2026-06-15 18:18:11.879667+00	7w2a26pwx2d6	18e51522-c726-494d-84ce-4036e41fdb0e
00000000-0000-0000-0000-000000000000	9	iresgwrvtbvd	1a9105d7-e0d8-4d02-9a88-b34ec796f1c7	t	2026-06-15 18:18:11.895891+00	2026-06-15 20:27:35.393821+00	3mud7k7grkrw	18e51522-c726-494d-84ce-4036e41fdb0e
00000000-0000-0000-0000-000000000000	11	z3qsxjefcf72	1a9105d7-e0d8-4d02-9a88-b34ec796f1c7	t	2026-06-15 21:20:06.900345+00	2026-06-15 22:41:08.42669+00	\N	c92f7942-7b7e-4425-b997-4d755798511e
00000000-0000-0000-0000-000000000000	12	zii53kpnyvcu	1a9105d7-e0d8-4d02-9a88-b34ec796f1c7	t	2026-06-15 22:41:08.437056+00	2026-06-15 23:41:33.304346+00	z3qsxjefcf72	c92f7942-7b7e-4425-b997-4d755798511e
00000000-0000-0000-0000-000000000000	13	zqwiso56on3b	1a9105d7-e0d8-4d02-9a88-b34ec796f1c7	t	2026-06-15 23:41:33.316011+00	2026-06-16 00:40:31.217779+00	zii53kpnyvcu	c92f7942-7b7e-4425-b997-4d755798511e
00000000-0000-0000-0000-000000000000	14	h3e4w3shdzes	1a9105d7-e0d8-4d02-9a88-b34ec796f1c7	t	2026-06-16 00:40:31.228869+00	2026-06-16 01:44:25.241021+00	zqwiso56on3b	c92f7942-7b7e-4425-b997-4d755798511e
00000000-0000-0000-0000-000000000000	15	t4yte72u4upf	1a9105d7-e0d8-4d02-9a88-b34ec796f1c7	t	2026-06-16 01:44:25.250233+00	2026-06-16 23:18:24.561036+00	h3e4w3shdzes	c92f7942-7b7e-4425-b997-4d755798511e
00000000-0000-0000-0000-000000000000	10	pm3gudhqultz	1a9105d7-e0d8-4d02-9a88-b34ec796f1c7	t	2026-06-15 20:27:35.404372+00	2026-06-16 23:18:34.446146+00	iresgwrvtbvd	18e51522-c726-494d-84ce-4036e41fdb0e
00000000-0000-0000-0000-000000000000	17	q5tacyqrmpv3	1a9105d7-e0d8-4d02-9a88-b34ec796f1c7	t	2026-06-16 23:18:34.446521+00	2026-06-17 01:13:15.702428+00	pm3gudhqultz	18e51522-c726-494d-84ce-4036e41fdb0e
00000000-0000-0000-0000-000000000000	16	vc7ltaf3tefd	1a9105d7-e0d8-4d02-9a88-b34ec796f1c7	t	2026-06-16 23:18:24.582662+00	2026-06-17 01:36:22.117844+00	t4yte72u4upf	c92f7942-7b7e-4425-b997-4d755798511e
00000000-0000-0000-0000-000000000000	19	rbrevwy4qzix	1a9105d7-e0d8-4d02-9a88-b34ec796f1c7	t	2026-06-17 01:36:22.125658+00	2026-06-18 00:36:07.108097+00	vc7ltaf3tefd	c92f7942-7b7e-4425-b997-4d755798511e
00000000-0000-0000-0000-000000000000	18	w4efnf5zivnz	1a9105d7-e0d8-4d02-9a88-b34ec796f1c7	t	2026-06-17 01:13:15.717986+00	2026-06-18 00:36:07.106528+00	q5tacyqrmpv3	18e51522-c726-494d-84ce-4036e41fdb0e
00000000-0000-0000-0000-000000000000	20	mpa7iq63hj42	1a9105d7-e0d8-4d02-9a88-b34ec796f1c7	t	2026-06-18 00:36:07.126543+00	2026-06-18 23:38:09.256127+00	w4efnf5zivnz	18e51522-c726-494d-84ce-4036e41fdb0e
00000000-0000-0000-0000-000000000000	21	ncxpwxp7wuco	1a9105d7-e0d8-4d02-9a88-b34ec796f1c7	t	2026-06-18 00:36:07.12655+00	2026-06-18 23:38:09.256346+00	rbrevwy4qzix	c92f7942-7b7e-4425-b997-4d755798511e
00000000-0000-0000-0000-000000000000	22	xseqzf5gcu7h	1a9105d7-e0d8-4d02-9a88-b34ec796f1c7	f	2026-06-18 23:38:09.275629+00	2026-06-18 23:38:09.275629+00	ncxpwxp7wuco	c92f7942-7b7e-4425-b997-4d755798511e
00000000-0000-0000-0000-000000000000	23	2zwuqh2s5tky	1a9105d7-e0d8-4d02-9a88-b34ec796f1c7	t	2026-06-18 23:38:09.275476+00	2026-06-19 01:33:57.288791+00	mpa7iq63hj42	18e51522-c726-494d-84ce-4036e41fdb0e
00000000-0000-0000-0000-000000000000	25	oouxh7rj4gnq	1a9105d7-e0d8-4d02-9a88-b34ec796f1c7	f	2026-06-24 22:06:33.155444+00	2026-06-24 22:06:33.155444+00	\N	b8884462-da80-49a1-b515-9b808a4b1890
00000000-0000-0000-0000-000000000000	26	7rutwe3dixb5	1a9105d7-e0d8-4d02-9a88-b34ec796f1c7	t	2026-06-24 22:47:52.830245+00	2026-06-29 15:14:27.835689+00	\N	a5c56ee2-14c0-4275-9449-0a6ad5f6896e
00000000-0000-0000-0000-000000000000	27	46imbef3bm5r	1a9105d7-e0d8-4d02-9a88-b34ec796f1c7	f	2026-06-29 15:14:27.859409+00	2026-06-29 15:14:27.859409+00	7rutwe3dixb5	a5c56ee2-14c0-4275-9449-0a6ad5f6896e
00000000-0000-0000-0000-000000000000	28	obs4tsd3vh3m	1a9105d7-e0d8-4d02-9a88-b34ec796f1c7	t	2026-07-10 03:21:55.953885+00	2026-07-10 20:31:05.18106+00	\N	2efeef57-4a7d-4b50-8f8c-2dbd9d68dabd
00000000-0000-0000-0000-000000000000	29	h2443gvoxt5g	1a9105d7-e0d8-4d02-9a88-b34ec796f1c7	t	2026-07-10 20:31:05.189693+00	2026-07-10 21:52:06.162206+00	obs4tsd3vh3m	2efeef57-4a7d-4b50-8f8c-2dbd9d68dabd
00000000-0000-0000-0000-000000000000	30	o7y6r2uzu5iz	1a9105d7-e0d8-4d02-9a88-b34ec796f1c7	t	2026-07-10 21:52:06.170787+00	2026-07-10 22:51:57.249126+00	h2443gvoxt5g	2efeef57-4a7d-4b50-8f8c-2dbd9d68dabd
00000000-0000-0000-0000-000000000000	31	guvmrnri7sdm	1a9105d7-e0d8-4d02-9a88-b34ec796f1c7	t	2026-07-10 22:51:57.253693+00	2026-07-10 23:53:17.539018+00	o7y6r2uzu5iz	2efeef57-4a7d-4b50-8f8c-2dbd9d68dabd
00000000-0000-0000-0000-000000000000	32	mlkbgjig2yj5	1a9105d7-e0d8-4d02-9a88-b34ec796f1c7	t	2026-07-10 23:53:17.54846+00	2026-07-11 01:00:44.88132+00	guvmrnri7sdm	2efeef57-4a7d-4b50-8f8c-2dbd9d68dabd
00000000-0000-0000-0000-000000000000	33	t43wxlvq5cyn	1a9105d7-e0d8-4d02-9a88-b34ec796f1c7	f	2026-07-11 01:00:44.893843+00	2026-07-11 01:00:44.893843+00	mlkbgjig2yj5	2efeef57-4a7d-4b50-8f8c-2dbd9d68dabd
00000000-0000-0000-0000-000000000000	24	v7f4d7nbodh5	1a9105d7-e0d8-4d02-9a88-b34ec796f1c7	t	2026-06-19 01:33:57.298171+00	2026-07-11 19:37:27.809617+00	2zwuqh2s5tky	18e51522-c726-494d-84ce-4036e41fdb0e
00000000-0000-0000-0000-000000000000	34	xjzkkiiu4ldn	1a9105d7-e0d8-4d02-9a88-b34ec796f1c7	t	2026-07-11 19:37:27.829304+00	2026-07-11 21:27:24.474382+00	v7f4d7nbodh5	18e51522-c726-494d-84ce-4036e41fdb0e
00000000-0000-0000-0000-000000000000	35	7xnyyc2p7rom	1a9105d7-e0d8-4d02-9a88-b34ec796f1c7	t	2026-07-11 21:27:24.486818+00	2026-07-12 00:38:22.824906+00	xjzkkiiu4ldn	18e51522-c726-494d-84ce-4036e41fdb0e
00000000-0000-0000-0000-000000000000	36	6t7lefnbwuww	1a9105d7-e0d8-4d02-9a88-b34ec796f1c7	t	2026-07-12 00:38:22.836313+00	2026-07-12 18:54:56.653881+00	7xnyyc2p7rom	18e51522-c726-494d-84ce-4036e41fdb0e
00000000-0000-0000-0000-000000000000	37	ubkoyks7uow6	1a9105d7-e0d8-4d02-9a88-b34ec796f1c7	t	2026-07-12 18:54:56.675883+00	2026-07-12 19:57:42.880952+00	6t7lefnbwuww	18e51522-c726-494d-84ce-4036e41fdb0e
00000000-0000-0000-0000-000000000000	38	xixbrndgsjnm	1a9105d7-e0d8-4d02-9a88-b34ec796f1c7	t	2026-07-12 19:57:42.890608+00	2026-07-12 20:57:16.406042+00	ubkoyks7uow6	18e51522-c726-494d-84ce-4036e41fdb0e
00000000-0000-0000-0000-000000000000	39	olqr4ejintmp	1a9105d7-e0d8-4d02-9a88-b34ec796f1c7	f	2026-07-12 20:57:16.416764+00	2026-07-12 20:57:16.416764+00	xixbrndgsjnm	18e51522-c726-494d-84ce-4036e41fdb0e
\.


--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.saml_providers (id, sso_provider_id, entity_id, metadata_xml, metadata_url, attribute_mapping, created_at, updated_at, name_id_format) FROM stdin;
\.


--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.saml_relay_states (id, sso_provider_id, request_id, for_email, redirect_to, created_at, updated_at, flow_state_id) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.schema_migrations (version) FROM stdin;
20171026211738
20171026211808
20171026211834
20180103212743
20180108183307
20180119214651
20180125194653
00
20210710035447
20210722035447
20210730183235
20210909172000
20210927181326
20211122151130
20211124214934
20211202183645
20220114185221
20220114185340
20220224000811
20220323170000
20220429102000
20220531120530
20220614074223
20220811173540
20221003041349
20221003041400
20221011041400
20221020193600
20221021073300
20221021082433
20221027105023
20221114143122
20221114143410
20221125140132
20221208132122
20221215195500
20221215195800
20221215195900
20230116124310
20230116124412
20230131181311
20230322519590
20230402418590
20230411005111
20230508135423
20230523124323
20230818113222
20230914180801
20231027141322
20231114161723
20231117164230
20240115144230
20240214120130
20240306115329
20240314092811
20240427152123
20240612123726
20240729123726
20240802193726
20240806073726
20241009103726
20250717082212
20250731150234
20250804100000
20250901200500
20250903112500
20250904133000
20250925093508
20251007112900
20251104100000
20251111201300
20251201000000
20260115000000
20260121000000
20260219120000
20260302000000
20260625000000
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.sessions (id, user_id, created_at, updated_at, factor_id, aal, not_after, refreshed_at, user_agent, ip, tag, oauth_client_id, refresh_token_hmac_key, refresh_token_counter, scopes) FROM stdin;
18e51522-c726-494d-84ce-4036e41fdb0e	1a9105d7-e0d8-4d02-9a88-b34ec796f1c7	2026-06-15 16:15:01.372117+00	2026-07-12 20:57:16.425302+00	\N	aal1	\N	2026-07-12 20:57:16.42518	node	190.60.32.85	\N	\N	\N	\N	\N
c92f7942-7b7e-4425-b997-4d755798511e	1a9105d7-e0d8-4d02-9a88-b34ec796f1c7	2026-06-15 21:20:06.884546+00	2026-06-18 23:38:09.304284+00	\N	aal1	\N	2026-06-18 23:38:09.304191	Next.js Middleware	179.1.110.227	\N	\N	\N	\N	\N
b8884462-da80-49a1-b515-9b808a4b1890	1a9105d7-e0d8-4d02-9a88-b34ec796f1c7	2026-06-24 22:06:33.126709+00	2026-06-24 22:06:33.126709+00	\N	aal1	\N	\N	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:152.0) Gecko/20100101 Firefox/152.0	190.251.226.22	\N	\N	\N	\N	\N
a5c56ee2-14c0-4275-9449-0a6ad5f6896e	1a9105d7-e0d8-4d02-9a88-b34ec796f1c7	2026-06-24 22:47:52.807166+00	2026-06-29 15:14:28.375916+00	\N	aal1	\N	2026-06-29 15:14:28.375785	Next.js Middleware	190.251.226.22	\N	\N	\N	\N	\N
2efeef57-4a7d-4b50-8f8c-2dbd9d68dabd	1a9105d7-e0d8-4d02-9a88-b34ec796f1c7	2026-07-10 03:21:55.934183+00	2026-07-11 01:00:44.908333+00	\N	aal1	\N	2026-07-11 01:00:44.908213	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	181.50.221.186	\N	\N	\N	\N	\N
\.


--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.sso_domains (id, sso_provider_id, domain, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.sso_providers (id, resource_id, created_at, updated_at, disabled) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at, is_anonymous) FROM stdin;
00000000-0000-0000-0000-000000000000	dfb79c19-84a3-4ddc-890d-854173a7e13e	authenticated	authenticated	nany931007@gmail.com	$2a$10$M.jAYXRTn9xsYrb/gZEFZum1H3GeEeXUqyF09oQvF7F/v3a6eTVBi	2026-06-15 00:58:00.887051+00	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{"id_cliente": "40bbd14d-bea0-44aa-9ff0-516f0fd5d5f5", "tipo_usuario": "cliente", "email_verified": true, "must_change_password": true}	\N	2026-06-15 00:58:00.875308+00	2026-06-15 00:59:51.93487+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	1a9105d7-e0d8-4d02-9a88-b34ec796f1c7	authenticated	authenticated	anamariagarcia093@gmail.com	$2a$10$.qga4ZN.Dz4NtIYvXaEIjOJQ1UhRL3/DnRB3H1wSbxqsuO8C/DCZC	2026-06-14 23:13:03.433214+00	\N		\N		\N			\N	2026-07-10 03:21:55.932931+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2026-06-14 23:13:03.416219+00	2026-07-12 20:57:16.420001+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	2363da67-5223-4fd2-96bf-0fa415ecacf6	authenticated	authenticated	rigoramirez1313@gmail.com	$2a$10$FsvWHgVvV8M8uuWcJPXZAu4ec9h8fIqfvMsR5TKHbsTh.Q3jN0ckG	2026-06-24 21:48:02.378258+00	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2026-06-24 21:48:02.343888+00	2026-06-24 21:48:02.379819+00	\N	\N			\N		0	\N		\N	f	\N	f
\.


--
-- Data for Name: webauthn_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.webauthn_challenges (id, user_id, challenge_type, session_data, created_at, expires_at) FROM stdin;
\.


--
-- Data for Name: webauthn_credentials; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.webauthn_credentials (id, user_id, credential_id, public_key, attestation_type, aaguid, sign_count, transports, backup_eligible, backed_up, friendly_name, created_at, updated_at, last_used_at) FROM stdin;
\.


--
-- Data for Name: barrios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.barrios (id_comuna, nombre, creado_en, id) FROM stdin;
11	Sin Identificar	2026-07-12 21:07:40.132027+00	1
6	Aeropuerto	2026-07-12 21:07:40.335312+00	2
10	Alfonso Lopez	2026-07-12 21:07:40.530065+00	3
11	Antioquia	2026-07-12 21:07:40.718638+00	4
8	Antonia Santos	2026-07-12 21:07:40.897372+00	5
9	Barrio Nuevo	2026-07-12 21:07:41.075197+00	6
8	Belisario	2026-07-12 21:07:41.274809+00	7
3	Bellavista	2026-07-12 21:07:41.474435+00	8
3	Bocono	2026-07-12 21:07:41.671789+00	9
7	Buenos Aires	2026-07-12 21:07:41.85285+00	10
1	Callejon	2026-07-12 21:07:42.03802+00	11
7	Camilo Daza	2026-07-12 21:07:42.217743+00	12
11	Carcel	2026-07-12 21:07:42.397396+00	13
6	Carlos Pizarro	2026-07-12 21:07:42.583852+00	14
8	Carlos Ramirez Paris	2026-07-12 21:07:42.776372+00	15
9	Carora	2026-07-12 21:07:42.961477+00	16
11	Centro	2026-07-12 21:07:43.140267+00	17
11	Cesar	2026-07-12 21:07:43.36732+00	18
11	Cgto Aguaclara	2026-07-12 21:07:43.609867+00	19
11	Cgto Banco De Arena	2026-07-12 21:07:43.869873+00	20
11	Cgto Buena Esperanza	2026-07-12 21:07:44.065325+00	21
11	Cgto Carmen De Tonchala	2026-07-12 21:07:44.243004+00	22
11	Cgto Guaramito	2026-07-12 21:07:44.422525+00	23
11	Cgto Limoncito	2026-07-12 21:07:44.629885+00	24
11	Cgto Palmarito	2026-07-12 21:07:44.877211+00	25
11	Cgto Puerto Villamizar	2026-07-12 21:07:45.089576+00	26
11	Cgto San Faustino	2026-07-12 21:07:45.281618+00	27
11	Cgto San Pedro	2026-07-12 21:07:45.468657+00	28
7	Chapinero	2026-07-12 21:07:45.648278+00	29
2	Colsag	2026-07-12 21:07:45.828634+00	30
7	Comuneros	2026-07-12 21:07:46.008138+00	31
1	Contento/paramo	2026-07-12 21:07:46.206249+00	32
11	Corregimiento Ricaurte	2026-07-12 21:07:46.407862+00	33
10	Cuberos Niño	2026-07-12 21:07:46.589493+00	34
8	Cucuta 75	2026-07-12 21:07:46.777058+00	35
8	Doña Nidia	2026-07-12 21:07:46.960414+00	36
5	El Bosque	2026-07-12 21:07:47.152889+00	37
11	El Carmen	2026-07-12 21:07:47.334522+00	38
6	El Cerrito	2026-07-12 21:07:47.526745+00	39
8	El Rodeo	2026-07-12 21:07:47.710872+00	40
7	El Rosal	2026-07-12 21:07:47.888918+00	41
6	El Salado	2026-07-12 21:07:48.069723+00	42
11	El Tarra	2026-07-12 21:07:48.259254+00	43
11	El Zulia	2026-07-12 21:07:48.455151+00	44
4	Escobal	2026-07-12 21:07:48.646302+00	45
10	Gaitan	2026-07-12 21:07:48.83525+00	46
5	Guaimaral	2026-07-12 21:07:49.015563+00	47
5	Inem	2026-07-12 21:07:49.194303+00	48
2	La Canasta	2026-07-12 21:07:49.380072+00	49
9	La Divina Pastora	2026-07-12 21:07:49.574178+00	50
11	La Esperanza	2026-07-12 21:07:49.76613+00	51
11	La Guajira	2026-07-12 21:07:49.947209+00	52
11	La Playa	2026-07-12 21:07:50.125866+00	53
8	La Victoria	2026-07-12 21:07:50.326242+00	54
11	Labateca	2026-07-12 21:07:50.518909+00	55
3	Libertad	2026-07-12 21:07:50.70652+00	56
1	Llano	2026-07-12 21:07:50.902676+00	57
9	Loma De Bolivar	2026-07-12 21:07:51.092616+00	58
8	Los Olivos	2026-07-12 21:07:51.275521+00	59
11	Los Patios	2026-07-12 21:07:51.455848+00	60
11	Lourdes	2026-07-12 21:07:51.662762+00	61
11	Magdalena	2026-07-12 21:07:51.862965+00	62
11	Meta	2026-07-12 21:07:52.058261+00	63
6	Metropoli	2026-07-12 21:07:52.236055+00	64
7	Ospina Perez	2026-07-12 21:07:52.418542+00	65
5	Pescadero	2026-07-12 21:07:52.598544+00	66
2	Popular	2026-07-12 21:07:52.781805+00	67
4	Prados Del Este	2026-07-12 21:07:52.971664+00	68
5	Prados Norte	2026-07-12 21:07:53.163579+00	69
11	Puerto Santander	2026-07-12 21:07:53.348776+00	70
11	Ragonvalia	2026-07-12 21:07:53.532145+00	71
11	Risaralda	2026-07-12 21:07:53.725788+00	72
1	Sagrado Corazon	2026-07-12 21:07:53.919632+00	73
11	San Calixto	2026-07-12 21:07:54.107279+00	74
11	San Cayetano	2026-07-12 21:07:54.2989+00	75
5	San Eduardo	2026-07-12 21:07:54.527201+00	76
10	San Jose	2026-07-12 21:07:54.81289+00	77
4	San Luis	2026-07-12 21:07:55.032351+00	78
4	San Martin	2026-07-12 21:07:55.30941+00	79
3	San Mateo	2026-07-12 21:07:55.536738+00	80
10	San Rafael	2026-07-12 21:07:55.738718+00	81
11	Santander	2026-07-12 21:07:55.943498+00	82
11	Santiago	2026-07-12 21:07:56.150882+00	83
11	Sardinata	2026-07-12 21:07:56.336999+00	84
5	Sevilla	2026-07-12 21:07:56.535349+00	85
11	Toledo	2026-07-12 21:07:56.726501+00	86
6	Toledo Plata	2026-07-12 21:07:56.9254+00	87
4	Torcoroma	2026-07-12 21:07:57.104209+00	88
6	Trigal Del Norte	2026-07-12 21:07:57.287363+00	89
7	Tucunare	2026-07-12 21:07:57.468721+00	90
2	Ufps	2026-07-12 21:07:57.661654+00	91
11	Valle De Cauca	2026-07-12 21:07:57.845239+00	92
3	Valle Esther	2026-07-12 21:07:58.040729+00	93
11	Villa Caro	2026-07-12 21:07:58.227148+00	94
11	Villa Del Rosario	2026-07-12 21:07:58.425232+00	95
6	Villanueva	2026-07-12 21:07:58.6179+00	96
5	Zulima Y San Geronimo	2026-07-12 21:07:58.828513+00	97
\.


--
-- Data for Name: campanas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.campanas (id_cliente, id_proceso_electoral, nombre, estado, iniciado_en, finalizado_en, purgado_en, creado_en, actualizado_en, id) FROM stdin;
1	1	Campaña001	activa	2026-07-12 00:39:51.17+00	\N	\N	2026-07-12 00:39:51.395629+00	2026-07-12 00:39:51.395629+00	1
\.


--
-- Data for Name: caracteristicas_campana; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.caracteristicas_campana (id_campana, resolutor_captcha, auditoria_e14, whatsapp, telegram, captura_web, actualizado_en) FROM stdin;
1	f	f	f	f	t	2026-07-12 00:39:51.395629+00
\.


--
-- Data for Name: clientes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.clientes (nombre, documento, telefono, correo_contacto, notas, creado_en, actualizado_en, id_usuario, id) FROM stdin;
Ana Maria Garcia Arias	1090470953	3005424395	nany931007@gmail.com	\N	2026-06-15 00:58:00.390826+00	2026-07-11 22:46:47.793432+00	dfb79c19-84a3-4ddc-890d-854173a7e13e	1
\.


--
-- Data for Name: comunas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.comunas (id_campana, nombre, creado_en, id) FROM stdin;
1	Comuna 1 Centro	2026-07-12 21:03:39.368405+00	1
1	Comuna 2 Centro Oriental	2026-07-12 21:03:39.567302+00	2
1	Comuna 3 Sur Oriental	2026-07-12 21:03:39.757155+00	3
1	Comuna 4 Oriental	2026-07-12 21:03:39.952201+00	4
1	Comuna 5 Nororiental	2026-07-12 21:03:40.133242+00	5
1	Comuna 6 Norte	2026-07-12 21:03:40.313417+00	6
1	Comuna 7 Nor Occidental	2026-07-12 21:03:40.509714+00	7
1	Comuna 8 Occidental	2026-07-12 21:03:40.691424+00	8
1	Comuna 9 Sur Occidental	2026-07-12 21:03:40.884209+00	9
1	Comuna 10 Sur	2026-07-12 21:03:41.078567+00	10
1	No Aplica	2026-07-12 21:03:41.259402+00	11
\.


--
-- Data for Name: configuracion_integracion_plataforma; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.configuracion_integracion_plataforma (proveedor, configuracion, activa, creado_en, actualizado_en) FROM stdin;
\.


--
-- Data for Name: configuracion_marca_plataforma; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.configuracion_marca_plataforma (id, url_logo, color_primario, color_secundario, familia_fuente, actualizado_en, color_acento, color_fondo_sidebar, color_fondo_pagina, nombre_plataforma, etiqueta_panel, texto_alt_logo, url_favicon, subtitulo_login, texto_boton_login, login_fondo_exterior, login_fondo_centro, login_panel_fondo, login_boton_fondo, fuente_titulos, fuente_subtitulos, fuente_cuerpo, color_titulo, color_subtitulo, color_texto, color_etiqueta, peso_titulo, peso_subtitulo, peso_texto, peso_etiqueta) FROM stdin;
1	https://kadhnauhghzyhfhsomif.supabase.co/storage/v1/object/public/platform-assets/brand/logo.png?v=1781537037984	#1e40af	#64748b	Inter	2026-06-16 00:27:26.369189+00	#2563eb	#0f172a	#f1f5f9	Plataforma	Campañas	Plataforma de campañas	https://kadhnauhghzyhfhsomif.supabase.co/storage/v1/object/public/platform-assets/brand/favicon.png?v=1781535589435	Accede con tu usuario y contraseña	INICIAR SESIÓN	#1e3a8a	#60a5fa	rgba(31, 41, 55, 0.55)	#1d4ed8	Inter	Inter	Inter	#111827	#6b7280	#374151	#525252	700	400	400	500
\.


--
-- Data for Name: cuarentena_votantes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cuarentena_votantes (id_campana, nombres, apellidos, documento, tipo_documento, sexo, telefono, direccion, id_puesto_votacion, mesa, id_rol, id_lider_directo, id_votante_conflicto, id_cuarentena_conflicto, tipo_coincidencia, similitud_nombre, estado, canal_origen, creado_por, resuelto_por, resuelto_en, notas_resolucion, creado_en, actualizado_en, fecha_nacimiento, id_lugar_trabajo, id) FROM stdin;
\.


--
-- Data for Name: datos_trabajador_votante; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.datos_trabajador_votante (id_votante, lugar_trabajo, direccion_trabajo, id_comuna, id_barrio, creado_en, actualizado_en, id) FROM stdin;
\.


--
-- Data for Name: exportaciones_campana; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.exportaciones_campana (id_campana, exportado_por, ruta_almacenamiento, tamano_archivo, creado_en, id) FROM stdin;
\.


--
-- Data for Name: integraciones_campana; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.integraciones_campana (id_campana, proveedor, configuracion_cifrada, activa, creado_en, actualizado_en, id) FROM stdin;
\.


--
-- Data for Name: lugares_trabajo; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lugares_trabajo (id_campana, nombre, direccion, id_comuna, id_barrio, creado_en, actualizado_en, id) FROM stdin;
\.


--
-- Data for Name: miembros_campana; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.miembros_campana (id_campana, id_usuario, rol, creado_en, id) FROM stdin;
1	dfb79c19-84a3-4ddc-890d-854173a7e13e	administrador_campana	2026-07-12 00:39:51.814792+00	1
\.


--
-- Data for Name: miembros_cliente; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.miembros_cliente (id_usuario, creado_en, id, id_cliente) FROM stdin;
dfb79c19-84a3-4ddc-890d-854173a7e13e	2026-06-15 00:58:01.303384+00	1	1
\.


--
-- Data for Name: miembros_plataforma; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.miembros_plataforma (id_usuario, rol, creado_en) FROM stdin;
1a9105d7-e0d8-4d02-9a88-b34ec796f1c7	dueno_plataforma	2026-06-14 23:14:01.377577+00
\.


--
-- Data for Name: novedades; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.novedades (id_votante, id_tipo_novedad, detalle, creado_por, creado_en, id) FROM stdin;
\.


--
-- Data for Name: procesos_electorales; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.procesos_electorales (nombre, fecha_eleccion, creado_en, id) FROM stdin;
Alcaldia 2028	2028-11-14	2026-06-14 23:44:13.535536+00	1
Presidencia 2026	2026-06-21	2026-06-15 01:23:26.30312+00	2
\.


--
-- Data for Name: puestos_votacion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.puestos_votacion (id_campana, id_comuna, id_barrio, nombre, municipio, direccion, votantes_hombres_admite, votantes_mujeres_admite, cantidad_mesas, fuente, actualizado_registraduria_en, creado_en, actualizado_en, embedding, id) FROM stdin;
1	11	1	Escuela La Piñuela - Abrego	Abrego	Cra.6 Calle 5 Y 5a	2473	2479	15	registraduria	2026-07-12 21:13:01.065347+00	2026-07-12 21:13:01.065347+00	2026-07-12 21:13:01.065347+00	\N	1
1	11	1	Colegio Santa Barbara - Abrego	Abrego	Cra. 1 Y 2 Calle 19 Barrio Los Alpes	3439	3246	21	registraduria	2026-07-12 21:13:01.274714+00	2026-07-12 21:13:01.274714+00	2026-07-12 21:13:01.274714+00	\N	2
1	11	1	Escuela Bolivar - Abrego	Abrego	Cra.5 Calle 11	1339	2490	12	registraduria	2026-07-12 21:13:01.462807+00	2026-07-12 21:13:01.462807+00	2026-07-12 21:13:01.462807+00	\N	3
1	11	1	Escuela San Antonio - Abrego	Abrego	Cra 9 Entre Cll 16a Y Cll 17	2931	1612	14	registraduria	2026-07-12 21:13:01.651513+00	2026-07-12 21:13:01.651513+00	2026-07-12 21:13:01.651513+00	\N	4
1	11	1	Megacolegio Carlos Julio Torrado P. - Abrego	Abrego	Kdx 23 A Vereda Rio Frio	91	80	1	registraduria	2026-07-12 21:13:01.848811+00	2026-07-12 21:13:01.848811+00	2026-07-12 21:13:01.848811+00	\N	5
1	11	1	Casitas - Abrego	Abrego	Esc Rural Casitas	151	130	1	registraduria	2026-07-12 21:13:02.039323+00	2026-07-12 21:13:02.039323+00	2026-07-12 21:13:02.039323+00	\N	6
1	11	1	Capitanlargo - Abrego	Abrego	Esc Rural Capitanlargo	437	383	3	registraduria	2026-07-12 21:13:02.229043+00	2026-07-12 21:13:02.229043+00	2026-07-12 21:13:02.229043+00	\N	7
1	11	1	La Arenosa - Abrego	Abrego	Esc Rural La Arenosa	188	130	1	registraduria	2026-07-12 21:13:02.417795+00	2026-07-12 21:13:02.417795+00	2026-07-12 21:13:02.417795+00	\N	8
1	11	1	El Tarra Viejo - Abrego	Abrego	Vda Tarra Viejo-Escuela Rural Tarra Viejo	42	34	1	registraduria	2026-07-12 21:13:02.621038+00	2026-07-12 21:13:02.621038+00	2026-07-12 21:13:02.621038+00	\N	9
1	11	1	La Maria - Abrego	Abrego	Esc Rural La Maria	169	120	1	registraduria	2026-07-12 21:13:02.80319+00	2026-07-12 21:13:02.80319+00	2026-07-12 21:13:02.80319+00	\N	10
1	11	1	San Jose - Abrego	Abrego	Esc Rural San Jose	15	21	1	registraduria	2026-07-12 21:13:02.991347+00	2026-07-12 21:13:02.991347+00	2026-07-12 21:13:02.991347+00	\N	11
1	11	1	San Vicente - Abrego	Abrego	Esc Rural San Vicente	248	202	2	registraduria	2026-07-12 21:13:03.178671+00	2026-07-12 21:13:03.178671+00	2026-07-12 21:13:03.178671+00	\N	12
1	11	1	El Guamal - Abrego	Abrego	Esc Rural Pavez	356	222	2	registraduria	2026-07-12 21:13:03.382081+00	2026-07-12 21:13:03.382081+00	2026-07-12 21:13:03.382081+00	\N	13
1	11	1	El Llanon - Abrego	Abrego	Esc Rural El Llanon	132	102	1	registraduria	2026-07-12 21:13:03.571735+00	2026-07-12 21:13:03.571735+00	2026-07-12 21:13:03.571735+00	\N	14
1	11	1	El Tarra - Abrego	Abrego	Esc Rural El Tarra	198	183	2	registraduria	2026-07-12 21:13:03.777401+00	2026-07-12 21:13:03.777401+00	2026-07-12 21:13:03.777401+00	\N	15
1	11	1	El Tabaco - Abrego	Abrego	Esc Rural El Tabaco	85	59	1	registraduria	2026-07-12 21:13:03.976328+00	2026-07-12 21:13:03.976328+00	2026-07-12 21:13:03.976328+00	\N	16
1	11	1	El Higueron - Abrego	Abrego	Esc Rural El Higueron	91	95	1	registraduria	2026-07-12 21:13:04.166013+00	2026-07-12 21:13:04.166013+00	2026-07-12 21:13:04.166013+00	\N	17
1	11	1	El Loro - Abrego	Abrego	Esc Rural El Loro	35	23	1	registraduria	2026-07-12 21:13:04.352788+00	2026-07-12 21:13:04.352788+00	2026-07-12 21:13:04.352788+00	\N	18
1	11	1	Gaira - Abrego	Abrego	Esc Rural Gaira	61	53	1	registraduria	2026-07-12 21:13:04.557728+00	2026-07-12 21:13:04.557728+00	2026-07-12 21:13:04.557728+00	\N	19
1	11	1	Hoyo Pilon - Abrego	Abrego	Esc Rural Hoyo Pilon	211	151	2	registraduria	2026-07-12 21:13:04.763958+00	2026-07-12 21:13:04.763958+00	2026-07-12 21:13:04.763958+00	\N	20
1	11	1	La Sierra - Abrego	Abrego	Esc Rural La Sierra	199	179	2	registraduria	2026-07-12 21:13:04.967088+00	2026-07-12 21:13:04.967088+00	2026-07-12 21:13:04.967088+00	\N	21
1	11	1	Los Indios - Abrego	Abrego	Esc Rural Los Indios	52	20	1	registraduria	2026-07-12 21:13:05.153515+00	2026-07-12 21:13:05.153515+00	2026-07-12 21:13:05.153515+00	\N	22
1	11	1	Canoas - Abrego	Abrego	Esc Rural Canoas	31	21	1	registraduria	2026-07-12 21:13:05.346372+00	2026-07-12 21:13:05.346372+00	2026-07-12 21:13:05.346372+00	\N	23
1	11	1	Montecristo - Abrego	Abrego	Esc Rural Montecristo	24	17	1	registraduria	2026-07-12 21:13:05.530636+00	2026-07-12 21:13:05.530636+00	2026-07-12 21:13:05.530636+00	\N	24
1	11	1	Playoncitos - Abrego	Abrego	Esc Rural Playoncitos	89	54	1	registraduria	2026-07-12 21:13:05.723167+00	2026-07-12 21:13:05.723167+00	2026-07-12 21:13:05.723167+00	\N	25
1	6	2	Col Municipal Aeropuerto	Cucuta	Cl. 9 N# 3-60 Br. Aeropuerto	7579	8871	47	registraduria	2026-07-12 21:13:05.91686+00	2026-07-12 21:13:05.91686+00	2026-07-12 21:13:05.91686+00	\N	26
1	6	2	Ie Virgilio Barco-Col Mpal Aeropuerto	Cucuta	Cll 24 # 2-45	12	18	10	registraduria	2026-07-12 21:13:06.100911+00	2026-07-12 21:13:06.100911+00	2026-07-12 21:13:06.100911+00	\N	27
1	10	3	Esc Francisco De Paula Andrade No 9	Cucuta	Av. 14 No. 21-50 Barrio Alfonso Lopez	5388	6331	36	registraduria	2026-07-12 21:13:06.284842+00	2026-07-12 21:13:06.284842+00	2026-07-12 21:13:06.284842+00	\N	28
1	11	4	Antioquia	Antioquia	Antioquia	0	0	0	registraduria	2026-07-12 21:13:06.474991+00	2026-07-12 21:13:06.474991+00	2026-07-12 21:13:06.474991+00	\N	29
1	8	5	Inst Tecn Carlos Ramirez Paris	Cucuta	Cl. 18 # 51-33 Br. Antonia Santos	7309	8281	43	registraduria	2026-07-12 21:13:06.679925+00	2026-07-12 21:13:06.679925+00	2026-07-12 21:13:06.679925+00	\N	30
1	11	1	Arauca	Arauca	Arauca	0	0	0	registraduria	2026-07-12 21:13:06.871666+00	2026-07-12 21:13:06.871666+00	2026-07-12 21:13:06.871666+00	\N	31
1	11	1	Guzaman - Arboledas	Arboledas	Esc Rural Guzaman	119	110	1	registraduria	2026-07-12 21:13:07.070094+00	2026-07-12 21:13:07.070094+00	2026-07-12 21:13:07.070094+00	\N	32
1	11	1	Puesto Cabecera Municipal - Arboledas	Arboledas	I.e. San Juan Bosco	2616	2358	15	registraduria	2026-07-12 21:13:07.254417+00	2026-07-12 21:13:07.254417+00	2026-07-12 21:13:07.254417+00	\N	33
1	11	1	Castro - Arboledas	Arboledas	I.e.san Jose De Castro	443	344	3	registraduria	2026-07-12 21:13:07.470796+00	2026-07-12 21:13:07.470796+00	2026-07-12 21:13:07.470796+00	\N	34
1	11	1	Cinera - Arboledas	Arboledas	Esc Rural Cinera	186	148	1	registraduria	2026-07-12 21:13:07.663887+00	2026-07-12 21:13:07.663887+00	2026-07-12 21:13:07.663887+00	\N	35
1	11	1	Barrientos - Arboledas	Arboledas	Esc Rural Barrientos	148	116	1	registraduria	2026-07-12 21:13:07.844074+00	2026-07-12 21:13:07.844074+00	2026-07-12 21:13:07.844074+00	\N	36
1	11	1	La Uvita - Arboledas	Arboledas	Esc Rural Chicagua	135	91	1	registraduria	2026-07-12 21:13:08.029205+00	2026-07-12 21:13:08.029205+00	2026-07-12 21:13:08.029205+00	\N	37
1	11	1	Los Molinos - Arboledas	Arboledas	Esc Rural San Joaquin	135	105	1	registraduria	2026-07-12 21:13:08.281328+00	2026-07-12 21:13:08.281328+00	2026-07-12 21:13:08.281328+00	\N	38
1	11	1	Uvito - Arboledas	Arboledas	Esc Rural El Uvito	34	17	1	registraduria	2026-07-12 21:13:08.57135+00	2026-07-12 21:13:08.57135+00	2026-07-12 21:13:08.57135+00	\N	39
1	11	1	Villa Sucre - Arboledas	Arboledas	I.e.antonio Jose De Sucre	414	248	2	registraduria	2026-07-12 21:13:08.774019+00	2026-07-12 21:13:08.774019+00	2026-07-12 21:13:08.774019+00	\N	40
1	11	1	Atlantico	Atlantico	Atlantico	0	0	0	registraduria	2026-07-12 21:13:08.969582+00	2026-07-12 21:13:08.969582+00	2026-07-12 21:13:08.969582+00	\N	41
1	9	6	Esc. Urb. Varones No 28 Atanasio Gir.	Cucuta	Av 24 No 24-21 Barrio Nuevo	4	6	10	registraduria	2026-07-12 21:13:09.15671+00	2026-07-12 21:13:09.15671+00	2026-07-12 21:13:09.15671+00	\N	42
1	11	1	Col Ntra Sra De Belen 23 Varon	Cucuta	Cl. 25 #. 27-40 Br. Belen	7004	8105	44	registraduria	2026-07-12 21:13:09.337202+00	2026-07-12 21:13:09.337202+00	2026-07-12 21:13:09.337202+00	\N	43
1	8	7	Col Hermano Rodulfo Eloy	Cucuta	Cl. 9 Nro. 15-64 Br. Belisario	4859	5997	30	registraduria	2026-07-12 21:13:09.597169+00	2026-07-12 21:13:09.597169+00	2026-07-12 21:13:09.597169+00	\N	44
1	3	8	Fco Jose De Caldas Sede San Pedro Claver	Cucuta	Cl. 28 #. 10-45 Br. Bellavista	1977	2507	14	registraduria	2026-07-12 21:13:09.795356+00	2026-07-12 21:13:09.795356+00	2026-07-12 21:13:09.795356+00	\N	45
1	11	1	Puesto Cabecera Municipal - Bochalema	Bochalema	Cra 5 #.3-80	3087	2978	19	registraduria	2026-07-12 21:13:09.979841+00	2026-07-12 21:13:09.979841+00	2026-07-12 21:13:09.979841+00	\N	46
1	11	1	Espejuelos (nebraska) - Bochalema	Bochalema	Esc Rural San Antonio La Torre	35	17	1	registraduria	2026-07-12 21:13:10.171271+00	2026-07-12 21:13:10.171271+00	2026-07-12 21:13:10.171271+00	\N	47
1	11	1	Portachuelo - Bochalema	Bochalema	Escuela Rural Portachuelo	103	70	1	registraduria	2026-07-12 21:13:10.821214+00	2026-07-12 21:13:10.821214+00	2026-07-12 21:13:10.821214+00	\N	50
1	11	1	Bolivar	Bolivar	Bolivar	0	0	0	registraduria	2026-07-12 21:13:11.379243+00	2026-07-12 21:13:11.379243+00	2026-07-12 21:13:11.379243+00	\N	53
1	11	1	La Curva - Bucarasica	Bucarasica	Centro Educativo Rural La Curva	510	371	3	registraduria	2026-07-12 21:13:11.958251+00	2026-07-12 21:13:11.958251+00	2026-07-12 21:13:11.958251+00	\N	56
1	11	1	Las Cuadras - Bucarasica	Bucarasica	Esc Rural Las Cuadras	115	84	1	registraduria	2026-07-12 21:13:12.536849+00	2026-07-12 21:13:12.536849+00	2026-07-12 21:13:12.536849+00	\N	59
1	11	1	La Carrera - Cachira	Cachira	Polideportivo La Carrera	382	328	3	registraduria	2026-07-12 21:13:13.105795+00	2026-07-12 21:13:13.105795+00	2026-07-12 21:13:13.105795+00	\N	62
1	11	1	Filo De San Cayetano - Cachira	Cachira	Esc Rural Filo De San Cayetano	81	59	1	registraduria	2026-07-12 21:13:13.658328+00	2026-07-12 21:13:13.658328+00	2026-07-12 21:13:13.658328+00	\N	65
1	11	1	La Union - Cachira	Cachira	Escuela Rural Primavera	56	36	1	registraduria	2026-07-12 21:13:14.233845+00	2026-07-12 21:13:14.233845+00	2026-07-12 21:13:14.233845+00	\N	68
1	11	1	San Jose De La Montaña - Cachira	Cachira	Escuela Rural San Jose De La Montaña	57	34	1	registraduria	2026-07-12 21:13:14.809763+00	2026-07-12 21:13:14.809763+00	2026-07-12 21:13:14.809763+00	\N	71
1	11	1	Puesto Cabecera Municipal - Cacota	Cacota	Cra 2 #.2-54 Barrio El Calvario	1362	1207	8	registraduria	2026-07-12 21:13:15.38219+00	2026-07-12 21:13:15.38219+00	2026-07-12 21:13:15.38219+00	\N	74
1	1	11	Colegio Antonio Nariño	Cucuta	Cl 1 # 8-17 Br Callejon	3083	3263	17	registraduria	2026-07-12 21:13:15.939807+00	2026-07-12 21:13:15.939807+00	2026-07-12 21:13:15.939807+00	\N	77
1	11	13	Carcel De Mujeres	Cucuta	Carcel De Mujeres	42	64	1	registraduria	2026-07-12 21:13:16.546872+00	2026-07-12 21:13:16.546872+00	2026-07-12 21:13:16.546872+00	\N	80
1	9	16	Ie Manuel Fernandez De Novoa	Cucuta	Av. 11 # 3 - 14 Br Carora	4277	4589	27	registraduria	2026-07-12 21:13:17.137425+00	2026-07-12 21:13:17.137425+00	2026-07-12 21:13:17.137425+00	\N	83
1	11	17	Ie Col San Jose De Cucuta	Cucuta	Cll 13 No 5-65 Centro	91	95	10	registraduria	2026-07-12 21:13:17.718169+00	2026-07-12 21:13:17.718169+00	2026-07-12 21:13:17.718169+00	\N	86
1	11	20	Banco De Arena	Cucuta	Cgto Banco De Arena	298	228	2	registraduria	2026-07-12 21:13:18.278662+00	2026-07-12 21:13:18.278662+00	2026-07-12 21:13:18.278662+00	\N	89
1	11	23	Guaramito	Cucuta	Cgto Guaramito	460	393	3	registraduria	2026-07-12 21:13:18.851771+00	2026-07-12 21:13:18.851771+00	2026-07-12 21:13:18.851771+00	\N	92
1	11	26	Puerto Villamizar	Cucuta	Cgto Puerto Villamizar	178	120	1	registraduria	2026-07-12 21:13:19.429859+00	2026-07-12 21:13:19.429859+00	2026-07-12 21:13:19.429859+00	\N	95
1	7	29	Esc. Urbana Jose Celestino Mutis No 31	Cucuta	Cll 1 Av 1 Y 2 Barrio Chapinero	6389	7365	41	registraduria	2026-07-12 21:13:20.005255+00	2026-07-12 21:13:20.005255+00	2026-07-12 21:13:20.005255+00	\N	98
1	11	1	Puesto De Votacion Vereda Iscala - Chinacota	Chinacota	Vda Iscala Centro/centro Educ. Rural Iscala Centro	109	91	1	registraduria	2026-07-12 21:13:20.568021+00	2026-07-12 21:13:20.568021+00	2026-07-12 21:13:20.568021+00	\N	101
1	11	1	Escuela Mariano Ospina Rodriguez	Chinacota	Cra 4 No 749	111	129	10	registraduria	2026-07-12 21:13:21.151418+00	2026-07-12 21:13:21.151418+00	2026-07-12 21:13:21.151418+00	\N	104
1	11	1	Chucarima - Chitaga	Chitaga	Col San Luis De Chucarima	364	305	2	registraduria	2026-07-12 21:13:21.732433+00	2026-07-12 21:13:21.732433+00	2026-07-12 21:13:21.732433+00	\N	107
1	11	1	Llano Grande - Chitaga	Chitaga	Polideportivo Llano Grande	243	226	2	registraduria	2026-07-12 21:13:22.29421+00	2026-07-12 21:13:22.29421+00	2026-07-12 21:13:22.29421+00	\N	110
1	2	30	Mercedes Abrego Sede Jardin Nacional	Cucuta	Av 13 E Cls 4 Y 5 Br. Colsag	4080	10467	42	registraduria	2026-07-12 21:13:22.854206+00	2026-07-12 21:13:22.854206+00	2026-07-12 21:13:22.854206+00	\N	113
1	7	31	Esc. Comuneros # 33 - Col. San Bartolome	Cucuta	Cll 4 Av 5 Barrio Comuneros	0	0	10	registraduria	2026-07-12 21:13:23.418326+00	2026-07-12 21:13:23.418326+00	2026-07-12 21:13:23.418326+00	\N	116
1	11	1	Cartagenita - Convencion	Convencion	Esc Nueva Cartagenita	567	466	3	registraduria	2026-07-12 21:13:23.974415+00	2026-07-12 21:13:23.974415+00	2026-07-12 21:13:23.974415+00	\N	119
1	11	1	La Libertad - Convencion	Convencion	Esc Nueva La Libertad	238	135	2	registraduria	2026-07-12 21:13:24.537744+00	2026-07-12 21:13:24.537744+00	2026-07-12 21:13:24.537744+00	\N	122
1	11	1	Los Balcones - Convencion	Convencion	Esc Nueva Balcones	312	207	2	registraduria	2026-07-12 21:13:25.10217+00	2026-07-12 21:13:25.10217+00	2026-07-12 21:13:25.10217+00	\N	125
1	11	1	Miraflores - Convencion	Convencion	Esc Nueva Miraflores	159	119	1	registraduria	2026-07-12 21:13:25.688019+00	2026-07-12 21:13:25.688019+00	2026-07-12 21:13:25.688019+00	\N	128
1	11	1	Saphadana - Convencion	Convencion	Esc Nueva Saphadana	266	151	2	registraduria	2026-07-12 21:13:26.269157+00	2026-07-12 21:13:26.269157+00	2026-07-12 21:13:26.269157+00	\N	131
1	10	34	Santo Angel Sede Jose Eusebio	Cucuta	Cl. 22 # 9b-85 Br. Cuberos Niño	3316	3719	21	registraduria	2026-07-12 21:13:26.829154+00	2026-07-12 21:13:26.829154+00	2026-07-12 21:13:26.829154+00	\N	134
1	11	1	Puente Julio Arboleda - Cucutilla	Cucutilla	Colegio Basico Roman	89	70	1	registraduria	2026-07-12 21:13:27.406279+00	2026-07-12 21:13:27.406279+00	2026-07-12 21:13:27.406279+00	\N	137
1	11	1	Cundinamarca	Cundinamarca	Cundinamarca	0	0	0	registraduria	2026-07-12 21:13:27.994881+00	2026-07-12 21:13:27.994881+00	2026-07-12 21:13:27.994881+00	\N	140
1	11	1	Hatoviejo - Durania	Durania	Esc Rural Hato Viejo	119	80	1	registraduria	2026-07-12 21:13:28.569717+00	2026-07-12 21:13:28.569717+00	2026-07-12 21:13:28.569717+00	\N	143
1	5	37	Centro Integracion Ciudadana El Bosque	Cucuta	Cll 11 An Entre Av 4a Y 5 Barrio El Bosque	542	653	4	registraduria	2026-07-12 21:13:29.137724+00	2026-07-12 21:13:29.137724+00	2026-07-12 21:13:29.137724+00	\N	146
1	11	38	Bobali - El Carmen	El Carmen	Esc Bobali	225	77	1	registraduria	2026-07-12 21:13:29.699461+00	2026-07-12 21:13:29.699461+00	2026-07-12 21:13:29.699461+00	\N	149
1	11	38	El Cobre - El Carmen	El Carmen	Esc El Cobre	77	44	1	registraduria	2026-07-12 21:13:30.298938+00	2026-07-12 21:13:30.298938+00	2026-07-12 21:13:30.298938+00	\N	152
1	11	38	La Estrella - El Carmen	El Carmen	Esc Los Jardines	85	34	1	registraduria	2026-07-12 21:13:30.891124+00	2026-07-12 21:13:30.891124+00	2026-07-12 21:13:30.891124+00	\N	155
1	11	38	La Pelota - El Carmen	El Carmen	Esc La Pelota	38	25	1	registraduria	2026-07-12 21:13:31.456286+00	2026-07-12 21:13:31.456286+00	2026-07-12 21:13:31.456286+00	\N	158
1	11	38	Las Vegas De Motilonia - El Carmen	El Carmen	Esc Vegas De Motilonia	77	46	1	registraduria	2026-07-12 21:13:32.08677+00	2026-07-12 21:13:32.08677+00	2026-07-12 21:13:32.08677+00	\N	161
1	11	38	Quebrada Arriba - El Carmen	El Carmen	Esc Tierra Azul	200	147	1	registraduria	2026-07-12 21:13:32.727533+00	2026-07-12 21:13:32.727533+00	2026-07-12 21:13:32.727533+00	\N	164
1	11	38	Santo Domingo - El Carmen	El Carmen	Esc Santo Domingo	80	58	1	registraduria	2026-07-12 21:13:33.344211+00	2026-07-12 21:13:33.344211+00	2026-07-12 21:13:33.344211+00	\N	167
1	8	40	I.e.el Rodeo	Cucuta	Mz 8-42 Barrio El Rodeo	2594	3315	16	registraduria	2026-07-12 21:13:33.898896+00	2026-07-12 21:13:33.898896+00	2026-07-12 21:13:33.898896+00	\N	170
1	6	42	Col Eustorgio Colmenares Bauti	Cucuta	Av. 6 #. 16-43 Br. El Salado	5036	5798	31	registraduria	2026-07-12 21:13:34.465125+00	2026-07-12 21:13:34.465125+00	2026-07-12 21:13:34.465125+00	\N	173
1	11	43	Filo El Gringo - El Tarra	El Tarra	Ie Filo El Gringo	748	547	4	registraduria	2026-07-12 21:13:35.055181+00	2026-07-12 21:13:35.055181+00	2026-07-12 21:13:35.055181+00	\N	176
1	11	1	Petrolea - Tibu	Tibu	Salon Comunal	572	422	3	registraduria	2026-07-12 21:14:26.251027+00	2026-07-12 21:14:26.251027+00	2026-07-12 21:14:26.251027+00	\N	440
1	11	1	La Donjuana - Bochalema	Bochalema	Colegio Marcos Garcia Carrillo	1061	1070	7	registraduria	2026-07-12 21:13:10.359792+00	2026-07-12 21:13:10.359792+00	2026-07-12 21:13:10.359792+00	\N	48
1	3	9	Club De Leones Sede I.e.bocono	Cucuta	Av 0 # 0-280 Anillo Vial Oriental	3314	3642	20	registraduria	2026-07-12 21:13:11.014485+00	2026-07-12 21:13:11.014485+00	2026-07-12 21:13:11.014485+00	\N	51
1	11	1	Boyaca	Boyaca	Boyaca	0	0	0	registraduria	2026-07-12 21:13:11.577045+00	2026-07-12 21:13:11.577045+00	2026-07-12 21:13:11.577045+00	\N	54
1	11	1	Aguablanca - Bucarasica	Bucarasica	Esc Rural La Capilla	335	281	2	registraduria	2026-07-12 21:13:12.142696+00	2026-07-12 21:13:12.142696+00	2026-07-12 21:13:12.142696+00	\N	57
1	7	10	Col Buenos Aires	Cucuta	Cl. 30 Av. 7 Y 7a Buenos Aires	3604	4347	23	registraduria	2026-07-12 21:13:12.730165+00	2026-07-12 21:13:12.730165+00	2026-07-12 21:13:12.730165+00	\N	60
1	11	1	El Manzano - Cachira	Cachira	Esc Rural El Manzano	71	58	1	registraduria	2026-07-12 21:13:13.289577+00	2026-07-12 21:13:13.289577+00	2026-07-12 21:13:13.289577+00	\N	63
1	11	1	El Lucero - Cachira	Cachira	Esc Rural El Lucero	171	126	1	registraduria	2026-07-12 21:13:13.857328+00	2026-07-12 21:13:13.857328+00	2026-07-12 21:13:13.857328+00	\N	66
1	11	1	Primavera - Cachira	Cachira	Esc Rural Primavera	252	155	2	registraduria	2026-07-12 21:13:14.4271+00	2026-07-12 21:13:14.4271+00	2026-07-12 21:13:14.4271+00	\N	69
1	11	1	Laguna De Oriente - Cachira	Cachira	Esc Rural Laguna De Oriente	36	12	1	registraduria	2026-07-12 21:13:15.002461+00	2026-07-12 21:13:15.002461+00	2026-07-12 21:13:15.002461+00	\N	72
1	11	1	Targuala - Cacota	Cacota	Esc Rural El Uvito	49	36	1	registraduria	2026-07-12 21:13:15.568623+00	2026-07-12 21:13:15.568623+00	2026-07-12 21:13:15.568623+00	\N	75
1	7	12	Col Basico Camilo Daza	Cucuta	Cl. 43 # 8 - 80 Br. Camilo Daza	2516	2916	15	registraduria	2026-07-12 21:13:16.126168+00	2026-07-12 21:13:16.126168+00	2026-07-12 21:13:16.126168+00	\N	78
1	6	14	Col Andres Bello Sede Laura Vi	Cucuta	Av 13 # 12n-66 Br. Carlos Pizarro	2260	2847	16	registraduria	2026-07-12 21:13:16.729807+00	2026-07-12 21:13:16.729807+00	2026-07-12 21:13:16.729807+00	\N	81
1	9	16	Col.basico Los Alpes	Cucuta	Transversal 17 Calle 2 No. 13 - 96 La Carora	1764	1586	10	registraduria	2026-07-12 21:13:17.331174+00	2026-07-12 21:13:17.331174+00	2026-07-12 21:13:17.331174+00	\N	84
1	11	18	Cesar	Cesar	Cesar	0	0	0	registraduria	2026-07-12 21:13:17.897813+00	2026-07-12 21:13:17.897813+00	2026-07-12 21:13:17.897813+00	\N	87
1	11	21	La Buena Esperanza	Cucuta	Cgto Buena Esperanza	1996	2050	12	registraduria	2026-07-12 21:13:18.476469+00	2026-07-12 21:13:18.476469+00	2026-07-12 21:13:18.476469+00	\N	90
1	11	24	Limoncito	Cucuta	Cgto Limoncito	334	281	2	registraduria	2026-07-12 21:13:19.055057+00	2026-07-12 21:13:19.055057+00	2026-07-12 21:13:19.055057+00	\N	93
1	11	27	San Faustino	Cucuta	Cgto San Faustino	645	618	4	registraduria	2026-07-12 21:13:19.617141+00	2026-07-12 21:13:19.617141+00	2026-07-12 21:13:19.617141+00	\N	96
1	11	1	Nueva Donjuana - Chinacota	Chinacota	Escuela La Victoria	637	566	4	registraduria	2026-07-12 21:13:20.190506+00	2026-07-12 21:13:20.190506+00	2026-07-12 21:13:20.190506+00	\N	99
1	11	1	Vereda Orozco - Chinacota	Chinacota	Vda Orozco/ctro Educ.rural Palocolorado Sd Orozco	75	67	1	registraduria	2026-07-12 21:13:20.754035+00	2026-07-12 21:13:20.754035+00	2026-07-12 21:13:20.754035+00	\N	102
1	11	1	Puesto Cabecera Municipal - Chitaga	Chitaga	Coliseo Mpal Cra 5 Entre Calles 7 Y 8	3560	3364	21	registraduria	2026-07-12 21:13:21.346342+00	2026-07-12 21:13:21.346342+00	2026-07-12 21:13:21.346342+00	\N	105
1	11	1	El Alisal - Chitaga	Chitaga	Esc Rural El Delirio	81	51	1	registraduria	2026-07-12 21:13:21.924789+00	2026-07-12 21:13:21.924789+00	2026-07-12 21:13:21.924789+00	\N	108
1	11	1	Presidente - Chitaga	Chitaga	Col Rural Presidente	161	108	1	registraduria	2026-07-12 21:13:22.478999+00	2026-07-12 21:13:22.478999+00	2026-07-12 21:13:22.478999+00	\N	111
1	2	30	Gimnasio Domingo Savio	Cucuta	Cll 9 # 9e - 77 Br. La Riviera	3065	4165	21	registraduria	2026-07-12 21:13:23.039733+00	2026-07-12 21:13:23.039733+00	2026-07-12 21:13:23.039733+00	\N	114
1	1	32	Col Sagrado Sede Antonia Santos	Cucuta	Av. 9 # 15-42 Br. El Paramo	5614	6688	37	registraduria	2026-07-12 21:13:23.600769+00	2026-07-12 21:13:23.600769+00	2026-07-12 21:13:23.600769+00	\N	117
1	11	1	Guamal - Convencion	Convencion	Esc Nueva Guamal	327	282	2	registraduria	2026-07-12 21:13:24.171568+00	2026-07-12 21:13:24.171568+00	2026-07-12 21:13:24.171568+00	\N	120
1	11	1	La Trinidad - Convencion	Convencion	Esc Nueva La Trinidad	372	260	2	registraduria	2026-07-12 21:13:24.722363+00	2026-07-12 21:13:24.722363+00	2026-07-12 21:13:24.722363+00	\N	123
1	11	1	El Hoyo - Convencion	Convencion	Esc Nueva El Hoyo	91	35	1	registraduria	2026-07-12 21:13:25.301703+00	2026-07-12 21:13:25.301703+00	2026-07-12 21:13:25.301703+00	\N	126
1	11	1	San Jose De Las Pitas - Convencion	Convencion	Esc Nueva San Jose De Las Pitas	235	154	2	registraduria	2026-07-12 21:13:25.887265+00	2026-07-12 21:13:25.887265+00	2026-07-12 21:13:25.887265+00	\N	129
1	11	1	Cordoba	Cordoba	Cordoba	0	0	0	registraduria	2026-07-12 21:13:26.465803+00	2026-07-12 21:13:26.465803+00	2026-07-12 21:13:26.465803+00	\N	132
1	8	35	I.e. Padre Manuel Briceño Jauregui	Cucuta	Av. 21 No. 2 - 100 Barrio Cucuta 75	7425	8205	46	registraduria	2026-07-12 21:13:27.015638+00	2026-07-12 21:13:27.015638+00	2026-07-12 21:13:27.015638+00	\N	135
1	11	1	San Jose De La Montaña - Cucutilla	Cucutilla	Cent Educ Rural Maria Auxiliadora	311	239	2	registraduria	2026-07-12 21:13:27.608569+00	2026-07-12 21:13:27.608569+00	2026-07-12 21:13:27.608569+00	\N	138
1	8	36	Col Rafael Uribe Uribe	Cucuta	Av 5 # 7 - 48 Br. Doã‘a Nidia	7030	7859	43	registraduria	2026-07-12 21:13:28.183776+00	2026-07-12 21:13:28.183776+00	2026-07-12 21:13:28.183776+00	\N	141
1	11	1	La Cuchilla - Durania	Durania	Esc.rural La Cuchilla Vda La Cuchilla	66	39	1	registraduria	2026-07-12 21:13:28.762884+00	2026-07-12 21:13:28.762884+00	2026-07-12 21:13:28.762884+00	\N	144
1	11	38	Puesto Cabecera Municipal - El Carmen	El Carmen	Aula Maxima Colpardo	2055	1781	12	registraduria	2026-07-12 21:13:29.324879+00	2026-07-12 21:13:29.324879+00	2026-07-12 21:13:29.324879+00	\N	147
1	11	38	Astillero - El Carmen	El Carmen	Esc Astilleros	102	67	1	registraduria	2026-07-12 21:13:29.908375+00	2026-07-12 21:13:29.908375+00	2026-07-12 21:13:29.908375+00	\N	150
1	11	38	El Zul - El Carmen	El Carmen	Esc El Zul	67	58	1	registraduria	2026-07-12 21:13:30.515004+00	2026-07-12 21:13:30.515004+00	2026-07-12 21:13:30.515004+00	\N	153
1	11	38	La Osa - El Carmen	El Carmen	Esc La Osa	107	69	1	registraduria	2026-07-12 21:13:31.085585+00	2026-07-12 21:13:31.085585+00	2026-07-12 21:13:31.085585+00	\N	156
1	11	38	Las Aguilas - El Carmen	El Carmen	Esc Las Aguilas	108	61	1	registraduria	2026-07-12 21:13:31.645614+00	2026-07-12 21:13:31.645614+00	2026-07-12 21:13:31.645614+00	\N	159
1	11	38	Las Vegas - El Carmen	El Carmen	Esc Las Vegas	111	73	1	registraduria	2026-07-12 21:13:32.344303+00	2026-07-12 21:13:32.344303+00	2026-07-12 21:13:32.344303+00	\N	162
1	11	38	Quebrada Honda - El Carmen	El Carmen	Esc Quebrada Honda	48	33	1	registraduria	2026-07-12 21:13:32.945337+00	2026-07-12 21:13:32.945337+00	2026-07-12 21:13:32.945337+00	\N	165
1	11	38	La Osa Parte Baja - El Carmen	El Carmen	Escuela Llano Cruzado , La Osa Parte Baja.	98	68	1	registraduria	2026-07-12 21:13:33.530954+00	2026-07-12 21:13:33.530954+00	2026-07-12 21:13:33.530954+00	\N	168
1	8	40	I.e. Pedro Cuadro Herrera	Cucuta	Mz. E Ciudad El Rodeo	415	596	3	registraduria	2026-07-12 21:13:34.082619+00	2026-07-12 21:13:34.082619+00	2026-07-12 21:13:34.082619+00	\N	171
1	11	43	Puesto Cabecera Municipal - El Tarra	El Tarra	Escuela Urbana Integrada No.2	6863	5877	39	registraduria	2026-07-12 21:13:34.652275+00	2026-07-12 21:13:34.652275+00	2026-07-12 21:13:34.652275+00	\N	174
1	11	43	Nueva Granada (bellavista) - El Tarra	El Tarra	Escuela Nueva Bellavista	282	228	2	registraduria	2026-07-12 21:13:35.247892+00	2026-07-12 21:13:35.247892+00	2026-07-12 21:13:35.247892+00	\N	177
1	11	43	Playa Cotiza - El Tarra	El Tarra	Escuela Isla Del Cedro	315	157	2	registraduria	2026-07-12 21:13:35.821533+00	2026-07-12 21:13:35.821533+00	2026-07-12 21:13:35.821533+00	\N	180
1	11	1	Monterredondo - Bochalema	Bochalema	Salón Comunal La Colonia	91	63	1	registraduria	2026-07-12 21:13:10.625249+00	2026-07-12 21:13:10.625249+00	2026-07-12 21:13:10.625249+00	\N	49
1	11	1	Bogota. D.c.	Bogota. D.c.	Bogota. D.c.	0	0	0	registraduria	2026-07-12 21:13:11.197888+00	2026-07-12 21:13:11.197888+00	2026-07-12 21:13:11.197888+00	\N	52
1	11	1	Puesto Cabecera Municipal - Bucarasica	Bucarasica	Inst Educ Rafael Celedon Sede Primaria	905	714	5	registraduria	2026-07-12 21:13:11.776667+00	2026-07-12 21:13:11.776667+00	2026-07-12 21:13:11.776667+00	\N	55
1	11	1	La Sanjuana - Bucarasica	Bucarasica	Inst Educ La Sanjuana Sede Primaria	674	524	4	registraduria	2026-07-12 21:13:12.325897+00	2026-07-12 21:13:12.325897+00	2026-07-12 21:13:12.325897+00	\N	58
1	11	1	Puesto Cabecera Municipal - Cachira	Cachira	Polideportivo Cabecera Municipal	1533	1489	10	registraduria	2026-07-12 21:13:12.914775+00	2026-07-12 21:13:12.914775+00	2026-07-12 21:13:12.914775+00	\N	61
1	11	1	La Vega - Cachira	Cachira	Polideportivo De La Vega	1148	1012	7	registraduria	2026-07-12 21:13:13.475319+00	2026-07-12 21:13:13.475319+00	2026-07-12 21:13:13.475319+00	\N	64
1	11	1	Miraflores - Cachira	Cachira	Escuela Rural Miraflores	86	67	1	registraduria	2026-07-12 21:13:14.046775+00	2026-07-12 21:13:14.046775+00	2026-07-12 21:13:14.046775+00	\N	67
1	11	1	Ramirez - Cachira	Cachira	Esc Rural Ramirez	141	107	1	registraduria	2026-07-12 21:13:14.622582+00	2026-07-12 21:13:14.622582+00	2026-07-12 21:13:14.622582+00	\N	70
1	11	1	Los Mangos - Cachira	Cachira	Esc Rural Los Mangos	175	150	1	registraduria	2026-07-12 21:13:15.189122+00	2026-07-12 21:13:15.189122+00	2026-07-12 21:13:15.189122+00	\N	73
1	11	1	Caldas	Caldas	Caldas	0	0	0	registraduria	2026-07-12 21:13:15.75476+00	2026-07-12 21:13:15.75476+00	2026-07-12 21:13:15.75476+00	\N	76
1	11	13	Carcel	Cucuta	Carcel	342	21	2	registraduria	2026-07-12 21:13:16.333088+00	2026-07-12 21:13:16.333088+00	2026-07-12 21:13:16.333088+00	\N	79
1	8	15	Ie Rafael Uribe Uribe Sd Carlos Ramirez	Cucuta	Av 5 # 3 Sur 1 Barrio Carlos Ramirez Paris	530	695	4	registraduria	2026-07-12 21:13:16.941739+00	2026-07-12 21:13:16.941739+00	2026-07-12 21:13:16.941739+00	\N	82
1	11	17	Normal Maria Auxiliadora	Cucuta	Av. 4 #.12-81 Barrio Centro	8260	6857	20	registraduria	2026-07-12 21:13:17.529785+00	2026-07-12 21:13:17.529785+00	2026-07-12 21:13:17.529785+00	\N	85
1	11	19	Aguaclara	Cucuta	Cgto Aguaclara	1904	1924	11	registraduria	2026-07-12 21:13:18.088324+00	2026-07-12 21:13:18.088324+00	2026-07-12 21:13:18.088324+00	\N	88
1	11	22	El Carmen De Tonchala	Cucuta	Cgto Carmen De Tonchala	241	243	2	registraduria	2026-07-12 21:13:18.666871+00	2026-07-12 21:13:18.666871+00	2026-07-12 21:13:18.666871+00	\N	91
1	11	25	Palmarito	Cucuta	Cgto Palmarito	302	237	2	registraduria	2026-07-12 21:13:19.25011+00	2026-07-12 21:13:19.25011+00	2026-07-12 21:13:19.25011+00	\N	94
1	11	28	San Pedro	Cucuta	Cgto San Pedro	445	490	3	registraduria	2026-07-12 21:13:19.818533+00	2026-07-12 21:13:19.818533+00	2026-07-12 21:13:19.818533+00	\N	97
1	11	1	Puesto Cabecera Municipal - Chinacota	Chinacota	Cra 4 No 8- 48 El Dique	6969	7309	43	registraduria	2026-07-12 21:13:20.374388+00	2026-07-12 21:13:20.374388+00	2026-07-12 21:13:20.374388+00	\N	100
1	11	1	Colegio San Luis Gonzaga - Chinacota	Chinacota	Cra 4 No 8- 48 El Dique	0	0	10	registraduria	2026-07-12 21:13:20.944165+00	2026-07-12 21:13:20.944165+00	2026-07-12 21:13:20.944165+00	\N	103
1	11	1	Cornejo - Chitaga	Chitaga	Esc Rural Cornejo	51	28	1	registraduria	2026-07-12 21:13:21.537504+00	2026-07-12 21:13:21.537504+00	2026-07-12 21:13:21.537504+00	\N	106
1	11	1	El Porvenir - Chitaga	Chitaga	Escuela Rural El Meson	91	89	1	registraduria	2026-07-12 21:13:22.109611+00	2026-07-12 21:13:22.109611+00	2026-07-12 21:13:22.109611+00	\N	109
1	11	1	Tane - Chitaga	Chitaga	Col Tane	239	174	2	registraduria	2026-07-12 21:13:22.67209+00	2026-07-12 21:13:22.67209+00	2026-07-12 21:13:22.67209+00	\N	112
1	7	31	Col San Bartolome	Cucuta	Cl. 0 #. 4-37 Br. Comuneros	5992	6895	39	registraduria	2026-07-12 21:13:23.223661+00	2026-07-12 21:13:23.223661+00	2026-07-12 21:13:23.223661+00	\N	115
1	11	1	Puesto Cabecera Municipal - Convencion	Convencion	Cll 5 No 5 - 39	5466	4955	32	registraduria	2026-07-12 21:13:23.791899+00	2026-07-12 21:13:23.791899+00	2026-07-12 21:13:23.791899+00	\N	118
1	11	1	Honduras - Convencion	Convencion	Esc Nueva Honduras	445	297	3	registraduria	2026-07-12 21:13:24.352113+00	2026-07-12 21:13:24.352113+00	2026-07-12 21:13:24.352113+00	\N	121
1	11	1	Las Mercedes - Convencion	Convencion	Esc Nueva Las Mercedes	250	191	2	registraduria	2026-07-12 21:13:24.915753+00	2026-07-12 21:13:24.915753+00	2026-07-12 21:13:24.915753+00	\N	124
1	11	1	Mesa Rica - Convencion	Convencion	Esc Nueva Mesa Rica	72	47	1	registraduria	2026-07-12 21:13:25.494149+00	2026-07-12 21:13:25.494149+00	2026-07-12 21:13:25.494149+00	\N	127
1	11	1	Soledad - Convencion	Convencion	Esc Nueva Soledad	269	179	2	registraduria	2026-07-12 21:13:26.072734+00	2026-07-12 21:13:26.072734+00	2026-07-12 21:13:26.072734+00	\N	130
1	11	33	Ricaurte	Cucuta	Corregimiento Ricaurte	317	239	2	registraduria	2026-07-12 21:13:26.645436+00	2026-07-12 21:13:26.645436+00	2026-07-12 21:13:26.645436+00	\N	133
1	11	1	Puesto Cabecera Municipal - Cucutilla	Cucutilla	Cmrt Cr 4 No 0-123 Barrio Instituto	3362	2974	19	registraduria	2026-07-12 21:13:27.222735+00	2026-07-12 21:13:27.222735+00	2026-07-12 21:13:27.222735+00	\N	136
1	11	1	Col Julio Perez Ferrero	Cucuta	Cl 11 Av. 19 Br.cundinamarca	5572	6175	34	registraduria	2026-07-12 21:13:27.804931+00	2026-07-12 21:13:27.804931+00	2026-07-12 21:13:27.804931+00	\N	139
1	11	1	Puesto Cabecera Municipal - Durania	Durania	Avenida 1a. Con Cl 9	3453	3304	21	registraduria	2026-07-12 21:13:28.385545+00	2026-07-12 21:13:28.385545+00	2026-07-12 21:13:28.385545+00	\N	142
1	11	1	La Trinidad - Durania	Durania	Esc Rural La Trinidad	48	25	1	registraduria	2026-07-12 21:13:28.95099+00	2026-07-12 21:13:28.95099+00	2026-07-12 21:13:28.95099+00	\N	145
1	11	38	Bellaluz - El Carmen	El Carmen	Esc Bellaluz	118	86	1	registraduria	2026-07-12 21:13:29.512033+00	2026-07-12 21:13:29.512033+00	2026-07-12 21:13:29.512033+00	\N	148
1	11	38	Culebrita - El Carmen	El Carmen	Esc Culebrita	116	76	1	registraduria	2026-07-12 21:13:30.107338+00	2026-07-12 21:13:30.107338+00	2026-07-12 21:13:30.107338+00	\N	151
1	11	38	Guamalito - El Carmen	El Carmen	Col Santo Angel	1610	1599	10	registraduria	2026-07-12 21:13:30.706015+00	2026-07-12 21:13:30.706015+00	2026-07-12 21:13:30.706015+00	\N	154
1	11	38	La Quiebra - El Carmen	El Carmen	Esc La Quiebra	54	30	1	registraduria	2026-07-12 21:13:31.272925+00	2026-07-12 21:13:31.272925+00	2026-07-12 21:13:31.272925+00	\N	157
1	11	38	Pajitas - El Carmen	El Carmen	Esc Pajitas	112	76	1	registraduria	2026-07-12 21:13:31.852654+00	2026-07-12 21:13:31.852654+00	2026-07-12 21:13:31.852654+00	\N	160
1	11	38	Maracaibo - El Carmen	El Carmen	Esc Maracaibo	149	96	1	registraduria	2026-07-12 21:13:32.527152+00	2026-07-12 21:13:32.527152+00	2026-07-12 21:13:32.527152+00	\N	163
1	11	38	Santa Ines - El Carmen	El Carmen	Esc Santa Ines	505	315	3	registraduria	2026-07-12 21:13:33.139818+00	2026-07-12 21:13:33.139818+00	2026-07-12 21:13:33.139818+00	\N	166
1	6	39	Escuela El Cerrito	Cucuta	Cra 4 # 4 - 59 El Cerrito	730	7160	5	registraduria	2026-07-12 21:13:33.717055+00	2026-07-12 21:13:33.717055+00	2026-07-12 21:13:33.717055+00	\N	169
1	7	41	Col. Santos Apostoles Sd El Rosal	Cucuta	Cll 3r # K 10-21 Barrio El Rosal Del Norte	100	80	10	registraduria	2026-07-12 21:13:34.270965+00	2026-07-12 21:13:34.270965+00	2026-07-12 21:13:34.270965+00	\N	172
1	11	43	El Paso - El Tarra	El Tarra	Esc Nueva El Paso	259	172	2	registraduria	2026-07-12 21:13:34.851579+00	2026-07-12 21:13:34.851579+00	2026-07-12 21:13:34.851579+00	\N	175
1	11	43	Ie Oru Bajo (colegio) - El Tarra	El Tarra	Ie Oru Bajo	348	207	2	registraduria	2026-07-12 21:13:35.441108+00	2026-07-12 21:13:35.441108+00	2026-07-12 21:13:35.441108+00	\N	178
1	11	44	Polideport. Multifuncional La Alejandra - El Zulia	El Zulia	Cll 12 Entre Av 14 Y 15a	1709	1896	11	registraduria	2026-07-12 21:13:36.010014+00	2026-07-12 21:13:36.010014+00	2026-07-12 21:13:36.010014+00	\N	181
1	11	44	Pan De Azucar - El Zulia	El Zulia	Esc Rural La Conquista	237	123	2	registraduria	2026-07-12 21:13:36.648042+00	2026-07-12 21:13:36.648042+00	2026-07-12 21:13:36.648042+00	\N	184
1	11	43	Palmas De Vino - El Tarra	El Tarra	Salon Comunal Palmas De Vino	87	53	1	registraduria	2026-07-12 21:13:35.637449+00	2026-07-12 21:13:35.637449+00	2026-07-12 21:13:35.637449+00	\N	179
1	11	44	Col Fco De Paula Stander Sd Alf. Lopez - El Zulia	El Zulia	Av. 11 Cll 3 Norte Barrio Alfonso Lopez	2274	2180	14	registraduria	2026-07-12 21:13:36.199363+00	2026-07-12 21:13:36.199363+00	2026-07-12 21:13:36.199363+00	\N	182
1	11	44	I.e. Colegio Marco Fidel Suarez - El Zulia	El Zulia	Cll 8 No 1- 21 C E Marco Fidel Suarez	4637	2256	21	registraduria	2026-07-12 21:13:36.840793+00	2026-07-12 21:13:36.840793+00	2026-07-12 21:13:36.840793+00	\N	185
1	11	44	Campo Alicia - El Zulia	El Zulia	Vda. Campo Alicia, Escuela Rural Peñalisa	317	235	2	registraduria	2026-07-12 21:13:37.410671+00	2026-07-12 21:13:37.410671+00	2026-07-12 21:13:37.410671+00	\N	188
1	11	44	Santa Rosa - El Zulia	El Zulia	Vda. Santa Rosa, Astilleros. Esc, Santa Rosa	182	168	1	registraduria	2026-07-12 21:13:37.977536+00	2026-07-12 21:13:37.977536+00	2026-07-12 21:13:37.977536+00	\N	191
1	11	1	Otros	Otras Ciudades Fuera De N/s	Fuera De Norte De Santander	0	0	10	registraduria	2026-07-12 21:13:38.546755+00	2026-07-12 21:13:38.546755+00	2026-07-12 21:13:38.546755+00	\N	194
1	11	1	El Rosario - Gramalote	Gramalote	Esc El Rosario	175	141	1	registraduria	2026-07-12 21:13:39.0998+00	2026-07-12 21:13:39.0998+00	2026-07-12 21:13:39.0998+00	\N	197
1	5	47	Guaimaral S.hermogenes Maza	Cucuta	Cl. 10an # 7e - 134 Br.guaimaral	6171	7421	41	registraduria	2026-07-12 21:13:39.694227+00	2026-07-12 21:13:39.694227+00	2026-07-12 21:13:39.694227+00	\N	200
1	11	1	Puesto Cabecera Municipal - Hacari	Hacari	Polideportivo Wilder Torres Parada Cll Central	2827	2277	16	registraduria	2026-07-12 21:13:40.267107+00	2026-07-12 21:13:40.267107+00	2026-07-12 21:13:40.267107+00	\N	203
1	11	1	Agua Blanca - Hacari	Hacari	Esc Rural Agua Blanca	281	179	2	registraduria	2026-07-12 21:13:40.840226+00	2026-07-12 21:13:40.840226+00	2026-07-12 21:13:40.840226+00	\N	206
1	11	1	San Miguel - Hacari	Hacari	Esc Rural San Miguel	245	189	2	registraduria	2026-07-12 21:13:41.406887+00	2026-07-12 21:13:41.406887+00	2026-07-12 21:13:41.406887+00	\N	209
1	11	1	Honda Sur - Herran	Herran	Esc Nueva Honda Sur	79	41	1	registraduria	2026-07-12 21:13:41.977706+00	2026-07-12 21:13:41.977706+00	2026-07-12 21:13:41.977706+00	\N	212
1	2	49	Salesiano	Cucuta	Cl 7 # 3e - 30 Br. Popular	9223	6235	47	registraduria	2026-07-12 21:13:42.549355+00	2026-07-12 21:13:42.549355+00	2026-07-12 21:13:42.549355+00	\N	215
1	11	51	Puesto Cabecera Municipal - La Esperanza	La Esperanza	Cll 1 No 2 - 32, Col Eduardo Cote Lamus	1529	1371	9	registraduria	2026-07-12 21:13:43.114785+00	2026-07-12 21:13:43.114785+00	2026-07-12 21:13:43.114785+00	\N	218
1	11	51	Tropezon - La Esperanza	La Esperanza	Concentracion Escolar El Tropezon	332	250	2	registraduria	2026-07-12 21:13:43.692921+00	2026-07-12 21:13:43.692921+00	2026-07-12 21:13:43.692921+00	\N	221
1	11	51	Los Cedros - La Esperanza	La Esperanza	Esc Rural Los Cedros	243	179	2	registraduria	2026-07-12 21:13:44.26669+00	2026-07-12 21:13:44.26669+00	2026-07-12 21:13:44.26669+00	\N	224
1	11	51	Jurisdicciones De San Pedro - La Esperanza	La Esperanza	Esc Rural Pata De Vaca	208	149	2	registraduria	2026-07-12 21:13:44.838489+00	2026-07-12 21:13:44.838489+00	2026-07-12 21:13:44.838489+00	\N	227
1	11	52	La Guajira	La Guajira	La Guajira	0	0	0	registraduria	2026-07-12 21:13:45.398219+00	2026-07-12 21:13:45.398219+00	2026-07-12 21:13:45.398219+00	\N	230
1	11	53	Curasica - La Playa	La Playa	Vda. Curasica	120	82	1	registraduria	2026-07-12 21:13:45.974106+00	2026-07-12 21:13:45.974106+00	2026-07-12 21:13:45.974106+00	\N	233
1	8	54	Esc.no38 Teodoro Gutierrez C.	Cucuta	Mz 6 Lt 9 Barrio La Victoria	4861	5505	31	registraduria	2026-07-12 21:13:46.549464+00	2026-07-12 21:13:46.549464+00	2026-07-12 21:13:46.549464+00	\N	236
1	11	55	La Cuchilla - Labateca	Labateca	Cer Chona Sede Quebrada Azul	78	57	1	registraduria	2026-07-12 21:13:47.143049+00	2026-07-12 21:13:47.143049+00	2026-07-12 21:13:47.143049+00	\N	239
1	1	57	Col San Jose Sede Mercedes Abrego	Cucuta	Av. 12 #. 9 - 01 Br. El Llano	7275	6585	41	registraduria	2026-07-12 21:13:47.714699+00	2026-07-12 21:13:47.714699+00	2026-07-12 21:13:47.714699+00	\N	242
1	11	60	Comfanorte - Los Patios	Los Patios	Km 3 Vía Pamplona	5751	5323	34	registraduria	2026-07-12 21:13:48.283145+00	2026-07-12 21:13:48.283145+00	2026-07-12 21:13:48.283145+00	\N	245
1	11	60	Col.basico Patios Centro No 1	Los Patios	Av10 #.30-31 Patios Centro	2699	2559	7	registraduria	2026-07-12 21:13:48.840779+00	2026-07-12 21:13:48.840779+00	2026-07-12 21:13:48.840779+00	\N	248
1	11	60	Colegio Bas. La Sabana	Los Patios	Av 4 No. 36-70 . La Sabana	3450	4053	23	registraduria	2026-07-12 21:13:49.417366+00	2026-07-12 21:13:49.417366+00	2026-07-12 21:13:49.417366+00	\N	251
1	11	60	Escuela Pisarreal	Los Patios	Kr 10 Nº 9-20 Pisarreal	3582	5684	28	registraduria	2026-07-12 21:13:49.960909+00	2026-07-12 21:13:49.960909+00	2026-07-12 21:13:49.960909+00	\N	254
1	11	60	Escuela Doce De Octubre - Los Patios	Los Patios	Cll 34 No 3e -120 Barrio Doce De Octubre	133	203	2	registraduria	2026-07-12 21:13:50.537751+00	2026-07-12 21:13:50.537751+00	2026-07-12 21:13:50.537751+00	\N	257
1	11	60	Escuela 11 De Noviembre - Los Patios	Los Patios	Cll 19 No 8 - 75 Once De Noviembre	430	450	3	registraduria	2026-07-12 21:13:51.119213+00	2026-07-12 21:13:51.119213+00	2026-07-12 21:13:51.119213+00	\N	260
1	11	60	Mutis - Los Patios	Los Patios	Esc Rural La Mutis	177	118	1	registraduria	2026-07-12 21:13:51.710047+00	2026-07-12 21:13:51.710047+00	2026-07-12 21:13:51.710047+00	\N	263
1	11	63	Meta	Meta	Meta	0	0	0	registraduria	2026-07-12 21:13:52.302115+00	2026-07-12 21:13:52.302115+00	2026-07-12 21:13:52.302115+00	\N	266
1	11	1	La Laguna - Mutiscua	Mutiscua	Cer La Caldera Sede La Laguna	126	142	1	registraduria	2026-07-12 21:13:52.890291+00	2026-07-12 21:13:52.890291+00	2026-07-12 21:13:52.890291+00	\N	269
1	11	1	Concentracion Argelino Duran - Ocaña	Ocaña	Calle 21 N. 10-10 Barrio El Bambo	3253	4069	22	registraduria	2026-07-12 21:13:53.460759+00	2026-07-12 21:13:53.460759+00	2026-07-12 21:13:53.460759+00	\N	272
1	11	1	Polideportivo Cristo Rey - Ocaña	Ocaña	Calle 16a Entre Carrera 14 Y 15 B. Cristo Rey	2574	3374	18	registraduria	2026-07-12 21:13:54.024568+00	2026-07-12 21:13:54.024568+00	2026-07-12 21:13:54.024568+00	\N	275
1	11	1	Escuela Adolfo Milanes - Ocaña	Ocaña	Cll 10 No 6 - 69 La Milanes	1451	2313	12	registraduria	2026-07-12 21:13:54.585164+00	2026-07-12 21:13:54.585164+00	2026-07-12 21:13:54.585164+00	\N	278
1	11	1	Escuela Marabel - Ocaña	Ocaña	Carrera 26 N. 5-01 Barrio Marabel	1508	2109	11	registraduria	2026-07-12 21:13:55.154354+00	2026-07-12 21:13:55.154354+00	2026-07-12 21:13:55.154354+00	\N	281
1	11	1	Escuela Santa Clara - Ocaña	Ocaña	Calle 5a N. 46-84 Barrio Santa Clara	1166	2150	10	registraduria	2026-07-12 21:13:55.758633+00	2026-07-12 21:13:55.758633+00	2026-07-12 21:13:55.758633+00	\N	284
1	11	1	Colegio La Salle - Ocaña	Ocaña	Antigua Avicola Santa Clara	1887	1908	12	registraduria	2026-07-12 21:13:56.316573+00	2026-07-12 21:13:56.316573+00	2026-07-12 21:13:56.316573+00	\N	287
1	11	1	Carcel - Ocaña	Ocaña	Calle 16 N. 4-34 Barrio La Modelo	132	40	1	registraduria	2026-07-12 21:13:56.941927+00	2026-07-12 21:13:56.941927+00	2026-07-12 21:13:56.941927+00	\N	290
1	11	1	Buenavista - Ocaña	Ocaña	Escuela Buenavista	420	347	3	registraduria	2026-07-12 21:13:57.523344+00	2026-07-12 21:13:57.523344+00	2026-07-12 21:13:57.523344+00	\N	293
1	11	1	Espiritusanto - Ocaña	Ocaña	Escuela Espiritu Santo	128	70	1	registraduria	2026-07-12 21:13:58.093306+00	2026-07-12 21:13:58.093306+00	2026-07-12 21:13:58.093306+00	\N	296
1	11	1	La Ermita - Ocaña	Ocaña	I. E. Carlos Hernandez Yaruro	375	330	2	registraduria	2026-07-12 21:13:58.674168+00	2026-07-12 21:13:58.674168+00	2026-07-12 21:13:58.674168+00	\N	299
1	11	1	Las Liscas - Ocaña	Ocaña	Escuela Las Liscas	181	141	1	registraduria	2026-07-12 21:13:59.228961+00	2026-07-12 21:13:59.228961+00	2026-07-12 21:13:59.228961+00	\N	302
1	11	1	Portachuelo - Ocaña	Ocaña	Escuela Portachuelo	56	43	1	registraduria	2026-07-12 21:13:59.804446+00	2026-07-12 21:13:59.804446+00	2026-07-12 21:13:59.804446+00	\N	305
1	11	44	Ctro De Integ. Ciu. Altos De San Antonio - El Zulia	El Zulia	Av 8 Y 9 Cll 6a Y 7 Altos De San Antonio	1373	3637	15	registraduria	2026-07-12 21:13:36.393834+00	2026-07-12 21:13:36.393834+00	2026-07-12 21:13:36.393834+00	\N	183
1	11	44	Astilleros - El Zulia	El Zulia	Biblioteca La Alegria Del Saber	1639	1579	10	registraduria	2026-07-12 21:13:37.02439+00	2026-07-12 21:13:37.02439+00	2026-07-12 21:13:37.02439+00	\N	186
1	11	44	Encerraderos - El Zulia	El Zulia	Esc Rural Encerraderos	174	110	1	registraduria	2026-07-12 21:13:37.603539+00	2026-07-12 21:13:37.603539+00	2026-07-12 21:13:37.603539+00	\N	189
1	11	44	Camilandia - El Zulia	El Zulia	Vereda Camilandia	86	86	1	registraduria	2026-07-12 21:13:38.165279+00	2026-07-12 21:13:38.165279+00	2026-07-12 21:13:38.165279+00	\N	192
1	10	46	Alejandro Gutierrez Sd San Juan Bosco	Cucuta	Cl. 22a #. 22-80 Barrio Gaitan	2171	2375	14	registraduria	2026-07-12 21:13:38.730058+00	2026-07-12 21:13:38.730058+00	2026-07-12 21:13:38.730058+00	\N	195
1	11	1	El Zumbador - Gramalote	Gramalote	Esc El Zumbador	182	124	1	registraduria	2026-07-12 21:13:39.31105+00	2026-07-12 21:13:39.31105+00	2026-07-12 21:13:39.31105+00	\N	198
1	5	47	Col.basico Guaimaral Nro 25	Cucuta	Av 12e No. 9bn - 46 Barrio Guaimaral	2585	3068	17	registraduria	2026-07-12 21:13:39.890058+00	2026-07-12 21:13:39.890058+00	2026-07-12 21:13:39.890058+00	\N	201
1	11	1	Maracaibo - Hacari	Hacari	Esc Rural Maracaibo	355	259	2	registraduria	2026-07-12 21:13:40.468818+00	2026-07-12 21:13:40.468818+00	2026-07-12 21:13:40.468818+00	\N	204
1	11	1	Martinez - Hacari	Hacari	Esc Rural Martinez	76	50	1	registraduria	2026-07-12 21:13:41.03379+00	2026-07-12 21:13:41.03379+00	2026-07-12 21:13:41.03379+00	\N	207
1	11	1	San Jose Del Tarra - Hacari	Hacari	Esc Rural San Jose Del Tarra	503	412	3	registraduria	2026-07-12 21:13:41.594253+00	2026-07-12 21:13:41.594253+00	2026-07-12 21:13:41.594253+00	\N	210
1	11	1	Siberia - Herran	Herran	Escuela Nueva Siberia	229	164	2	registraduria	2026-07-12 21:13:42.175662+00	2026-07-12 21:13:42.175662+00	2026-07-12 21:13:42.175662+00	\N	213
1	9	50	Col Ntra Sra De Belen La Divina Pastora	Cucuta	Cl. 31 # 31-60 Br. La Divina Pastora	3023	3753	21	registraduria	2026-07-12 21:13:42.734101+00	2026-07-12 21:13:42.734101+00	2026-07-12 21:13:42.734101+00	\N	216
1	11	51	Campo Alegre - La Esperanza	La Esperanza	Esc Campo Alegre	142	110	1	registraduria	2026-07-12 21:13:43.309145+00	2026-07-12 21:13:43.309145+00	2026-07-12 21:13:43.309145+00	\N	219
1	11	51	Leon Xiii - La Esperanza	La Esperanza	Concentracion Escolar Leon Xiii	280	212	2	registraduria	2026-07-12 21:13:43.880137+00	2026-07-12 21:13:43.880137+00	2026-07-12 21:13:43.880137+00	\N	222
1	11	51	Los Planes - La Esperanza	La Esperanza	Esc Rural Los Planes	171	116	1	registraduria	2026-07-12 21:13:44.461368+00	2026-07-12 21:13:44.461368+00	2026-07-12 21:13:44.461368+00	\N	225
1	11	51	Vijagual - La Esperanza	La Esperanza	Esc Rural Vijagual	110	88	1	registraduria	2026-07-12 21:13:45.023496+00	2026-07-12 21:13:45.023496+00	2026-07-12 21:13:45.023496+00	\N	228
1	11	53	Puesto Cabecera Municipal - La Playa	La Playa	Av. Los Fundadores No. 0 - 07	2207	1886	13	registraduria	2026-07-12 21:13:45.60252+00	2026-07-12 21:13:45.60252+00	2026-07-12 21:13:45.60252+00	\N	231
1	11	53	El Cincho La Vega De San Antonio - La Playa	La Playa	Correg El Cincho-La Vega De San Antonio	579	451	3	registraduria	2026-07-12 21:13:46.169678+00	2026-07-12 21:13:46.169678+00	2026-07-12 21:13:46.169678+00	\N	234
1	11	55	Puesto Cabecera Municipal - Labateca	Labateca	Cl 4 #.2-31 Br La Esmeralda	2859	2584	17	registraduria	2026-07-12 21:13:46.760136+00	2026-07-12 21:13:46.760136+00	2026-07-12 21:13:46.760136+00	\N	237
1	3	56	Col.francisco Jose Caldas	Cucuta	Calle 19 No. 13 - 23 Barrio La Libertad	7416	8161	44	registraduria	2026-07-12 21:13:47.330649+00	2026-07-12 21:13:47.330649+00	2026-07-12 21:13:47.330649+00	\N	240
1	9	58	Col Garcia Herreros Sede Esc 28 Febrero	Cucuta	Cl. 6 # 12-118 Barrio Loma De Bolivar	3508	4236	24	registraduria	2026-07-12 21:13:47.909259+00	2026-07-12 21:13:47.909259+00	2026-07-12 21:13:47.909259+00	\N	243
1	11	60	Colegio 11 De Noviembre	Los Patios	Mz 31 Lote 422 Videlso	7235	4893	41	registraduria	2026-07-12 21:13:48.469688+00	2026-07-12 21:13:48.469688+00	2026-07-12 21:13:48.469688+00	\N	246
1	11	60	Inst. Tecnico Municipal	Los Patios	Av. 9 #. 7 - 40 Daniel Jordán	4453	5051	28	registraduria	2026-07-12 21:13:49.033844+00	2026-07-12 21:13:49.033844+00	2026-07-12 21:13:49.033844+00	\N	249
1	11	60	Colegio Fe Y Alegria	Los Patios	Av 11 28a-25 Patios Centro	3486	3525	21	registraduria	2026-07-12 21:13:49.598703+00	2026-07-12 21:13:49.598703+00	2026-07-12 21:13:49.598703+00	\N	252
1	11	60	Colegio San Tarcisio - Los Patios	Los Patios	Cll 9k No 14 - 7 Km Pisarreal	704	2045	9	registraduria	2026-07-12 21:13:50.151049+00	2026-07-12 21:13:50.151049+00	2026-07-12 21:13:50.151049+00	\N	255
1	11	60	Establecimiento Educativo Jian Piaget - Los Patios	Los Patios	Cll 28 No 0 - 59 Cordialidad	146	225	2	registraduria	2026-07-12 21:13:50.723261+00	2026-07-12 21:13:50.723261+00	2026-07-12 21:13:50.723261+00	\N	258
1	11	60	Centro De Expresion Cultural - Los Patios	Los Patios	Av 9 No 22sur 38 Barrio Valles Del Mirador	130	149	1	registraduria	2026-07-12 21:13:51.313865+00	2026-07-12 21:13:51.313865+00	2026-07-12 21:13:51.313865+00	\N	261
1	11	61	Puesto Cabecera Municipal - Lourdes	Lourdes	Cr 2 No 3 - 70 Barrio La Loma	2025	1671	12	registraduria	2026-07-12 21:13:51.898695+00	2026-07-12 21:13:51.898695+00	2026-07-12 21:13:51.898695+00	\N	264
1	6	64	Centro Integracion Ciudadana Metropoli	Cucuta	Avenida 2 Calle 27 Y 28	683	770	5	registraduria	2026-07-12 21:13:52.49621+00	2026-07-12 21:13:52.49621+00	2026-07-12 21:13:52.49621+00	\N	267
1	11	1	Sucre - Mutiscua	Mutiscua	Cer Sucre	172	164	1	registraduria	2026-07-12 21:13:53.074377+00	2026-07-12 21:13:53.074377+00	2026-07-12 21:13:53.074377+00	\N	270
1	11	1	Sede Llanadas No 2 - Ocaña	Ocaña	Cll 6 No 25 - 26 Barrio 20 De Julio	2551	3229	18	registraduria	2026-07-12 21:13:53.647663+00	2026-07-12 21:13:53.647663+00	2026-07-12 21:13:53.647663+00	\N	273
1	11	1	Polideportivo La Monumental - Ocaña	Ocaña	Cra. 7 No. 9a - 149 Barrio La Milanes	795	838	5	registraduria	2026-07-12 21:13:54.206024+00	2026-07-12 21:13:54.206024+00	2026-07-12 21:13:54.206024+00	\N	276
1	11	1	Sede Cuesta Blanca - Ocaña	Ocaña	Cll 25 No 10 - 62 Barrio Cuesta Blanca	197	314	2	registraduria	2026-07-12 21:13:54.779339+00	2026-07-12 21:13:54.779339+00	2026-07-12 21:13:54.779339+00	\N	279
1	11	1	Cancha Juan Xxiii - Ocaña	Ocaña	Cll 2 Cra 14 Esquina Barrio Juan Xxiii	2071	2737	15	registraduria	2026-07-12 21:13:55.359263+00	2026-07-12 21:13:55.359263+00	2026-07-12 21:13:55.359263+00	\N	282
1	11	1	Cancha Marabel - Ocaña	Ocaña	Carrera 25 Entre Calle 6a Bario Marabel	2454	2406	15	registraduria	2026-07-12 21:13:55.949367+00	2026-07-12 21:13:55.949367+00	2026-07-12 21:13:55.949367+00	\N	285
1	11	1	Sede Jose Antonio Galan - Ocaña	Ocaña	Cll 5 K 153 Barrio Jose Antonio Galan	1626	1923	11	registraduria	2026-07-12 21:13:56.513218+00	2026-07-12 21:13:56.513218+00	2026-07-12 21:13:56.513218+00	\N	288
1	11	1	Aguas Claras - Ocaña	Ocaña	Escuela Aguas Claras	611	600	4	registraduria	2026-07-12 21:13:57.13042+00	2026-07-12 21:13:57.13042+00	2026-07-12 21:13:57.13042+00	\N	291
1	11	1	Otare - Ocaña	Ocaña	Colegio Edmundo Velasquez	460	382	3	registraduria	2026-07-12 21:13:57.710019+00	2026-07-12 21:13:57.710019+00	2026-07-12 21:13:57.710019+00	\N	294
1	11	1	Alto De Los Patios - Ocaña	Ocaña	Vereda Alto De Los Patios	144	94	1	registraduria	2026-07-12 21:13:58.292544+00	2026-07-12 21:13:58.292544+00	2026-07-12 21:13:58.292544+00	\N	297
1	11	1	La Floresta - Ocaña	Ocaña	Escuela La Floresta	46	35	1	registraduria	2026-07-12 21:13:58.859871+00	2026-07-12 21:13:58.859871+00	2026-07-12 21:13:58.859871+00	\N	300
1	11	1	Llano De Los Trigos - Ocaña	Ocaña	Escuela Llano De Los Trigos	139	97	1	registraduria	2026-07-12 21:13:59.433854+00	2026-07-12 21:13:59.433854+00	2026-07-12 21:13:59.433854+00	\N	303
1	11	1	Pueblo Nuevo - Ocaña	Ocaña	Escuela Pueblo Nuevo	262	214	2	registraduria	2026-07-12 21:13:59.989736+00	2026-07-12 21:13:59.989736+00	2026-07-12 21:13:59.989736+00	\N	306
1	11	44	La Milagrosa - El Zulia	El Zulia	Av 3 Barrio La Milagrosa	170	179	2	registraduria	2026-07-12 21:13:37.20902+00	2026-07-12 21:13:37.20902+00	2026-07-12 21:13:37.20902+00	\N	187
1	11	44	San Miguel - El Zulia	El Zulia	Esc Rural San Miguel	287	264	2	registraduria	2026-07-12 21:13:37.796579+00	2026-07-12 21:13:37.796579+00	2026-07-12 21:13:37.796579+00	\N	190
1	4	45	Colegio Padre Luis Variara	Cucuta	Via Bocono # 1- 55 Br. Escobal	5574	6551	36	registraduria	2026-07-12 21:13:38.357783+00	2026-07-12 21:13:38.357783+00	2026-07-12 21:13:38.357783+00	\N	193
1	11	1	Puesto Cabecera Municipal - Gramalote	Gramalote	Cll 9b No 5 - 02 Santa Rosa	2490	2379	15	registraduria	2026-07-12 21:13:38.912383+00	2026-07-12 21:13:38.912383+00	2026-07-12 21:13:38.912383+00	\N	196
1	11	1	San Isidro - Gramalote	Gramalote	Esc El Triunfo	256	203	2	registraduria	2026-07-12 21:13:39.5079+00	2026-07-12 21:13:39.5079+00	2026-07-12 21:13:39.5079+00	\N	199
1	5	47	Col. Mpal Maria Concepcion Loperena	Cucuta	Av Guaimaral 11e No 2n- 117 Quinta Oriental	13	13	10	registraduria	2026-07-12 21:13:40.074962+00	2026-07-12 21:13:40.074962+00	2026-07-12 21:13:40.074962+00	\N	202
1	11	1	Astilleros - Hacari	Hacari	Esc Rural Astilleros	182	143	1	registraduria	2026-07-12 21:13:40.650818+00	2026-07-12 21:13:40.650818+00	2026-07-12 21:13:40.650818+00	\N	205
1	11	1	Buenos Aires - Hacari	Hacari	Esc Rural Buenos Aires	160	116	1	registraduria	2026-07-12 21:13:41.219822+00	2026-07-12 21:13:41.219822+00	2026-07-12 21:13:41.219822+00	\N	208
1	11	1	Puesto Cabecera Municipal - Herran	Herran	Av.2 #.1-41 Br Centro	2431	2217	14	registraduria	2026-07-12 21:13:41.77869+00	2026-07-12 21:13:41.77869+00	2026-07-12 21:13:41.77869+00	\N	211
1	5	48	Inem	Cucuta	Cl. 4e # 11e - 121 Guaimaral	7617	8372	48	registraduria	2026-07-12 21:13:42.360233+00	2026-07-12 21:13:42.360233+00	2026-07-12 21:13:42.360233+00	\N	214
1	11	51	La Raya - La Esperanza	La Esperanza	Esc La Raya	197	141	1	registraduria	2026-07-12 21:13:42.928474+00	2026-07-12 21:13:42.928474+00	2026-07-12 21:13:42.928474+00	\N	217
1	11	51	Pueblo Nuevo - La Esperanza	La Esperanza	Col Conde De San German, Pueblo Nuevo	943	840	6	registraduria	2026-07-12 21:13:43.504667+00	2026-07-12 21:13:43.504667+00	2026-07-12 21:13:43.504667+00	\N	220
1	11	51	La Pedregoza - La Esperanza	La Esperanza	Col Jesus Antonio Ramirez	1134	1124	7	registraduria	2026-07-12 21:13:44.077168+00	2026-07-12 21:13:44.077168+00	2026-07-12 21:13:44.077168+00	\N	223
1	11	51	La Quiebra - La Esperanza	La Esperanza	Esc Cristo Rey, La Quiebra	166	124	1	registraduria	2026-07-12 21:13:44.655743+00	2026-07-12 21:13:44.655743+00	2026-07-12 21:13:44.655743+00	\N	226
1	11	51	Villa Maria - La Esperanza	La Esperanza	Conc Escol Simon Bolivar, Villa Maria	296	237	2	registraduria	2026-07-12 21:13:45.215881+00	2026-07-12 21:13:45.215881+00	2026-07-12 21:13:45.215881+00	\N	229
1	11	53	Aspasica - La Playa	La Playa	Corrg Aspasica	848	692	5	registraduria	2026-07-12 21:13:45.791558+00	2026-07-12 21:13:45.791558+00	2026-07-12 21:13:45.791558+00	\N	232
1	11	53	Maciegas - La Playa	La Playa	Vda Masiegas	135	109	1	registraduria	2026-07-12 21:13:46.359675+00	2026-07-12 21:13:46.359675+00	2026-07-12 21:13:46.359675+00	\N	235
1	11	55	Santa Maria - Labateca	Labateca	Cer Balsa Sede Santa Maria	95	64	1	registraduria	2026-07-12 21:13:46.949908+00	2026-07-12 21:13:46.949908+00	2026-07-12 21:13:46.949908+00	\N	238
1	3	56	Ie Pablo Correa Leon	Cucuta	Av 16 No 11-10 La Libertad	118	119	10	registraduria	2026-07-12 21:13:47.516192+00	2026-07-12 21:13:47.516192+00	2026-07-12 21:13:47.516192+00	\N	241
1	8	59	Carlos Ramirez Sede Ntra Sra De Mongui	Cucuta	Cl. 9 # 47-50 Antonia Santos Sector Los Olivos	3528	4566	25	registraduria	2026-07-12 21:13:48.089371+00	2026-07-12 21:13:48.089371+00	2026-07-12 21:13:48.089371+00	\N	244
1	11	60	Col Patio Centro No.2	Los Patios	Av 4 27 - 28 B. Patios Centro	3206	3554	20	registraduria	2026-07-12 21:13:48.655708+00	2026-07-12 21:13:48.655708+00	2026-07-12 21:13:48.655708+00	\N	247
1	11	60	Colegio Llanitos	Los Patios	Av 9 # Kdx-136 Llanitos	1889	2220	11	registraduria	2026-07-12 21:13:49.220991+00	2026-07-12 21:13:49.220991+00	2026-07-12 21:13:49.220991+00	\N	250
1	11	60	Hogar Infantil El Manantial	Los Patios	Av 3 No. 34 - 23 B. Doce De Octubre	1950	2113	13	registraduria	2026-07-12 21:13:49.78093+00	2026-07-12 21:13:49.78093+00	2026-07-12 21:13:49.78093+00	\N	253
1	11	60	Escuela Buena Esperanza - Los Patios	Los Patios	Calle 15 Av 15k La Esperanza	756	1098	6	registraduria	2026-07-12 21:13:50.348669+00	2026-07-12 21:13:50.348669+00	2026-07-12 21:13:50.348669+00	\N	256
1	11	60	Salon Comunal Santa Clara - Los Patios	Los Patios	Av 0 Cll 30 Urbanizacion Santa Clara	125	140	1	registraduria	2026-07-12 21:13:50.92658+00	2026-07-12 21:13:50.92658+00	2026-07-12 21:13:50.92658+00	\N	259
1	11	60	La Garita - Los Patios	Los Patios	I.e. La Garita	871	742	5	registraduria	2026-07-12 21:13:51.522921+00	2026-07-12 21:13:51.522921+00	2026-07-12 21:13:51.522921+00	\N	262
1	11	62	Magdalena	Magdalena	Magdalena	0	0	0	registraduria	2026-07-12 21:13:52.09636+00	2026-07-12 21:13:52.09636+00	2026-07-12 21:13:52.09636+00	\N	265
1	11	1	Puesto Cabecera Municipal - Mutiscua	Mutiscua	Cra. 2 #.2-55 Col Nuestra Señora De La Merced	1460	1281	9	registraduria	2026-07-12 21:13:52.700943+00	2026-07-12 21:13:52.700943+00	2026-07-12 21:13:52.700943+00	\N	268
1	11	1	Nariño	Nariño	Nariño	0	0	0	registraduria	2026-07-12 21:13:53.261707+00	2026-07-12 21:13:53.261707+00	2026-07-12 21:13:53.261707+00	\N	271
1	11	1	Sede Simon Bolivar No 1 - Ocaña	Ocaña	Cll 13 No 12 - 56 Barrio El Tamaco	2261	1991	13	registraduria	2026-07-12 21:13:53.830495+00	2026-07-12 21:13:53.830495+00	2026-07-12 21:13:53.830495+00	\N	274
1	11	1	Sede David Haddad Salcedo - Ocaña	Ocaña	Carrera 10 N. 11-54 Centro	2650	1743	14	registraduria	2026-07-12 21:13:54.391697+00	2026-07-12 21:13:54.391697+00	2026-07-12 21:13:54.391697+00	\N	277
1	11	1	Sede Kennedy - Ocaña	Ocaña	Cll 7 No 11- 48 Urbanizacion Central	146	206	2	registraduria	2026-07-12 21:13:54.965201+00	2026-07-12 21:13:54.965201+00	2026-07-12 21:13:54.965201+00	\N	280
1	11	1	Instituto Tecnico Industrial - Ocaña	Ocaña	Transv. 30 Cll 7 110 Barrio La Primavera	3265	3946	22	registraduria	2026-07-12 21:13:55.561861+00	2026-07-12 21:13:55.561861+00	2026-07-12 21:13:55.561861+00	\N	283
1	11	1	Colegio Alfonso Lopez - Ocaña	Ocaña	Carrera 10 No. 7 - 07	1478	1923	11	registraduria	2026-07-12 21:13:56.132878+00	2026-07-12 21:13:56.132878+00	2026-07-12 21:13:56.132878+00	\N	286
1	11	1	Col Nal Jose Eusebio Caro - Ocaña	Ocaña	Cl 11 #.9-31	5551	5811	15	registraduria	2026-07-12 21:13:56.746812+00	2026-07-12 21:13:56.746812+00	2026-07-12 21:13:56.746812+00	\N	289
1	11	1	Agua De La Virgen - Ocaña	Ocaña	Salon Comunal Agua De La Virgen	415	320	3	registraduria	2026-07-12 21:13:57.328127+00	2026-07-12 21:13:57.328127+00	2026-07-12 21:13:57.328127+00	\N	292
1	11	1	Cerro De Las Flores - Ocaña	Ocaña	Escuela Cerro De Las Flores	75	55	1	registraduria	2026-07-12 21:13:57.910217+00	2026-07-12 21:13:57.910217+00	2026-07-12 21:13:57.910217+00	\N	295
1	11	1	Palogrande - Ocaña	Ocaña	Vereda Palo Grande	121	69	1	registraduria	2026-07-12 21:13:58.478612+00	2026-07-12 21:13:58.478612+00	2026-07-12 21:13:58.478612+00	\N	298
1	11	1	Las Chircas - Ocaña	Ocaña	Escuela Las Chircas	95	74	1	registraduria	2026-07-12 21:13:59.043407+00	2026-07-12 21:13:59.043407+00	2026-07-12 21:13:59.043407+00	\N	301
1	11	1	Mariquita - Ocaña	Ocaña	Escuela Mariquita	85	76	1	registraduria	2026-07-12 21:13:59.618335+00	2026-07-12 21:13:59.618335+00	2026-07-12 21:13:59.618335+00	\N	304
1	11	1	Quebrada De La Esperanza - Ocaña	Ocaña	Escuela Quebrada De La Esperanza	211	160	2	registraduria	2026-07-12 21:14:00.182763+00	2026-07-12 21:14:00.182763+00	2026-07-12 21:14:00.182763+00	\N	307
1	11	1	Venadillo - Ocaña	Ocaña	Escuela Venadillo	77	45	1	registraduria	2026-07-12 21:14:00.37074+00	2026-07-12 21:14:00.37074+00	2026-07-12 21:14:00.37074+00	\N	308
1	11	1	Loma Larga - Ocaña	Ocaña	Vda Loma Larga-Corregimiento Agua De La Virgen	28	21	1	registraduria	2026-07-12 21:14:00.576522+00	2026-07-12 21:14:00.576522+00	2026-07-12 21:14:00.576522+00	\N	309
1	11	1	La Pacha - Ocaña	Ocaña	Vda La Pacha-Corregimiento Mariquita	68	42	1	registraduria	2026-07-12 21:14:00.765018+00	2026-07-12 21:14:00.765018+00	2026-07-12 21:14:00.765018+00	\N	310
1	7	65	Col Mariano Ospina Rodriguez	Cucuta	Cl 14 # 5-01 Br. Ospina Perez	7988	9267	50	registraduria	2026-07-12 21:14:00.997808+00	2026-07-12 21:14:00.997808+00	2026-07-12 21:14:00.997808+00	\N	311
1	11	1	Sede Gabriela Mistral Col.pro - Pamplona	Pamplona	Av. Santander Con Pasaje Mistral	2711	2634	17	registraduria	2026-07-12 21:14:01.625874+00	2026-07-12 21:14:01.625874+00	2026-07-12 21:14:01.625874+00	\N	314
1	11	1	La Casona-Universidad Pamplona	Pamplona	Cra. 4 #. 6-84	3836	3666	23	registraduria	2026-07-12 21:14:02.216165+00	2026-07-12 21:14:02.216165+00	2026-07-12 21:14:02.216165+00	\N	317
1	11	1	Colegio Jose Rafael Faria Bermudez - Pamplona	Pamplona	Cra 8 No 2 - 56	246	295	2	registraduria	2026-07-12 21:14:02.77236+00	2026-07-12 21:14:02.77236+00	2026-07-12 21:14:02.77236+00	\N	320
1	11	1	Laureano Gomez - Pamplona	Pamplona	Esc San Miguel Vereda Laureano Gomez	195	137	1	registraduria	2026-07-12 21:14:03.353531+00	2026-07-12 21:14:03.353531+00	2026-07-12 21:14:03.353531+00	\N	323
1	11	1	El Diamante - Pamplonita	Pamplonita	Col El Diamante	548	499	3	registraduria	2026-07-12 21:14:03.92413+00	2026-07-12 21:14:03.92413+00	2026-07-12 21:14:03.92413+00	\N	326
1	4	68	Centro Int. Ciudadana Prados Del Este	Cucuta	Via La Gazapa Cll 7e Y 8e - Prados Del Este	2990	3696	19	registraduria	2026-07-12 21:14:04.502238+00	2026-07-12 21:14:04.502238+00	2026-07-12 21:14:04.502238+00	\N	329
1	11	70	Cancha 23 De Abril - Puerto Santander	Puerto Santander	Barrio 23 De Abril	1752	2323	13	registraduria	2026-07-12 21:14:05.065396+00	2026-07-12 21:14:05.065396+00	2026-07-12 21:14:05.065396+00	\N	332
1	11	71	Caliches - Ragonvalia	Ragonvalia	Esc Rural Caliches	201	140	1	registraduria	2026-07-12 21:14:05.631226+00	2026-07-12 21:14:05.631226+00	2026-07-12 21:14:05.631226+00	\N	335
1	11	71	Centro Educativo Rural Buenos Aires - Ragonvalia	Ragonvalia	Vereda Sombrerito	53	55	1	registraduria	2026-07-12 21:14:06.185622+00	2026-07-12 21:14:06.185622+00	2026-07-12 21:14:06.185622+00	\N	338
1	11	1	Puesto Cabecera Municipal - Salazar	Salazar	Col Inst Tec Ntra Señora De Belen Cra 5 No 1-30	3425	3223	20	registraduria	2026-07-12 21:14:06.76466+00	2026-07-12 21:14:06.76466+00	2026-07-12 21:14:06.76466+00	\N	341
1	11	1	Campo Nuevo - Salazar	Salazar	Centro Educativo Rural Campo Nuevo Sur	62	41	1	registraduria	2026-07-12 21:14:07.324021+00	2026-07-12 21:14:07.324021+00	2026-07-12 21:14:07.324021+00	\N	344
1	11	1	Montecristo - Salazar	Salazar	Centro Educativo Rural Montecristo	141	107	1	registraduria	2026-07-12 21:14:07.974752+00	2026-07-12 21:14:07.974752+00	2026-07-12 21:14:07.974752+00	\N	347
1	11	74	Puesto Cabecera Municipal - San Calixto	San Calixto	Barrio El Centro	1838	1753	11	registraduria	2026-07-12 21:14:08.532617+00	2026-07-12 21:14:08.532617+00	2026-07-12 21:14:08.532617+00	\N	350
1	11	74	Casas Viejas - San Calixto	San Calixto	Ctro Rural Educ Casas Viejas	347	257	2	registraduria	2026-07-12 21:14:09.102035+00	2026-07-12 21:14:09.102035+00	2026-07-12 21:14:09.102035+00	\N	353
1	11	74	El Espejo - San Calixto	San Calixto	Ctro Rural Educ El Espejo	181	144	1	registraduria	2026-07-12 21:14:09.741047+00	2026-07-12 21:14:09.741047+00	2026-07-12 21:14:09.741047+00	\N	356
1	11	74	Puente Real - San Calixto	San Calixto	Ctro Rural Educ Puente Real	167	102	1	registraduria	2026-07-12 21:14:10.337473+00	2026-07-12 21:14:10.337473+00	2026-07-12 21:14:10.337473+00	\N	359
1	11	74	La Cristalina - San Calixto	San Calixto	Ctro Rural Educ La Cristalina	166	72	1	registraduria	2026-07-12 21:14:10.89467+00	2026-07-12 21:14:10.89467+00	2026-07-12 21:14:10.89467+00	\N	362
1	11	74	San Javier - San Calixto	San Calixto	Ctro Rural Educ San Javier	137	97	1	registraduria	2026-07-12 21:14:11.562394+00	2026-07-12 21:14:11.562394+00	2026-07-12 21:14:11.562394+00	\N	365
1	11	75	Puesto Cabecera Municipal - San Cayetano	San Cayetano	K 3 # 4-29 Barrio La Playa Sede Primaria	3753	3156	21	registraduria	2026-07-12 21:14:12.116307+00	2026-07-12 21:14:12.116307+00	2026-07-12 21:14:12.116307+00	\N	368
1	11	75	San Isidro - San Cayetano	San Cayetano	Anillo Vial Occidental Sector Central	444	422	3	registraduria	2026-07-12 21:14:12.697228+00	2026-07-12 21:14:12.697228+00	2026-07-12 21:14:12.697228+00	\N	371
1	10	77	Ie Nuestra Señora Del Rosario	Cucuta	Avenida 20 No 22- 30 Barrio San Jose	2198	2761	15	registraduria	2026-07-12 21:14:13.270148+00	2026-07-12 21:14:13.270148+00	2026-07-12 21:14:13.270148+00	\N	374
1	4	78	Col.carlos Perez Escalante	Cucuta	Calle 13 No. 2 - 26 Barrio San Luis	3445	4065	21	registraduria	2026-07-12 21:14:13.832615+00	2026-07-12 21:14:13.832615+00	2026-07-12 21:14:13.832615+00	\N	377
1	3	80	Ie Misael Pastrana Borrero	Cucuta	Av 3 # 21 - 23 Barrio San Mateo	5797	6319	35	registraduria	2026-07-12 21:14:14.387275+00	2026-07-12 21:14:14.387275+00	2026-07-12 21:14:14.387275+00	\N	380
1	11	83	Puesto Cabecera Municipal - Santiago	Santiago	Institucion Educativa Santiago Apostol	2662	2294	15	registraduria	2026-07-12 21:14:14.972624+00	2026-07-12 21:14:14.972624+00	2026-07-12 21:14:14.972624+00	\N	383
1	11	84	Puesto Cabecera Municipal - Sardinata	Sardinata	Carrera 4 No. 4 - 19 Barrio Tamarindo	7009	6375	41	registraduria	2026-07-12 21:14:15.541263+00	2026-07-12 21:14:15.541263+00	2026-07-12 21:14:15.541263+00	\N	386
1	11	84	Las Mercedes - Sardinata	Sardinata	Colegio Monseñor Sarmiento Peralta	1865	1439	10	registraduria	2026-07-12 21:14:16.110514+00	2026-07-12 21:14:16.110514+00	2026-07-12 21:14:16.110514+00	\N	389
1	11	84	Balsamina - Sardinata	Sardinata	Esc Gallinetas	77	63	1	registraduria	2026-07-12 21:14:16.703184+00	2026-07-12 21:14:16.703184+00	2026-07-12 21:14:16.703184+00	\N	392
1	11	84	La Cristalina - Sardinata	Sardinata	Esc La Cristalina	47	30	1	registraduria	2026-07-12 21:14:17.271392+00	2026-07-12 21:14:17.271392+00	2026-07-12 21:14:17.271392+00	\N	395
1	11	84	San Martin De Loba - Sardinata	Sardinata	Casa Comunal	576	398	3	registraduria	2026-07-12 21:14:17.856027+00	2026-07-12 21:14:17.856027+00	2026-07-12 21:14:17.856027+00	\N	398
1	11	84	Encerraderos - Sardinata	Sardinata	Esc San Miguel	33	13	1	registraduria	2026-07-12 21:14:18.438548+00	2026-07-12 21:14:18.438548+00	2026-07-12 21:14:18.438548+00	\N	401
1	11	84	La Esmeralda - Sardinata	Sardinata	Esc La Esmeralda	13	5	1	registraduria	2026-07-12 21:14:18.99529+00	2026-07-12 21:14:18.99529+00	2026-07-12 21:14:18.99529+00	\N	404
1	11	84	San Isidro - Sardinata	Sardinata	Vda La Vega -Escuela El Riecito	96	68	1	registraduria	2026-07-12 21:14:19.623948+00	2026-07-12 21:14:19.623948+00	2026-07-12 21:14:19.623948+00	\N	407
1	11	1	Babega - Silos	Silos	Col Babega	465	413	3	registraduria	2026-07-12 21:14:20.434967+00	2026-07-12 21:14:20.434967+00	2026-07-12 21:14:20.434967+00	\N	410
1	11	1	Los Rincon - Silos	Silos	Los Rincon	281	252	2	registraduria	2026-07-12 21:14:21.000772+00	2026-07-12 21:14:21.000772+00	2026-07-12 21:14:21.000772+00	\N	413
1	11	1	Puesto Cabecera Municipal - Teorama	Teorama	Cll 3 No:4-30	1938	1678	11	registraduria	2026-07-12 21:14:21.595596+00	2026-07-12 21:14:21.595596+00	2026-07-12 21:14:21.595596+00	\N	416
1	11	1	El Aserrio - Teorama	Teorama	Sede Educativa El Aserrio	806	566	4	registraduria	2026-07-12 21:14:22.177711+00	2026-07-12 21:14:22.177711+00	2026-07-12 21:14:22.177711+00	\N	419
1	11	1	La Cecilia - Teorama	Teorama	Sede Educativa La Cecilia	547	360	3	registraduria	2026-07-12 21:14:22.73344+00	2026-07-12 21:14:22.73344+00	2026-07-12 21:14:22.73344+00	\N	422
1	11	1	San Juancito - Teorama	Teorama	Sede Educativa San Juancito	515	347	3	registraduria	2026-07-12 21:14:23.300193+00	2026-07-12 21:14:23.300193+00	2026-07-12 21:14:23.300193+00	\N	425
1	11	1	Instituto Diversificado Domingo Savio - Tibu	Tibu	Cra. 11 No. 14-50 Barrio Barco	4206	1974	19	registraduria	2026-07-12 21:14:23.867258+00	2026-07-12 21:14:23.867258+00	2026-07-12 21:14:23.867258+00	\N	428
1	11	1	Escuela Sede Integral Kennedy - Tibu	Tibu	Cl 2 No. 11-35 Barrio Kennedy	813	1400	7	registraduria	2026-07-12 21:14:24.429892+00	2026-07-12 21:14:24.429892+00	2026-07-12 21:14:24.429892+00	\N	431
1	11	1	Barco La Silla - Tibu	Tibu	Esc. Rural Barco La Silla	99	59	1	registraduria	2026-07-12 21:14:25.086115+00	2026-07-12 21:14:25.086115+00	2026-07-12 21:14:25.086115+00	\N	434
1	11	1	La Gabarra - Tibu	Tibu	Mega Colegio De La Gabarra	3217	2278	16	registraduria	2026-07-12 21:14:25.669933+00	2026-07-12 21:14:25.669933+00	2026-07-12 21:14:25.669933+00	\N	437
1	7	65	Ie Mariano Ospina R. Sd Mons. Luis Perez	Cucuta	Cll 10 No. 3-01	0	0	10	registraduria	2026-07-12 21:14:01.233387+00	2026-07-12 21:14:01.233387+00	2026-07-12 21:14:01.233387+00	\N	312
1	11	1	I. S. E. R. - Pamplona	Pamplona	Cl 8 #.8-155	3569	3631	22	registraduria	2026-07-12 21:14:01.80735+00	2026-07-12 21:14:01.80735+00	2026-07-12 21:14:01.80735+00	\N	315
1	11	1	Concentracion Basica Galan - Pamplona	Pamplona	Cra. 6 #.18-71 Barrio Galan	2078	3197	16	registraduria	2026-07-12 21:14:02.396227+00	2026-07-12 21:14:02.396227+00	2026-07-12 21:14:02.396227+00	\N	318
1	11	1	Colegio Brighton Sd Afanador Y Cadena - Pamplona	Pamplona	Cra 4 No 6 - 84	271	315	2	registraduria	2026-07-12 21:14:02.968876+00	2026-07-12 21:14:02.968876+00	2026-07-12 21:14:02.968876+00	\N	321
1	11	1	Negavita - Pamplona	Pamplona	Centro De Salud Vereda Negavita	130	114	1	registraduria	2026-07-12 21:14:03.548133+00	2026-07-12 21:14:03.548133+00	2026-07-12 21:14:03.548133+00	\N	324
1	5	66	Col. Gremios Unidos Sd Simon Bolivar	Cucuta	Av 5a Con Cll 2n Br. Pescadero	5455	6110	35	registraduria	2026-07-12 21:14:04.110887+00	2026-07-12 21:14:04.110887+00	2026-07-12 21:14:04.110887+00	\N	327
1	5	69	Col Oriental No. 26	Cucuta	Cl. 19an # 4-89 Br. Prados Norte	4813	5630	31	registraduria	2026-07-12 21:14:04.69009+00	2026-07-12 21:14:04.69009+00	2026-07-12 21:14:04.69009+00	\N	330
1	11	70	Escuela Monseñor Leonardo Gomez Serna - Puerto Santander	Puerto Santander	Cra 3 Barrio Bertrania	2434	2435	15	registraduria	2026-07-12 21:14:05.248651+00	2026-07-12 21:14:05.248651+00	2026-07-12 21:14:05.248651+00	\N	333
1	11	71	Puesto Cabecera Municipal - Ragonvalia	Ragonvalia	Av. 1 Cl 4 Esquina	4745	4718	29	registraduria	2026-07-12 21:14:05.811294+00	2026-07-12 21:14:05.811294+00	2026-07-12 21:14:05.811294+00	\N	336
1	11	72	Risaralda	Risaralda	Risaralda	0	0	0	registraduria	2026-07-12 21:14:06.380282+00	2026-07-12 21:14:06.380282+00	2026-07-12 21:14:06.380282+00	\N	339
1	11	1	El Carmen De Nazareth - Salazar	Salazar	El Carmen Nazareth,coliseo Cubierto Nestor Rojas	773	651	5	registraduria	2026-07-12 21:14:06.954961+00	2026-07-12 21:14:06.954961+00	2026-07-12 21:14:06.954961+00	\N	342
1	11	1	La Laguna - Salazar	Salazar	Centro Integracion Ciudadana Cic Sector El Llano	377	345	3	registraduria	2026-07-12 21:14:07.512209+00	2026-07-12 21:14:07.512209+00	2026-07-12 21:14:07.512209+00	\N	345
1	11	1	San Antonio - Salazar	Salazar	Centro Educativo Rural La Quinta	132	75	1	registraduria	2026-07-12 21:14:08.156712+00	2026-07-12 21:14:08.156712+00	2026-07-12 21:14:08.156712+00	\N	348
1	11	74	Algarrobos - San Calixto	San Calixto	Ctro Rural Educ Algarrobos	182	127	1	registraduria	2026-07-12 21:14:08.717559+00	2026-07-12 21:14:08.717559+00	2026-07-12 21:14:08.717559+00	\N	351
1	11	74	Banderas - San Calixto	San Calixto	Ctro Rural Educ Banderas	96	58	1	registraduria	2026-07-12 21:14:09.282403+00	2026-07-12 21:14:09.282403+00	2026-07-12 21:14:09.282403+00	\N	354
1	11	74	Mesallana - San Calixto	San Calixto	Ctro Rural Educ Mesallana	202	161	2	registraduria	2026-07-12 21:14:09.953754+00	2026-07-12 21:14:09.953754+00	2026-07-12 21:14:09.953754+00	\N	357
1	11	74	San Jeronimo - San Calixto	San Calixto	Ctro Rural Educ San Jeronimo	122	88	1	registraduria	2026-07-12 21:14:10.519598+00	2026-07-12 21:14:10.519598+00	2026-07-12 21:14:10.519598+00	\N	360
1	11	74	La Quina - San Calixto	San Calixto	Ctro Rural Educ La Quina	245	179	2	registraduria	2026-07-12 21:14:11.1086+00	2026-07-12 21:14:11.1086+00	2026-07-12 21:14:11.1086+00	\N	363
1	11	74	San Juan - San Calixto	San Calixto	Ctro Rural Educ San Juan	161	131	1	registraduria	2026-07-12 21:14:11.744142+00	2026-07-12 21:14:11.744142+00	2026-07-12 21:14:11.744142+00	\N	366
1	11	75	Cornejo - San Cayetano	San Cayetano	C.e Rural Cornejo	1026	1075	6	registraduria	2026-07-12 21:14:12.312922+00	2026-07-12 21:14:12.312922+00	2026-07-12 21:14:12.312922+00	\N	369
1	11	75	Urimaco - San Cayetano	San Cayetano	C.e Rural Urimaco	139	101	1	registraduria	2026-07-12 21:14:12.88464+00	2026-07-12 21:14:12.88464+00	2026-07-12 21:14:12.88464+00	\N	372
1	4	78	Esc.marco Fidel Suarez	Cucuta	Cl. 11 #. 2 - 27 Br. San Luis	2734	2928	18	registraduria	2026-07-12 21:14:13.454443+00	2026-07-12 21:14:13.454443+00	2026-07-12 21:14:13.454443+00	\N	375
1	4	78	Ie San Juan Bosco - Club De Leones	Cucuta	Cll 1 Av. 9-10	7	4	10	registraduria	2026-07-12 21:14:14.017715+00	2026-07-12 21:14:14.017715+00	2026-07-12 21:14:14.017715+00	\N	378
1	10	81	Col Luis Carlos Galan Sarmient	Cucuta	Cl 26 # 0 - 63 Br. San Rafael	5353	6076	34	registraduria	2026-07-12 21:14:14.604404+00	2026-07-12 21:14:14.604404+00	2026-07-12 21:14:14.604404+00	\N	381
1	11	83	La Cacahuala - Santiago	Santiago	Escuela La Cacahuala	143	107	1	registraduria	2026-07-12 21:14:15.156809+00	2026-07-12 21:14:15.156809+00	2026-07-12 21:14:15.156809+00	\N	384
1	11	84	Jordancito - Sardinata	Sardinata	Esc Jordancito	76	47	1	registraduria	2026-07-12 21:14:15.729777+00	2026-07-12 21:14:15.729777+00	2026-07-12 21:14:15.729777+00	\N	387
1	11	84	Cascajal - Sardinata	Sardinata	Esc Rural	65	41	1	registraduria	2026-07-12 21:14:16.294639+00	2026-07-12 21:14:16.294639+00	2026-07-12 21:14:16.294639+00	\N	390
1	11	84	El Carmen - Sardinata	Sardinata	Col Nuestra Señora Del Carmen	111	75	1	registraduria	2026-07-12 21:14:16.897222+00	2026-07-12 21:14:16.897222+00	2026-07-12 21:14:16.897222+00	\N	393
1	11	84	Paramillo - Sardinata	Sardinata	Escuela Central Paramillo	58	31	1	registraduria	2026-07-12 21:14:17.470255+00	2026-07-12 21:14:17.470255+00	2026-07-12 21:14:17.470255+00	\N	396
1	11	84	San Roque - Sardinata	Sardinata	C.e San Roque	192	141	1	registraduria	2026-07-12 21:14:18.050106+00	2026-07-12 21:14:18.050106+00	2026-07-12 21:14:18.050106+00	\N	399
1	11	84	Fatima - Sardinata	Sardinata	Esc Fátima	28	20	1	registraduria	2026-07-12 21:14:18.624252+00	2026-07-12 21:14:18.624252+00	2026-07-12 21:14:18.624252+00	\N	402
1	11	84	Las Mesas - Sardinata	Sardinata	Esc Las Mesas	14	16	1	registraduria	2026-07-12 21:14:19.249953+00	2026-07-12 21:14:19.249953+00	2026-07-12 21:14:19.249953+00	\N	405
1	5	85	Col Andres Bello	Cucuta	Cll 7n # 7an - 06 Br. Sevilla	4034	4404	24	registraduria	2026-07-12 21:14:19.80679+00	2026-07-12 21:14:19.80679+00	2026-07-12 21:14:19.80679+00	\N	408
1	11	1	Belen - Silos	Silos	Sede Belen	126	81	1	registraduria	2026-07-12 21:14:20.616772+00	2026-07-12 21:14:20.616772+00	2026-07-12 21:14:20.616772+00	\N	411
1	11	1	Sin Registro	Sin Registro	Sin Registro	0	0	0	registraduria	2026-07-12 21:14:21.213353+00	2026-07-12 21:14:21.213353+00	2026-07-12 21:14:21.213353+00	\N	414
1	11	1	Fronteras De Teorama - Teorama	Teorama	Escuela Shubacbarina	255	143	2	registraduria	2026-07-12 21:14:21.79608+00	2026-07-12 21:14:21.79608+00	2026-07-12 21:14:21.79608+00	\N	417
1	11	1	Juridicciones - Teorama	Teorama	Sede Educativa Jurisdicciones	138	93	1	registraduria	2026-07-12 21:14:22.361493+00	2026-07-12 21:14:22.361493+00	2026-07-12 21:14:22.361493+00	\N	420
1	11	1	Ramirez - Teorama	Teorama	Sede Educativa Ramírez	94	80	1	registraduria	2026-07-12 21:14:22.931671+00	2026-07-12 21:14:22.931671+00	2026-07-12 21:14:22.931671+00	\N	423
1	11	1	Centro Cultural Tibu	Tibu	Cll 15 # 11- 07 Barrio Barco	2230	2446	14	registraduria	2026-07-12 21:14:23.498656+00	2026-07-12 21:14:23.498656+00	2026-07-12 21:14:23.498656+00	\N	426
1	11	1	Col. Integ Francisco Jose De Caldas - Tibu	Tibu	Cra.3 No. 3-28 Barrio Miraflores	4959	5831	33	registraduria	2026-07-12 21:14:24.054234+00	2026-07-12 21:14:24.054234+00	2026-07-12 21:14:24.054234+00	\N	429
1	11	1	Escuela Urbana La Union - Tibu	Tibu	Cll 1a # 6e- 22 Barrio La Union	228	220	2	registraduria	2026-07-12 21:14:24.618218+00	2026-07-12 21:14:24.618218+00	2026-07-12 21:14:24.618218+00	\N	432
1	11	1	Campo Giles - Tibu	Tibu	Esc Rural Campo Giles	421	332	3	registraduria	2026-07-12 21:14:25.281621+00	2026-07-12 21:14:25.281621+00	2026-07-12 21:14:25.281621+00	\N	435
1	11	1	La Llana O La Finaria - Tibu	Tibu	Col Integrado La Llana	587	376	3	registraduria	2026-07-12 21:14:25.858314+00	2026-07-12 21:14:25.858314+00	2026-07-12 21:14:25.858314+00	\N	438
1	11	1	Rio De Oro - Tibu	Tibu	Esc Rural Km 60	258	183	2	registraduria	2026-07-12 21:14:26.450828+00	2026-07-12 21:14:26.450828+00	2026-07-12 21:14:26.450828+00	\N	441
1	11	1	Colegio Cristo Rey - Pamplona	Pamplona	Calle 5 No. 12 - 3660	1683	945	8	registraduria	2026-07-12 21:14:01.428379+00	2026-07-12 21:14:01.428379+00	2026-07-12 21:14:01.428379+00	\N	313
1	11	1	Colegio Provincial San Jose - Pamplona	Pamplona	Av. Santander #. 11-118	4499	5074	13	registraduria	2026-07-12 21:14:01.99579+00	2026-07-12 21:14:01.99579+00	2026-07-12 21:14:01.99579+00	\N	316
1	11	1	El Rosario Unipamplona - Pamplona	Pamplona	Calle 5 No 5-39	4210	3961	25	registraduria	2026-07-12 21:14:02.585902+00	2026-07-12 21:14:02.585902+00	2026-07-12 21:14:02.585902+00	\N	319
1	11	1	Carcel - Pamplona	Pamplona	Av.santander #. 12-129	92	11	1	registraduria	2026-07-12 21:14:03.158401+00	2026-07-12 21:14:03.158401+00	2026-07-12 21:14:03.158401+00	\N	322
1	11	1	Puesto Cabecera Municipal - Pamplonita	Pamplonita	Coliseo Municipal	1849	1664	11	registraduria	2026-07-12 21:14:03.734338+00	2026-07-12 21:14:03.734338+00	2026-07-12 21:14:03.734338+00	\N	325
1	2	67	Colegio La Salle	Cucuta	Av 2e # 6 - 80 Br. Popular	7983	4200	35	registraduria	2026-07-12 21:14:04.306395+00	2026-07-12 21:14:04.306395+00	2026-07-12 21:14:04.306395+00	\N	328
1	11	70	Ie Puerto Santander - Puerto Santander	Puerto Santander	Cll 9 Barrio Bertrania	3494	2471	18	registraduria	2026-07-12 21:14:04.882831+00	2026-07-12 21:14:04.882831+00	2026-07-12 21:14:04.882831+00	\N	331
1	11	70	Escuela Urbana Integrada Sede No 3 - Puerto Santander	Puerto Santander	Cll 5 No 5 - 100 Barrio Nuevo	1769	3001	15	registraduria	2026-07-12 21:14:05.435646+00	2026-07-12 21:14:05.435646+00	2026-07-12 21:14:05.435646+00	\N	334
1	11	71	Ctro Educ. Rural Vereda San Miguel - Ragonvalia	Ragonvalia	Vereda San Miguel	68	59	1	registraduria	2026-07-12 21:14:06.002115+00	2026-07-12 21:14:06.002115+00	2026-07-12 21:14:06.002115+00	\N	337
1	1	73	Col Sagrado Corazon De Jesus	Cucuta	Cl. 16 # 3 - 60 Br La Playa	8306	9303	49	registraduria	2026-07-12 21:14:06.567494+00	2026-07-12 21:14:06.567494+00	2026-07-12 21:14:06.567494+00	\N	340
1	11	1	Alto De Angulo - Salazar	Salazar	C.e Rural Alto De Angulo	55	40	1	registraduria	2026-07-12 21:14:07.142729+00	2026-07-12 21:14:07.142729+00	2026-07-12 21:14:07.142729+00	\N	343
1	11	1	El Zulia - Salazar	Salazar	Centro Educativo Rural El Zulia	173	171	1	registraduria	2026-07-12 21:14:07.783085+00	2026-07-12 21:14:07.783085+00	2026-07-12 21:14:07.783085+00	\N	346
1	11	1	San Jose De Avila - Salazar	Salazar	Sd San Jose De Avila Centro Educ. Rural Filo Real	162	108	1	registraduria	2026-07-12 21:14:08.347214+00	2026-07-12 21:14:08.347214+00	2026-07-12 21:14:08.347214+00	\N	349
1	11	74	Palmarito - San Calixto	San Calixto	Ctro Rural Educ Palmarito	143	106	1	registraduria	2026-07-12 21:14:08.909621+00	2026-07-12 21:14:08.909621+00	2026-07-12 21:14:08.909621+00	\N	352
1	11	74	Guaduales - San Calixto	San Calixto	Ctro Rural Educ Guaduales	231	158	2	registraduria	2026-07-12 21:14:09.471235+00	2026-07-12 21:14:09.471235+00	2026-07-12 21:14:09.471235+00	\N	355
1	11	74	Quebrada Grande - San Calixto	San Calixto	Ctro Rural Educ Quebrada Grande	162	86	1	registraduria	2026-07-12 21:14:10.143352+00	2026-07-12 21:14:10.143352+00	2026-07-12 21:14:10.143352+00	\N	358
1	11	74	El Caracol - San Calixto	San Calixto	Ctro Rural Educ El Caracol	130	73	1	registraduria	2026-07-12 21:14:10.709686+00	2026-07-12 21:14:10.709686+00	2026-07-12 21:14:10.709686+00	\N	361
1	11	74	Mediaguita - San Calixto	San Calixto	Ctro Rural Educ Mediaguita	88	56	1	registraduria	2026-07-12 21:14:11.363198+00	2026-07-12 21:14:11.363198+00	2026-07-12 21:14:11.363198+00	\N	364
1	11	74	Santa Catalina - San Calixto	San Calixto	Ctro Rural Educ Santa Catalina	211	130	1	registraduria	2026-07-12 21:14:11.927911+00	2026-07-12 21:14:11.927911+00	2026-07-12 21:14:11.927911+00	\N	367
1	11	75	Ayacucho - San Cayetano	San Cayetano	Esc Rosa Blanca Ayacucho	67	27	1	registraduria	2026-07-12 21:14:12.500259+00	2026-07-12 21:14:12.500259+00	2026-07-12 21:14:12.500259+00	\N	370
1	5	76	Instituto Tecnico Mercedes Abrego	Cucuta	Cll 8 N # 16 E 30 San Eduardo	590	675	4	registraduria	2026-07-12 21:14:13.080481+00	2026-07-12 21:14:13.080481+00	2026-07-12 21:14:13.080481+00	\N	373
1	4	78	Col Bas Club De Leones No 29	Cucuta	Av. 5a # 6-63 B. Bajo Pamplonita	2387	2908	16	registraduria	2026-07-12 21:14:13.638533+00	2026-07-12 21:14:13.638533+00	2026-07-12 21:14:13.638533+00	\N	376
1	4	79	Colegio Simon Bolivar	Cucuta	Cl. 4 # 11a - 26 Br. San Martin	46270	6164	33	registraduria	2026-07-12 21:14:14.198064+00	2026-07-12 21:14:14.198064+00	2026-07-12 21:14:14.198064+00	\N	379
1	11	82	Santander	Santander	Santander	6338	6533	0	registraduria	2026-07-12 21:14:14.793214+00	2026-07-12 21:14:14.793214+00	2026-07-12 21:14:14.793214+00	\N	382
1	11	83	Los Naranjos - Santiago	Santiago	Escuela Los Naranjos	55	36	1	registraduria	2026-07-12 21:14:15.349876+00	2026-07-12 21:14:15.349876+00	2026-07-12 21:14:15.349876+00	\N	385
1	11	84	San Luis - Sardinata	Sardinata	Esc Rural	60	43	1	registraduria	2026-07-12 21:14:15.91166+00	2026-07-12 21:14:15.91166+00	2026-07-12 21:14:15.91166+00	\N	388
1	11	84	Campo Rico - Sardinata	Sardinata	Esc Violetas	30	19	1	registraduria	2026-07-12 21:14:16.477699+00	2026-07-12 21:14:16.477699+00	2026-07-12 21:14:16.477699+00	\N	391
1	11	84	La Victoria - Sardinata	Sardinata	Colegio Argelino Duran Quintero	388	271	2	registraduria	2026-07-12 21:14:17.08092+00	2026-07-12 21:14:17.08092+00	2026-07-12 21:14:17.08092+00	\N	394
1	11	84	Luis Vero - Sardinata	Sardinata	Col La Divina Esperanza	403	297	2	registraduria	2026-07-12 21:14:17.666052+00	2026-07-12 21:14:17.666052+00	2026-07-12 21:14:17.666052+00	\N	397
1	11	84	El Vesubio - Sardinata	Sardinata	Esc El Vesubio	15	6	1	registraduria	2026-07-12 21:14:18.241671+00	2026-07-12 21:14:18.241671+00	2026-07-12 21:14:18.241671+00	\N	400
1	11	84	Guamo San Miguel - Sardinata	Sardinata	Esc Santa Barbara	44	21	1	registraduria	2026-07-12 21:14:18.806284+00	2026-07-12 21:14:18.806284+00	2026-07-12 21:14:18.806284+00	\N	403
1	11	84	Rio Nuevo - Sardinata	Sardinata	Esc Jericó	61	41	1	registraduria	2026-07-12 21:14:19.434711+00	2026-07-12 21:14:19.434711+00	2026-07-12 21:14:19.434711+00	\N	406
1	11	1	Puesto Cabecera Municipal - Silos	Silos	Col Luis Ernesto Puyana	1344	1254	8	registraduria	2026-07-12 21:14:20.002265+00	2026-07-12 21:14:20.002265+00	2026-07-12 21:14:20.002265+00	\N	409
1	11	1	La Laguna - Silos	Silos	Salon Cultural De La Laguna	299	271	2	registraduria	2026-07-12 21:14:20.806021+00	2026-07-12 21:14:20.806021+00	2026-07-12 21:14:20.806021+00	\N	412
1	11	1	Sucre	Sucre	Sucre	177	172	0	registraduria	2026-07-12 21:14:21.406648+00	2026-07-12 21:14:21.406648+00	2026-07-12 21:14:21.406648+00	\N	415
1	11	1	San Pablo - Teorama	Teorama	Inst. Agricola Región Del Catatumbo	2181	1938	12	registraduria	2026-07-12 21:14:21.983029+00	2026-07-12 21:14:21.983029+00	2026-07-12 21:14:21.983029+00	\N	418
1	11	1	El Juncal - Teorama	Teorama	Sede Educativa El Juncal	151	148	1	registraduria	2026-07-12 21:14:22.545438+00	2026-07-12 21:14:22.545438+00	2026-07-12 21:14:22.545438+00	\N	421
1	11	1	Rio De Oro - Teorama	Teorama	Sede Educativa Rio De Oro	62	38	1	registraduria	2026-07-12 21:14:23.116711+00	2026-07-12 21:14:23.116711+00	2026-07-12 21:14:23.116711+00	\N	424
1	11	1	Reyes (campo Dos) - Tibu	Tibu	Col Integrado Campo Dos	2798	2384	15	registraduria	2026-07-12 21:14:23.680919+00	2026-07-12 21:14:23.680919+00	2026-07-12 21:14:23.680919+00	\N	427
1	11	1	Esc. Urbana Integrada Marco Fidel Suarez - Tibu	Tibu	Cll 6 # 12 -123 Barrio San Martin	1201	225	5	registraduria	2026-07-12 21:14:24.248108+00	2026-07-12 21:14:24.248108+00	2026-07-12 21:14:24.248108+00	\N	430
1	11	1	Aeropuerto La Pista - Tibu	Tibu	Esc. La Motilona Com. Carikachaboquira	305	170	2	registraduria	2026-07-12 21:14:24.821724+00	2026-07-12 21:14:24.821724+00	2026-07-12 21:14:24.821724+00	\N	433
1	11	1	La Angalia - Tibu	Tibu	Esc Rural La Angalia	242	161	2	registraduria	2026-07-12 21:14:25.468227+00	2026-07-12 21:14:25.468227+00	2026-07-12 21:14:25.468227+00	\N	436
1	11	1	Pacelli - Tibu	Tibu	Col Horacio Olave	1177	870	6	registraduria	2026-07-12 21:14:26.052688+00	2026-07-12 21:14:26.052688+00	2026-07-12 21:14:26.052688+00	\N	439
1	11	1	Tres Bocas - Tibu	Tibu	Escuela Rural Tres Bocas	655	684	4	registraduria	2026-07-12 21:14:26.646088+00	2026-07-12 21:14:26.646088+00	2026-07-12 21:14:26.646088+00	\N	442
1	11	1	Versalles - Tibu	Tibu	Esc Rural Versalles	471	354	3	registraduria	2026-07-12 21:14:26.831367+00	2026-07-12 21:14:26.831367+00	2026-07-12 21:14:26.831367+00	\N	443
1	11	86	San Bernardo Bata - Toledo	Toledo	I.e.san Bernardo	1071	926	6	registraduria	2026-07-12 21:14:27.429294+00	2026-07-12 21:14:27.429294+00	2026-07-12 21:14:27.429294+00	\N	446
1	11	86	San Alberto - Toledo	Toledo	Cer San Alberto	92	68	1	registraduria	2026-07-12 21:14:28.104268+00	2026-07-12 21:14:28.104268+00	2026-07-12 21:14:28.104268+00	\N	449
1	11	86	La Union - Toledo	Toledo	Cer La Union	47	57	1	registraduria	2026-07-12 21:14:28.699816+00	2026-07-12 21:14:28.699816+00	2026-07-12 21:14:28.699816+00	\N	452
1	6	87	Col Toledo Plata	Cucuta	Cl. 12 # 14-12 Br. Toledo Plata	5126	6254	33	registraduria	2026-07-12 21:14:29.435712+00	2026-07-12 21:14:29.435712+00	2026-07-12 21:14:29.435712+00	\N	455
1	4	88	I.e.mon.jaime Prieto Amaya	Cucuta	Calle 13 Entre Av. 15 Y 16,br. Torcoroma	1349	1712	9	registraduria	2026-07-12 21:14:30.027724+00	2026-07-12 21:14:30.027724+00	2026-07-12 21:14:30.027724+00	\N	458
1	7	90	Col.concejo De Cucuta	Cucuta	Av 5 Mz 7 Lt 67 B. Tucunare Atalaya Parte Alta	2658	3012	17	registraduria	2026-07-12 21:14:30.757774+00	2026-07-12 21:14:30.757774+00	2026-07-12 21:14:30.757774+00	\N	461
1	3	93	Col Pablo Correa Sede Club De	Cucuta	Av. 18 # 14-98 Br. Valle Ester	6477	6931	35	registraduria	2026-07-12 21:14:31.492942+00	2026-07-12 21:14:31.492942+00	2026-07-12 21:14:31.492942+00	\N	464
1	11	94	Alto Del Pozo - Villa Caro	Villa Caro	Esc Alto Elpozo	222	197	2	registraduria	2026-07-12 21:14:32.101715+00	2026-07-12 21:14:32.101715+00	2026-07-12 21:14:32.101715+00	\N	467
1	11	95	Polideportivo - Villa Del Rosario	Villa Del Rosario	Avd. 1 Calle 11 Villa Graciela	1173	1279	8	registraduria	2026-07-12 21:14:32.804453+00	2026-07-12 21:14:32.804453+00	2026-07-12 21:14:32.804453+00	\N	470
1	11	95	Escuela Policarpa Salavarieta - Villa Del Rosario	Villa Del Rosario	Cra 8 #3-43 Centro	4967	5795	33	registraduria	2026-07-12 21:14:33.406506+00	2026-07-12 21:14:33.406506+00	2026-07-12 21:14:33.406506+00	\N	473
1	11	95	Mega Colegio La Frontera - Villa Del Rosario	Villa Del Rosario	Calle 6 N.15-215 Barrio La Parada	5350	6228	35	registraduria	2026-07-12 21:14:33.971037+00	2026-07-12 21:14:33.971037+00	2026-07-12 21:14:33.971037+00	\N	476
1	11	95	Colegio Manuel Antonio Rueda - Villa Del Rosario	Villa Del Rosario	Cll 4 # 7-32 Centro	6256	6124	16	registraduria	2026-07-12 21:14:34.547896+00	2026-07-12 21:14:34.547896+00	2026-07-12 21:14:34.547896+00	\N	479
1	11	95	Escuela Veinte De Julio - Villa Del Rosario	Villa Del Rosario	Carrera 12 No. 13n - 40 Barrio 20 De Julio	1547	1804	11	registraduria	2026-07-12 21:14:35.140375+00	2026-07-12 21:14:35.140375+00	2026-07-12 21:14:35.140375+00	\N	482
1	11	95	La Uchema - Villa Del Rosario	Villa Del Rosario	Vereda La Uchema	298	241	2	registraduria	2026-07-12 21:14:35.724349+00	2026-07-12 21:14:35.724349+00	2026-07-12 21:14:35.724349+00	\N	485
1	5	97	Inem Sede Miguel Muller	Cucuta	Cl. 14n # 12e-56 Zulima 1 Etapa	2784	3562	19	registraduria	2026-07-12 21:14:36.324023+00	2026-07-12 21:14:36.324023+00	2026-07-12 21:14:36.324023+00	\N	488
1	11	1	Vetas De Oriente - Tibu	Tibu	Esc Rural De Vetas Central	542	317	3	registraduria	2026-07-12 21:14:27.059734+00	2026-07-12 21:14:27.059734+00	2026-07-12 21:14:27.059734+00	\N	444
1	11	86	Gibraltar (rio Cobaria) - Toledo	Toledo	Salon De Eventos Culturales	270	263	2	registraduria	2026-07-12 21:14:27.625365+00	2026-07-12 21:14:27.625365+00	2026-07-12 21:14:27.625365+00	\N	447
1	11	86	Margua - Toledo	Toledo	Cer El Porvenir	97	59	1	registraduria	2026-07-12 21:14:28.327081+00	2026-07-12 21:14:28.327081+00	2026-07-12 21:14:28.327081+00	\N	450
1	11	86	La Mesa - Toledo	Toledo	Cer La Mesa	132	100	1	registraduria	2026-07-12 21:14:28.895625+00	2026-07-12 21:14:28.895625+00	2026-07-12 21:14:28.895625+00	\N	453
1	11	1	Tolima	Tolima	Tolima	0	0	0	registraduria	2026-07-12 21:14:29.636624+00	2026-07-12 21:14:29.636624+00	2026-07-12 21:14:29.636624+00	\N	456
1	6	89	Inst Educativa San Jose	Cucuta	Cl. 3 # 1n-73 Br. Trigal Del Norte	4685	6035	31	registraduria	2026-07-12 21:14:30.369143+00	2026-07-12 21:14:30.369143+00	2026-07-12 21:14:30.369143+00	\N	459
1	2	91	Universidad Francisco De Paula Santander	Cucuta	Av. Gran Colombia No. 12 E - 96	6024	6272	37	registraduria	2026-07-12 21:14:30.988862+00	2026-07-12 21:14:30.988862+00	2026-07-12 21:14:30.988862+00	\N	462
1	11	1	Venezuela	Venezuela	Venezuela	0	0	0	registraduria	2026-07-12 21:14:31.715186+00	2026-07-12 21:14:31.715186+00	2026-07-12 21:14:31.715186+00	\N	465
1	11	1	Col Mpalsede Maria Ofelia Villamizar	Cucuta	Cll 16kn No 13a- 61 Barrio Esperanza Martinez	2363	2674	15	registraduria	2026-07-12 21:14:32.298323+00	2026-07-12 21:14:32.298323+00	2026-07-12 21:14:32.298323+00	\N	468
1	11	95	Juan Frio - Villa Del Rosario	Villa Del Rosario	Km 3 Inst. Tec. Agricola Juan Frio	1117	1143	7	registraduria	2026-07-12 21:14:33.006217+00	2026-07-12 21:14:33.006217+00	2026-07-12 21:14:33.006217+00	\N	471
1	11	95	Esc. Fco. De Paula Santander - Villa Del Rosario	Villa Del Rosario	Cra 7 # 2n-38 Barrio Santander	3004	3765	21	registraduria	2026-07-12 21:14:33.593334+00	2026-07-12 21:14:33.593334+00	2026-07-12 21:14:33.593334+00	\N	474
1	11	95	Colegio Montevideo Ii - Villa Del Rosario	Villa Del Rosario	Cl 22 An No. 8-46 Montevideo Ii	1690	2152	12	registraduria	2026-07-12 21:14:34.162173+00	2026-07-12 21:14:34.162173+00	2026-07-12 21:14:34.162173+00	\N	477
1	11	95	Escuela San Martin - Villa Del Rosario	Villa Del Rosario	Cra. 12 #.6-40 Barrio San Martin	4132	4812	27	registraduria	2026-07-12 21:14:34.734783+00	2026-07-12 21:14:34.734783+00	2026-07-12 21:14:34.734783+00	\N	480
1	11	95	Institucion Educativa San Antonio - Villa Del Rosario	Villa Del Rosario	Cra 13 No 7- 04 Gramalote	323	386	3	registraduria	2026-07-12 21:14:35.341498+00	2026-07-12 21:14:35.341498+00	2026-07-12 21:14:35.341498+00	\N	483
1	11	95	Palogordo - Villa Del Rosario	Villa Del Rosario	Vereda Palogordo	316	263	2	registraduria	2026-07-12 21:14:35.915854+00	2026-07-12 21:14:35.915854+00	2026-07-12 21:14:35.915854+00	\N	486
1	11	86	Puesto Cabecera Municipal - Toledo	Toledo	Cl 15 Entre Carera 4 Y 5	4364	4071	26	registraduria	2026-07-12 21:14:27.244659+00	2026-07-12 21:14:27.244659+00	2026-07-12 21:14:27.244659+00	\N	445
1	11	86	La Loma - Toledo	Toledo	Cer La Loma	117	68	1	registraduria	2026-07-12 21:14:27.901765+00	2026-07-12 21:14:27.901765+00	2026-07-12 21:14:27.901765+00	\N	448
1	11	86	Samore - Toledo	Toledo	C.i.c. Samore	637	592	4	registraduria	2026-07-12 21:14:28.51427+00	2026-07-12 21:14:28.51427+00	2026-07-12 21:14:28.51427+00	\N	451
1	11	86	Roman - Toledo	Toledo	Cer Roman	182	136	1	registraduria	2026-07-12 21:14:29.095737+00	2026-07-12 21:14:29.095737+00	2026-07-12 21:14:29.095737+00	\N	454
1	4	88	Ie Pablo Correa Sd Maria Auxiliadora	Cucuta	Cl. 10b # 12b-42 Br. Aniversario I	4737	5838	32	registraduria	2026-07-12 21:14:29.843731+00	2026-07-12 21:14:29.843731+00	2026-07-12 21:14:29.843731+00	\N	457
1	7	90	Col Integrado Juan Atalaya	Cucuta	Cl. 6n #. 26-118 Br. Tucunare	6825	7839	41	registraduria	2026-07-12 21:14:30.563904+00	2026-07-12 21:14:30.563904+00	2026-07-12 21:14:30.563904+00	\N	460
1	11	92	Valle Del Cauca	Valle	Valle Del Cauca	0	0	0	registraduria	2026-07-12 21:14:31.197786+00	2026-07-12 21:14:31.197786+00	2026-07-12 21:14:31.197786+00	\N	463
1	11	94	Puesto Cabecera Municipal - Villa Caro	Villa Caro	Casa De La Cultura Luis Ramon Torrado Rodriguez	1877	1799	12	registraduria	2026-07-12 21:14:31.897706+00	2026-07-12 21:14:31.897706+00	2026-07-12 21:14:31.897706+00	\N	466
1	11	95	Colegio San Pedro La Palmita - Villa Del Rosario	Villa Del Rosario	Cl 15 #.8-75 Br La Palmita	5162	4352	29	registraduria	2026-07-12 21:14:32.541183+00	2026-07-12 21:14:32.541183+00	2026-07-12 21:14:32.541183+00	\N	469
1	11	95	Colegio General Santander - Villa Del Rosario	Villa Del Rosario	Cl. 6 Nº 8-14-Centro	6693	7429	43	registraduria	2026-07-12 21:14:33.208688+00	2026-07-12 21:14:33.208688+00	2026-07-12 21:14:33.208688+00	\N	472
1	11	95	Colegio Luis Gabriel Castro - Villa Del Rosario	Villa Del Rosario	Cl 20 #. 9-50 Barrio Santa Barbara	4520	5929	32	registraduria	2026-07-12 21:14:33.78667+00	2026-07-12 21:14:33.78667+00	2026-07-12 21:14:33.78667+00	\N	475
1	11	95	Colegio Pbro Alvaro Suarez - Villa Del Rosario	Villa Del Rosario	Cra. 4 #. 4-58 Lomitas	1992	2147	13	registraduria	2026-07-12 21:14:34.361303+00	2026-07-12 21:14:34.361303+00	2026-07-12 21:14:34.361303+00	\N	478
1	11	95	Gimnacio Campestre - Villa Del Rosario	Villa Del Rosario	Confaoriente Km.4 Via Bocono	1099	1173	7	registraduria	2026-07-12 21:14:34.930124+00	2026-07-12 21:14:34.930124+00	2026-07-12 21:14:34.930124+00	\N	481
1	11	95	Ctro De Integracion Ciud - Villa Del Rosario	Villa Del Rosario	Calle 30 Entre Carrera 9 Y 10	1762	2056	12	registraduria	2026-07-12 21:14:35.537669+00	2026-07-12 21:14:35.537669+00	2026-07-12 21:14:35.537669+00	\N	484
1	6	96	Ie Ancizar Ocampo - Col. Andres Bello	Cucuta	Cll 17bn # 10-35	39	30	10	registraduria	2026-07-12 21:14:36.115844+00	2026-07-12 21:14:36.115844+00	2026-07-12 21:14:36.115844+00	\N	487
\.


--
-- Data for Name: recolectores_telegram; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.recolectores_telegram (id_campana, id_usuario, telegram_user_id, telegram_username, creado_en, id_rol, id) FROM stdin;
\.


--
-- Data for Name: registro_auditoria; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.registro_auditoria (id_actor, accion, tipo_entidad, id_entidad, id_campana, metadatos, creado_en, id) FROM stdin;
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (id_campana, nombre, nivel_jerarquia, creado_en, id) FROM stdin;
1	Coordinador	1	2026-07-12 00:41:23.01687+00	1
1	Votante	2	2026-07-12 00:41:30.231827+00	2
\.


--
-- Data for Name: sesiones_captura_telegram; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sesiones_captura_telegram (id_campana, chat_id, telegram_user_id, id_usuario, paso, datos_parciales, creado_en, actualizado_en, id) FROM stdin;
\.


--
-- Data for Name: sesiones_captura_whatsapp; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sesiones_captura_whatsapp (id_campana, telefono, perfil_nombre, id_usuario, paso, datos_parciales, creado_en, actualizado_en, id) FROM stdin;
\.


--
-- Data for Name: tipos_novedad; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tipos_novedad (id_campana, novedad, creado_en, id) FROM stdin;
\.


--
-- Data for Name: uso_campana; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.uso_campana (id_campana, proveedor, metrica, cantidad, periodo_inicio, periodo_fin, registrado_en, id) FROM stdin;
\.


--
-- Data for Name: verificaciones_registraduria; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.verificaciones_registraduria (id_campana, documento, tipo_documento, estado, nombres_oficial, apellidos_oficial, departamento, municipio, puesto_votacion, mesa, mensaje_error, datos_crudos, id_corrida, intentos, consultado_en, creado_en, actualizado_en, id) FROM stdin;
\.


--
-- Data for Name: votantes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.votantes (id_campana, nombres, apellidos, documento, tipo_documento, sexo, fecha_nacimiento, telefono, direccion, id_puesto_votacion, mesa, id_rol, id_lider_directo, estado, canal_origen, creado_por, creado_en, actualizado_en, id_lugar_trabajo, id_tipo_novedad, detalle_novedad, embedding, id) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.schema_migrations (version, inserted_at) FROM stdin;
20211116024918	2026-06-13 16:58:59
20211116045059	2026-06-13 16:58:59
20211116050929	2026-06-13 16:58:59
20211116051442	2026-06-13 16:58:59
20211116212300	2026-06-13 16:58:59
20211116213355	2026-06-13 16:59:00
20211116213934	2026-06-13 16:59:00
20211116214523	2026-06-13 16:59:00
20211122062447	2026-06-13 16:59:00
20211124070109	2026-06-13 16:59:00
20211202204204	2026-06-13 16:59:01
20211202204605	2026-06-13 16:59:01
20211210212804	2026-06-13 16:59:01
20211228014915	2026-06-13 16:59:02
20220107221237	2026-06-13 16:59:02
20220228202821	2026-06-13 16:59:02
20220312004840	2026-06-13 16:59:02
20220603231003	2026-06-13 16:59:03
20220603232444	2026-06-13 16:59:03
20220615214548	2026-06-13 16:59:03
20220712093339	2026-06-13 16:59:03
20220908172859	2026-06-13 16:59:03
20220916233421	2026-06-13 16:59:03
20230119133233	2026-06-13 16:59:04
20230128025114	2026-06-13 16:59:04
20230128025212	2026-06-13 16:59:04
20230227211149	2026-06-13 16:59:04
20230228184745	2026-06-13 16:59:04
20230308225145	2026-06-13 16:59:05
20230328144023	2026-06-13 16:59:05
20231018144023	2026-06-13 16:59:05
20231204144023	2026-06-13 16:59:05
20231204144024	2026-06-13 16:59:06
20231204144025	2026-06-13 16:59:06
20240108234812	2026-06-13 16:59:06
20240109165339	2026-06-13 16:59:06
20240227174441	2026-06-13 16:59:06
20240311171622	2026-06-13 16:59:07
20240321100241	2026-06-13 16:59:07
20240401105812	2026-06-13 16:59:08
20240418121054	2026-06-13 16:59:08
20240523004032	2026-06-13 16:59:09
20240618124746	2026-06-13 16:59:09
20240801235015	2026-06-13 16:59:09
20240805133720	2026-06-13 16:59:09
20240827160934	2026-06-13 16:59:09
20240919163303	2026-06-13 16:59:10
20240919163305	2026-06-13 16:59:10
20241019105805	2026-06-13 16:59:10
20241030150047	2026-06-13 16:59:11
20241108114728	2026-06-13 16:59:11
20241121104152	2026-06-13 16:59:11
20241130184212	2026-06-13 16:59:11
20241220035512	2026-06-13 16:59:12
20241220123912	2026-06-13 16:59:12
20241224161212	2026-06-13 16:59:12
20250107150512	2026-06-13 16:59:12
20250110162412	2026-06-13 16:59:12
20250123174212	2026-06-13 16:59:12
20250128220012	2026-06-13 16:59:13
20250506224012	2026-06-13 16:59:13
20250523164012	2026-06-13 16:59:13
20250714121412	2026-06-13 16:59:13
20250905041441	2026-06-13 16:59:13
20251103001201	2026-06-13 16:59:14
20251120212548	2026-06-13 16:59:14
20251120215549	2026-06-13 16:59:14
20260218120000	2026-06-13 16:59:14
20260326120000	2026-06-13 16:59:14
20260514120000	2026-06-13 16:59:15
20260527120000	2026-06-13 16:59:15
20260528120000	2026-06-13 16:59:15
20260603120000	2026-06-13 16:59:16
20260605120000	2026-06-24 21:01:27
20260606110000	2026-06-24 21:01:27
20260616120000	2026-06-24 23:14:45
20260624120000	2026-06-28 19:26:43
20260626120000	2026-07-02 22:06:58
20260706120000	2026-07-07 19:14:06
\.


--
-- Data for Name: subscription; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.subscription (id, subscription_id, entity, filters, claims, created_at, action_filter, selected_columns) FROM stdin;
\.


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.buckets (id, name, owner, created_at, updated_at, public, avif_autodetection, file_size_limit, allowed_mime_types, owner_id, type) FROM stdin;
platform-assets	platform-assets	\N	2026-06-15 14:11:01.424374+00	2026-06-15 14:11:01.424374+00	t	f	2097152	{image/png,image/jpeg,image/webp,image/svg+xml,image/x-icon,image/vnd.microsoft.icon}	\N	STANDARD
\.


--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.buckets_analytics (name, type, format, created_at, updated_at, id, deleted_at) FROM stdin;
\.


--
-- Data for Name: buckets_vectors; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.buckets_vectors (id, type, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.migrations (id, name, hash, executed_at) FROM stdin;
0	create-migrations-table	e18db593bcde2aca2a408c4d1100f6abba2195df	2026-06-13 13:56:44.841681
1	initialmigration	6ab16121fbaa08bbd11b712d05f358f9b555d777	2026-06-13 13:56:44.875011
2	storage-schema	f6a1fa2c93cbcd16d4e487b362e45fca157a8dbd	2026-06-13 13:56:44.880023
3	pathtoken-column	2cb1b0004b817b29d5b0a971af16bafeede4b70d	2026-06-13 13:56:44.902275
4	add-migrations-rls	427c5b63fe1c5937495d9c635c263ee7a5905058	2026-06-13 13:56:44.916158
5	add-size-functions	79e081a1455b63666c1294a440f8ad4b1e6a7f84	2026-06-13 13:56:44.92203
6	change-column-name-in-get-size	ded78e2f1b5d7e616117897e6443a925965b30d2	2026-06-13 13:56:44.927561
7	add-rls-to-buckets	e7e7f86adbc51049f341dfe8d30256c1abca17aa	2026-06-13 13:56:44.933043
8	add-public-to-buckets	fd670db39ed65f9d08b01db09d6202503ca2bab3	2026-06-13 13:56:44.938092
9	fix-search-function	af597a1b590c70519b464a4ab3be54490712796b	2026-06-13 13:56:44.94332
10	search-files-search-function	b595f05e92f7e91211af1bbfe9c6a13bb3391e16	2026-06-13 13:56:44.948602
11	add-trigger-to-auto-update-updated_at-column	7425bdb14366d1739fa8a18c83100636d74dcaa2	2026-06-13 13:56:44.95526
12	add-automatic-avif-detection-flag	8e92e1266eb29518b6a4c5313ab8f29dd0d08df9	2026-06-13 13:56:44.961623
13	add-bucket-custom-limits	cce962054138135cd9a8c4bcd531598684b25e7d	2026-06-13 13:56:44.967066
14	use-bytes-for-max-size	941c41b346f9802b411f06f30e972ad4744dad27	2026-06-13 13:56:44.972249
15	add-can-insert-object-function	934146bc38ead475f4ef4b555c524ee5d66799e5	2026-06-13 13:56:44.997994
16	add-version	76debf38d3fd07dcfc747ca49096457d95b1221b	2026-06-13 13:56:45.004183
17	drop-owner-foreign-key	f1cbb288f1b7a4c1eb8c38504b80ae2a0153d101	2026-06-13 13:56:45.012518
18	add_owner_id_column_deprecate_owner	e7a511b379110b08e2f214be852c35414749fe66	2026-06-13 13:56:45.019182
19	alter-default-value-objects-id	02e5e22a78626187e00d173dc45f58fa66a4f043	2026-06-13 13:56:45.026553
20	list-objects-with-delimiter	cd694ae708e51ba82bf012bba00caf4f3b6393b7	2026-06-13 13:56:45.031795
21	s3-multipart-uploads	8c804d4a566c40cd1e4cc5b3725a664a9303657f	2026-06-13 13:56:45.038587
22	s3-multipart-uploads-big-ints	9737dc258d2397953c9953d9b86920b8be0cdb73	2026-06-13 13:56:45.053474
23	optimize-search-function	9d7e604cddc4b56a5422dc68c9313f4a1b6f132c	2026-06-13 13:56:45.063035
24	operation-function	8312e37c2bf9e76bbe841aa5fda889206d2bf8aa	2026-06-13 13:56:45.068314
25	custom-metadata	d974c6057c3db1c1f847afa0e291e6165693b990	2026-06-13 13:56:45.073242
26	objects-prefixes	215cabcb7f78121892a5a2037a09fedf9a1ae322	2026-06-13 13:56:45.078657
27	search-v2	859ba38092ac96eb3964d83bf53ccc0b141663a6	2026-06-13 13:56:45.084019
28	object-bucket-name-sorting	c73a2b5b5d4041e39705814fd3a1b95502d38ce4	2026-06-13 13:56:45.088905
29	create-prefixes	ad2c1207f76703d11a9f9007f821620017a66c21	2026-06-13 13:56:45.093598
30	update-object-levels	2be814ff05c8252fdfdc7cfb4b7f5c7e17f0bed6	2026-06-13 13:56:45.098235
31	objects-level-index	b40367c14c3440ec75f19bbce2d71e914ddd3da0	2026-06-13 13:56:45.103224
32	backward-compatible-index-on-objects	e0c37182b0f7aee3efd823298fb3c76f1042c0f7	2026-06-13 13:56:45.108058
33	backward-compatible-index-on-prefixes	b480e99ed951e0900f033ec4eb34b5bdcb4e3d49	2026-06-13 13:56:45.113316
34	optimize-search-function-v1	ca80a3dc7bfef894df17108785ce29a7fc8ee456	2026-06-13 13:56:45.118026
35	add-insert-trigger-prefixes	458fe0ffd07ec53f5e3ce9df51bfdf4861929ccc	2026-06-13 13:56:45.122696
36	optimise-existing-functions	6ae5fca6af5c55abe95369cd4f93985d1814ca8f	2026-06-13 13:56:45.127383
37	add-bucket-name-length-trigger	3944135b4e3e8b22d6d4cbb568fe3b0b51df15c1	2026-06-13 13:56:45.13258
38	iceberg-catalog-flag-on-buckets	02716b81ceec9705aed84aa1501657095b32e5c5	2026-06-13 13:56:45.138238
39	add-search-v2-sort-support	6706c5f2928846abee18461279799ad12b279b78	2026-06-13 13:56:45.151718
40	fix-prefix-race-conditions-optimized	7ad69982ae2d372b21f48fc4829ae9752c518f6b	2026-06-13 13:56:45.158009
41	add-object-level-update-trigger	07fcf1a22165849b7a029deed059ffcde08d1ae0	2026-06-13 13:56:45.162788
42	rollback-prefix-triggers	771479077764adc09e2ea2043eb627503c034cd4	2026-06-13 13:56:45.167596
43	fix-object-level	84b35d6caca9d937478ad8a797491f38b8c2979f	2026-06-13 13:56:45.172854
44	vector-bucket-type	99c20c0ffd52bb1ff1f32fb992f3b351e3ef8fb3	2026-06-13 13:56:45.17757
45	vector-buckets	049e27196d77a7cb76497a85afae669d8b230953	2026-06-13 13:56:45.185251
46	buckets-objects-grants	fedeb96d60fefd8e02ab3ded9fbde05632f84aed	2026-06-13 13:56:45.196475
47	iceberg-table-metadata	649df56855c24d8b36dd4cc1aeb8251aa9ad42c2	2026-06-13 13:56:45.201869
48	iceberg-catalog-ids	e0e8b460c609b9999ccd0df9ad14294613eed939	2026-06-13 13:56:45.206719
49	buckets-objects-grants-postgres	072b1195d0d5a2f888af6b2302a1938dd94b8b3d	2026-06-13 13:56:45.223908
50	search-v2-optimised	6323ac4f850aa14e7387eb32102869578b5bd478	2026-06-13 13:56:45.232273
51	index-backward-compatible-search	2ee395d433f76e38bcd3856debaf6e0e5b674011	2026-06-13 13:56:45.275095
52	drop-not-used-indexes-and-functions	5cc44c8696749ac11dd0dc37f2a3802075f3a171	2026-06-13 13:56:45.27686
53	drop-index-lower-name	d0cb18777d9e2a98ebe0bc5cc7a42e57ebe41854	2026-06-13 13:56:45.288319
54	drop-index-object-level	6289e048b1472da17c31a7eba1ded625a6457e67	2026-06-13 13:56:45.291306
55	prevent-direct-deletes	262a4798d5e0f2e7c8970232e03ce8be695d5819	2026-06-13 13:56:45.293023
56	fix-optimized-search-function	b823ed1e418101032fa01374edc9a436e54e3ed4	2026-06-13 13:56:45.299036
57	s3-multipart-uploads-metadata	f127886e00d1b374fadbc7c6b31e09336aad5287	2026-06-13 13:56:45.305802
58	operation-ergonomics	00ca5d483b3fe0d522133d9002ccc5df98365120	2026-06-13 13:56:45.310766
59	drop-unused-functions	38456f13e39691c2bbb4b5151d0d1cdbabd4a8c4	2026-06-13 13:56:45.316123
60	optimize-existing-functions-again	db35e1c91a9201e59f4fef8d972c2f277d68b157	2026-06-13 13:56:45.321375
\.


--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.objects (id, bucket_id, name, owner, created_at, updated_at, last_accessed_at, metadata, version, owner_id, user_metadata) FROM stdin;
474b283a-8dec-4e9d-a633-c28a66bea025	platform-assets	brand/favicon.jpg	\N	2026-06-15 14:39:29.795993+00	2026-06-15 14:39:29.795993+00	2026-06-15 14:39:29.795993+00	{"eTag": "\\"cbe7141c8b8828637e96a01b7cf2b643\\"", "size": 177812, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-06-15T14:39:30.000Z", "contentLength": 177812, "httpStatusCode": 200}	351f8d44-a462-49c0-b2a6-ab81448afda9	\N	{}
93a17e38-15d1-4253-a0f0-bc81ef8a87c5	platform-assets	brand/favicon.png	\N	2026-06-15 14:59:48.363021+00	2026-06-15 14:59:48.363021+00	2026-06-15 14:59:48.363021+00	{"eTag": "\\"567752804c02ed71cec1c433bdeff214\\"", "size": 66532, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-06-15T14:59:49.000Z", "contentLength": 66532, "httpStatusCode": 200}	26afe694-ba5f-45eb-9893-3e07c116d821	\N	{}
a8733f74-6d7f-42fb-9cad-e8127ff0583a	platform-assets	brand/logo.png	\N	2026-06-15 15:21:13.714621+00	2026-06-15 15:23:56.934099+00	2026-06-15 15:21:13.714621+00	{"eTag": "\\"5213724299c5b922cf9245c3cae45895\\"", "size": 98511, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-06-15T15:23:57.000Z", "contentLength": 98511, "httpStatusCode": 200}	e5b9c4d6-5ef3-4c0b-8fb3-fa5c14a4d3fb	\N	{}
\.


--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.s3_multipart_uploads (id, in_progress_size, upload_signature, bucket_id, key, version, owner_id, created_at, user_metadata, metadata) FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.s3_multipart_uploads_parts (id, upload_id, size, part_number, bucket_id, key, etag, owner_id, version, created_at) FROM stdin;
\.


--
-- Data for Name: vector_indexes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.vector_indexes (id, name, bucket_id, data_type, dimension, distance_metric, metadata_configuration, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: supabase_migrations; Owner: postgres
--

COPY supabase_migrations.schema_migrations (version, statements, name, created_by, idempotency_key, rollback) FROM stdin;
20260711224647	{"-- 029_uuid_to_int8.sql\n-- Cambia todas las PKs de uuid a bigint con GENERATED ALWAYS AS IDENTITY.\n-- Actualiza FKs, funciones y triggers para usar bigint.\n\nBEGIN;\n\n-- ============================================================================\n-- PHASE 0: Drop ALL FK constraints (both changing and staying uuid)\n-- ============================================================================\n\n-- campanas\nALTER TABLE campanas DROP CONSTRAINT IF EXISTS campanas_id_cliente_fkey;\nALTER TABLE campanas DROP CONSTRAINT IF EXISTS campanas_id_proceso_electoral_fkey;\n\n-- miembros_campana\nALTER TABLE miembros_campana DROP CONSTRAINT IF EXISTS miembros_campana_id_campana_fkey;\nALTER TABLE miembros_campana DROP CONSTRAINT IF EXISTS miembros_campana_id_usuario_fkey;\n\n-- miembros_cliente\nALTER TABLE miembros_cliente DROP CONSTRAINT IF EXISTS miembros_cliente_id_cliente_fkey;\nALTER TABLE miembros_cliente DROP CONSTRAINT IF EXISTS miembros_cliente_id_usuario_fkey;\nALTER TABLE miembros_cliente DROP CONSTRAINT IF EXISTS miembros_cliente_pkey;\nALTER TABLE miembros_cliente DROP CONSTRAINT IF EXISTS miembros_cliente_id_cliente_id_usuario_key;\n\n-- miembros_plataforma\nALTER TABLE miembros_plataforma DROP CONSTRAINT IF EXISTS miembros_plataforma_id_usuario_fkey;\n\n-- caracteristicas_campana\nALTER TABLE caracteristicas_campana DROP CONSTRAINT IF EXISTS caracteristicas_campana_id_campana_fkey;\nALTER TABLE caracteristicas_campana DROP CONSTRAINT IF EXISTS caracteristicas_campana_pkey;\n\n-- integraciones_campana\nALTER TABLE integraciones_campana DROP CONSTRAINT IF EXISTS integraciones_campana_id_campana_fkey;\n\n-- uso_campana\nALTER TABLE uso_campana DROP CONSTRAINT IF EXISTS uso_campana_id_campana_fkey;\n\n-- exportaciones_campana\nALTER TABLE exportaciones_campana DROP CONSTRAINT IF EXISTS exportaciones_campana_id_campana_fkey;\nALTER TABLE exportaciones_campana DROP CONSTRAINT IF EXISTS exportaciones_campana_exportado_por_fkey;\n\n-- registro_auditoria\nALTER TABLE registro_auditoria DROP CONSTRAINT IF EXISTS registro_auditoria_id_campana_fkey;\nALTER TABLE registro_auditoria DROP CONSTRAINT IF EXISTS registro_auditoria_id_actor_fkey;\n\n-- roles\nALTER TABLE roles DROP CONSTRAINT IF EXISTS roles_id_campana_fkey;\n\n-- comunas\nALTER TABLE comunas DROP CONSTRAINT IF EXISTS comunas_id_campana_fkey;\n\n-- barrios\nALTER TABLE barrios DROP CONSTRAINT IF EXISTS barrios_id_comuna_fkey;\n\n-- puestos_votacion\nALTER TABLE puestos_votacion DROP CONSTRAINT IF EXISTS puestos_votacion_id_campana_fkey;\nALTER TABLE puestos_votacion DROP CONSTRAINT IF EXISTS puestos_votacion_id_comuna_fkey;\nALTER TABLE puestos_votacion DROP CONSTRAINT IF EXISTS puestos_votacion_id_barrio_fkey;\n\n-- tipos_novedad\nALTER TABLE tipos_novedad DROP CONSTRAINT IF EXISTS tipos_novedad_id_campana_fkey;\n\n-- votantes\nALTER TABLE votantes DROP CONSTRAINT IF EXISTS votantes_id_campana_fkey;\nALTER TABLE votantes DROP CONSTRAINT IF EXISTS votantes_id_puesto_votacion_fkey;\nALTER TABLE votantes DROP CONSTRAINT IF EXISTS votantes_id_rol_fkey;\nALTER TABLE votantes DROP CONSTRAINT IF EXISTS votantes_id_lider_directo_fkey;\nALTER TABLE votantes DROP CONSTRAINT IF EXISTS votantes_id_lugar_trabajo_fkey;\nALTER TABLE votantes DROP CONSTRAINT IF EXISTS votantes_id_tipo_novedad_fkey;\nALTER TABLE votantes DROP CONSTRAINT IF EXISTS votantes_creado_por_fkey;\n\n-- datos_trabajador_votante\nALTER TABLE datos_trabajador_votante DROP CONSTRAINT IF EXISTS datos_trabajador_votante_id_votante_fkey;\nALTER TABLE datos_trabajador_votante DROP CONSTRAINT IF EXISTS datos_trabajador_votante_id_comuna_fkey;\nALTER TABLE datos_trabajador_votante DROP CONSTRAINT IF EXISTS datos_trabajador_votante_id_barrio_fkey;\n\n-- novedades\nALTER TABLE novedades DROP CONSTRAINT IF EXISTS novedades_id_votante_fkey;\nALTER TABLE novedades DROP CONSTRAINT IF EXISTS novedades_id_tipo_novedad_fkey;\nALTER TABLE novedades DROP CONSTRAINT IF EXISTS novedades_creado_por_fkey;\n\n-- cuarentena_votantes\nALTER TABLE cuarentena_votantes DROP CONSTRAINT IF EXISTS cuarentena_votantes_id_campana_fkey;\nALTER TABLE cuarentena_votantes DROP CONSTRAINT IF EXISTS cuarentena_votantes_id_puesto_votacion_fkey;\nALTER TABLE cuarentena_votantes DROP CONSTRAINT IF EXISTS cuarentena_votantes_id_rol_fkey;\nALTER TABLE cuarentena_votantes DROP CONSTRAINT IF EXISTS cuarentena_votantes_id_lider_directo_fkey;\nALTER TABLE cuarentena_votantes DROP CONSTRAINT IF EXISTS cuarentena_votantes_id_votante_conflicto_fkey;\nALTER TABLE cuarentena_votantes DROP CONSTRAINT IF EXISTS cuarentena_votantes_id_cuarentena_conflicto_fkey;\nALTER TABLE cuarentena_votantes DROP CONSTRAINT IF EXISTS cuarentena_votantes_id_lugar_trabajo_fkey;\nALTER TABLE cuarentena_votantes DROP CONSTRAINT IF EXISTS cuarentena_votantes_creado_por_fkey;\nALTER TABLE cuarentena_votantes DROP CONSTRAINT IF EXISTS cuarentena_votantes_resuelto_por_fkey;\n\n-- lugares_trabajo\nALTER TABLE lugares_trabajo DROP CONSTRAINT IF EXISTS lugares_trabajo_id_campana_fkey;\nALTER TABLE lugares_trabajo DROP CONSTRAINT IF EXISTS lugares_trabajo_id_comuna_fkey;\nALTER TABLE lugares_trabajo DROP CONSTRAINT IF EXISTS lugares_trabajo_id_barrio_fkey;\n\n-- recolectores_telegram\nALTER TABLE recolectores_telegram DROP CONSTRAINT IF EXISTS recolectores_telegram_id_campana_fkey;\nALTER TABLE recolectores_telegram DROP CONSTRAINT IF EXISTS recolectores_telegram_id_rol_fkey;\nALTER TABLE recolectores_telegram DROP CONSTRAINT IF EXISTS recolectores_telegram_id_usuario_fkey;\n\n-- sesiones_captura_telegram\nALTER TABLE sesiones_captura_telegram DROP CONSTRAINT IF EXISTS sesiones_captura_telegram_id_campana_fkey;\nALTER TABLE sesiones_captura_telegram DROP CONSTRAINT IF EXISTS sesiones_captura_telegram_id_usuario_fkey;\n\n-- verificaciones_registraduria\nALTER TABLE verificaciones_registraduria DROP CONSTRAINT IF EXISTS verificaciones_registraduria_id_campana_fkey;\n\n-- sesiones_captura_whatsapp\nALTER TABLE sesiones_captura_whatsapp DROP CONSTRAINT IF EXISTS sesiones_captura_whatsapp_id_campana_fkey;\nALTER TABLE sesiones_captura_whatsapp DROP CONSTRAINT IF EXISTS sesiones_captura_whatsapp_id_usuario_fkey;\n\n-- clientes (FK to auth.users — stays uuid, just recreated later)\nALTER TABLE clientes DROP CONSTRAINT IF EXISTS clientes_id_usuario_fkey;\n\n-- ============================================================================\n-- PHASE 1: Drop ALL RLS policies in public schema (depend on functions we'll recreate)\n-- ============================================================================\n\nDO $$\nDECLARE\n  rec RECORD;\nBEGIN\n  FOR rec IN (\n    SELECT schemaname, tablename, policyname\n    FROM pg_policies\n    WHERE schemaname = 'public'\n  ) LOOP\n    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', rec.policyname, rec.schemaname, rec.tablename);\n  END LOOP;\nEND $$;\n\n-- ============================================================================\n-- PHASE 2: Drop triggers and functions that depend on uuid types\n-- ============================================================================\n\nDROP TRIGGER IF EXISTS votantes_lider_misma_campana ON votantes;\nDROP TRIGGER IF EXISTS comunas_asignar_codigo ON comunas;\nDROP TRIGGER IF EXISTS barrios_asignar_codigo ON barrios;\nDROP TRIGGER IF EXISTS puestos_asignar_codigo ON puestos_votacion;\nDROP TRIGGER IF EXISTS roles_asignar_codigo ON roles;\nDROP TRIGGER IF EXISTS tipos_novedad_asignar_codigo ON tipos_novedad;\nDROP TRIGGER IF EXISTS lugares_trabajo_asignar_codigo ON lugares_trabajo;\nDROP TRIGGER IF EXISTS clientes_asignar_codigo ON clientes;\nDROP TRIGGER IF EXISTS procesos_electorales_asignar_codigo ON procesos_electorales;\nDROP TRIGGER IF EXISTS campanas_asignar_codigo ON campanas;\n\nDROP FUNCTION IF EXISTS ids_campanas_usuario();\nDROP FUNCTION IF EXISTS puede_leer_campana(uuid);\nDROP FUNCTION IF EXISTS puede_editar_campana(uuid);\nDROP FUNCTION IF EXISTS puede_administrar_campana(uuid);\nDROP FUNCTION IF EXISTS subarbol_votantes(uuid);\nDROP FUNCTION IF EXISTS asignar_codigo_serial();\nDROP FUNCTION IF EXISTS validar_lider_misma_campana();\nDROP FUNCTION IF EXISTS match_puestos_votacion(vector, integer, jsonb);\nDROP FUNCTION IF EXISTS match_votantes(vector, integer, jsonb);\n\n-- ============================================================================\n-- PHASE 3: Migrate PKs — tables WITH data (procesos_electorales, clientes)\n-- Campaigns tablas vacías: drop + recreate column con IDENTITY\n-- ============================================================================\n\n--- 3.1 procesos_electorales (2 rows con data) ---\nDO $$\nDECLARE\n  seq_name text := 'procesos_electorales_id_seq';\n  new_max bigint;\nBEGIN\n  ALTER TABLE procesos_electorales ADD COLUMN id_new bigint;\n  CREATE SEQUENCE temp_pe_seq;\n  UPDATE procesos_electorales t\n  SET id_new = sub.rn\n  FROM (\n    SELECT id, row_number() OVER (ORDER BY creado_en, id) AS rn\n    FROM procesos_electorales\n  ) sub\n  WHERE t.id = sub.id;\n  PERFORM setval('temp_pe_seq', (SELECT COALESCE(MAX(id_new), 0) FROM procesos_electorales));\n  new_max := currval('temp_pe_seq');\n  DROP SEQUENCE temp_pe_seq;\n\n  ALTER TABLE procesos_electorales DROP CONSTRAINT procesos_electorales_pkey CASCADE;\n  ALTER TABLE procesos_electorales DROP COLUMN id;\n  ALTER TABLE procesos_electorales RENAME COLUMN id_new TO id;\n  ALTER TABLE procesos_electorales ADD PRIMARY KEY (id);\n\n  EXECUTE format('CREATE SEQUENCE %I START WITH %s', seq_name, new_max + 1);\n  EXECUTE format('ALTER TABLE procesos_electorales ALTER COLUMN id SET DEFAULT nextval(%L::regclass)', seq_name);\n  EXECUTE format('ALTER SEQUENCE %I OWNED BY procesos_electorales.id', seq_name);\nEND $$;\n\n--- 3.2 clientes (1 row con data) ---\nDO $$\nDECLARE\n  seq_name text := 'clientes_id_seq';\n  new_max bigint;\nBEGIN\n  ALTER TABLE clientes ADD COLUMN id_new bigint;\n  CREATE SEQUENCE temp_cl_seq;\n  UPDATE clientes t\n  SET id_new = sub.rn\n  FROM (\n    SELECT id, row_number() OVER (ORDER BY creado_en, id) AS rn\n    FROM clientes\n  ) sub\n  WHERE t.id = sub.id;\n  PERFORM setval('temp_cl_seq', (SELECT COALESCE(MAX(id_new), 0) FROM clientes));\n  new_max := currval('temp_cl_seq');\n  DROP SEQUENCE temp_cl_seq;\n\n  ALTER TABLE clientes DROP CONSTRAINT clientes_pkey CASCADE;\n  ALTER TABLE clientes DROP COLUMN id;\n  ALTER TABLE clientes RENAME COLUMN id_new TO id;\n  ALTER TABLE clientes ADD PRIMARY KEY (id);\n\n  EXECUTE format('CREATE SEQUENCE %I START WITH %s', seq_name, new_max + 1);\n  EXECUTE format('ALTER TABLE clientes ALTER COLUMN id SET DEFAULT nextval(%L::regclass)', seq_name);\n  EXECUTE format('ALTER SEQUENCE %I OWNED BY clientes.id', seq_name);\nEND $$;\n\n--- 3.3 Tablas vacías (campanas, miembros_campana, etc.) ---\n\nCREATE OR REPLACE FUNCTION _tmp_drop_recreate_pk(tbl text)\nRETURNS void\nLANGUAGE plpgsql\nAS $$\nDECLARE\n  pk_name text;\n  seq_name text;\nBEGIN\n  SELECT con.conname INTO pk_name\n  FROM pg_constraint con\n  JOIN pg_class cl ON con.conrelid = cl.oid\n  WHERE cl.relname = tbl\n    AND con.contype = 'p';\n\n  IF pk_name IS NOT NULL THEN\n    EXECUTE format('ALTER TABLE %I DROP CONSTRAINT %I', tbl, pk_name);\n  END IF;\n\n  EXECUTE format('ALTER TABLE %I DROP COLUMN id CASCADE', tbl);\n  EXECUTE format('ALTER TABLE %I ADD COLUMN id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY', tbl);\nEND;\n$$;\n\nSELECT _tmp_drop_recreate_pk('campanas');\nSELECT _tmp_drop_recreate_pk('miembros_campana');\nSELECT _tmp_drop_recreate_pk('integraciones_campana');\nSELECT _tmp_drop_recreate_pk('uso_campana');\nSELECT _tmp_drop_recreate_pk('exportaciones_campana');\nSELECT _tmp_drop_recreate_pk('registro_auditoria');\nSELECT _tmp_drop_recreate_pk('roles');\nSELECT _tmp_drop_recreate_pk('comunas');\nSELECT _tmp_drop_recreate_pk('barrios');\nSELECT _tmp_drop_recreate_pk('puestos_votacion');\nSELECT _tmp_drop_recreate_pk('tipos_novedad');\nSELECT _tmp_drop_recreate_pk('datos_trabajador_votante');\nSELECT _tmp_drop_recreate_pk('novedades');\nSELECT _tmp_drop_recreate_pk('lugares_trabajo');\nSELECT _tmp_drop_recreate_pk('recolectores_telegram');\nSELECT _tmp_drop_recreate_pk('sesiones_captura_telegram');\nSELECT _tmp_drop_recreate_pk('verificaciones_registraduria');\nSELECT _tmp_drop_recreate_pk('sesiones_captura_whatsapp');\n\n-- votantes y cuarentena_votantes (self-referencing, handle separately)\nSELECT _tmp_drop_recreate_pk('votantes');\nSELECT _tmp_drop_recreate_pk('cuarentena_votantes');\n\nDROP FUNCTION _tmp_drop_recreate_pk;\n\n--- 3.4 miembros_cliente (1 row with data) ---\nDO $$\nDECLARE\n  seq_name text := 'miembros_cliente_id_seq';\n  new_max bigint;\nBEGIN\n  ALTER TABLE miembros_cliente ADD COLUMN id_new bigint;\n\n  -- Migrate id_cliente FK to bigint (only 1 row, direct mapping)\n  ALTER TABLE miembros_cliente ADD COLUMN id_cliente_new bigint;\n  UPDATE miembros_cliente SET id_cliente_new = (SELECT id FROM clientes LIMIT 1);\n\n  CREATE SEQUENCE temp_mc_seq;\n  UPDATE miembros_cliente t\n  SET id_new = sub.rn\n  FROM (\n    SELECT id, row_number() OVER (ORDER BY creado_en, id) AS rn\n    FROM miembros_cliente\n  ) sub\n  WHERE t.id = sub.id;\n  PERFORM setval('temp_mc_seq', (SELECT COALESCE(MAX(id_new), 0) FROM miembros_cliente));\n  new_max := currval('temp_mc_seq');\n  DROP SEQUENCE temp_mc_seq;\n\n  ALTER TABLE miembros_cliente DROP COLUMN id;\n  ALTER TABLE miembros_cliente DROP COLUMN id_cliente;\n  ALTER TABLE miembros_cliente RENAME COLUMN id_new TO id;\n  ALTER TABLE miembros_cliente RENAME COLUMN id_cliente_new TO id_cliente;\n  ALTER TABLE miembros_cliente ADD PRIMARY KEY (id);\n\n  EXECUTE format('CREATE SEQUENCE %I START WITH %s', seq_name, new_max + 1);\n  EXECUTE format('ALTER TABLE miembros_cliente ALTER COLUMN id SET DEFAULT nextval(%L::regclass)', seq_name);\n  EXECUTE format('ALTER SEQUENCE %I OWNED BY miembros_cliente.id', seq_name);\nEND $$;\n\n-- ============================================================================\n-- PHASE 4: Migrate FK columns — tables without data (all nulls -> type change)\n-- ============================================================================\n\n--- 4.1 campanas ---\nALTER TABLE campanas ALTER COLUMN id_cliente TYPE bigint USING NULL::bigint;\nALTER TABLE campanas ALTER COLUMN id_cliente SET NOT NULL;\nALTER TABLE campanas ALTER COLUMN id_proceso_electoral TYPE bigint USING NULL::bigint;\nALTER TABLE campanas ALTER COLUMN id_proceso_electoral SET NOT NULL;\n\n--- 4.2 miembros_campana ---\nALTER TABLE miembros_campana ALTER COLUMN id_campana TYPE bigint USING NULL::bigint;\nALTER TABLE miembros_campana ALTER COLUMN id_campana SET NOT NULL;\n\n--- 4.3 caracteristicas_campana ---\nALTER TABLE caracteristicas_campana ALTER COLUMN id_campana TYPE bigint USING NULL::bigint;\nALTER TABLE caracteristicas_campana ALTER COLUMN id_campana SET NOT NULL;\nALTER TABLE caracteristicas_campana ADD PRIMARY KEY (id_campana);\n\n--- 4.4 integraciones_campana ---\nALTER TABLE integraciones_campana ALTER COLUMN id_campana TYPE bigint USING NULL::bigint;\nALTER TABLE integraciones_campana ALTER COLUMN id_campana SET NOT NULL;\n\n--- 4.5 uso_campana ---\nALTER TABLE uso_campana ALTER COLUMN id_campana TYPE bigint USING NULL::bigint;\nALTER TABLE uso_campana ALTER COLUMN id_campana SET NOT NULL;\n\n--- 4.6 exportaciones_campana ---\nALTER TABLE exportaciones_campana ALTER COLUMN id_campana TYPE bigint USING NULL::bigint;\nALTER TABLE exportaciones_campana ALTER COLUMN id_campana SET NOT NULL;\n\n--- 4.7 registro_auditoria ---\nALTER TABLE registro_auditoria ALTER COLUMN id_campana TYPE bigint USING NULL::bigint;\n\n--- 4.8 roles ---\nALTER TABLE roles ALTER COLUMN id_campana TYPE bigint USING NULL::bigint;\nALTER TABLE roles ALTER COLUMN id_campana SET NOT NULL;\n\n--- 4.9 comunas ---\nALTER TABLE comunas ALTER COLUMN id_campana TYPE bigint USING NULL::bigint;\nALTER TABLE comunas ALTER COLUMN id_campana SET NOT NULL;\n\n--- 4.10 barrios ---\nALTER TABLE barrios ALTER COLUMN id_comuna TYPE bigint USING NULL::bigint;\nALTER TABLE barrios ALTER COLUMN id_comuna SET NOT NULL;\n\n--- 4.11 puestos_votacion ---\nALTER TABLE puestos_votacion ALTER COLUMN id_campana TYPE bigint USING NULL::bigint;\nALTER TABLE puestos_votacion ALTER COLUMN id_campana SET NOT NULL;\nALTER TABLE puestos_votacion ALTER COLUMN id_comuna TYPE bigint USING NULL::bigint;\nALTER TABLE puestos_votacion ALTER COLUMN id_barrio TYPE bigint USING NULL::bigint;\n\n--- 4.12 tipos_novedad ---\nALTER TABLE tipos_novedad ALTER COLUMN id_campana TYPE bigint USING NULL::bigint;\nALTER TABLE tipos_novedad ALTER COLUMN id_campana SET NOT NULL;\n\n--- 4.13 votantes ---\nALTER TABLE votantes ALTER COLUMN id_campana TYPE bigint USING NULL::bigint;\nALTER TABLE votantes ALTER COLUMN id_campana SET NOT NULL;\nALTER TABLE votantes ALTER COLUMN id_puesto_votacion TYPE bigint USING NULL::bigint;\nALTER TABLE votantes ALTER COLUMN id_rol TYPE bigint USING NULL::bigint;\nALTER TABLE votantes ALTER COLUMN id_lider_directo TYPE bigint USING NULL::bigint;\nALTER TABLE votantes ALTER COLUMN id_lugar_trabajo TYPE bigint USING NULL::bigint;\nALTER TABLE votantes ALTER COLUMN id_tipo_novedad TYPE bigint USING NULL::bigint;\n\n--- 4.14 datos_trabajador_votante ---\nALTER TABLE datos_trabajador_votante ALTER COLUMN id_votante TYPE bigint USING NULL::bigint;\nALTER TABLE datos_trabajador_votante ALTER COLUMN id_votante SET NOT NULL;\nALTER TABLE datos_trabajador_votante ALTER COLUMN id_comuna TYPE bigint USING NULL::bigint;\nALTER TABLE datos_trabajador_votante ALTER COLUMN id_barrio TYPE bigint USING NULL::bigint;\n\n--- 4.15 novedades ---\nALTER TABLE novedades ALTER COLUMN id_votante TYPE bigint USING NULL::bigint;\nALTER TABLE novedades ALTER COLUMN id_votante SET NOT NULL;\nALTER TABLE novedades ALTER COLUMN id_tipo_novedad TYPE bigint USING NULL::bigint;\nALTER TABLE novedades ALTER COLUMN id_tipo_novedad SET NOT NULL;\n\n--- 4.16 cuarentena_votantes ---\nALTER TABLE cuarentena_votantes ALTER COLUMN id_campana TYPE bigint USING NULL::bigint;\nALTER TABLE cuarentena_votantes ALTER COLUMN id_campana SET NOT NULL;\nALTER TABLE cuarentena_votantes ALTER COLUMN id_puesto_votacion TYPE bigint USING NULL::bigint;\nALTER TABLE cuarentena_votantes ALTER COLUMN id_rol TYPE bigint USING NULL::bigint;\nALTER TABLE cuarentena_votantes ALTER COLUMN id_lider_directo TYPE bigint USING NULL::bigint;\nALTER TABLE cuarentena_votantes ALTER COLUMN id_votante_conflicto TYPE bigint USING NULL::bigint;\nALTER TABLE cuarentena_votantes ALTER COLUMN id_cuarentena_conflicto TYPE bigint USING NULL::bigint;\nALTER TABLE cuarentena_votantes ALTER COLUMN id_lugar_trabajo TYPE bigint USING NULL::bigint;\n\n--- 4.17 lugares_trabajo ---\nALTER TABLE lugares_trabajo ALTER COLUMN id_campana TYPE bigint USING NULL::bigint;\nALTER TABLE lugares_trabajo ALTER COLUMN id_campana SET NOT NULL;\nALTER TABLE lugares_trabajo ALTER COLUMN id_comuna TYPE bigint USING NULL::bigint;\nALTER TABLE lugares_trabajo ALTER COLUMN id_barrio TYPE bigint USING NULL::bigint;\n\n--- 4.18 recolectores_telegram ---\nALTER TABLE recolectores_telegram ALTER COLUMN id_campana TYPE bigint USING NULL::bigint;\nALTER TABLE recolectores_telegram ALTER COLUMN id_campana SET NOT NULL;\nALTER TABLE recolectores_telegram ALTER COLUMN id_rol TYPE bigint USING NULL::bigint;\n\n--- 4.19 sesiones_captura_telegram ---\nALTER TABLE sesiones_captura_telegram ALTER COLUMN id_campana TYPE bigint USING NULL::bigint;\nALTER TABLE sesiones_captura_telegram ALTER COLUMN id_campana SET NOT NULL;\n\n--- 4.20 verificaciones_registraduria ---\nALTER TABLE verificaciones_registraduria ALTER COLUMN id_campana TYPE bigint USING NULL::bigint;\nALTER TABLE verificaciones_registraduria ALTER COLUMN id_campana SET NOT NULL;\n\n--- 4.21 sesiones_captura_whatsapp ---\nALTER TABLE sesiones_captura_whatsapp ALTER COLUMN id_campana TYPE bigint USING NULL::bigint;\nALTER TABLE sesiones_captura_whatsapp ALTER COLUMN id_campana SET NOT NULL;\n\n-- Recreate CHECK constraints that were dropped by CASCADE\n-- Must be AFTER FK column type changes (now both sides are bigint)\nALTER TABLE votantes ADD CONSTRAINT votantes_sin_auto_lider\n  CHECK (id_lider_directo IS NULL OR id_lider_directo <> id);\nALTER TABLE cuarentena_votantes ADD CONSTRAINT cuarentena_sin_auto_conflicto\n  CHECK (id_cuarentena_conflicto IS NULL OR id_cuarentena_conflicto <> id);\nALTER TABLE cuarentena_votantes DROP CONSTRAINT IF EXISTS cuarentena_tiene_conflicto;\nALTER TABLE cuarentena_votantes ADD CONSTRAINT cuarentena_tiene_conflicto\n  CHECK (id_votante_conflicto IS NOT NULL OR id_cuarentena_conflicto IS NOT NULL);\n\n-- ============================================================================\n-- PHASE 5: Recreate FK constraints\n-- ============================================================================\n\n--- 5.1 Referencias a procesos_electorales ---\nALTER TABLE campanas ADD CONSTRAINT campanas_id_proceso_electoral_fkey\n  FOREIGN KEY (id_proceso_electoral) REFERENCES procesos_electorales(id) ON DELETE RESTRICT;\n\n--- 5.2 Referencias a clientes ---\nALTER TABLE campanas ADD CONSTRAINT campanas_id_cliente_fkey\n  FOREIGN KEY (id_cliente) REFERENCES clientes(id) ON DELETE RESTRICT;\nALTER TABLE miembros_cliente ADD CONSTRAINT miembros_cliente_id_cliente_fkey\n  FOREIGN KEY (id_cliente) REFERENCES clientes(id) ON DELETE CASCADE;\n\n--- 5.3 Referencias a campanas ---\nALTER TABLE miembros_campana ADD CONSTRAINT miembros_campana_id_campana_fkey\n  FOREIGN KEY (id_campana) REFERENCES campanas(id) ON DELETE CASCADE;\nALTER TABLE caracteristicas_campana ADD CONSTRAINT caracteristicas_campana_id_campana_fkey\n  FOREIGN KEY (id_campana) REFERENCES campanas(id) ON DELETE CASCADE;\nALTER TABLE integraciones_campana ADD CONSTRAINT integraciones_campana_id_campana_fkey\n  FOREIGN KEY (id_campana) REFERENCES campanas(id) ON DELETE CASCADE;\nALTER TABLE uso_campana ADD CONSTRAINT uso_campana_id_campana_fkey\n  FOREIGN KEY (id_campana) REFERENCES campanas(id) ON DELETE CASCADE;\nALTER TABLE exportaciones_campana ADD CONSTRAINT exportaciones_campana_id_campana_fkey\n  FOREIGN KEY (id_campana) REFERENCES campanas(id) ON DELETE CASCADE;\nALTER TABLE registro_auditoria ADD CONSTRAINT registro_auditoria_id_campana_fkey\n  FOREIGN KEY (id_campana) REFERENCES campanas(id) ON DELETE SET NULL;\nALTER TABLE roles ADD CONSTRAINT roles_id_campana_fkey\n  FOREIGN KEY (id_campana) REFERENCES campanas(id) ON DELETE CASCADE;\nALTER TABLE comunas ADD CONSTRAINT comunas_id_campana_fkey\n  FOREIGN KEY (id_campana) REFERENCES campanas(id) ON DELETE CASCADE;\nALTER TABLE puestos_votacion ADD CONSTRAINT puestos_votacion_id_campana_fkey\n  FOREIGN KEY (id_campana) REFERENCES campanas(id) ON DELETE CASCADE;\nALTER TABLE tipos_novedad ADD CONSTRAINT tipos_novedad_id_campana_fkey\n  FOREIGN KEY (id_campana) REFERENCES campanas(id) ON DELETE CASCADE;\nALTER TABLE votantes ADD CONSTRAINT votantes_id_campana_fkey\n  FOREIGN KEY (id_campana) REFERENCES campanas(id) ON DELETE CASCADE;\nALTER TABLE cuarentena_votantes ADD CONSTRAINT cuarentena_votantes_id_campana_fkey\n  FOREIGN KEY (id_campana) REFERENCES campanas(id) ON DELETE CASCADE;\nALTER TABLE lugares_trabajo ADD CONSTRAINT lugares_trabajo_id_campana_fkey\n  FOREIGN KEY (id_campana) REFERENCES campanas(id) ON DELETE CASCADE;\nALTER TABLE recolectores_telegram ADD CONSTRAINT recolectores_telegram_id_campana_fkey\n  FOREIGN KEY (id_campana) REFERENCES campanas(id) ON DELETE CASCADE;\nALTER TABLE sesiones_captura_telegram ADD CONSTRAINT sesiones_captura_telegram_id_campana_fkey\n  FOREIGN KEY (id_campana) REFERENCES campanas(id) ON DELETE CASCADE;\nALTER TABLE verificaciones_registraduria ADD CONSTRAINT verificaciones_registraduria_id_campana_fkey\n  FOREIGN KEY (id_campana) REFERENCES campanas(id) ON DELETE CASCADE;\nALTER TABLE sesiones_captura_whatsapp ADD CONSTRAINT sesiones_captura_whatsapp_id_campana_fkey\n  FOREIGN KEY (id_campana) REFERENCES campanas(id) ON DELETE CASCADE;\n\n--- 5.4 Referencias a comunas ---\nALTER TABLE barrios ADD CONSTRAINT barrios_id_comuna_fkey\n  FOREIGN KEY (id_comuna) REFERENCES comunas(id) ON DELETE CASCADE;\nALTER TABLE puestos_votacion ADD CONSTRAINT puestos_votacion_id_comuna_fkey\n  FOREIGN KEY (id_comuna) REFERENCES comunas(id) ON DELETE SET NULL;\nALTER TABLE datos_trabajador_votante ADD CONSTRAINT datos_trabajador_votante_id_comuna_fkey\n  FOREIGN KEY (id_comuna) REFERENCES comunas(id) ON DELETE SET NULL;\nALTER TABLE lugares_trabajo ADD CONSTRAINT lugares_trabajo_id_comuna_fkey\n  FOREIGN KEY (id_comuna) REFERENCES comunas(id) ON DELETE SET NULL;\n\n--- 5.5 Referencias a barrios ---\nALTER TABLE puestos_votacion ADD CONSTRAINT puestos_votacion_id_barrio_fkey\n  FOREIGN KEY (id_barrio) REFERENCES barrios(id) ON DELETE SET NULL;\nALTER TABLE datos_trabajador_votante ADD CONSTRAINT datos_trabajador_votante_id_barrio_fkey\n  FOREIGN KEY (id_barrio) REFERENCES barrios(id) ON DELETE SET NULL;\nALTER TABLE lugares_trabajo ADD CONSTRAINT lugares_trabajo_id_barrio_fkey\n  FOREIGN KEY (id_barrio) REFERENCES barrios(id) ON DELETE SET NULL;\n\n--- 5.6 Referencias a puestos_votacion ---\nALTER TABLE votantes ADD CONSTRAINT votantes_id_puesto_votacion_fkey\n  FOREIGN KEY (id_puesto_votacion) REFERENCES puestos_votacion(id) ON DELETE SET NULL;\nALTER TABLE cuarentena_votantes ADD CONSTRAINT cuarentena_votantes_id_puesto_votacion_fkey\n  FOREIGN KEY (id_puesto_votacion) REFERENCES puestos_votacion(id) ON DELETE SET NULL;\n\n--- 5.7 Referencias a roles ---\nALTER TABLE votantes ADD CONSTRAINT votantes_id_rol_fkey\n  FOREIGN KEY (id_rol) REFERENCES roles(id) ON DELETE SET NULL;\nALTER TABLE cuarentena_votantes ADD CONSTRAINT cuarentena_votantes_id_rol_fkey\n  FOREIGN KEY (id_rol) REFERENCES roles(id) ON DELETE SET NULL;\nALTER TABLE recolectores_telegram ADD CONSTRAINT recolectores_telegram_id_rol_fkey\n  FOREIGN KEY (id_rol) REFERENCES roles(id) ON DELETE SET NULL;\n\n--- 5.8 Referencias a tipos_novedad ---\nALTER TABLE votantes ADD CONSTRAINT votantes_id_tipo_novedad_fkey\n  FOREIGN KEY (id_tipo_novedad) REFERENCES tipos_novedad(id) ON DELETE SET NULL;\nALTER TABLE novedades ADD CONSTRAINT novedades_id_tipo_novedad_fkey\n  FOREIGN KEY (id_tipo_novedad) REFERENCES tipos_novedad(id) ON DELETE RESTRICT;\n\n--- 5.9 Referencias a votantes (incluye self-ref) ---\nALTER TABLE votantes ADD CONSTRAINT votantes_id_lider_directo_fkey\n  FOREIGN KEY (id_lider_directo) REFERENCES votantes(id) ON DELETE SET NULL;\nALTER TABLE datos_trabajador_votante ADD CONSTRAINT datos_trabajador_votante_id_votante_fkey\n  FOREIGN KEY (id_votante) REFERENCES votantes(id) ON DELETE CASCADE;\nALTER TABLE novedades ADD CONSTRAINT novedades_id_votante_fkey\n  FOREIGN KEY (id_votante) REFERENCES votantes(id) ON DELETE CASCADE;\nALTER TABLE cuarentena_votantes ADD CONSTRAINT cuarentena_votantes_id_lider_directo_fkey\n  FOREIGN KEY (id_lider_directo) REFERENCES votantes(id) ON DELETE SET NULL;\nALTER TABLE cuarentena_votantes ADD CONSTRAINT cuarentena_votantes_id_votante_conflicto_fkey\n  FOREIGN KEY (id_votante_conflicto) REFERENCES votantes(id) ON DELETE SET NULL;\n\n--- 5.10 Self-ref cuarentena_votantes ---\nALTER TABLE cuarentena_votantes ADD CONSTRAINT cuarentena_votantes_id_cuarentena_conflicto_fkey\n  FOREIGN KEY (id_cuarentena_conflicto) REFERENCES cuarentena_votantes(id) ON DELETE SET NULL;\n\n--- 5.11 Referencias a lugares_trabajo ---\nALTER TABLE votantes ADD CONSTRAINT votantes_id_lugar_trabajo_fkey\n  FOREIGN KEY (id_lugar_trabajo) REFERENCES lugares_trabajo(id) ON DELETE SET NULL;\nALTER TABLE cuarentena_votantes ADD CONSTRAINT cuarentena_votantes_id_lugar_trabajo_fkey\n  FOREIGN KEY (id_lugar_trabajo) REFERENCES lugares_trabajo(id) ON DELETE SET NULL;\n\n--- 5.12 Referencias a auth.users (se mantienen uuid) ---\nALTER TABLE miembros_plataforma ADD CONSTRAINT miembros_plataforma_id_usuario_fkey\n  FOREIGN KEY (id_usuario) REFERENCES auth.users(id) ON DELETE CASCADE;\nALTER TABLE clientes ADD CONSTRAINT clientes_id_usuario_fkey\n  FOREIGN KEY (id_usuario) REFERENCES auth.users(id) ON DELETE SET NULL;\nALTER TABLE miembros_campana ADD CONSTRAINT miembros_campana_id_usuario_fkey\n  FOREIGN KEY (id_usuario) REFERENCES auth.users(id) ON DELETE CASCADE;\nALTER TABLE miembros_cliente ADD CONSTRAINT miembros_cliente_id_usuario_fkey\n  FOREIGN KEY (id_usuario) REFERENCES auth.users(id) ON DELETE CASCADE;\nALTER TABLE miembros_cliente ADD CONSTRAINT miembros_cliente_id_cliente_id_usuario_key\n  UNIQUE (id_cliente, id_usuario);\nALTER TABLE exportaciones_campana ADD CONSTRAINT exportaciones_campana_exportado_por_fkey\n  FOREIGN KEY (exportado_por) REFERENCES auth.users(id) ON DELETE SET NULL;\nALTER TABLE registro_auditoria ADD CONSTRAINT registro_auditoria_id_actor_fkey\n  FOREIGN KEY (id_actor) REFERENCES auth.users(id) ON DELETE SET NULL;\nALTER TABLE votantes ADD CONSTRAINT votantes_creado_por_fkey\n  FOREIGN KEY (creado_por) REFERENCES auth.users(id) ON DELETE SET NULL;\nALTER TABLE novedades ADD CONSTRAINT novedades_creado_por_fkey\n  FOREIGN KEY (creado_por) REFERENCES auth.users(id) ON DELETE SET NULL;\nALTER TABLE cuarentena_votantes ADD CONSTRAINT cuarentena_votantes_creado_por_fkey\n  FOREIGN KEY (creado_por) REFERENCES auth.users(id) ON DELETE SET NULL;\nALTER TABLE cuarentena_votantes ADD CONSTRAINT cuarentena_votantes_resuelto_por_fkey\n  FOREIGN KEY (resuelto_por) REFERENCES auth.users(id) ON DELETE SET NULL;\nALTER TABLE recolectores_telegram ADD CONSTRAINT recolectores_telegram_id_usuario_fkey\n  FOREIGN KEY (id_usuario) REFERENCES auth.users(id) ON DELETE CASCADE;\nALTER TABLE sesiones_captura_telegram ADD CONSTRAINT sesiones_captura_telegram_id_usuario_fkey\n  FOREIGN KEY (id_usuario) REFERENCES auth.users(id) ON DELETE SET NULL;\nALTER TABLE sesiones_captura_whatsapp ADD CONSTRAINT sesiones_captura_whatsapp_id_usuario_fkey\n  FOREIGN KEY (id_usuario) REFERENCES auth.users(id) ON DELETE SET NULL;\n\n-- ============================================================================\n-- PHASE 6: Recreate functions with bigint signatures\n-- ============================================================================\n\n--- 6.1 ids_campanas_usuario — returns SETOF bigint ---\nCREATE OR REPLACE FUNCTION ids_campanas_usuario()\nRETURNS SETOF bigint\nLANGUAGE sql\nSTABLE\nSECURITY DEFINER\nSET search_path = public\nAS $$\n  SELECT id_campana\n  FROM miembros_campana\n  WHERE id_usuario = auth.uid();\n$$;\n\n--- 6.2 Helper RLS functions with bigint params ---\nCREATE OR REPLACE FUNCTION puede_leer_campana(p_id_campana bigint)\nRETURNS boolean\nLANGUAGE sql\nSTABLE\nSECURITY DEFINER\nSET search_path = public\nAS $$\n  SELECT es_dueno_plataforma()\n    OR p_id_campana IN (SELECT ids_campanas_usuario());\n$$;\n\nCREATE OR REPLACE FUNCTION puede_editar_campana(p_id_campana bigint)\nRETURNS boolean\nLANGUAGE sql\nSTABLE\nSECURITY DEFINER\nSET search_path = public\nAS $$\n  SELECT es_dueno_plataforma()\n    OR EXISTS (\n      SELECT 1\n      FROM miembros_campana\n      WHERE id_campana = p_id_campana\n        AND id_usuario = auth.uid()\n        AND rol IN ('editor', 'administrador_campana')\n    );\n$$;\n\nCREATE OR REPLACE FUNCTION puede_administrar_campana(p_id_campana bigint)\nRETURNS boolean\nLANGUAGE sql\nSTABLE\nSECURITY DEFINER\nSET search_path = public\nAS $$\n  SELECT es_dueno_plataforma()\n    OR EXISTS (\n      SELECT 1\n      FROM miembros_campana\n      WHERE id_campana = p_id_campana\n        AND id_usuario = auth.uid()\n        AND rol = 'administrador_campana'\n    );\n$$;\n\n--- 6.3 subarbol_votantes — bigint param, returns TABLE(id_votante bigint) ---\nCREATE OR REPLACE FUNCTION subarbol_votantes(id_votante_raiz bigint)\nRETURNS TABLE (id_votante bigint, profundidad integer)\nLANGUAGE sql\nSTABLE\nSECURITY DEFINER\nSET search_path = public\nAS $$\n  WITH RECURSIVE arbol AS (\n    SELECT v.id, 0 AS profundidad\n    FROM votantes v\n    WHERE v.id = id_votante_raiz\n    UNION ALL\n    SELECT hijo.id, arbol.profundidad + 1\n    FROM votantes hijo\n    INNER JOIN arbol ON hijo.id_lider_directo = arbol.id\n    WHERE hijo.id_campana = (SELECT id_campana FROM votantes WHERE id = id_votante_raiz)\n  )\n  SELECT arbol.id, arbol.profundidad\n  FROM arbol\n  WHERE arbol.profundidad > 0;\n$$;\n\n--- 6.4 asignar_codigo_serial — updated to use bigint scope ---\nCREATE OR REPLACE FUNCTION asignar_codigo_serial()\nRETURNS TRIGGER\nLANGUAGE plpgsql\nAS $$\nDECLARE\n  scope_col text := TG_ARGV[0];\nBEGIN\n  IF NEW.codigo IS NOT NULL THEN\n    RETURN NEW;\n  END IF;\n\n  IF scope_col IS NULL OR scope_col = '' THEN\n    EXECUTE format(\n      'SELECT COALESCE(MAX(codigo), 0) + 1 FROM %I',\n      TG_TABLE_NAME\n    )\n    INTO NEW.codigo;\n  ELSE\n    EXECUTE format(\n      'SELECT COALESCE(MAX(codigo), 0) + 1 FROM %I WHERE %I = $1',\n      TG_TABLE_NAME,\n      scope_col\n    )\n    INTO NEW.codigo\n    USING (to_jsonb(NEW) ->> scope_col)::bigint;\n  END IF;\n\n  RETURN NEW;\nEND;\n$$;\n\n--- 6.5 validar_lider_misma_campana ---\nCREATE OR REPLACE FUNCTION validar_lider_misma_campana()\nRETURNS trigger\nLANGUAGE plpgsql\nAS $$\nBEGIN\n  IF NEW.id_lider_directo IS NOT NULL THEN\n    IF NOT EXISTS (\n      SELECT 1\n      FROM votantes lider\n      WHERE lider.id = NEW.id_lider_directo\n        AND lider.id_campana = NEW.id_campana\n    ) THEN\n      RAISE EXCEPTION 'id_lider_directo debe pertenecer a la misma campaña';\n    END IF;\n  END IF;\n  RETURN NEW;\nEND;\n$$;\n\n--- 6.6 match_puestos_votacion — returns bigint ---\nCREATE OR REPLACE FUNCTION match_puestos_votacion(\n  query_embedding vector,\n  match_count integer DEFAULT NULL::integer,\n  filter jsonb DEFAULT '{}'::jsonb\n)\nRETURNS TABLE(id bigint, content text, metadata jsonb, similarity double precision)\nLANGUAGE plpgsql\nSTABLE\nAS $$\nBEGIN\n  RETURN QUERY\n  SELECT\n    p.id,\n    p.nombre || ' - ' || COALESCE(p.municipio, '') || ' - ' || COALESCE(p.direccion, '') AS content,\n    jsonb_build_object(\n      'id_campana', p.id_campana,\n      'nombre', p.nombre,\n      'municipio', p.municipio,\n      'direccion', p.direccion,\n      'codigo', p.codigo\n    ) AS metadata,\n    1 - (p.embedding <=> query_embedding) AS similarity\n  FROM puestos_votacion p\n  WHERE p.embedding IS NOT NULL\n    AND (filter = '{}'::jsonb OR p.id_campana = (filter->>'id_campana')::bigint)\n  ORDER BY p.embedding <=> query_embedding\n  LIMIT match_count;\nEND;\n$$;\n\n--- 6.7 match_votantes — returns bigint ---\nCREATE OR REPLACE FUNCTION match_votantes(\n  query_embedding vector,\n  match_count integer DEFAULT NULL::integer,\n  filter jsonb DEFAULT '{}'::jsonb\n)\nRETURNS TABLE(id bigint, content text, metadata jsonb, similarity double precision)\nLANGUAGE plpgsql\nSTABLE\nAS $$\nBEGIN\n  RETURN QUERY\n  SELECT\n    v.id,\n    v.nombres || ' ' || v.apellidos || ' - ' || v.documento AS content,\n    jsonb_build_object(\n      'id_campana', v.id_campana,\n      'nombres', v.nombres,\n      'apellidos', v.apellidos,\n      'documento', v.documento,\n      'id_rol', v.id_rol,\n      'id_puesto_votacion', v.id_puesto_votacion\n    ) AS metadata,\n    1 - (v.embedding <=> query_embedding) AS similarity\n  FROM votantes v\n  WHERE v.embedding IS NOT NULL\n    AND (filter = '{}'::jsonb OR v.id_campana = (filter->>'id_campana')::bigint)\n  ORDER BY v.embedding <=> query_embedding\n  LIMIT match_count;\nEND;\n$$;\n\n-- ============================================================================\n-- PHASE 7: Recreate triggers\n-- ============================================================================\n\n--- 7.1 asignar_codigo_serial triggers ---\nDROP TRIGGER IF EXISTS comunas_asignar_codigo ON comunas;\nCREATE TRIGGER comunas_asignar_codigo\n  BEFORE INSERT ON comunas\n  FOR EACH ROW EXECUTE FUNCTION asignar_codigo_serial('id_campana');\n\nDROP TRIGGER IF EXISTS barrios_asignar_codigo ON barrios;\nCREATE TRIGGER barrios_asignar_codigo\n  BEFORE INSERT ON barrios\n  FOR EACH ROW EXECUTE FUNCTION asignar_codigo_serial('id_comuna');\n\nDROP TRIGGER IF EXISTS puestos_asignar_codigo ON puestos_votacion;\nCREATE TRIGGER puestos_asignar_codigo\n  BEFORE INSERT ON puestos_votacion\n  FOR EACH ROW EXECUTE FUNCTION asignar_codigo_serial('id_campana');\n\nDROP TRIGGER IF EXISTS roles_asignar_codigo ON roles;\nCREATE TRIGGER roles_asignar_codigo\n  BEFORE INSERT ON roles\n  FOR EACH ROW EXECUTE FUNCTION asignar_codigo_serial('id_campana');\n\nDROP TRIGGER IF EXISTS tipos_novedad_asignar_codigo ON tipos_novedad;\nCREATE TRIGGER tipos_novedad_asignar_codigo\n  BEFORE INSERT ON tipos_novedad\n  FOR EACH ROW EXECUTE FUNCTION asignar_codigo_serial('id_campana');\n\nDROP TRIGGER IF EXISTS lugares_trabajo_asignar_codigo ON lugares_trabajo;\nCREATE TRIGGER lugares_trabajo_asignar_codigo\n  BEFORE INSERT ON lugares_trabajo\n  FOR EACH ROW EXECUTE FUNCTION asignar_codigo_serial('id_campana');\n\nDROP TRIGGER IF EXISTS clientes_asignar_codigo ON clientes;\nCREATE TRIGGER clientes_asignar_codigo\n  BEFORE INSERT ON clientes\n  FOR EACH ROW EXECUTE FUNCTION asignar_codigo_serial('');\n\nDROP TRIGGER IF EXISTS procesos_electorales_asignar_codigo ON procesos_electorales;\nCREATE TRIGGER procesos_electorales_asignar_codigo\n  BEFORE INSERT ON procesos_electorales\n  FOR EACH ROW EXECUTE FUNCTION asignar_codigo_serial('');\n\nDROP TRIGGER IF EXISTS campanas_asignar_codigo ON campanas;\nCREATE TRIGGER campanas_asignar_codigo\n  BEFORE INSERT ON campanas\n  FOR EACH ROW EXECUTE FUNCTION asignar_codigo_serial('');\n\n--- 7.2 validar_lider_misma_campana ---\nDROP TRIGGER IF EXISTS votantes_lider_misma_campana ON votantes;\nCREATE TRIGGER votantes_lider_misma_campana\n  BEFORE INSERT OR UPDATE OF id_lider_directo, id_campana ON votantes\n  FOR EACH ROW EXECUTE FUNCTION validar_lider_misma_campana();\n\n-- ============================================================================\n-- PHASE 8: Recreate RLS policies (dropped in Phase 1)\n-- ============================================================================\n\n-- procesos_electorales\nCREATE POLICY procesos_electorales_select ON procesos_electorales\n  FOR SELECT TO authenticated\n  USING (\n    es_dueno_plataforma()\n    OR EXISTS (\n      SELECT 1\n      FROM campanas c\n      JOIN miembros_campana mc ON mc.id_campana = c.id\n      WHERE c.id_proceso_electoral = procesos_electorales.id\n        AND mc.id_usuario = auth.uid()\n    )\n  );\nCREATE POLICY procesos_electorales_write ON procesos_electorales\n  FOR ALL TO authenticated\n  USING (es_dueno_plataforma())\n  WITH CHECK (es_dueno_plataforma());\n\n-- clientes\nCREATE POLICY clientes_plataforma ON clientes\n  FOR ALL TO authenticated\n  USING (es_dueno_plataforma())\n  WITH CHECK (es_dueno_plataforma());\n\n-- campanas\nCREATE POLICY campanas_select ON campanas\n  FOR SELECT TO authenticated\n  USING (\n    es_dueno_plataforma()\n    OR id IN (SELECT ids_campanas_usuario())\n  );\nCREATE POLICY campanas_write ON campanas\n  FOR ALL TO authenticated\n  USING (es_dueno_plataforma())\n  WITH CHECK (es_dueno_plataforma());\n\n-- miembros_plataforma\nCREATE POLICY miembros_plataforma_select ON miembros_plataforma\n  FOR SELECT TO authenticated\n  USING (id_usuario = auth.uid() OR es_dueno_plataforma());\nCREATE POLICY miembros_plataforma_write ON miembros_plataforma\n  FOR ALL TO authenticated\n  USING (es_dueno_plataforma())\n  WITH CHECK (es_dueno_plataforma());\n\n-- miembros_campana\nCREATE POLICY miembros_campana_select ON miembros_campana\n  FOR SELECT TO authenticated\n  USING (\n    es_dueno_plataforma()\n    OR id_campana IN (SELECT ids_campanas_usuario())\n  );\nCREATE POLICY miembros_campana_write ON miembros_campana\n  FOR ALL TO authenticated\n  USING (es_dueno_plataforma())\n  WITH CHECK (es_dueno_plataforma());\n\n-- miembros_cliente\nCREATE POLICY miembros_cliente_plataforma ON miembros_cliente\n  FOR ALL TO authenticated\n  USING (es_dueno_plataforma())\n  WITH CHECK (es_dueno_plataforma());\n\n-- caracteristicas_campana\nCREATE POLICY caracteristicas_campana_select ON caracteristicas_campana\n  FOR SELECT TO authenticated\n  USING (\n    es_dueno_plataforma()\n    OR id_campana IN (SELECT ids_campanas_usuario())\n  );\nCREATE POLICY caracteristicas_campana_write ON caracteristicas_campana\n  FOR ALL TO authenticated\n  USING (es_dueno_plataforma())\n  WITH CHECK (es_dueno_plataforma());\n\n-- integraciones_campana\nCREATE POLICY integraciones_campana_plataforma ON integraciones_campana\n  FOR ALL TO authenticated\n  USING (es_dueno_plataforma())\n  WITH CHECK (es_dueno_plataforma());\n\n-- uso_campana\nCREATE POLICY uso_campana_plataforma ON uso_campana\n  FOR ALL TO authenticated\n  USING (es_dueno_plataforma())\n  WITH CHECK (es_dueno_plataforma());\n\n-- exportaciones_campana\nCREATE POLICY exportaciones_campana_select ON exportaciones_campana\n  FOR SELECT TO authenticated\n  USING (\n    es_dueno_plataforma()\n    OR (\n      id_campana IN (SELECT ids_campanas_usuario())\n      AND EXISTS (\n        SELECT 1 FROM campanas c\n        WHERE c.id = exportaciones_campana.id_campana\n          AND c.estado IN ('finalizada', 'purgada')\n      )\n    )\n  );\nCREATE POLICY exportaciones_campana_write ON exportaciones_campana\n  FOR ALL TO authenticated\n  USING (es_dueno_plataforma())\n  WITH CHECK (es_dueno_plataforma());\n\n-- configuracion_marca_plataforma\nCREATE POLICY marca_plataforma_select ON configuracion_marca_plataforma\n  FOR SELECT TO authenticated\n  USING (true);\nCREATE POLICY marca_plataforma_select_anon ON configuracion_marca_plataforma\n  FOR SELECT TO anon\n  USING (true);\nCREATE POLICY marca_plataforma_write ON configuracion_marca_plataforma\n  FOR ALL TO authenticated\n  USING (es_dueno_plataforma())\n  WITH CHECK (es_dueno_plataforma());\n\n-- configuracion_integracion_plataforma\nCREATE POLICY configuracion_integracion_plataforma_select\n  ON configuracion_integracion_plataforma\n  FOR SELECT TO authenticated\n  USING (es_dueno_plataforma());\nCREATE POLICY configuracion_integracion_plataforma_write\n  ON configuracion_integracion_plataforma\n  FOR ALL TO authenticated\n  USING (es_dueno_plataforma())\n  WITH CHECK (es_dueno_plataforma());\n\n-- registro_auditoria\nCREATE POLICY registro_auditoria_select ON registro_auditoria\n  FOR SELECT TO authenticated\n  USING (\n    es_dueno_plataforma()\n    OR (\n      id_campana IS NOT NULL\n      AND id_campana IN (SELECT ids_campanas_usuario())\n    )\n  );\nCREATE POLICY registro_auditoria_insert ON registro_auditoria\n  FOR INSERT TO authenticated\n  WITH CHECK (\n    es_dueno_plataforma()\n    OR (\n      id_campana IS NOT NULL\n      AND puede_editar_campana(id_campana)\n    )\n  );\n\n-- roles\nCREATE POLICY roles_select ON roles\n  FOR SELECT TO authenticated\n  USING (puede_leer_campana(id_campana));\nCREATE POLICY roles_insert ON roles\n  FOR INSERT TO authenticated\n  WITH CHECK (puede_editar_campana(id_campana));\nCREATE POLICY roles_update ON roles\n  FOR UPDATE TO authenticated\n  USING (puede_editar_campana(id_campana))\n  WITH CHECK (puede_editar_campana(id_campana));\nCREATE POLICY roles_delete ON roles\n  FOR DELETE TO authenticated\n  USING (puede_administrar_campana(id_campana));\n\n-- comunas\nCREATE POLICY comunas_select ON comunas\n  FOR SELECT TO authenticated\n  USING (puede_leer_campana(id_campana));\nCREATE POLICY comunas_insert ON comunas\n  FOR INSERT TO authenticated\n  WITH CHECK (puede_editar_campana(id_campana));\nCREATE POLICY comunas_update ON comunas\n  FOR UPDATE TO authenticated\n  USING (puede_editar_campana(id_campana))\n  WITH CHECK (puede_editar_campana(id_campana));\nCREATE POLICY comunas_delete ON comunas\n  FOR DELETE TO authenticated\n  USING (puede_administrar_campana(id_campana));\n\n-- barrios\nCREATE POLICY barrios_select ON barrios\n  FOR SELECT TO authenticated\n  USING (\n    EXISTS (\n      SELECT 1 FROM comunas c\n      WHERE c.id = barrios.id_comuna\n        AND puede_leer_campana(c.id_campana)\n    )\n  );\nCREATE POLICY barrios_insert ON barrios\n  FOR INSERT TO authenticated\n  WITH CHECK (\n    EXISTS (\n      SELECT 1 FROM comunas c\n      WHERE c.id = barrios.id_comuna\n        AND puede_editar_campana(c.id_campana)\n    )\n  );\nCREATE POLICY barrios_update ON barrios\n  FOR UPDATE TO authenticated\n  USING (\n    EXISTS (\n      SELECT 1 FROM comunas c\n      WHERE c.id = barrios.id_comuna\n        AND puede_editar_campana(c.id_campana)\n    )\n  )\n  WITH CHECK (\n    EXISTS (\n      SELECT 1 FROM comunas c\n      WHERE c.id = barrios.id_comuna\n        AND puede_editar_campana(c.id_campana)\n    )\n  );\nCREATE POLICY barrios_delete ON barrios\n  FOR DELETE TO authenticated\n  USING (\n    EXISTS (\n      SELECT 1 FROM comunas c\n      WHERE c.id = barrios.id_comuna\n        AND puede_administrar_campana(c.id_campana)\n    )\n  );\n\n-- puestos_votacion\nCREATE POLICY puestos_select ON puestos_votacion\n  FOR SELECT TO authenticated\n  USING (puede_leer_campana(id_campana));\nCREATE POLICY puestos_insert ON puestos_votacion\n  FOR INSERT TO authenticated\n  WITH CHECK (puede_editar_campana(id_campana));\nCREATE POLICY puestos_update ON puestos_votacion\n  FOR UPDATE TO authenticated\n  USING (puede_editar_campana(id_campana))\n  WITH CHECK (puede_editar_campana(id_campana));\nCREATE POLICY puestos_delete ON puestos_votacion\n  FOR DELETE TO authenticated\n  USING (puede_administrar_campana(id_campana));\n\n-- tipos_novedad\nCREATE POLICY tipos_novedad_select ON tipos_novedad\n  FOR SELECT TO authenticated\n  USING (puede_leer_campana(id_campana));\nCREATE POLICY tipos_novedad_insert ON tipos_novedad\n  FOR INSERT TO authenticated\n  WITH CHECK (puede_editar_campana(id_campana));\nCREATE POLICY tipos_novedad_update ON tipos_novedad\n  FOR UPDATE TO authenticated\n  USING (puede_editar_campana(id_campana))\n  WITH CHECK (puede_editar_campana(id_campana));\nCREATE POLICY tipos_novedad_delete ON tipos_novedad\n  FOR DELETE TO authenticated\n  USING (puede_administrar_campana(id_campana));\n\n-- votantes\nCREATE POLICY votantes_select ON votantes\n  FOR SELECT TO authenticated\n  USING (puede_leer_campana(id_campana));\nCREATE POLICY votantes_insert ON votantes\n  FOR INSERT TO authenticated\n  WITH CHECK (puede_editar_campana(id_campana));\nCREATE POLICY votantes_update ON votantes\n  FOR UPDATE TO authenticated\n  USING (puede_editar_campana(id_campana))\n  WITH CHECK (puede_editar_campana(id_campana));\nCREATE POLICY votantes_delete ON votantes\n  FOR DELETE TO authenticated\n  USING (puede_administrar_campana(id_campana));\n\n-- datos_trabajador_votante\nCREATE POLICY datos_trabajador_select ON datos_trabajador_votante\n  FOR SELECT TO authenticated\n  USING (\n    EXISTS (\n      SELECT 1 FROM votantes v\n      WHERE v.id = datos_trabajador_votante.id_votante\n        AND puede_leer_campana(v.id_campana)\n    )\n  );\nCREATE POLICY datos_trabajador_insert ON datos_trabajador_votante\n  FOR INSERT TO authenticated\n  WITH CHECK (\n    EXISTS (\n      SELECT 1 FROM votantes v\n      WHERE v.id = datos_trabajador_votante.id_votante\n        AND puede_editar_campana(v.id_campana)\n    )\n  );\nCREATE POLICY datos_trabajador_update ON datos_trabajador_votante\n  FOR UPDATE TO authenticated\n  USING (\n    EXISTS (\n      SELECT 1 FROM votantes v\n      WHERE v.id = datos_trabajador_votante.id_votante\n        AND puede_editar_campana(v.id_campana)\n    )\n  )\n  WITH CHECK (\n    EXISTS (\n      SELECT 1 FROM votantes v\n      WHERE v.id = datos_trabajador_votante.id_votante\n        AND puede_editar_campana(v.id_campana)\n    )\n  );\nCREATE POLICY datos_trabajador_delete ON datos_trabajador_votante\n  FOR DELETE TO authenticated\n  USING (\n    EXISTS (\n      SELECT 1 FROM votantes v\n      WHERE v.id = datos_trabajador_votante.id_votante\n        AND puede_administrar_campana(v.id_campana)\n    )\n  );\n\n-- novedades\nCREATE POLICY novedades_select ON novedades\n  FOR SELECT TO authenticated\n  USING (\n    EXISTS (\n      SELECT 1 FROM votantes v\n      WHERE v.id = novedades.id_votante\n        AND puede_leer_campana(v.id_campana)\n    )\n  );\nCREATE POLICY novedades_insert ON novedades\n  FOR INSERT TO authenticated\n  WITH CHECK (\n    EXISTS (\n      SELECT 1 FROM votantes v\n      WHERE v.id = novedades.id_votante\n        AND puede_editar_campana(v.id_campana)\n    )\n  );\nCREATE POLICY novedades_update ON novedades\n  FOR UPDATE TO authenticated\n  USING (\n    EXISTS (\n      SELECT 1 FROM votantes v\n      WHERE v.id = novedades.id_votante\n        AND puede_editar_campana(v.id_campana)\n    )\n  )\n  WITH CHECK (\n    EXISTS (\n      SELECT 1 FROM votantes v\n      WHERE v.id = novedades.id_votante\n        AND puede_editar_campana(v.id_campana)\n    )\n  );\nCREATE POLICY novedades_delete ON novedades\n  FOR DELETE TO authenticated\n  USING (\n    EXISTS (\n      SELECT 1 FROM votantes v\n      WHERE v.id = novedades.id_votante\n        AND puede_administrar_campana(v.id_campana)\n    )\n  );\n\n-- cuarentena_votantes\nCREATE POLICY cuarentena_select ON cuarentena_votantes\n  FOR SELECT TO authenticated\n  USING (puede_leer_campana(id_campana));\nCREATE POLICY cuarentena_insert ON cuarentena_votantes\n  FOR INSERT TO authenticated\n  WITH CHECK (puede_editar_campana(id_campana));\nCREATE POLICY cuarentena_update ON cuarentena_votantes\n  FOR UPDATE TO authenticated\n  USING (puede_editar_campana(id_campana))\n  WITH CHECK (puede_editar_campana(id_campana));\nCREATE POLICY cuarentena_delete ON cuarentena_votantes\n  FOR DELETE TO authenticated\n  USING (puede_administrar_campana(id_campana));\n\n-- lugares_trabajo\nCREATE POLICY lugares_trabajo_select ON lugares_trabajo\n  FOR SELECT TO authenticated\n  USING (puede_leer_campana(id_campana));\nCREATE POLICY lugares_trabajo_insert ON lugares_trabajo\n  FOR INSERT TO authenticated\n  WITH CHECK (puede_editar_campana(id_campana));\nCREATE POLICY lugares_trabajo_update ON lugares_trabajo\n  FOR UPDATE TO authenticated\n  USING (puede_editar_campana(id_campana))\n  WITH CHECK (puede_editar_campana(id_campana));\nCREATE POLICY lugares_trabajo_delete ON lugares_trabajo\n  FOR DELETE TO authenticated\n  USING (puede_administrar_campana(id_campana));\n\n-- recolectores_telegram\nCREATE POLICY recolectores_telegram_select ON recolectores_telegram\n  FOR SELECT TO authenticated\n  USING (puede_leer_campana(id_campana));\nCREATE POLICY recolectores_telegram_plataforma_write ON recolectores_telegram\n  FOR ALL TO authenticated\n  USING (es_dueno_plataforma())\n  WITH CHECK (es_dueno_plataforma());\n\n-- sesiones_captura_telegram\nCREATE POLICY sesiones_captura_telegram_select ON sesiones_captura_telegram\n  FOR SELECT TO authenticated\n  USING (puede_leer_campana(id_campana));\nCREATE POLICY sesiones_captura_telegram_plataforma_write ON sesiones_captura_telegram\n  FOR ALL TO authenticated\n  USING (es_dueno_plataforma())\n  WITH CHECK (es_dueno_plataforma());\n\n-- verificaciones_registraduria\nCREATE POLICY verificaciones_registraduria_select ON verificaciones_registraduria\n  FOR SELECT TO authenticated\n  USING (puede_leer_campana(id_campana));\nCREATE POLICY verificaciones_registraduria_write ON verificaciones_registraduria\n  FOR ALL TO authenticated\n  USING (puede_administrar_campana(id_campana))\n  WITH CHECK (puede_administrar_campana(id_campana));\n\n-- sesiones_captura_whatsapp\nCREATE POLICY sesiones_captura_whatsapp_select ON sesiones_captura_whatsapp\n  FOR SELECT TO authenticated\n  USING (puede_leer_campana(id_campana));\n\nCOMMIT;"}	029_uuid_to_int8	anamariagarcia093@gmail.com	\N	\N
20260712200259	{"-- 030_drop_codigo.sql\n-- Elimina la columna codigo, sus triggers, indices y la funcion asignar_codigo_serial.\n-- El campo id (bigint secuencial) reemplaza a codigo como identificador visible.\n\nBEGIN;\n\n-- ============================================================================\n-- PHASE 1: Drop triggers que usan asignar_codigo_serial\n-- ============================================================================\n\nDROP TRIGGER IF EXISTS comunas_asignar_codigo ON comunas;\nDROP TRIGGER IF EXISTS barrios_asignar_codigo ON barrios;\nDROP TRIGGER IF EXISTS puestos_asignar_codigo ON puestos_votacion;\nDROP TRIGGER IF EXISTS roles_asignar_codigo ON roles;\nDROP TRIGGER IF EXISTS tipos_novedad_asignar_codigo ON tipos_novedad;\nDROP TRIGGER IF EXISTS lugares_trabajo_asignar_codigo ON lugares_trabajo;\nDROP TRIGGER IF EXISTS clientes_asignar_codigo ON clientes;\nDROP TRIGGER IF EXISTS procesos_electorales_asignar_codigo ON procesos_electorales;\nDROP TRIGGER IF EXISTS campanas_asignar_codigo ON campanas;\n\n-- ============================================================================\n-- PHASE 2: Drop the function\n-- ============================================================================\n\nDROP FUNCTION IF EXISTS asignar_codigo_serial();\n\n-- ============================================================================\n-- PHASE 3: Drop unique indexes on codigo\n-- ============================================================================\n\nDROP INDEX IF EXISTS comunas_campana_codigo_unique;\nDROP INDEX IF EXISTS barrios_comuna_codigo_unique;\nDROP INDEX IF EXISTS puestos_campana_codigo_unique;\nDROP INDEX IF EXISTS roles_campana_codigo_unique;\nDROP INDEX IF EXISTS tipos_novedad_campana_codigo_unique;\nDROP INDEX IF EXISTS lugares_trabajo_campana_codigo_unique;\nDROP INDEX IF EXISTS clientes_codigo_unique;\nDROP INDEX IF EXISTS procesos_electorales_codigo_unique;\nDROP INDEX IF EXISTS campanas_codigo_unique;\n\n-- ============================================================================\n-- PHASE 4: Drop codigo columns\n-- ============================================================================\n\nALTER TABLE comunas DROP COLUMN IF EXISTS codigo;\nALTER TABLE barrios DROP COLUMN IF EXISTS codigo;\nALTER TABLE puestos_votacion DROP COLUMN IF EXISTS codigo;\nALTER TABLE roles DROP COLUMN IF EXISTS codigo;\nALTER TABLE tipos_novedad DROP COLUMN IF EXISTS codigo;\nALTER TABLE lugares_trabajo DROP COLUMN IF EXISTS codigo;\nALTER TABLE clientes DROP COLUMN IF EXISTS codigo;\nALTER TABLE procesos_electorales DROP COLUMN IF EXISTS codigo;\nALTER TABLE campanas DROP COLUMN IF EXISTS codigo;\n\nCOMMIT;"}	030_drop_codigo	anamariagarcia093@gmail.com	\N	\N
\.


--
-- Data for Name: secrets; Type: TABLE DATA; Schema: vault; Owner: supabase_admin
--

COPY vault.secrets (id, name, description, secret, key_id, nonce, created_at, updated_at) FROM stdin;
\.


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('auth.refresh_tokens_id_seq', 39, true);


--
-- Name: barrios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.barrios_id_seq', 97, true);


--
-- Name: campanas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.campanas_id_seq', 1, true);


--
-- Name: clientes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.clientes_id_seq', 2, false);


--
-- Name: comunas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.comunas_id_seq', 11, true);


--
-- Name: cuarentena_votantes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cuarentena_votantes_id_seq', 1, false);


--
-- Name: datos_trabajador_votante_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.datos_trabajador_votante_id_seq', 1, false);


--
-- Name: exportaciones_campana_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.exportaciones_campana_id_seq', 1, false);


--
-- Name: integraciones_campana_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.integraciones_campana_id_seq', 1, false);


--
-- Name: lugares_trabajo_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.lugares_trabajo_id_seq', 1, false);


--
-- Name: miembros_campana_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.miembros_campana_id_seq', 1, true);


--
-- Name: miembros_cliente_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.miembros_cliente_id_seq', 2, false);


--
-- Name: novedades_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.novedades_id_seq', 1, false);


--
-- Name: procesos_electorales_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.procesos_electorales_id_seq', 3, false);


--
-- Name: puestos_votacion_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.puestos_votacion_id_seq', 488, true);


--
-- Name: recolectores_telegram_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.recolectores_telegram_id_seq', 1, false);


--
-- Name: registro_auditoria_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.registro_auditoria_id_seq', 1, false);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_id_seq', 2, true);


--
-- Name: sesiones_captura_telegram_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sesiones_captura_telegram_id_seq', 1, false);


--
-- Name: sesiones_captura_whatsapp_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sesiones_captura_whatsapp_id_seq', 1, false);


--
-- Name: tipos_novedad_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tipos_novedad_id_seq', 1, false);


--
-- Name: uso_campana_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.uso_campana_id_seq', 1, false);


--
-- Name: verificaciones_registraduria_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.verificaciones_registraduria_id_seq', 1, false);


--
-- Name: votantes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.votantes_id_seq', 1, false);


--
-- Name: subscription_id_seq; Type: SEQUENCE SET; Schema: realtime; Owner: supabase_admin
--

SELECT pg_catalog.setval('realtime.subscription_id_seq', 1, false);


--
-- Name: mfa_amr_claims amr_id_pk; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT amr_id_pk PRIMARY KEY (id);


--
-- Name: audit_log_entries audit_log_entries_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.audit_log_entries
    ADD CONSTRAINT audit_log_entries_pkey PRIMARY KEY (id);


--
-- Name: custom_oauth_providers custom_oauth_providers_identifier_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.custom_oauth_providers
    ADD CONSTRAINT custom_oauth_providers_identifier_key UNIQUE (identifier);


--
-- Name: custom_oauth_providers custom_oauth_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.custom_oauth_providers
    ADD CONSTRAINT custom_oauth_providers_pkey PRIMARY KEY (id);


--
-- Name: flow_state flow_state_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.flow_state
    ADD CONSTRAINT flow_state_pkey PRIMARY KEY (id);


--
-- Name: identities identities_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_pkey PRIMARY KEY (id);


--
-- Name: identities identities_provider_id_provider_unique; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_provider_id_provider_unique UNIQUE (provider_id, provider);


--
-- Name: instances instances_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.instances
    ADD CONSTRAINT instances_pkey PRIMARY KEY (id);


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_authentication_method_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_authentication_method_pkey UNIQUE (session_id, authentication_method);


--
-- Name: mfa_challenges mfa_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_pkey PRIMARY KEY (id);


--
-- Name: mfa_factors mfa_factors_last_challenged_at_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_last_challenged_at_key UNIQUE (last_challenged_at);


--
-- Name: mfa_factors mfa_factors_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_pkey PRIMARY KEY (id);


--
-- Name: oauth_authorizations oauth_authorizations_authorization_code_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_authorization_code_key UNIQUE (authorization_code);


--
-- Name: oauth_authorizations oauth_authorizations_authorization_id_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_authorization_id_key UNIQUE (authorization_id);


--
-- Name: oauth_authorizations oauth_authorizations_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_pkey PRIMARY KEY (id);


--
-- Name: oauth_client_states oauth_client_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_client_states
    ADD CONSTRAINT oauth_client_states_pkey PRIMARY KEY (id);


--
-- Name: oauth_clients oauth_clients_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_clients
    ADD CONSTRAINT oauth_clients_pkey PRIMARY KEY (id);


--
-- Name: oauth_consents oauth_consents_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_pkey PRIMARY KEY (id);


--
-- Name: oauth_consents oauth_consents_user_client_unique; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_user_client_unique UNIQUE (user_id, client_id);


--
-- Name: one_time_tokens one_time_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_token_unique; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_unique UNIQUE (token);


--
-- Name: saml_providers saml_providers_entity_id_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_entity_id_key UNIQUE (entity_id);


--
-- Name: saml_providers saml_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_pkey PRIMARY KEY (id);


--
-- Name: saml_relay_states saml_relay_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: sso_domains sso_domains_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_pkey PRIMARY KEY (id);


--
-- Name: sso_providers sso_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_providers
    ADD CONSTRAINT sso_providers_pkey PRIMARY KEY (id);


--
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: webauthn_challenges webauthn_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.webauthn_challenges
    ADD CONSTRAINT webauthn_challenges_pkey PRIMARY KEY (id);


--
-- Name: webauthn_credentials webauthn_credentials_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.webauthn_credentials
    ADD CONSTRAINT webauthn_credentials_pkey PRIMARY KEY (id);


--
-- Name: barrios barrios_id_comuna_nombre_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.barrios
    ADD CONSTRAINT barrios_id_comuna_nombre_key UNIQUE (id_comuna, nombre);


--
-- Name: barrios barrios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.barrios
    ADD CONSTRAINT barrios_pkey PRIMARY KEY (id);


--
-- Name: campanas campanas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.campanas
    ADD CONSTRAINT campanas_pkey PRIMARY KEY (id);


--
-- Name: caracteristicas_campana caracteristicas_campana_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.caracteristicas_campana
    ADD CONSTRAINT caracteristicas_campana_pkey PRIMARY KEY (id_campana);


--
-- Name: clientes clientes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clientes
    ADD CONSTRAINT clientes_pkey PRIMARY KEY (id);


--
-- Name: comunas comunas_id_campana_nombre_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comunas
    ADD CONSTRAINT comunas_id_campana_nombre_key UNIQUE (id_campana, nombre);


--
-- Name: comunas comunas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comunas
    ADD CONSTRAINT comunas_pkey PRIMARY KEY (id);


--
-- Name: configuracion_integracion_plataforma configuracion_integracion_plataforma_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.configuracion_integracion_plataforma
    ADD CONSTRAINT configuracion_integracion_plataforma_pkey PRIMARY KEY (proveedor);


--
-- Name: configuracion_marca_plataforma configuracion_marca_plataforma_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.configuracion_marca_plataforma
    ADD CONSTRAINT configuracion_marca_plataforma_pkey PRIMARY KEY (id);


--
-- Name: cuarentena_votantes cuarentena_votantes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cuarentena_votantes
    ADD CONSTRAINT cuarentena_votantes_pkey PRIMARY KEY (id);


--
-- Name: datos_trabajador_votante datos_trabajador_votante_id_votante_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.datos_trabajador_votante
    ADD CONSTRAINT datos_trabajador_votante_id_votante_key UNIQUE (id_votante);


--
-- Name: datos_trabajador_votante datos_trabajador_votante_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.datos_trabajador_votante
    ADD CONSTRAINT datos_trabajador_votante_pkey PRIMARY KEY (id);


--
-- Name: exportaciones_campana exportaciones_campana_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exportaciones_campana
    ADD CONSTRAINT exportaciones_campana_pkey PRIMARY KEY (id);


--
-- Name: integraciones_campana integraciones_campana_id_campana_proveedor_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.integraciones_campana
    ADD CONSTRAINT integraciones_campana_id_campana_proveedor_key UNIQUE (id_campana, proveedor);


--
-- Name: integraciones_campana integraciones_campana_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.integraciones_campana
    ADD CONSTRAINT integraciones_campana_pkey PRIMARY KEY (id);


--
-- Name: lugares_trabajo lugares_trabajo_id_campana_nombre_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lugares_trabajo
    ADD CONSTRAINT lugares_trabajo_id_campana_nombre_key UNIQUE (id_campana, nombre);


--
-- Name: lugares_trabajo lugares_trabajo_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lugares_trabajo
    ADD CONSTRAINT lugares_trabajo_pkey PRIMARY KEY (id);


--
-- Name: miembros_campana miembros_campana_id_campana_id_usuario_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.miembros_campana
    ADD CONSTRAINT miembros_campana_id_campana_id_usuario_key UNIQUE (id_campana, id_usuario);


--
-- Name: miembros_campana miembros_campana_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.miembros_campana
    ADD CONSTRAINT miembros_campana_pkey PRIMARY KEY (id);


--
-- Name: miembros_cliente miembros_cliente_id_cliente_id_usuario_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.miembros_cliente
    ADD CONSTRAINT miembros_cliente_id_cliente_id_usuario_key UNIQUE (id_cliente, id_usuario);


--
-- Name: miembros_cliente miembros_cliente_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.miembros_cliente
    ADD CONSTRAINT miembros_cliente_pkey PRIMARY KEY (id);


--
-- Name: miembros_plataforma miembros_plataforma_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.miembros_plataforma
    ADD CONSTRAINT miembros_plataforma_pkey PRIMARY KEY (id_usuario);


--
-- Name: novedades novedades_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.novedades
    ADD CONSTRAINT novedades_pkey PRIMARY KEY (id);


--
-- Name: procesos_electorales procesos_electorales_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.procesos_electorales
    ADD CONSTRAINT procesos_electorales_pkey PRIMARY KEY (id);


--
-- Name: puestos_votacion puestos_votacion_campana_nombre_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.puestos_votacion
    ADD CONSTRAINT puestos_votacion_campana_nombre_unique UNIQUE (id_campana, nombre);


--
-- Name: puestos_votacion puestos_votacion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.puestos_votacion
    ADD CONSTRAINT puestos_votacion_pkey PRIMARY KEY (id);


--
-- Name: recolectores_telegram recolectores_telegram_id_campana_telegram_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recolectores_telegram
    ADD CONSTRAINT recolectores_telegram_id_campana_telegram_user_id_key UNIQUE (id_campana, telegram_user_id);


--
-- Name: recolectores_telegram recolectores_telegram_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recolectores_telegram
    ADD CONSTRAINT recolectores_telegram_pkey PRIMARY KEY (id);


--
-- Name: registro_auditoria registro_auditoria_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registro_auditoria
    ADD CONSTRAINT registro_auditoria_pkey PRIMARY KEY (id);


--
-- Name: roles roles_id_campana_nombre_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_id_campana_nombre_key UNIQUE (id_campana, nombre);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: sesiones_captura_telegram sesiones_captura_telegram_id_campana_chat_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sesiones_captura_telegram
    ADD CONSTRAINT sesiones_captura_telegram_id_campana_chat_id_key UNIQUE (id_campana, chat_id);


--
-- Name: sesiones_captura_telegram sesiones_captura_telegram_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sesiones_captura_telegram
    ADD CONSTRAINT sesiones_captura_telegram_pkey PRIMARY KEY (id);


--
-- Name: sesiones_captura_whatsapp sesiones_captura_whatsapp_id_campana_telefono_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sesiones_captura_whatsapp
    ADD CONSTRAINT sesiones_captura_whatsapp_id_campana_telefono_key UNIQUE (id_campana, telefono);


--
-- Name: sesiones_captura_whatsapp sesiones_captura_whatsapp_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sesiones_captura_whatsapp
    ADD CONSTRAINT sesiones_captura_whatsapp_pkey PRIMARY KEY (id);


--
-- Name: tipos_novedad tipos_novedad_id_campana_novedad_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipos_novedad
    ADD CONSTRAINT tipos_novedad_id_campana_novedad_key UNIQUE (id_campana, novedad);


--
-- Name: tipos_novedad tipos_novedad_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipos_novedad
    ADD CONSTRAINT tipos_novedad_pkey PRIMARY KEY (id);


--
-- Name: uso_campana uso_campana_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.uso_campana
    ADD CONSTRAINT uso_campana_pkey PRIMARY KEY (id);


--
-- Name: verificaciones_registraduria verificaciones_registraduria_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.verificaciones_registraduria
    ADD CONSTRAINT verificaciones_registraduria_pkey PRIMARY KEY (id);


--
-- Name: votantes votantes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.votantes
    ADD CONSTRAINT votantes_pkey PRIMARY KEY (id);


--
-- Name: messages messages_payload_exclusive; Type: CHECK CONSTRAINT; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE realtime.messages
    ADD CONSTRAINT messages_payload_exclusive CHECK (((payload IS NULL) OR (binary_payload IS NULL))) NOT VALID;


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE ONLY realtime.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: subscription pk_subscription; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.subscription
    ADD CONSTRAINT pk_subscription PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: buckets_analytics buckets_analytics_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.buckets_analytics
    ADD CONSTRAINT buckets_analytics_pkey PRIMARY KEY (id);


--
-- Name: buckets buckets_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.buckets
    ADD CONSTRAINT buckets_pkey PRIMARY KEY (id);


--
-- Name: buckets_vectors buckets_vectors_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.buckets_vectors
    ADD CONSTRAINT buckets_vectors_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_name_key; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_name_key UNIQUE (name);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: objects objects_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT objects_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_pkey PRIMARY KEY (id);


--
-- Name: vector_indexes vector_indexes_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.vector_indexes
    ADD CONSTRAINT vector_indexes_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_idempotency_key_key; Type: CONSTRAINT; Schema: supabase_migrations; Owner: postgres
--

ALTER TABLE ONLY supabase_migrations.schema_migrations
    ADD CONSTRAINT schema_migrations_idempotency_key_key UNIQUE (idempotency_key);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: supabase_migrations; Owner: postgres
--

ALTER TABLE ONLY supabase_migrations.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: audit_logs_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX audit_logs_instance_id_idx ON auth.audit_log_entries USING btree (instance_id);


--
-- Name: confirmation_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX confirmation_token_idx ON auth.users USING btree (confirmation_token) WHERE ((confirmation_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: custom_oauth_providers_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX custom_oauth_providers_created_at_idx ON auth.custom_oauth_providers USING btree (created_at);


--
-- Name: custom_oauth_providers_enabled_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX custom_oauth_providers_enabled_idx ON auth.custom_oauth_providers USING btree (enabled);


--
-- Name: custom_oauth_providers_identifier_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX custom_oauth_providers_identifier_idx ON auth.custom_oauth_providers USING btree (identifier);


--
-- Name: custom_oauth_providers_provider_type_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX custom_oauth_providers_provider_type_idx ON auth.custom_oauth_providers USING btree (provider_type);


--
-- Name: email_change_token_current_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX email_change_token_current_idx ON auth.users USING btree (email_change_token_current) WHERE ((email_change_token_current)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_new_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX email_change_token_new_idx ON auth.users USING btree (email_change_token_new) WHERE ((email_change_token_new)::text !~ '^[0-9 ]*$'::text);


--
-- Name: factor_id_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX factor_id_created_at_idx ON auth.mfa_factors USING btree (user_id, created_at);


--
-- Name: flow_state_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX flow_state_created_at_idx ON auth.flow_state USING btree (created_at DESC);


--
-- Name: identities_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX identities_email_idx ON auth.identities USING btree (email text_pattern_ops);


--
-- Name: INDEX identities_email_idx; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON INDEX auth.identities_email_idx IS 'Auth: Ensures indexed queries on the email column';


--
-- Name: identities_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX identities_user_id_idx ON auth.identities USING btree (user_id);


--
-- Name: idx_auth_code; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_auth_code ON auth.flow_state USING btree (auth_code);


--
-- Name: idx_oauth_client_states_created_at; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_oauth_client_states_created_at ON auth.oauth_client_states USING btree (created_at);


--
-- Name: idx_user_id_auth_method; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_user_id_auth_method ON auth.flow_state USING btree (user_id, authentication_method);


--
-- Name: idx_users_created_at_desc; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_users_created_at_desc ON auth.users USING btree (created_at DESC);


--
-- Name: idx_users_email; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_users_email ON auth.users USING btree (email);


--
-- Name: idx_users_last_sign_in_at_desc; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_users_last_sign_in_at_desc ON auth.users USING btree (last_sign_in_at DESC);


--
-- Name: idx_users_name; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_users_name ON auth.users USING btree (((raw_user_meta_data ->> 'name'::text))) WHERE ((raw_user_meta_data ->> 'name'::text) IS NOT NULL);


--
-- Name: mfa_challenge_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX mfa_challenge_created_at_idx ON auth.mfa_challenges USING btree (created_at DESC);


--
-- Name: mfa_factors_user_friendly_name_unique; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX mfa_factors_user_friendly_name_unique ON auth.mfa_factors USING btree (friendly_name, user_id) WHERE (TRIM(BOTH FROM friendly_name) <> ''::text);


--
-- Name: mfa_factors_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX mfa_factors_user_id_idx ON auth.mfa_factors USING btree (user_id);


--
-- Name: oauth_auth_pending_exp_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_auth_pending_exp_idx ON auth.oauth_authorizations USING btree (expires_at) WHERE (status = 'pending'::auth.oauth_authorization_status);


--
-- Name: oauth_clients_deleted_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_clients_deleted_at_idx ON auth.oauth_clients USING btree (deleted_at);


--
-- Name: oauth_consents_active_client_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_consents_active_client_idx ON auth.oauth_consents USING btree (client_id) WHERE (revoked_at IS NULL);


--
-- Name: oauth_consents_active_user_client_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_consents_active_user_client_idx ON auth.oauth_consents USING btree (user_id, client_id) WHERE (revoked_at IS NULL);


--
-- Name: oauth_consents_user_order_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_consents_user_order_idx ON auth.oauth_consents USING btree (user_id, granted_at DESC);


--
-- Name: one_time_tokens_relates_to_hash_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX one_time_tokens_relates_to_hash_idx ON auth.one_time_tokens USING hash (relates_to);


--
-- Name: one_time_tokens_token_hash_hash_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX one_time_tokens_token_hash_hash_idx ON auth.one_time_tokens USING hash (token_hash);


--
-- Name: one_time_tokens_user_id_token_type_key; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX one_time_tokens_user_id_token_type_key ON auth.one_time_tokens USING btree (user_id, token_type);


--
-- Name: reauthentication_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX reauthentication_token_idx ON auth.users USING btree (reauthentication_token) WHERE ((reauthentication_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: recovery_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX recovery_token_idx ON auth.users USING btree (recovery_token) WHERE ((recovery_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: refresh_tokens_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_instance_id_idx ON auth.refresh_tokens USING btree (instance_id);


--
-- Name: refresh_tokens_instance_id_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_instance_id_user_id_idx ON auth.refresh_tokens USING btree (instance_id, user_id);


--
-- Name: refresh_tokens_parent_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_parent_idx ON auth.refresh_tokens USING btree (parent);


--
-- Name: refresh_tokens_session_id_revoked_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_session_id_revoked_idx ON auth.refresh_tokens USING btree (session_id, revoked);


--
-- Name: refresh_tokens_updated_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_updated_at_idx ON auth.refresh_tokens USING btree (updated_at DESC);


--
-- Name: saml_providers_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_providers_sso_provider_id_idx ON auth.saml_providers USING btree (sso_provider_id);


--
-- Name: saml_relay_states_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_created_at_idx ON auth.saml_relay_states USING btree (created_at DESC);


--
-- Name: saml_relay_states_for_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_for_email_idx ON auth.saml_relay_states USING btree (for_email);


--
-- Name: saml_relay_states_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_sso_provider_id_idx ON auth.saml_relay_states USING btree (sso_provider_id);


--
-- Name: sessions_not_after_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sessions_not_after_idx ON auth.sessions USING btree (not_after DESC);


--
-- Name: sessions_oauth_client_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sessions_oauth_client_id_idx ON auth.sessions USING btree (oauth_client_id);


--
-- Name: sessions_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sessions_user_id_idx ON auth.sessions USING btree (user_id);


--
-- Name: sso_domains_domain_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX sso_domains_domain_idx ON auth.sso_domains USING btree (lower(domain));


--
-- Name: sso_domains_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sso_domains_sso_provider_id_idx ON auth.sso_domains USING btree (sso_provider_id);


--
-- Name: sso_providers_resource_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX sso_providers_resource_id_idx ON auth.sso_providers USING btree (lower(resource_id));


--
-- Name: sso_providers_resource_id_pattern_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sso_providers_resource_id_pattern_idx ON auth.sso_providers USING btree (resource_id text_pattern_ops);


--
-- Name: unique_phone_factor_per_user; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX unique_phone_factor_per_user ON auth.mfa_factors USING btree (user_id, phone);


--
-- Name: user_id_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX user_id_created_at_idx ON auth.sessions USING btree (user_id, created_at);


--
-- Name: users_email_partial_key; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX users_email_partial_key ON auth.users USING btree (email) WHERE (is_sso_user = false);


--
-- Name: INDEX users_email_partial_key; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON INDEX auth.users_email_partial_key IS 'Auth: A partial unique index that applies only when is_sso_user is false';


--
-- Name: users_instance_id_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_instance_id_email_idx ON auth.users USING btree (instance_id, lower((email)::text));


--
-- Name: users_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_instance_id_idx ON auth.users USING btree (instance_id);


--
-- Name: users_is_anonymous_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_is_anonymous_idx ON auth.users USING btree (is_anonymous);


--
-- Name: webauthn_challenges_expires_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX webauthn_challenges_expires_at_idx ON auth.webauthn_challenges USING btree (expires_at);


--
-- Name: webauthn_challenges_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX webauthn_challenges_user_id_idx ON auth.webauthn_challenges USING btree (user_id);


--
-- Name: webauthn_credentials_credential_id_key; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX webauthn_credentials_credential_id_key ON auth.webauthn_credentials USING btree (credential_id);


--
-- Name: webauthn_credentials_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX webauthn_credentials_user_id_idx ON auth.webauthn_credentials USING btree (user_id);


--
-- Name: barrios_id_comuna_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX barrios_id_comuna_idx ON public.barrios USING btree (id_comuna);


--
-- Name: campanas_cliente_proceso_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX campanas_cliente_proceso_unique ON public.campanas USING btree (id_cliente, id_proceso_electoral);


--
-- Name: campanas_estado_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX campanas_estado_idx ON public.campanas USING btree (estado);


--
-- Name: campanas_id_cliente_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX campanas_id_cliente_idx ON public.campanas USING btree (id_cliente);


--
-- Name: clientes_id_usuario_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX clientes_id_usuario_unique ON public.clientes USING btree (id_usuario) WHERE (id_usuario IS NOT NULL);


--
-- Name: cuarentena_votantes_documento_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX cuarentena_votantes_documento_idx ON public.cuarentena_votantes USING btree (id_campana, documento);


--
-- Name: cuarentena_votantes_estado_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX cuarentena_votantes_estado_idx ON public.cuarentena_votantes USING btree (id_campana, estado);


--
-- Name: cuarentena_votantes_id_campana_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX cuarentena_votantes_id_campana_idx ON public.cuarentena_votantes USING btree (id_campana);


--
-- Name: lugares_trabajo_id_campana_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX lugares_trabajo_id_campana_idx ON public.lugares_trabajo USING btree (id_campana);


--
-- Name: miembros_campana_id_usuario_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX miembros_campana_id_usuario_idx ON public.miembros_campana USING btree (id_usuario);


--
-- Name: novedades_id_votante_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX novedades_id_votante_idx ON public.novedades USING btree (id_votante);


--
-- Name: puestos_votacion_id_campana_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX puestos_votacion_id_campana_idx ON public.puestos_votacion USING btree (id_campana);


--
-- Name: recolectores_telegram_campana_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX recolectores_telegram_campana_idx ON public.recolectores_telegram USING btree (id_campana);


--
-- Name: recolectores_telegram_id_rol_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX recolectores_telegram_id_rol_idx ON public.recolectores_telegram USING btree (id_rol);


--
-- Name: recolectores_telegram_usuario_unico; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX recolectores_telegram_usuario_unico ON public.recolectores_telegram USING btree (id_campana, id_usuario) WHERE (id_usuario IS NOT NULL);


--
-- Name: registro_auditoria_creado_en_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX registro_auditoria_creado_en_idx ON public.registro_auditoria USING btree (creado_en DESC);


--
-- Name: registro_auditoria_id_campana_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX registro_auditoria_id_campana_idx ON public.registro_auditoria USING btree (id_campana);


--
-- Name: roles_campana_jerarquia_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX roles_campana_jerarquia_idx ON public.roles USING btree (id_campana, nivel_jerarquia);


--
-- Name: sesiones_captura_telegram_campana_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX sesiones_captura_telegram_campana_idx ON public.sesiones_captura_telegram USING btree (id_campana);


--
-- Name: sesiones_captura_whatsapp_campana_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX sesiones_captura_whatsapp_campana_idx ON public.sesiones_captura_whatsapp USING btree (id_campana);


--
-- Name: uso_campana_id_campana_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX uso_campana_id_campana_idx ON public.uso_campana USING btree (id_campana);


--
-- Name: verificaciones_registraduria_campana_corrida_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX verificaciones_registraduria_campana_corrida_idx ON public.verificaciones_registraduria USING btree (id_campana, id_corrida) WHERE (id_corrida IS NOT NULL);


--
-- Name: verificaciones_registraduria_campana_estado_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX verificaciones_registraduria_campana_estado_idx ON public.verificaciones_registraduria USING btree (id_campana, estado);


--
-- Name: verificaciones_registraduria_unico_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX verificaciones_registraduria_unico_idx ON public.verificaciones_registraduria USING btree (id_campana, documento, tipo_documento);


--
-- Name: votantes_documento_activo_unico; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX votantes_documento_activo_unico ON public.votantes USING btree (id_campana, documento, tipo_documento) WHERE (estado = ANY (ARRAY['activo'::public.estado_votante, 'pendiente_verificacion'::public.estado_votante]));


--
-- Name: votantes_documento_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX votantes_documento_idx ON public.votantes USING btree (id_campana, documento);


--
-- Name: votantes_id_campana_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX votantes_id_campana_idx ON public.votantes USING btree (id_campana);


--
-- Name: votantes_id_lider_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX votantes_id_lider_idx ON public.votantes USING btree (id_lider_directo);


--
-- Name: votantes_id_lugar_trabajo_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX votantes_id_lugar_trabajo_idx ON public.votantes USING btree (id_lugar_trabajo);


--
-- Name: votantes_id_puesto_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX votantes_id_puesto_idx ON public.votantes USING btree (id_puesto_votacion);


--
-- Name: votantes_id_tipo_novedad_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX votantes_id_tipo_novedad_idx ON public.votantes USING btree (id_tipo_novedad);


--
-- Name: ix_realtime_subscription_entity; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE INDEX ix_realtime_subscription_entity ON realtime.subscription USING btree (entity);


--
-- Name: messages_inserted_at_topic_index; Type: INDEX; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE INDEX messages_inserted_at_topic_index ON ONLY realtime.messages USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: subscription_subscription_id_entity_filters_action_filter_selec; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE UNIQUE INDEX subscription_subscription_id_entity_filters_action_filter_selec ON realtime.subscription USING btree (subscription_id, entity, filters, action_filter, COALESCE(selected_columns, '{}'::text[]));


--
-- Name: bname; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX bname ON storage.buckets USING btree (name);


--
-- Name: bucketid_objname; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX bucketid_objname ON storage.objects USING btree (bucket_id, name);


--
-- Name: buckets_analytics_unique_name_idx; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX buckets_analytics_unique_name_idx ON storage.buckets_analytics USING btree (name) WHERE (deleted_at IS NULL);


--
-- Name: idx_multipart_uploads_list; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_multipart_uploads_list ON storage.s3_multipart_uploads USING btree (bucket_id, key, created_at);


--
-- Name: idx_objects_bucket_id_name; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_objects_bucket_id_name ON storage.objects USING btree (bucket_id, name COLLATE "C");


--
-- Name: idx_objects_bucket_id_name_lower; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_objects_bucket_id_name_lower ON storage.objects USING btree (bucket_id, lower(name) COLLATE "C");


--
-- Name: name_prefix_search; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX name_prefix_search ON storage.objects USING btree (name text_pattern_ops);


--
-- Name: vector_indexes_name_bucket_id_idx; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX vector_indexes_name_bucket_id_idx ON storage.vector_indexes USING btree (name, bucket_id);


--
-- Name: campanas campanas_actualizado_en; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER campanas_actualizado_en BEFORE UPDATE ON public.campanas FOR EACH ROW EXECUTE FUNCTION public.establecer_actualizado_en();


--
-- Name: campanas campanas_crear_caracteristicas; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER campanas_crear_caracteristicas AFTER INSERT ON public.campanas FOR EACH ROW EXECUTE FUNCTION public.crear_caracteristicas_campana();


--
-- Name: caracteristicas_campana caracteristicas_campana_actualizado_en; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER caracteristicas_campana_actualizado_en BEFORE UPDATE ON public.caracteristicas_campana FOR EACH ROW EXECUTE FUNCTION public.establecer_actualizado_en();


--
-- Name: clientes clientes_actualizado_en; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER clientes_actualizado_en BEFORE UPDATE ON public.clientes FOR EACH ROW EXECUTE FUNCTION public.establecer_actualizado_en();


--
-- Name: configuracion_integracion_plataforma configuracion_integracion_plataforma_actualizado_en; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER configuracion_integracion_plataforma_actualizado_en BEFORE UPDATE ON public.configuracion_integracion_plataforma FOR EACH ROW EXECUTE FUNCTION public.establecer_actualizado_en();


--
-- Name: configuracion_marca_plataforma configuracion_marca_actualizado_en; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER configuracion_marca_actualizado_en BEFORE UPDATE ON public.configuracion_marca_plataforma FOR EACH ROW EXECUTE FUNCTION public.establecer_actualizado_en();


--
-- Name: cuarentena_votantes cuarentena_votantes_actualizado_en; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER cuarentena_votantes_actualizado_en BEFORE UPDATE ON public.cuarentena_votantes FOR EACH ROW EXECUTE FUNCTION public.establecer_actualizado_en();


--
-- Name: datos_trabajador_votante datos_trabajador_actualizado_en; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER datos_trabajador_actualizado_en BEFORE UPDATE ON public.datos_trabajador_votante FOR EACH ROW EXECUTE FUNCTION public.establecer_actualizado_en();


--
-- Name: integraciones_campana integraciones_campana_actualizado_en; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER integraciones_campana_actualizado_en BEFORE UPDATE ON public.integraciones_campana FOR EACH ROW EXECUTE FUNCTION public.establecer_actualizado_en();


--
-- Name: lugares_trabajo lugares_trabajo_actualizado_en; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER lugares_trabajo_actualizado_en BEFORE UPDATE ON public.lugares_trabajo FOR EACH ROW EXECUTE FUNCTION public.establecer_actualizado_en();


--
-- Name: puestos_votacion puestos_votacion_actualizado_en; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER puestos_votacion_actualizado_en BEFORE UPDATE ON public.puestos_votacion FOR EACH ROW EXECUTE FUNCTION public.establecer_actualizado_en();


--
-- Name: sesiones_captura_telegram sesiones_captura_telegram_actualizado_en; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER sesiones_captura_telegram_actualizado_en BEFORE UPDATE ON public.sesiones_captura_telegram FOR EACH ROW EXECUTE FUNCTION public.establecer_actualizado_en();


--
-- Name: sesiones_captura_whatsapp sesiones_captura_whatsapp_actualizado_en; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER sesiones_captura_whatsapp_actualizado_en BEFORE UPDATE ON public.sesiones_captura_whatsapp FOR EACH ROW EXECUTE FUNCTION public.establecer_actualizado_en();


--
-- Name: verificaciones_registraduria verificaciones_registraduria_actualizado; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER verificaciones_registraduria_actualizado BEFORE UPDATE ON public.verificaciones_registraduria FOR EACH ROW EXECUTE FUNCTION public.actualizar_verificacion_registraduria_ts();


--
-- Name: votantes votantes_actualizado_en; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER votantes_actualizado_en BEFORE UPDATE ON public.votantes FOR EACH ROW EXECUTE FUNCTION public.establecer_actualizado_en();


--
-- Name: votantes votantes_lider_misma_campana; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER votantes_lider_misma_campana BEFORE INSERT OR UPDATE OF id_lider_directo, id_campana ON public.votantes FOR EACH ROW EXECUTE FUNCTION public.validar_lider_misma_campana();


--
-- Name: subscription tr_check_filters; Type: TRIGGER; Schema: realtime; Owner: supabase_admin
--

CREATE TRIGGER tr_check_filters BEFORE INSERT OR UPDATE ON realtime.subscription FOR EACH ROW EXECUTE FUNCTION realtime.subscription_check_filters();


--
-- Name: buckets enforce_bucket_name_length_trigger; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER enforce_bucket_name_length_trigger BEFORE INSERT OR UPDATE OF name ON storage.buckets FOR EACH ROW EXECUTE FUNCTION storage.enforce_bucket_name_length();


--
-- Name: buckets protect_buckets_delete; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER protect_buckets_delete BEFORE DELETE ON storage.buckets FOR EACH STATEMENT EXECUTE FUNCTION storage.protect_delete();


--
-- Name: objects protect_objects_delete; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER protect_objects_delete BEFORE DELETE ON storage.objects FOR EACH STATEMENT EXECUTE FUNCTION storage.protect_delete();


--
-- Name: objects update_objects_updated_at; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER update_objects_updated_at BEFORE UPDATE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.update_updated_at_column();


--
-- Name: identities identities_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: mfa_challenges mfa_challenges_auth_factor_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_auth_factor_id_fkey FOREIGN KEY (factor_id) REFERENCES auth.mfa_factors(id) ON DELETE CASCADE;


--
-- Name: mfa_factors mfa_factors_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: oauth_authorizations oauth_authorizations_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: oauth_authorizations oauth_authorizations_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: oauth_consents oauth_consents_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: oauth_consents oauth_consents_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: one_time_tokens one_time_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: refresh_tokens refresh_tokens_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: saml_providers saml_providers_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_flow_state_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_flow_state_id_fkey FOREIGN KEY (flow_state_id) REFERENCES auth.flow_state(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_oauth_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_oauth_client_id_fkey FOREIGN KEY (oauth_client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: sso_domains sso_domains_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: webauthn_challenges webauthn_challenges_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.webauthn_challenges
    ADD CONSTRAINT webauthn_challenges_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: webauthn_credentials webauthn_credentials_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.webauthn_credentials
    ADD CONSTRAINT webauthn_credentials_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: barrios barrios_id_comuna_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.barrios
    ADD CONSTRAINT barrios_id_comuna_fkey FOREIGN KEY (id_comuna) REFERENCES public.comunas(id) ON DELETE CASCADE;


--
-- Name: campanas campanas_id_cliente_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.campanas
    ADD CONSTRAINT campanas_id_cliente_fkey FOREIGN KEY (id_cliente) REFERENCES public.clientes(id) ON DELETE RESTRICT;


--
-- Name: campanas campanas_id_proceso_electoral_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.campanas
    ADD CONSTRAINT campanas_id_proceso_electoral_fkey FOREIGN KEY (id_proceso_electoral) REFERENCES public.procesos_electorales(id) ON DELETE RESTRICT;


--
-- Name: caracteristicas_campana caracteristicas_campana_id_campana_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.caracteristicas_campana
    ADD CONSTRAINT caracteristicas_campana_id_campana_fkey FOREIGN KEY (id_campana) REFERENCES public.campanas(id) ON DELETE CASCADE;


--
-- Name: clientes clientes_id_usuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clientes
    ADD CONSTRAINT clientes_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: comunas comunas_id_campana_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comunas
    ADD CONSTRAINT comunas_id_campana_fkey FOREIGN KEY (id_campana) REFERENCES public.campanas(id) ON DELETE CASCADE;


--
-- Name: cuarentena_votantes cuarentena_votantes_creado_por_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cuarentena_votantes
    ADD CONSTRAINT cuarentena_votantes_creado_por_fkey FOREIGN KEY (creado_por) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: cuarentena_votantes cuarentena_votantes_id_campana_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cuarentena_votantes
    ADD CONSTRAINT cuarentena_votantes_id_campana_fkey FOREIGN KEY (id_campana) REFERENCES public.campanas(id) ON DELETE CASCADE;


--
-- Name: cuarentena_votantes cuarentena_votantes_id_cuarentena_conflicto_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cuarentena_votantes
    ADD CONSTRAINT cuarentena_votantes_id_cuarentena_conflicto_fkey FOREIGN KEY (id_cuarentena_conflicto) REFERENCES public.cuarentena_votantes(id) ON DELETE SET NULL;


--
-- Name: cuarentena_votantes cuarentena_votantes_id_lider_directo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cuarentena_votantes
    ADD CONSTRAINT cuarentena_votantes_id_lider_directo_fkey FOREIGN KEY (id_lider_directo) REFERENCES public.votantes(id) ON DELETE SET NULL;


--
-- Name: cuarentena_votantes cuarentena_votantes_id_lugar_trabajo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cuarentena_votantes
    ADD CONSTRAINT cuarentena_votantes_id_lugar_trabajo_fkey FOREIGN KEY (id_lugar_trabajo) REFERENCES public.lugares_trabajo(id) ON DELETE SET NULL;


--
-- Name: cuarentena_votantes cuarentena_votantes_id_puesto_votacion_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cuarentena_votantes
    ADD CONSTRAINT cuarentena_votantes_id_puesto_votacion_fkey FOREIGN KEY (id_puesto_votacion) REFERENCES public.puestos_votacion(id) ON DELETE SET NULL;


--
-- Name: cuarentena_votantes cuarentena_votantes_id_rol_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cuarentena_votantes
    ADD CONSTRAINT cuarentena_votantes_id_rol_fkey FOREIGN KEY (id_rol) REFERENCES public.roles(id) ON DELETE SET NULL;


--
-- Name: cuarentena_votantes cuarentena_votantes_id_votante_conflicto_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cuarentena_votantes
    ADD CONSTRAINT cuarentena_votantes_id_votante_conflicto_fkey FOREIGN KEY (id_votante_conflicto) REFERENCES public.votantes(id) ON DELETE SET NULL;


--
-- Name: cuarentena_votantes cuarentena_votantes_resuelto_por_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cuarentena_votantes
    ADD CONSTRAINT cuarentena_votantes_resuelto_por_fkey FOREIGN KEY (resuelto_por) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: datos_trabajador_votante datos_trabajador_votante_id_barrio_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.datos_trabajador_votante
    ADD CONSTRAINT datos_trabajador_votante_id_barrio_fkey FOREIGN KEY (id_barrio) REFERENCES public.barrios(id) ON DELETE SET NULL;


--
-- Name: datos_trabajador_votante datos_trabajador_votante_id_comuna_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.datos_trabajador_votante
    ADD CONSTRAINT datos_trabajador_votante_id_comuna_fkey FOREIGN KEY (id_comuna) REFERENCES public.comunas(id) ON DELETE SET NULL;


--
-- Name: datos_trabajador_votante datos_trabajador_votante_id_votante_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.datos_trabajador_votante
    ADD CONSTRAINT datos_trabajador_votante_id_votante_fkey FOREIGN KEY (id_votante) REFERENCES public.votantes(id) ON DELETE CASCADE;


--
-- Name: exportaciones_campana exportaciones_campana_exportado_por_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exportaciones_campana
    ADD CONSTRAINT exportaciones_campana_exportado_por_fkey FOREIGN KEY (exportado_por) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: exportaciones_campana exportaciones_campana_id_campana_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exportaciones_campana
    ADD CONSTRAINT exportaciones_campana_id_campana_fkey FOREIGN KEY (id_campana) REFERENCES public.campanas(id) ON DELETE CASCADE;


--
-- Name: integraciones_campana integraciones_campana_id_campana_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.integraciones_campana
    ADD CONSTRAINT integraciones_campana_id_campana_fkey FOREIGN KEY (id_campana) REFERENCES public.campanas(id) ON DELETE CASCADE;


--
-- Name: lugares_trabajo lugares_trabajo_id_barrio_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lugares_trabajo
    ADD CONSTRAINT lugares_trabajo_id_barrio_fkey FOREIGN KEY (id_barrio) REFERENCES public.barrios(id) ON DELETE SET NULL;


--
-- Name: lugares_trabajo lugares_trabajo_id_campana_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lugares_trabajo
    ADD CONSTRAINT lugares_trabajo_id_campana_fkey FOREIGN KEY (id_campana) REFERENCES public.campanas(id) ON DELETE CASCADE;


--
-- Name: lugares_trabajo lugares_trabajo_id_comuna_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lugares_trabajo
    ADD CONSTRAINT lugares_trabajo_id_comuna_fkey FOREIGN KEY (id_comuna) REFERENCES public.comunas(id) ON DELETE SET NULL;


--
-- Name: miembros_campana miembros_campana_id_campana_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.miembros_campana
    ADD CONSTRAINT miembros_campana_id_campana_fkey FOREIGN KEY (id_campana) REFERENCES public.campanas(id) ON DELETE CASCADE;


--
-- Name: miembros_campana miembros_campana_id_usuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.miembros_campana
    ADD CONSTRAINT miembros_campana_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: miembros_cliente miembros_cliente_id_cliente_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.miembros_cliente
    ADD CONSTRAINT miembros_cliente_id_cliente_fkey FOREIGN KEY (id_cliente) REFERENCES public.clientes(id) ON DELETE CASCADE;


--
-- Name: miembros_cliente miembros_cliente_id_usuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.miembros_cliente
    ADD CONSTRAINT miembros_cliente_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: miembros_plataforma miembros_plataforma_id_usuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.miembros_plataforma
    ADD CONSTRAINT miembros_plataforma_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: novedades novedades_creado_por_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.novedades
    ADD CONSTRAINT novedades_creado_por_fkey FOREIGN KEY (creado_por) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: novedades novedades_id_tipo_novedad_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.novedades
    ADD CONSTRAINT novedades_id_tipo_novedad_fkey FOREIGN KEY (id_tipo_novedad) REFERENCES public.tipos_novedad(id) ON DELETE RESTRICT;


--
-- Name: novedades novedades_id_votante_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.novedades
    ADD CONSTRAINT novedades_id_votante_fkey FOREIGN KEY (id_votante) REFERENCES public.votantes(id) ON DELETE CASCADE;


--
-- Name: puestos_votacion puestos_votacion_id_barrio_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.puestos_votacion
    ADD CONSTRAINT puestos_votacion_id_barrio_fkey FOREIGN KEY (id_barrio) REFERENCES public.barrios(id) ON DELETE SET NULL;


--
-- Name: puestos_votacion puestos_votacion_id_campana_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.puestos_votacion
    ADD CONSTRAINT puestos_votacion_id_campana_fkey FOREIGN KEY (id_campana) REFERENCES public.campanas(id) ON DELETE CASCADE;


--
-- Name: puestos_votacion puestos_votacion_id_comuna_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.puestos_votacion
    ADD CONSTRAINT puestos_votacion_id_comuna_fkey FOREIGN KEY (id_comuna) REFERENCES public.comunas(id) ON DELETE SET NULL;


--
-- Name: recolectores_telegram recolectores_telegram_id_campana_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recolectores_telegram
    ADD CONSTRAINT recolectores_telegram_id_campana_fkey FOREIGN KEY (id_campana) REFERENCES public.campanas(id) ON DELETE CASCADE;


--
-- Name: recolectores_telegram recolectores_telegram_id_rol_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recolectores_telegram
    ADD CONSTRAINT recolectores_telegram_id_rol_fkey FOREIGN KEY (id_rol) REFERENCES public.roles(id) ON DELETE SET NULL;


--
-- Name: recolectores_telegram recolectores_telegram_id_usuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recolectores_telegram
    ADD CONSTRAINT recolectores_telegram_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: registro_auditoria registro_auditoria_id_actor_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registro_auditoria
    ADD CONSTRAINT registro_auditoria_id_actor_fkey FOREIGN KEY (id_actor) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: registro_auditoria registro_auditoria_id_campana_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registro_auditoria
    ADD CONSTRAINT registro_auditoria_id_campana_fkey FOREIGN KEY (id_campana) REFERENCES public.campanas(id) ON DELETE SET NULL;


--
-- Name: roles roles_id_campana_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_id_campana_fkey FOREIGN KEY (id_campana) REFERENCES public.campanas(id) ON DELETE CASCADE;


--
-- Name: sesiones_captura_telegram sesiones_captura_telegram_id_campana_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sesiones_captura_telegram
    ADD CONSTRAINT sesiones_captura_telegram_id_campana_fkey FOREIGN KEY (id_campana) REFERENCES public.campanas(id) ON DELETE CASCADE;


--
-- Name: sesiones_captura_telegram sesiones_captura_telegram_id_usuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sesiones_captura_telegram
    ADD CONSTRAINT sesiones_captura_telegram_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: sesiones_captura_whatsapp sesiones_captura_whatsapp_id_campana_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sesiones_captura_whatsapp
    ADD CONSTRAINT sesiones_captura_whatsapp_id_campana_fkey FOREIGN KEY (id_campana) REFERENCES public.campanas(id) ON DELETE CASCADE;


--
-- Name: sesiones_captura_whatsapp sesiones_captura_whatsapp_id_usuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sesiones_captura_whatsapp
    ADD CONSTRAINT sesiones_captura_whatsapp_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: tipos_novedad tipos_novedad_id_campana_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipos_novedad
    ADD CONSTRAINT tipos_novedad_id_campana_fkey FOREIGN KEY (id_campana) REFERENCES public.campanas(id) ON DELETE CASCADE;


--
-- Name: uso_campana uso_campana_id_campana_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.uso_campana
    ADD CONSTRAINT uso_campana_id_campana_fkey FOREIGN KEY (id_campana) REFERENCES public.campanas(id) ON DELETE CASCADE;


--
-- Name: verificaciones_registraduria verificaciones_registraduria_id_campana_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.verificaciones_registraduria
    ADD CONSTRAINT verificaciones_registraduria_id_campana_fkey FOREIGN KEY (id_campana) REFERENCES public.campanas(id) ON DELETE CASCADE;


--
-- Name: votantes votantes_creado_por_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.votantes
    ADD CONSTRAINT votantes_creado_por_fkey FOREIGN KEY (creado_por) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: votantes votantes_id_campana_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.votantes
    ADD CONSTRAINT votantes_id_campana_fkey FOREIGN KEY (id_campana) REFERENCES public.campanas(id) ON DELETE CASCADE;


--
-- Name: votantes votantes_id_lider_directo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.votantes
    ADD CONSTRAINT votantes_id_lider_directo_fkey FOREIGN KEY (id_lider_directo) REFERENCES public.votantes(id) ON DELETE SET NULL;


--
-- Name: votantes votantes_id_lugar_trabajo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.votantes
    ADD CONSTRAINT votantes_id_lugar_trabajo_fkey FOREIGN KEY (id_lugar_trabajo) REFERENCES public.lugares_trabajo(id) ON DELETE SET NULL;


--
-- Name: votantes votantes_id_puesto_votacion_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.votantes
    ADD CONSTRAINT votantes_id_puesto_votacion_fkey FOREIGN KEY (id_puesto_votacion) REFERENCES public.puestos_votacion(id) ON DELETE SET NULL;


--
-- Name: votantes votantes_id_rol_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.votantes
    ADD CONSTRAINT votantes_id_rol_fkey FOREIGN KEY (id_rol) REFERENCES public.roles(id) ON DELETE SET NULL;


--
-- Name: votantes votantes_id_tipo_novedad_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.votantes
    ADD CONSTRAINT votantes_id_tipo_novedad_fkey FOREIGN KEY (id_tipo_novedad) REFERENCES public.tipos_novedad(id) ON DELETE SET NULL;


--
-- Name: objects objects_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT "objects_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_upload_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_upload_id_fkey FOREIGN KEY (upload_id) REFERENCES storage.s3_multipart_uploads(id) ON DELETE CASCADE;


--
-- Name: vector_indexes vector_indexes_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.vector_indexes
    ADD CONSTRAINT vector_indexes_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets_vectors(id);


--
-- Name: audit_log_entries; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.audit_log_entries ENABLE ROW LEVEL SECURITY;

--
-- Name: flow_state; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.flow_state ENABLE ROW LEVEL SECURITY;

--
-- Name: identities; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.identities ENABLE ROW LEVEL SECURITY;

--
-- Name: instances; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.instances ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_amr_claims; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_amr_claims ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_challenges; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_challenges ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_factors; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_factors ENABLE ROW LEVEL SECURITY;

--
-- Name: one_time_tokens; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.one_time_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: refresh_tokens; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.refresh_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_providers; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.saml_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_relay_states; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.saml_relay_states ENABLE ROW LEVEL SECURITY;

--
-- Name: schema_migrations; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.schema_migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: sessions; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_domains; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sso_domains ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_providers; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sso_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: users; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

--
-- Name: barrios; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.barrios ENABLE ROW LEVEL SECURITY;

--
-- Name: barrios barrios_delete; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY barrios_delete ON public.barrios FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.comunas c
  WHERE ((c.id = barrios.id_comuna) AND public.puede_administrar_campana(c.id_campana)))));


--
-- Name: barrios barrios_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY barrios_insert ON public.barrios FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM public.comunas c
  WHERE ((c.id = barrios.id_comuna) AND public.puede_editar_campana(c.id_campana)))));


--
-- Name: barrios barrios_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY barrios_select ON public.barrios FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.comunas c
  WHERE ((c.id = barrios.id_comuna) AND public.puede_leer_campana(c.id_campana)))));


--
-- Name: barrios barrios_update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY barrios_update ON public.barrios FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.comunas c
  WHERE ((c.id = barrios.id_comuna) AND public.puede_editar_campana(c.id_campana))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.comunas c
  WHERE ((c.id = barrios.id_comuna) AND public.puede_editar_campana(c.id_campana)))));


--
-- Name: campanas; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.campanas ENABLE ROW LEVEL SECURITY;

--
-- Name: campanas campanas_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY campanas_select ON public.campanas FOR SELECT TO authenticated USING ((public.es_dueno_plataforma() OR (id IN ( SELECT public.ids_campanas_usuario() AS ids_campanas_usuario))));


--
-- Name: campanas campanas_write; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY campanas_write ON public.campanas TO authenticated USING (public.es_dueno_plataforma()) WITH CHECK (public.es_dueno_plataforma());


--
-- Name: caracteristicas_campana; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.caracteristicas_campana ENABLE ROW LEVEL SECURITY;

--
-- Name: caracteristicas_campana caracteristicas_campana_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY caracteristicas_campana_select ON public.caracteristicas_campana FOR SELECT TO authenticated USING ((public.es_dueno_plataforma() OR (id_campana IN ( SELECT public.ids_campanas_usuario() AS ids_campanas_usuario))));


--
-- Name: caracteristicas_campana caracteristicas_campana_write; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY caracteristicas_campana_write ON public.caracteristicas_campana TO authenticated USING (public.es_dueno_plataforma()) WITH CHECK (public.es_dueno_plataforma());


--
-- Name: clientes; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;

--
-- Name: clientes clientes_plataforma; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY clientes_plataforma ON public.clientes TO authenticated USING (public.es_dueno_plataforma()) WITH CHECK (public.es_dueno_plataforma());


--
-- Name: comunas; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.comunas ENABLE ROW LEVEL SECURITY;

--
-- Name: comunas comunas_delete; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY comunas_delete ON public.comunas FOR DELETE TO authenticated USING (public.puede_administrar_campana(id_campana));


--
-- Name: comunas comunas_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY comunas_insert ON public.comunas FOR INSERT TO authenticated WITH CHECK (public.puede_editar_campana(id_campana));


--
-- Name: comunas comunas_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY comunas_select ON public.comunas FOR SELECT TO authenticated USING (public.puede_leer_campana(id_campana));


--
-- Name: comunas comunas_update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY comunas_update ON public.comunas FOR UPDATE TO authenticated USING (public.puede_editar_campana(id_campana)) WITH CHECK (public.puede_editar_campana(id_campana));


--
-- Name: configuracion_integracion_plataforma; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.configuracion_integracion_plataforma ENABLE ROW LEVEL SECURITY;

--
-- Name: configuracion_integracion_plataforma configuracion_integracion_plataforma_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY configuracion_integracion_plataforma_select ON public.configuracion_integracion_plataforma FOR SELECT TO authenticated USING (public.es_dueno_plataforma());


--
-- Name: configuracion_integracion_plataforma configuracion_integracion_plataforma_write; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY configuracion_integracion_plataforma_write ON public.configuracion_integracion_plataforma TO authenticated USING (public.es_dueno_plataforma()) WITH CHECK (public.es_dueno_plataforma());


--
-- Name: configuracion_marca_plataforma; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.configuracion_marca_plataforma ENABLE ROW LEVEL SECURITY;

--
-- Name: cuarentena_votantes cuarentena_delete; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY cuarentena_delete ON public.cuarentena_votantes FOR DELETE TO authenticated USING (public.puede_administrar_campana(id_campana));


--
-- Name: cuarentena_votantes cuarentena_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY cuarentena_insert ON public.cuarentena_votantes FOR INSERT TO authenticated WITH CHECK (public.puede_editar_campana(id_campana));


--
-- Name: cuarentena_votantes cuarentena_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY cuarentena_select ON public.cuarentena_votantes FOR SELECT TO authenticated USING (public.puede_leer_campana(id_campana));


--
-- Name: cuarentena_votantes cuarentena_update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY cuarentena_update ON public.cuarentena_votantes FOR UPDATE TO authenticated USING (public.puede_editar_campana(id_campana)) WITH CHECK (public.puede_editar_campana(id_campana));


--
-- Name: cuarentena_votantes; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.cuarentena_votantes ENABLE ROW LEVEL SECURITY;

--
-- Name: datos_trabajador_votante datos_trabajador_delete; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY datos_trabajador_delete ON public.datos_trabajador_votante FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.votantes v
  WHERE ((v.id = datos_trabajador_votante.id_votante) AND public.puede_administrar_campana(v.id_campana)))));


--
-- Name: datos_trabajador_votante datos_trabajador_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY datos_trabajador_insert ON public.datos_trabajador_votante FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM public.votantes v
  WHERE ((v.id = datos_trabajador_votante.id_votante) AND public.puede_editar_campana(v.id_campana)))));


--
-- Name: datos_trabajador_votante datos_trabajador_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY datos_trabajador_select ON public.datos_trabajador_votante FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.votantes v
  WHERE ((v.id = datos_trabajador_votante.id_votante) AND public.puede_leer_campana(v.id_campana)))));


--
-- Name: datos_trabajador_votante datos_trabajador_update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY datos_trabajador_update ON public.datos_trabajador_votante FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.votantes v
  WHERE ((v.id = datos_trabajador_votante.id_votante) AND public.puede_editar_campana(v.id_campana))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.votantes v
  WHERE ((v.id = datos_trabajador_votante.id_votante) AND public.puede_editar_campana(v.id_campana)))));


--
-- Name: datos_trabajador_votante; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.datos_trabajador_votante ENABLE ROW LEVEL SECURITY;

--
-- Name: exportaciones_campana; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.exportaciones_campana ENABLE ROW LEVEL SECURITY;

--
-- Name: exportaciones_campana exportaciones_campana_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY exportaciones_campana_select ON public.exportaciones_campana FOR SELECT TO authenticated USING ((public.es_dueno_plataforma() OR ((id_campana IN ( SELECT public.ids_campanas_usuario() AS ids_campanas_usuario)) AND (EXISTS ( SELECT 1
   FROM public.campanas c
  WHERE ((c.id = exportaciones_campana.id_campana) AND (c.estado = ANY (ARRAY['finalizada'::public.estado_campana, 'purgada'::public.estado_campana]))))))));


--
-- Name: exportaciones_campana exportaciones_campana_write; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY exportaciones_campana_write ON public.exportaciones_campana TO authenticated USING (public.es_dueno_plataforma()) WITH CHECK (public.es_dueno_plataforma());


--
-- Name: integraciones_campana; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.integraciones_campana ENABLE ROW LEVEL SECURITY;

--
-- Name: integraciones_campana integraciones_campana_plataforma; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY integraciones_campana_plataforma ON public.integraciones_campana TO authenticated USING (public.es_dueno_plataforma()) WITH CHECK (public.es_dueno_plataforma());


--
-- Name: lugares_trabajo; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.lugares_trabajo ENABLE ROW LEVEL SECURITY;

--
-- Name: lugares_trabajo lugares_trabajo_delete; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY lugares_trabajo_delete ON public.lugares_trabajo FOR DELETE TO authenticated USING (public.puede_administrar_campana(id_campana));


--
-- Name: lugares_trabajo lugares_trabajo_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY lugares_trabajo_insert ON public.lugares_trabajo FOR INSERT TO authenticated WITH CHECK (public.puede_editar_campana(id_campana));


--
-- Name: lugares_trabajo lugares_trabajo_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY lugares_trabajo_select ON public.lugares_trabajo FOR SELECT TO authenticated USING (public.puede_leer_campana(id_campana));


--
-- Name: lugares_trabajo lugares_trabajo_update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY lugares_trabajo_update ON public.lugares_trabajo FOR UPDATE TO authenticated USING (public.puede_editar_campana(id_campana)) WITH CHECK (public.puede_editar_campana(id_campana));


--
-- Name: configuracion_marca_plataforma marca_plataforma_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY marca_plataforma_select ON public.configuracion_marca_plataforma FOR SELECT TO authenticated USING (true);


--
-- Name: configuracion_marca_plataforma marca_plataforma_select_anon; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY marca_plataforma_select_anon ON public.configuracion_marca_plataforma FOR SELECT TO anon USING (true);


--
-- Name: configuracion_marca_plataforma marca_plataforma_write; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY marca_plataforma_write ON public.configuracion_marca_plataforma TO authenticated USING (public.es_dueno_plataforma()) WITH CHECK (public.es_dueno_plataforma());


--
-- Name: miembros_campana; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.miembros_campana ENABLE ROW LEVEL SECURITY;

--
-- Name: miembros_campana miembros_campana_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY miembros_campana_select ON public.miembros_campana FOR SELECT TO authenticated USING ((public.es_dueno_plataforma() OR (id_campana IN ( SELECT public.ids_campanas_usuario() AS ids_campanas_usuario))));


--
-- Name: miembros_campana miembros_campana_write; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY miembros_campana_write ON public.miembros_campana TO authenticated USING (public.es_dueno_plataforma()) WITH CHECK (public.es_dueno_plataforma());


--
-- Name: miembros_cliente; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.miembros_cliente ENABLE ROW LEVEL SECURITY;

--
-- Name: miembros_cliente miembros_cliente_plataforma; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY miembros_cliente_plataforma ON public.miembros_cliente TO authenticated USING (public.es_dueno_plataforma()) WITH CHECK (public.es_dueno_plataforma());


--
-- Name: miembros_plataforma; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.miembros_plataforma ENABLE ROW LEVEL SECURITY;

--
-- Name: miembros_plataforma miembros_plataforma_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY miembros_plataforma_select ON public.miembros_plataforma FOR SELECT TO authenticated USING (((id_usuario = auth.uid()) OR public.es_dueno_plataforma()));


--
-- Name: miembros_plataforma miembros_plataforma_write; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY miembros_plataforma_write ON public.miembros_plataforma TO authenticated USING (public.es_dueno_plataforma()) WITH CHECK (public.es_dueno_plataforma());


--
-- Name: novedades; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.novedades ENABLE ROW LEVEL SECURITY;

--
-- Name: novedades novedades_delete; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY novedades_delete ON public.novedades FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.votantes v
  WHERE ((v.id = novedades.id_votante) AND public.puede_administrar_campana(v.id_campana)))));


--
-- Name: novedades novedades_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY novedades_insert ON public.novedades FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM public.votantes v
  WHERE ((v.id = novedades.id_votante) AND public.puede_editar_campana(v.id_campana)))));


--
-- Name: novedades novedades_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY novedades_select ON public.novedades FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.votantes v
  WHERE ((v.id = novedades.id_votante) AND public.puede_leer_campana(v.id_campana)))));


--
-- Name: novedades novedades_update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY novedades_update ON public.novedades FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.votantes v
  WHERE ((v.id = novedades.id_votante) AND public.puede_editar_campana(v.id_campana))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.votantes v
  WHERE ((v.id = novedades.id_votante) AND public.puede_editar_campana(v.id_campana)))));


--
-- Name: procesos_electorales; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.procesos_electorales ENABLE ROW LEVEL SECURITY;

--
-- Name: procesos_electorales procesos_electorales_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY procesos_electorales_select ON public.procesos_electorales FOR SELECT TO authenticated USING ((public.es_dueno_plataforma() OR (EXISTS ( SELECT 1
   FROM (public.campanas c
     JOIN public.miembros_campana mc ON ((mc.id_campana = c.id)))
  WHERE ((c.id_proceso_electoral = procesos_electorales.id) AND (mc.id_usuario = auth.uid()))))));


--
-- Name: procesos_electorales procesos_electorales_write; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY procesos_electorales_write ON public.procesos_electorales TO authenticated USING (public.es_dueno_plataforma()) WITH CHECK (public.es_dueno_plataforma());


--
-- Name: puestos_votacion puestos_delete; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY puestos_delete ON public.puestos_votacion FOR DELETE TO authenticated USING (public.puede_administrar_campana(id_campana));


--
-- Name: puestos_votacion puestos_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY puestos_insert ON public.puestos_votacion FOR INSERT TO authenticated WITH CHECK (public.puede_editar_campana(id_campana));


--
-- Name: puestos_votacion puestos_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY puestos_select ON public.puestos_votacion FOR SELECT TO authenticated USING (public.puede_leer_campana(id_campana));


--
-- Name: puestos_votacion puestos_update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY puestos_update ON public.puestos_votacion FOR UPDATE TO authenticated USING (public.puede_editar_campana(id_campana)) WITH CHECK (public.puede_editar_campana(id_campana));


--
-- Name: puestos_votacion; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.puestos_votacion ENABLE ROW LEVEL SECURITY;

--
-- Name: recolectores_telegram; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.recolectores_telegram ENABLE ROW LEVEL SECURITY;

--
-- Name: recolectores_telegram recolectores_telegram_plataforma_write; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY recolectores_telegram_plataforma_write ON public.recolectores_telegram TO authenticated USING (public.es_dueno_plataforma()) WITH CHECK (public.es_dueno_plataforma());


--
-- Name: recolectores_telegram recolectores_telegram_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY recolectores_telegram_select ON public.recolectores_telegram FOR SELECT TO authenticated USING (public.puede_leer_campana(id_campana));


--
-- Name: registro_auditoria; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.registro_auditoria ENABLE ROW LEVEL SECURITY;

--
-- Name: registro_auditoria registro_auditoria_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY registro_auditoria_insert ON public.registro_auditoria FOR INSERT TO authenticated WITH CHECK ((public.es_dueno_plataforma() OR ((id_campana IS NOT NULL) AND public.puede_editar_campana(id_campana))));


--
-- Name: registro_auditoria registro_auditoria_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY registro_auditoria_select ON public.registro_auditoria FOR SELECT TO authenticated USING ((public.es_dueno_plataforma() OR ((id_campana IS NOT NULL) AND (id_campana IN ( SELECT public.ids_campanas_usuario() AS ids_campanas_usuario)))));


--
-- Name: roles; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

--
-- Name: roles roles_delete; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY roles_delete ON public.roles FOR DELETE TO authenticated USING (public.puede_administrar_campana(id_campana));


--
-- Name: roles roles_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY roles_insert ON public.roles FOR INSERT TO authenticated WITH CHECK (public.puede_editar_campana(id_campana));


--
-- Name: roles roles_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY roles_select ON public.roles FOR SELECT TO authenticated USING (public.puede_leer_campana(id_campana));


--
-- Name: roles roles_update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY roles_update ON public.roles FOR UPDATE TO authenticated USING (public.puede_editar_campana(id_campana)) WITH CHECK (public.puede_editar_campana(id_campana));


--
-- Name: sesiones_captura_telegram; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.sesiones_captura_telegram ENABLE ROW LEVEL SECURITY;

--
-- Name: sesiones_captura_telegram sesiones_captura_telegram_plataforma_write; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY sesiones_captura_telegram_plataforma_write ON public.sesiones_captura_telegram TO authenticated USING (public.es_dueno_plataforma()) WITH CHECK (public.es_dueno_plataforma());


--
-- Name: sesiones_captura_telegram sesiones_captura_telegram_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY sesiones_captura_telegram_select ON public.sesiones_captura_telegram FOR SELECT TO authenticated USING (public.puede_leer_campana(id_campana));


--
-- Name: sesiones_captura_whatsapp; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.sesiones_captura_whatsapp ENABLE ROW LEVEL SECURITY;

--
-- Name: sesiones_captura_whatsapp sesiones_captura_whatsapp_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY sesiones_captura_whatsapp_select ON public.sesiones_captura_whatsapp FOR SELECT TO authenticated USING (public.puede_leer_campana(id_campana));


--
-- Name: tipos_novedad; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.tipos_novedad ENABLE ROW LEVEL SECURITY;

--
-- Name: tipos_novedad tipos_novedad_delete; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY tipos_novedad_delete ON public.tipos_novedad FOR DELETE TO authenticated USING (public.puede_administrar_campana(id_campana));


--
-- Name: tipos_novedad tipos_novedad_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY tipos_novedad_insert ON public.tipos_novedad FOR INSERT TO authenticated WITH CHECK (public.puede_editar_campana(id_campana));


--
-- Name: tipos_novedad tipos_novedad_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY tipos_novedad_select ON public.tipos_novedad FOR SELECT TO authenticated USING (public.puede_leer_campana(id_campana));


--
-- Name: tipos_novedad tipos_novedad_update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY tipos_novedad_update ON public.tipos_novedad FOR UPDATE TO authenticated USING (public.puede_editar_campana(id_campana)) WITH CHECK (public.puede_editar_campana(id_campana));


--
-- Name: uso_campana; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.uso_campana ENABLE ROW LEVEL SECURITY;

--
-- Name: uso_campana uso_campana_plataforma; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY uso_campana_plataforma ON public.uso_campana TO authenticated USING (public.es_dueno_plataforma()) WITH CHECK (public.es_dueno_plataforma());


--
-- Name: verificaciones_registraduria; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.verificaciones_registraduria ENABLE ROW LEVEL SECURITY;

--
-- Name: verificaciones_registraduria verificaciones_registraduria_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY verificaciones_registraduria_select ON public.verificaciones_registraduria FOR SELECT TO authenticated USING (public.puede_leer_campana(id_campana));


--
-- Name: verificaciones_registraduria verificaciones_registraduria_write; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY verificaciones_registraduria_write ON public.verificaciones_registraduria TO authenticated USING (public.puede_administrar_campana(id_campana)) WITH CHECK (public.puede_administrar_campana(id_campana));


--
-- Name: votantes; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.votantes ENABLE ROW LEVEL SECURITY;

--
-- Name: votantes votantes_delete; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY votantes_delete ON public.votantes FOR DELETE TO authenticated USING (public.puede_administrar_campana(id_campana));


--
-- Name: votantes votantes_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY votantes_insert ON public.votantes FOR INSERT TO authenticated WITH CHECK (public.puede_editar_campana(id_campana));


--
-- Name: votantes votantes_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY votantes_select ON public.votantes FOR SELECT TO authenticated USING (public.puede_leer_campana(id_campana));


--
-- Name: votantes votantes_update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY votantes_update ON public.votantes FOR UPDATE TO authenticated USING (public.puede_editar_campana(id_campana)) WITH CHECK (public.puede_editar_campana(id_campana));


--
-- Name: messages; Type: ROW SECURITY; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets_analytics; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.buckets_analytics ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets_vectors; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.buckets_vectors ENABLE ROW LEVEL SECURITY;

--
-- Name: migrations; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: objects; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

--
-- Name: objects platform_assets_delete; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY platform_assets_delete ON storage.objects FOR DELETE TO authenticated USING (((bucket_id = 'platform-assets'::text) AND public.es_dueno_plataforma()));


--
-- Name: objects platform_assets_insert; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY platform_assets_insert ON storage.objects FOR INSERT TO authenticated WITH CHECK (((bucket_id = 'platform-assets'::text) AND public.es_dueno_plataforma()));


--
-- Name: objects platform_assets_public_read; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY platform_assets_public_read ON storage.objects FOR SELECT USING ((bucket_id = 'platform-assets'::text));


--
-- Name: objects platform_assets_update; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY platform_assets_update ON storage.objects FOR UPDATE TO authenticated USING (((bucket_id = 'platform-assets'::text) AND public.es_dueno_plataforma())) WITH CHECK (((bucket_id = 'platform-assets'::text) AND public.es_dueno_plataforma()));


--
-- Name: s3_multipart_uploads; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.s3_multipart_uploads ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads_parts; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.s3_multipart_uploads_parts ENABLE ROW LEVEL SECURITY;

--
-- Name: vector_indexes; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.vector_indexes ENABLE ROW LEVEL SECURITY;

--
-- Name: supabase_realtime; Type: PUBLICATION; Schema: -; Owner: postgres
--

CREATE PUBLICATION supabase_realtime WITH (publish = 'insert, update, delete, truncate');


ALTER PUBLICATION supabase_realtime OWNER TO postgres;

--
-- Name: SCHEMA auth; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA auth TO anon;
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT USAGE ON SCHEMA auth TO service_role;
GRANT ALL ON SCHEMA auth TO supabase_auth_admin;
GRANT ALL ON SCHEMA auth TO dashboard_user;
GRANT USAGE ON SCHEMA auth TO postgres;


--
-- Name: SCHEMA extensions; Type: ACL; Schema: -; Owner: postgres
--

GRANT USAGE ON SCHEMA extensions TO anon;
GRANT USAGE ON SCHEMA extensions TO authenticated;
GRANT USAGE ON SCHEMA extensions TO service_role;
GRANT ALL ON SCHEMA extensions TO dashboard_user;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT USAGE ON SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;


--
-- Name: SCHEMA realtime; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA realtime TO postgres;
GRANT USAGE ON SCHEMA realtime TO anon;
GRANT USAGE ON SCHEMA realtime TO authenticated;
GRANT USAGE ON SCHEMA realtime TO service_role;
GRANT ALL ON SCHEMA realtime TO supabase_realtime_admin;


--
-- Name: SCHEMA storage; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA storage TO postgres WITH GRANT OPTION;
GRANT USAGE ON SCHEMA storage TO anon;
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT USAGE ON SCHEMA storage TO service_role;
GRANT ALL ON SCHEMA storage TO supabase_storage_admin WITH GRANT OPTION;
GRANT ALL ON SCHEMA storage TO dashboard_user;


--
-- Name: SCHEMA vault; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA vault TO postgres WITH GRANT OPTION;
GRANT USAGE ON SCHEMA vault TO service_role;


--
-- Name: FUNCTION halfvec_in(cstring, oid, integer); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.halfvec_in(cstring, oid, integer) TO postgres;
GRANT ALL ON FUNCTION public.halfvec_in(cstring, oid, integer) TO anon;
GRANT ALL ON FUNCTION public.halfvec_in(cstring, oid, integer) TO authenticated;
GRANT ALL ON FUNCTION public.halfvec_in(cstring, oid, integer) TO service_role;


--
-- Name: FUNCTION halfvec_out(public.halfvec); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.halfvec_out(public.halfvec) TO postgres;
GRANT ALL ON FUNCTION public.halfvec_out(public.halfvec) TO anon;
GRANT ALL ON FUNCTION public.halfvec_out(public.halfvec) TO authenticated;
GRANT ALL ON FUNCTION public.halfvec_out(public.halfvec) TO service_role;


--
-- Name: FUNCTION halfvec_recv(internal, oid, integer); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.halfvec_recv(internal, oid, integer) TO postgres;
GRANT ALL ON FUNCTION public.halfvec_recv(internal, oid, integer) TO anon;
GRANT ALL ON FUNCTION public.halfvec_recv(internal, oid, integer) TO authenticated;
GRANT ALL ON FUNCTION public.halfvec_recv(internal, oid, integer) TO service_role;


--
-- Name: FUNCTION halfvec_send(public.halfvec); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.halfvec_send(public.halfvec) TO postgres;
GRANT ALL ON FUNCTION public.halfvec_send(public.halfvec) TO anon;
GRANT ALL ON FUNCTION public.halfvec_send(public.halfvec) TO authenticated;
GRANT ALL ON FUNCTION public.halfvec_send(public.halfvec) TO service_role;


--
-- Name: FUNCTION halfvec_typmod_in(cstring[]); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.halfvec_typmod_in(cstring[]) TO postgres;
GRANT ALL ON FUNCTION public.halfvec_typmod_in(cstring[]) TO anon;
GRANT ALL ON FUNCTION public.halfvec_typmod_in(cstring[]) TO authenticated;
GRANT ALL ON FUNCTION public.halfvec_typmod_in(cstring[]) TO service_role;


--
-- Name: FUNCTION sparsevec_in(cstring, oid, integer); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.sparsevec_in(cstring, oid, integer) TO postgres;
GRANT ALL ON FUNCTION public.sparsevec_in(cstring, oid, integer) TO anon;
GRANT ALL ON FUNCTION public.sparsevec_in(cstring, oid, integer) TO authenticated;
GRANT ALL ON FUNCTION public.sparsevec_in(cstring, oid, integer) TO service_role;


--
-- Name: FUNCTION sparsevec_out(public.sparsevec); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.sparsevec_out(public.sparsevec) TO postgres;
GRANT ALL ON FUNCTION public.sparsevec_out(public.sparsevec) TO anon;
GRANT ALL ON FUNCTION public.sparsevec_out(public.sparsevec) TO authenticated;
GRANT ALL ON FUNCTION public.sparsevec_out(public.sparsevec) TO service_role;


--
-- Name: FUNCTION sparsevec_recv(internal, oid, integer); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.sparsevec_recv(internal, oid, integer) TO postgres;
GRANT ALL ON FUNCTION public.sparsevec_recv(internal, oid, integer) TO anon;
GRANT ALL ON FUNCTION public.sparsevec_recv(internal, oid, integer) TO authenticated;
GRANT ALL ON FUNCTION public.sparsevec_recv(internal, oid, integer) TO service_role;


--
-- Name: FUNCTION sparsevec_send(public.sparsevec); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.sparsevec_send(public.sparsevec) TO postgres;
GRANT ALL ON FUNCTION public.sparsevec_send(public.sparsevec) TO anon;
GRANT ALL ON FUNCTION public.sparsevec_send(public.sparsevec) TO authenticated;
GRANT ALL ON FUNCTION public.sparsevec_send(public.sparsevec) TO service_role;


--
-- Name: FUNCTION sparsevec_typmod_in(cstring[]); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.sparsevec_typmod_in(cstring[]) TO postgres;
GRANT ALL ON FUNCTION public.sparsevec_typmod_in(cstring[]) TO anon;
GRANT ALL ON FUNCTION public.sparsevec_typmod_in(cstring[]) TO authenticated;
GRANT ALL ON FUNCTION public.sparsevec_typmod_in(cstring[]) TO service_role;


--
-- Name: FUNCTION vector_in(cstring, oid, integer); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.vector_in(cstring, oid, integer) TO postgres;
GRANT ALL ON FUNCTION public.vector_in(cstring, oid, integer) TO anon;
GRANT ALL ON FUNCTION public.vector_in(cstring, oid, integer) TO authenticated;
GRANT ALL ON FUNCTION public.vector_in(cstring, oid, integer) TO service_role;


--
-- Name: FUNCTION vector_out(public.vector); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.vector_out(public.vector) TO postgres;
GRANT ALL ON FUNCTION public.vector_out(public.vector) TO anon;
GRANT ALL ON FUNCTION public.vector_out(public.vector) TO authenticated;
GRANT ALL ON FUNCTION public.vector_out(public.vector) TO service_role;


--
-- Name: FUNCTION vector_recv(internal, oid, integer); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.vector_recv(internal, oid, integer) TO postgres;
GRANT ALL ON FUNCTION public.vector_recv(internal, oid, integer) TO anon;
GRANT ALL ON FUNCTION public.vector_recv(internal, oid, integer) TO authenticated;
GRANT ALL ON FUNCTION public.vector_recv(internal, oid, integer) TO service_role;


--
-- Name: FUNCTION vector_send(public.vector); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.vector_send(public.vector) TO postgres;
GRANT ALL ON FUNCTION public.vector_send(public.vector) TO anon;
GRANT ALL ON FUNCTION public.vector_send(public.vector) TO authenticated;
GRANT ALL ON FUNCTION public.vector_send(public.vector) TO service_role;


--
-- Name: FUNCTION vector_typmod_in(cstring[]); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.vector_typmod_in(cstring[]) TO postgres;
GRANT ALL ON FUNCTION public.vector_typmod_in(cstring[]) TO anon;
GRANT ALL ON FUNCTION public.vector_typmod_in(cstring[]) TO authenticated;
GRANT ALL ON FUNCTION public.vector_typmod_in(cstring[]) TO service_role;


--
-- Name: FUNCTION array_to_halfvec(real[], integer, boolean); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.array_to_halfvec(real[], integer, boolean) TO postgres;
GRANT ALL ON FUNCTION public.array_to_halfvec(real[], integer, boolean) TO anon;
GRANT ALL ON FUNCTION public.array_to_halfvec(real[], integer, boolean) TO authenticated;
GRANT ALL ON FUNCTION public.array_to_halfvec(real[], integer, boolean) TO service_role;


--
-- Name: FUNCTION array_to_sparsevec(real[], integer, boolean); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.array_to_sparsevec(real[], integer, boolean) TO postgres;
GRANT ALL ON FUNCTION public.array_to_sparsevec(real[], integer, boolean) TO anon;
GRANT ALL ON FUNCTION public.array_to_sparsevec(real[], integer, boolean) TO authenticated;
GRANT ALL ON FUNCTION public.array_to_sparsevec(real[], integer, boolean) TO service_role;


--
-- Name: FUNCTION array_to_vector(real[], integer, boolean); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.array_to_vector(real[], integer, boolean) TO postgres;
GRANT ALL ON FUNCTION public.array_to_vector(real[], integer, boolean) TO anon;
GRANT ALL ON FUNCTION public.array_to_vector(real[], integer, boolean) TO authenticated;
GRANT ALL ON FUNCTION public.array_to_vector(real[], integer, boolean) TO service_role;


--
-- Name: FUNCTION array_to_halfvec(double precision[], integer, boolean); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.array_to_halfvec(double precision[], integer, boolean) TO postgres;
GRANT ALL ON FUNCTION public.array_to_halfvec(double precision[], integer, boolean) TO anon;
GRANT ALL ON FUNCTION public.array_to_halfvec(double precision[], integer, boolean) TO authenticated;
GRANT ALL ON FUNCTION public.array_to_halfvec(double precision[], integer, boolean) TO service_role;


--
-- Name: FUNCTION array_to_sparsevec(double precision[], integer, boolean); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.array_to_sparsevec(double precision[], integer, boolean) TO postgres;
GRANT ALL ON FUNCTION public.array_to_sparsevec(double precision[], integer, boolean) TO anon;
GRANT ALL ON FUNCTION public.array_to_sparsevec(double precision[], integer, boolean) TO authenticated;
GRANT ALL ON FUNCTION public.array_to_sparsevec(double precision[], integer, boolean) TO service_role;


--
-- Name: FUNCTION array_to_vector(double precision[], integer, boolean); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.array_to_vector(double precision[], integer, boolean) TO postgres;
GRANT ALL ON FUNCTION public.array_to_vector(double precision[], integer, boolean) TO anon;
GRANT ALL ON FUNCTION public.array_to_vector(double precision[], integer, boolean) TO authenticated;
GRANT ALL ON FUNCTION public.array_to_vector(double precision[], integer, boolean) TO service_role;


--
-- Name: FUNCTION array_to_halfvec(integer[], integer, boolean); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.array_to_halfvec(integer[], integer, boolean) TO postgres;
GRANT ALL ON FUNCTION public.array_to_halfvec(integer[], integer, boolean) TO anon;
GRANT ALL ON FUNCTION public.array_to_halfvec(integer[], integer, boolean) TO authenticated;
GRANT ALL ON FUNCTION public.array_to_halfvec(integer[], integer, boolean) TO service_role;


--
-- Name: FUNCTION array_to_sparsevec(integer[], integer, boolean); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.array_to_sparsevec(integer[], integer, boolean) TO postgres;
GRANT ALL ON FUNCTION public.array_to_sparsevec(integer[], integer, boolean) TO anon;
GRANT ALL ON FUNCTION public.array_to_sparsevec(integer[], integer, boolean) TO authenticated;
GRANT ALL ON FUNCTION public.array_to_sparsevec(integer[], integer, boolean) TO service_role;


--
-- Name: FUNCTION array_to_vector(integer[], integer, boolean); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.array_to_vector(integer[], integer, boolean) TO postgres;
GRANT ALL ON FUNCTION public.array_to_vector(integer[], integer, boolean) TO anon;
GRANT ALL ON FUNCTION public.array_to_vector(integer[], integer, boolean) TO authenticated;
GRANT ALL ON FUNCTION public.array_to_vector(integer[], integer, boolean) TO service_role;


--
-- Name: FUNCTION array_to_halfvec(numeric[], integer, boolean); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.array_to_halfvec(numeric[], integer, boolean) TO postgres;
GRANT ALL ON FUNCTION public.array_to_halfvec(numeric[], integer, boolean) TO anon;
GRANT ALL ON FUNCTION public.array_to_halfvec(numeric[], integer, boolean) TO authenticated;
GRANT ALL ON FUNCTION public.array_to_halfvec(numeric[], integer, boolean) TO service_role;


--
-- Name: FUNCTION array_to_sparsevec(numeric[], integer, boolean); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.array_to_sparsevec(numeric[], integer, boolean) TO postgres;
GRANT ALL ON FUNCTION public.array_to_sparsevec(numeric[], integer, boolean) TO anon;
GRANT ALL ON FUNCTION public.array_to_sparsevec(numeric[], integer, boolean) TO authenticated;
GRANT ALL ON FUNCTION public.array_to_sparsevec(numeric[], integer, boolean) TO service_role;


--
-- Name: FUNCTION array_to_vector(numeric[], integer, boolean); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.array_to_vector(numeric[], integer, boolean) TO postgres;
GRANT ALL ON FUNCTION public.array_to_vector(numeric[], integer, boolean) TO anon;
GRANT ALL ON FUNCTION public.array_to_vector(numeric[], integer, boolean) TO authenticated;
GRANT ALL ON FUNCTION public.array_to_vector(numeric[], integer, boolean) TO service_role;


--
-- Name: FUNCTION halfvec_to_float4(public.halfvec, integer, boolean); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.halfvec_to_float4(public.halfvec, integer, boolean) TO postgres;
GRANT ALL ON FUNCTION public.halfvec_to_float4(public.halfvec, integer, boolean) TO anon;
GRANT ALL ON FUNCTION public.halfvec_to_float4(public.halfvec, integer, boolean) TO authenticated;
GRANT ALL ON FUNCTION public.halfvec_to_float4(public.halfvec, integer, boolean) TO service_role;


--
-- Name: FUNCTION halfvec(public.halfvec, integer, boolean); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.halfvec(public.halfvec, integer, boolean) TO postgres;
GRANT ALL ON FUNCTION public.halfvec(public.halfvec, integer, boolean) TO anon;
GRANT ALL ON FUNCTION public.halfvec(public.halfvec, integer, boolean) TO authenticated;
GRANT ALL ON FUNCTION public.halfvec(public.halfvec, integer, boolean) TO service_role;


--
-- Name: FUNCTION halfvec_to_sparsevec(public.halfvec, integer, boolean); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.halfvec_to_sparsevec(public.halfvec, integer, boolean) TO postgres;
GRANT ALL ON FUNCTION public.halfvec_to_sparsevec(public.halfvec, integer, boolean) TO anon;
GRANT ALL ON FUNCTION public.halfvec_to_sparsevec(public.halfvec, integer, boolean) TO authenticated;
GRANT ALL ON FUNCTION public.halfvec_to_sparsevec(public.halfvec, integer, boolean) TO service_role;


--
-- Name: FUNCTION halfvec_to_vector(public.halfvec, integer, boolean); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.halfvec_to_vector(public.halfvec, integer, boolean) TO postgres;
GRANT ALL ON FUNCTION public.halfvec_to_vector(public.halfvec, integer, boolean) TO anon;
GRANT ALL ON FUNCTION public.halfvec_to_vector(public.halfvec, integer, boolean) TO authenticated;
GRANT ALL ON FUNCTION public.halfvec_to_vector(public.halfvec, integer, boolean) TO service_role;


--
-- Name: FUNCTION sparsevec_to_halfvec(public.sparsevec, integer, boolean); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.sparsevec_to_halfvec(public.sparsevec, integer, boolean) TO postgres;
GRANT ALL ON FUNCTION public.sparsevec_to_halfvec(public.sparsevec, integer, boolean) TO anon;
GRANT ALL ON FUNCTION public.sparsevec_to_halfvec(public.sparsevec, integer, boolean) TO authenticated;
GRANT ALL ON FUNCTION public.sparsevec_to_halfvec(public.sparsevec, integer, boolean) TO service_role;


--
-- Name: FUNCTION sparsevec(public.sparsevec, integer, boolean); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.sparsevec(public.sparsevec, integer, boolean) TO postgres;
GRANT ALL ON FUNCTION public.sparsevec(public.sparsevec, integer, boolean) TO anon;
GRANT ALL ON FUNCTION public.sparsevec(public.sparsevec, integer, boolean) TO authenticated;
GRANT ALL ON FUNCTION public.sparsevec(public.sparsevec, integer, boolean) TO service_role;


--
-- Name: FUNCTION sparsevec_to_vector(public.sparsevec, integer, boolean); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.sparsevec_to_vector(public.sparsevec, integer, boolean) TO postgres;
GRANT ALL ON FUNCTION public.sparsevec_to_vector(public.sparsevec, integer, boolean) TO anon;
GRANT ALL ON FUNCTION public.sparsevec_to_vector(public.sparsevec, integer, boolean) TO authenticated;
GRANT ALL ON FUNCTION public.sparsevec_to_vector(public.sparsevec, integer, boolean) TO service_role;


--
-- Name: FUNCTION vector_to_float4(public.vector, integer, boolean); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.vector_to_float4(public.vector, integer, boolean) TO postgres;
GRANT ALL ON FUNCTION public.vector_to_float4(public.vector, integer, boolean) TO anon;
GRANT ALL ON FUNCTION public.vector_to_float4(public.vector, integer, boolean) TO authenticated;
GRANT ALL ON FUNCTION public.vector_to_float4(public.vector, integer, boolean) TO service_role;


--
-- Name: FUNCTION vector_to_halfvec(public.vector, integer, boolean); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.vector_to_halfvec(public.vector, integer, boolean) TO postgres;
GRANT ALL ON FUNCTION public.vector_to_halfvec(public.vector, integer, boolean) TO anon;
GRANT ALL ON FUNCTION public.vector_to_halfvec(public.vector, integer, boolean) TO authenticated;
GRANT ALL ON FUNCTION public.vector_to_halfvec(public.vector, integer, boolean) TO service_role;


--
-- Name: FUNCTION vector_to_sparsevec(public.vector, integer, boolean); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.vector_to_sparsevec(public.vector, integer, boolean) TO postgres;
GRANT ALL ON FUNCTION public.vector_to_sparsevec(public.vector, integer, boolean) TO anon;
GRANT ALL ON FUNCTION public.vector_to_sparsevec(public.vector, integer, boolean) TO authenticated;
GRANT ALL ON FUNCTION public.vector_to_sparsevec(public.vector, integer, boolean) TO service_role;


--
-- Name: FUNCTION vector(public.vector, integer, boolean); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.vector(public.vector, integer, boolean) TO postgres;
GRANT ALL ON FUNCTION public.vector(public.vector, integer, boolean) TO anon;
GRANT ALL ON FUNCTION public.vector(public.vector, integer, boolean) TO authenticated;
GRANT ALL ON FUNCTION public.vector(public.vector, integer, boolean) TO service_role;


--
-- Name: FUNCTION email(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.email() TO dashboard_user;


--
-- Name: FUNCTION jwt(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.jwt() TO postgres;
GRANT ALL ON FUNCTION auth.jwt() TO dashboard_user;


--
-- Name: FUNCTION role(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.role() TO dashboard_user;


--
-- Name: FUNCTION uid(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.uid() TO dashboard_user;


--
-- Name: FUNCTION armor(bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.armor(bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.armor(bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.armor(bytea) TO dashboard_user;


--
-- Name: FUNCTION armor(bytea, text[], text[]); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.armor(bytea, text[], text[]) FROM postgres;
GRANT ALL ON FUNCTION extensions.armor(bytea, text[], text[]) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.armor(bytea, text[], text[]) TO dashboard_user;


--
-- Name: FUNCTION crypt(text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.crypt(text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.crypt(text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.crypt(text, text) TO dashboard_user;


--
-- Name: FUNCTION dearmor(text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.dearmor(text) FROM postgres;
GRANT ALL ON FUNCTION extensions.dearmor(text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.dearmor(text) TO dashboard_user;


--
-- Name: FUNCTION decrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION decrypt_iv(bytea, bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION digest(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.digest(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.digest(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.digest(bytea, text) TO dashboard_user;


--
-- Name: FUNCTION digest(text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.digest(text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.digest(text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.digest(text, text) TO dashboard_user;


--
-- Name: FUNCTION encrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION encrypt_iv(bytea, bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION gen_random_bytes(integer); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_random_bytes(integer) FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_random_bytes(integer) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_random_bytes(integer) TO dashboard_user;


--
-- Name: FUNCTION gen_random_uuid(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_random_uuid() FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_random_uuid() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_random_uuid() TO dashboard_user;


--
-- Name: FUNCTION gen_salt(text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_salt(text) FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_salt(text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_salt(text) TO dashboard_user;


--
-- Name: FUNCTION gen_salt(text, integer); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_salt(text, integer) FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_salt(text, integer) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_salt(text, integer) TO dashboard_user;


--
-- Name: FUNCTION grant_pg_cron_access(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION extensions.grant_pg_cron_access() FROM supabase_admin;
GRANT ALL ON FUNCTION extensions.grant_pg_cron_access() TO supabase_admin WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.grant_pg_cron_access() TO dashboard_user;


--
-- Name: FUNCTION grant_pg_graphql_access(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.grant_pg_graphql_access() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION grant_pg_net_access(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION extensions.grant_pg_net_access() FROM supabase_admin;
GRANT ALL ON FUNCTION extensions.grant_pg_net_access() TO supabase_admin WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.grant_pg_net_access() TO dashboard_user;


--
-- Name: FUNCTION hmac(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.hmac(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.hmac(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.hmac(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION hmac(text, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.hmac(text, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.hmac(text, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.hmac(text, text, text) TO dashboard_user;


--
-- Name: FUNCTION pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone) FROM postgres;
GRANT ALL ON FUNCTION extensions.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone) TO dashboard_user;


--
-- Name: FUNCTION pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) FROM postgres;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) TO dashboard_user;


--
-- Name: FUNCTION pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean) FROM postgres;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean) TO dashboard_user;


--
-- Name: FUNCTION pgp_armor_headers(text, OUT key text, OUT value text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) TO dashboard_user;


--
-- Name: FUNCTION pgp_key_id(bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_key_id(bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_key_id(bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_key_id(bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_encrypt(text, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_encrypt(text, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_encrypt_bytea(bytea, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_encrypt_bytea(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_decrypt(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_decrypt(bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_decrypt_bytea(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_decrypt_bytea(bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_encrypt(text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_encrypt(text, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_encrypt_bytea(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_encrypt_bytea(bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgrst_ddl_watch(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgrst_ddl_watch() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgrst_drop_watch(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgrst_drop_watch() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION set_graphql_placeholder(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.set_graphql_placeholder() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_generate_v1(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v1() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1() TO dashboard_user;


--
-- Name: FUNCTION uuid_generate_v1mc(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v1mc() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1mc() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1mc() TO dashboard_user;


--
-- Name: FUNCTION uuid_generate_v3(namespace uuid, name text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) TO dashboard_user;


--
-- Name: FUNCTION uuid_generate_v4(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v4() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v4() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v4() TO dashboard_user;


--
-- Name: FUNCTION uuid_generate_v5(namespace uuid, name text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) TO dashboard_user;


--
-- Name: FUNCTION uuid_nil(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_nil() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_nil() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_nil() TO dashboard_user;


--
-- Name: FUNCTION uuid_ns_dns(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_dns() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_dns() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_dns() TO dashboard_user;


--
-- Name: FUNCTION uuid_ns_oid(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_oid() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_oid() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_oid() TO dashboard_user;


--
-- Name: FUNCTION uuid_ns_url(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_url() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_url() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_url() TO dashboard_user;


--
-- Name: FUNCTION uuid_ns_x500(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_x500() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_x500() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_x500() TO dashboard_user;


--
-- Name: FUNCTION graphql("operationName" text, query text, variables jsonb, extensions jsonb); Type: ACL; Schema: graphql_public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO postgres;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO anon;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO authenticated;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO service_role;


--
-- Name: FUNCTION pg_reload_conf(); Type: ACL; Schema: pg_catalog; Owner: supabase_admin
--

GRANT ALL ON FUNCTION pg_catalog.pg_reload_conf() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION get_auth(p_usename text); Type: ACL; Schema: pgbouncer; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION pgbouncer.get_auth(p_usename text) FROM PUBLIC;
GRANT ALL ON FUNCTION pgbouncer.get_auth(p_usename text) TO pgbouncer;


--
-- Name: FUNCTION actualizar_verificacion_registraduria_ts(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.actualizar_verificacion_registraduria_ts() TO anon;
GRANT ALL ON FUNCTION public.actualizar_verificacion_registraduria_ts() TO authenticated;
GRANT ALL ON FUNCTION public.actualizar_verificacion_registraduria_ts() TO service_role;


--
-- Name: FUNCTION binary_quantize(public.halfvec); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.binary_quantize(public.halfvec) TO postgres;
GRANT ALL ON FUNCTION public.binary_quantize(public.halfvec) TO anon;
GRANT ALL ON FUNCTION public.binary_quantize(public.halfvec) TO authenticated;
GRANT ALL ON FUNCTION public.binary_quantize(public.halfvec) TO service_role;


--
-- Name: FUNCTION binary_quantize(public.vector); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.binary_quantize(public.vector) TO postgres;
GRANT ALL ON FUNCTION public.binary_quantize(public.vector) TO anon;
GRANT ALL ON FUNCTION public.binary_quantize(public.vector) TO authenticated;
GRANT ALL ON FUNCTION public.binary_quantize(public.vector) TO service_role;


--
-- Name: FUNCTION cosine_distance(public.halfvec, public.halfvec); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.cosine_distance(public.halfvec, public.halfvec) TO postgres;
GRANT ALL ON FUNCTION public.cosine_distance(public.halfvec, public.halfvec) TO anon;
GRANT ALL ON FUNCTION public.cosine_distance(public.halfvec, public.halfvec) TO authenticated;
GRANT ALL ON FUNCTION public.cosine_distance(public.halfvec, public.halfvec) TO service_role;


--
-- Name: FUNCTION cosine_distance(public.sparsevec, public.sparsevec); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.cosine_distance(public.sparsevec, public.sparsevec) TO postgres;
GRANT ALL ON FUNCTION public.cosine_distance(public.sparsevec, public.sparsevec) TO anon;
GRANT ALL ON FUNCTION public.cosine_distance(public.sparsevec, public.sparsevec) TO authenticated;
GRANT ALL ON FUNCTION public.cosine_distance(public.sparsevec, public.sparsevec) TO service_role;


--
-- Name: FUNCTION cosine_distance(public.vector, public.vector); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.cosine_distance(public.vector, public.vector) TO postgres;
GRANT ALL ON FUNCTION public.cosine_distance(public.vector, public.vector) TO anon;
GRANT ALL ON FUNCTION public.cosine_distance(public.vector, public.vector) TO authenticated;
GRANT ALL ON FUNCTION public.cosine_distance(public.vector, public.vector) TO service_role;


--
-- Name: FUNCTION crear_caracteristicas_campana(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.crear_caracteristicas_campana() TO anon;
GRANT ALL ON FUNCTION public.crear_caracteristicas_campana() TO authenticated;
GRANT ALL ON FUNCTION public.crear_caracteristicas_campana() TO service_role;


--
-- Name: FUNCTION es_dueno_plataforma(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.es_dueno_plataforma() TO anon;
GRANT ALL ON FUNCTION public.es_dueno_plataforma() TO authenticated;
GRANT ALL ON FUNCTION public.es_dueno_plataforma() TO service_role;


--
-- Name: FUNCTION establecer_actualizado_en(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.establecer_actualizado_en() TO anon;
GRANT ALL ON FUNCTION public.establecer_actualizado_en() TO authenticated;
GRANT ALL ON FUNCTION public.establecer_actualizado_en() TO service_role;


--
-- Name: FUNCTION halfvec_accum(double precision[], public.halfvec); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.halfvec_accum(double precision[], public.halfvec) TO postgres;
GRANT ALL ON FUNCTION public.halfvec_accum(double precision[], public.halfvec) TO anon;
GRANT ALL ON FUNCTION public.halfvec_accum(double precision[], public.halfvec) TO authenticated;
GRANT ALL ON FUNCTION public.halfvec_accum(double precision[], public.halfvec) TO service_role;


--
-- Name: FUNCTION halfvec_add(public.halfvec, public.halfvec); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.halfvec_add(public.halfvec, public.halfvec) TO postgres;
GRANT ALL ON FUNCTION public.halfvec_add(public.halfvec, public.halfvec) TO anon;
GRANT ALL ON FUNCTION public.halfvec_add(public.halfvec, public.halfvec) TO authenticated;
GRANT ALL ON FUNCTION public.halfvec_add(public.halfvec, public.halfvec) TO service_role;


--
-- Name: FUNCTION halfvec_avg(double precision[]); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.halfvec_avg(double precision[]) TO postgres;
GRANT ALL ON FUNCTION public.halfvec_avg(double precision[]) TO anon;
GRANT ALL ON FUNCTION public.halfvec_avg(double precision[]) TO authenticated;
GRANT ALL ON FUNCTION public.halfvec_avg(double precision[]) TO service_role;


--
-- Name: FUNCTION halfvec_cmp(public.halfvec, public.halfvec); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.halfvec_cmp(public.halfvec, public.halfvec) TO postgres;
GRANT ALL ON FUNCTION public.halfvec_cmp(public.halfvec, public.halfvec) TO anon;
GRANT ALL ON FUNCTION public.halfvec_cmp(public.halfvec, public.halfvec) TO authenticated;
GRANT ALL ON FUNCTION public.halfvec_cmp(public.halfvec, public.halfvec) TO service_role;


--
-- Name: FUNCTION halfvec_combine(double precision[], double precision[]); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.halfvec_combine(double precision[], double precision[]) TO postgres;
GRANT ALL ON FUNCTION public.halfvec_combine(double precision[], double precision[]) TO anon;
GRANT ALL ON FUNCTION public.halfvec_combine(double precision[], double precision[]) TO authenticated;
GRANT ALL ON FUNCTION public.halfvec_combine(double precision[], double precision[]) TO service_role;


--
-- Name: FUNCTION halfvec_concat(public.halfvec, public.halfvec); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.halfvec_concat(public.halfvec, public.halfvec) TO postgres;
GRANT ALL ON FUNCTION public.halfvec_concat(public.halfvec, public.halfvec) TO anon;
GRANT ALL ON FUNCTION public.halfvec_concat(public.halfvec, public.halfvec) TO authenticated;
GRANT ALL ON FUNCTION public.halfvec_concat(public.halfvec, public.halfvec) TO service_role;


--
-- Name: FUNCTION halfvec_eq(public.halfvec, public.halfvec); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.halfvec_eq(public.halfvec, public.halfvec) TO postgres;
GRANT ALL ON FUNCTION public.halfvec_eq(public.halfvec, public.halfvec) TO anon;
GRANT ALL ON FUNCTION public.halfvec_eq(public.halfvec, public.halfvec) TO authenticated;
GRANT ALL ON FUNCTION public.halfvec_eq(public.halfvec, public.halfvec) TO service_role;


--
-- Name: FUNCTION halfvec_ge(public.halfvec, public.halfvec); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.halfvec_ge(public.halfvec, public.halfvec) TO postgres;
GRANT ALL ON FUNCTION public.halfvec_ge(public.halfvec, public.halfvec) TO anon;
GRANT ALL ON FUNCTION public.halfvec_ge(public.halfvec, public.halfvec) TO authenticated;
GRANT ALL ON FUNCTION public.halfvec_ge(public.halfvec, public.halfvec) TO service_role;


--
-- Name: FUNCTION halfvec_gt(public.halfvec, public.halfvec); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.halfvec_gt(public.halfvec, public.halfvec) TO postgres;
GRANT ALL ON FUNCTION public.halfvec_gt(public.halfvec, public.halfvec) TO anon;
GRANT ALL ON FUNCTION public.halfvec_gt(public.halfvec, public.halfvec) TO authenticated;
GRANT ALL ON FUNCTION public.halfvec_gt(public.halfvec, public.halfvec) TO service_role;


--
-- Name: FUNCTION halfvec_l2_squared_distance(public.halfvec, public.halfvec); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.halfvec_l2_squared_distance(public.halfvec, public.halfvec) TO postgres;
GRANT ALL ON FUNCTION public.halfvec_l2_squared_distance(public.halfvec, public.halfvec) TO anon;
GRANT ALL ON FUNCTION public.halfvec_l2_squared_distance(public.halfvec, public.halfvec) TO authenticated;
GRANT ALL ON FUNCTION public.halfvec_l2_squared_distance(public.halfvec, public.halfvec) TO service_role;


--
-- Name: FUNCTION halfvec_le(public.halfvec, public.halfvec); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.halfvec_le(public.halfvec, public.halfvec) TO postgres;
GRANT ALL ON FUNCTION public.halfvec_le(public.halfvec, public.halfvec) TO anon;
GRANT ALL ON FUNCTION public.halfvec_le(public.halfvec, public.halfvec) TO authenticated;
GRANT ALL ON FUNCTION public.halfvec_le(public.halfvec, public.halfvec) TO service_role;


--
-- Name: FUNCTION halfvec_lt(public.halfvec, public.halfvec); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.halfvec_lt(public.halfvec, public.halfvec) TO postgres;
GRANT ALL ON FUNCTION public.halfvec_lt(public.halfvec, public.halfvec) TO anon;
GRANT ALL ON FUNCTION public.halfvec_lt(public.halfvec, public.halfvec) TO authenticated;
GRANT ALL ON FUNCTION public.halfvec_lt(public.halfvec, public.halfvec) TO service_role;


--
-- Name: FUNCTION halfvec_mul(public.halfvec, public.halfvec); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.halfvec_mul(public.halfvec, public.halfvec) TO postgres;
GRANT ALL ON FUNCTION public.halfvec_mul(public.halfvec, public.halfvec) TO anon;
GRANT ALL ON FUNCTION public.halfvec_mul(public.halfvec, public.halfvec) TO authenticated;
GRANT ALL ON FUNCTION public.halfvec_mul(public.halfvec, public.halfvec) TO service_role;


--
-- Name: FUNCTION halfvec_ne(public.halfvec, public.halfvec); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.halfvec_ne(public.halfvec, public.halfvec) TO postgres;
GRANT ALL ON FUNCTION public.halfvec_ne(public.halfvec, public.halfvec) TO anon;
GRANT ALL ON FUNCTION public.halfvec_ne(public.halfvec, public.halfvec) TO authenticated;
GRANT ALL ON FUNCTION public.halfvec_ne(public.halfvec, public.halfvec) TO service_role;


--
-- Name: FUNCTION halfvec_negative_inner_product(public.halfvec, public.halfvec); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.halfvec_negative_inner_product(public.halfvec, public.halfvec) TO postgres;
GRANT ALL ON FUNCTION public.halfvec_negative_inner_product(public.halfvec, public.halfvec) TO anon;
GRANT ALL ON FUNCTION public.halfvec_negative_inner_product(public.halfvec, public.halfvec) TO authenticated;
GRANT ALL ON FUNCTION public.halfvec_negative_inner_product(public.halfvec, public.halfvec) TO service_role;


--
-- Name: FUNCTION halfvec_spherical_distance(public.halfvec, public.halfvec); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.halfvec_spherical_distance(public.halfvec, public.halfvec) TO postgres;
GRANT ALL ON FUNCTION public.halfvec_spherical_distance(public.halfvec, public.halfvec) TO anon;
GRANT ALL ON FUNCTION public.halfvec_spherical_distance(public.halfvec, public.halfvec) TO authenticated;
GRANT ALL ON FUNCTION public.halfvec_spherical_distance(public.halfvec, public.halfvec) TO service_role;


--
-- Name: FUNCTION halfvec_sub(public.halfvec, public.halfvec); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.halfvec_sub(public.halfvec, public.halfvec) TO postgres;
GRANT ALL ON FUNCTION public.halfvec_sub(public.halfvec, public.halfvec) TO anon;
GRANT ALL ON FUNCTION public.halfvec_sub(public.halfvec, public.halfvec) TO authenticated;
GRANT ALL ON FUNCTION public.halfvec_sub(public.halfvec, public.halfvec) TO service_role;


--
-- Name: FUNCTION hamming_distance(bit, bit); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.hamming_distance(bit, bit) TO postgres;
GRANT ALL ON FUNCTION public.hamming_distance(bit, bit) TO anon;
GRANT ALL ON FUNCTION public.hamming_distance(bit, bit) TO authenticated;
GRANT ALL ON FUNCTION public.hamming_distance(bit, bit) TO service_role;


--
-- Name: FUNCTION hnsw_bit_support(internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.hnsw_bit_support(internal) TO postgres;
GRANT ALL ON FUNCTION public.hnsw_bit_support(internal) TO anon;
GRANT ALL ON FUNCTION public.hnsw_bit_support(internal) TO authenticated;
GRANT ALL ON FUNCTION public.hnsw_bit_support(internal) TO service_role;


--
-- Name: FUNCTION hnsw_halfvec_support(internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.hnsw_halfvec_support(internal) TO postgres;
GRANT ALL ON FUNCTION public.hnsw_halfvec_support(internal) TO anon;
GRANT ALL ON FUNCTION public.hnsw_halfvec_support(internal) TO authenticated;
GRANT ALL ON FUNCTION public.hnsw_halfvec_support(internal) TO service_role;


--
-- Name: FUNCTION hnsw_sparsevec_support(internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.hnsw_sparsevec_support(internal) TO postgres;
GRANT ALL ON FUNCTION public.hnsw_sparsevec_support(internal) TO anon;
GRANT ALL ON FUNCTION public.hnsw_sparsevec_support(internal) TO authenticated;
GRANT ALL ON FUNCTION public.hnsw_sparsevec_support(internal) TO service_role;


--
-- Name: FUNCTION hnswhandler(internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.hnswhandler(internal) TO postgres;
GRANT ALL ON FUNCTION public.hnswhandler(internal) TO anon;
GRANT ALL ON FUNCTION public.hnswhandler(internal) TO authenticated;
GRANT ALL ON FUNCTION public.hnswhandler(internal) TO service_role;


--
-- Name: FUNCTION ids_campanas_usuario(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.ids_campanas_usuario() TO anon;
GRANT ALL ON FUNCTION public.ids_campanas_usuario() TO authenticated;
GRANT ALL ON FUNCTION public.ids_campanas_usuario() TO service_role;


--
-- Name: FUNCTION inner_product(public.halfvec, public.halfvec); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.inner_product(public.halfvec, public.halfvec) TO postgres;
GRANT ALL ON FUNCTION public.inner_product(public.halfvec, public.halfvec) TO anon;
GRANT ALL ON FUNCTION public.inner_product(public.halfvec, public.halfvec) TO authenticated;
GRANT ALL ON FUNCTION public.inner_product(public.halfvec, public.halfvec) TO service_role;


--
-- Name: FUNCTION inner_product(public.sparsevec, public.sparsevec); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.inner_product(public.sparsevec, public.sparsevec) TO postgres;
GRANT ALL ON FUNCTION public.inner_product(public.sparsevec, public.sparsevec) TO anon;
GRANT ALL ON FUNCTION public.inner_product(public.sparsevec, public.sparsevec) TO authenticated;
GRANT ALL ON FUNCTION public.inner_product(public.sparsevec, public.sparsevec) TO service_role;


--
-- Name: FUNCTION inner_product(public.vector, public.vector); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.inner_product(public.vector, public.vector) TO postgres;
GRANT ALL ON FUNCTION public.inner_product(public.vector, public.vector) TO anon;
GRANT ALL ON FUNCTION public.inner_product(public.vector, public.vector) TO authenticated;
GRANT ALL ON FUNCTION public.inner_product(public.vector, public.vector) TO service_role;


--
-- Name: FUNCTION ivfflat_bit_support(internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.ivfflat_bit_support(internal) TO postgres;
GRANT ALL ON FUNCTION public.ivfflat_bit_support(internal) TO anon;
GRANT ALL ON FUNCTION public.ivfflat_bit_support(internal) TO authenticated;
GRANT ALL ON FUNCTION public.ivfflat_bit_support(internal) TO service_role;


--
-- Name: FUNCTION ivfflat_halfvec_support(internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.ivfflat_halfvec_support(internal) TO postgres;
GRANT ALL ON FUNCTION public.ivfflat_halfvec_support(internal) TO anon;
GRANT ALL ON FUNCTION public.ivfflat_halfvec_support(internal) TO authenticated;
GRANT ALL ON FUNCTION public.ivfflat_halfvec_support(internal) TO service_role;


--
-- Name: FUNCTION ivfflathandler(internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.ivfflathandler(internal) TO postgres;
GRANT ALL ON FUNCTION public.ivfflathandler(internal) TO anon;
GRANT ALL ON FUNCTION public.ivfflathandler(internal) TO authenticated;
GRANT ALL ON FUNCTION public.ivfflathandler(internal) TO service_role;


--
-- Name: FUNCTION jaccard_distance(bit, bit); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.jaccard_distance(bit, bit) TO postgres;
GRANT ALL ON FUNCTION public.jaccard_distance(bit, bit) TO anon;
GRANT ALL ON FUNCTION public.jaccard_distance(bit, bit) TO authenticated;
GRANT ALL ON FUNCTION public.jaccard_distance(bit, bit) TO service_role;


--
-- Name: FUNCTION l1_distance(public.halfvec, public.halfvec); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.l1_distance(public.halfvec, public.halfvec) TO postgres;
GRANT ALL ON FUNCTION public.l1_distance(public.halfvec, public.halfvec) TO anon;
GRANT ALL ON FUNCTION public.l1_distance(public.halfvec, public.halfvec) TO authenticated;
GRANT ALL ON FUNCTION public.l1_distance(public.halfvec, public.halfvec) TO service_role;


--
-- Name: FUNCTION l1_distance(public.sparsevec, public.sparsevec); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.l1_distance(public.sparsevec, public.sparsevec) TO postgres;
GRANT ALL ON FUNCTION public.l1_distance(public.sparsevec, public.sparsevec) TO anon;
GRANT ALL ON FUNCTION public.l1_distance(public.sparsevec, public.sparsevec) TO authenticated;
GRANT ALL ON FUNCTION public.l1_distance(public.sparsevec, public.sparsevec) TO service_role;


--
-- Name: FUNCTION l1_distance(public.vector, public.vector); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.l1_distance(public.vector, public.vector) TO postgres;
GRANT ALL ON FUNCTION public.l1_distance(public.vector, public.vector) TO anon;
GRANT ALL ON FUNCTION public.l1_distance(public.vector, public.vector) TO authenticated;
GRANT ALL ON FUNCTION public.l1_distance(public.vector, public.vector) TO service_role;


--
-- Name: FUNCTION l2_distance(public.halfvec, public.halfvec); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.l2_distance(public.halfvec, public.halfvec) TO postgres;
GRANT ALL ON FUNCTION public.l2_distance(public.halfvec, public.halfvec) TO anon;
GRANT ALL ON FUNCTION public.l2_distance(public.halfvec, public.halfvec) TO authenticated;
GRANT ALL ON FUNCTION public.l2_distance(public.halfvec, public.halfvec) TO service_role;


--
-- Name: FUNCTION l2_distance(public.sparsevec, public.sparsevec); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.l2_distance(public.sparsevec, public.sparsevec) TO postgres;
GRANT ALL ON FUNCTION public.l2_distance(public.sparsevec, public.sparsevec) TO anon;
GRANT ALL ON FUNCTION public.l2_distance(public.sparsevec, public.sparsevec) TO authenticated;
GRANT ALL ON FUNCTION public.l2_distance(public.sparsevec, public.sparsevec) TO service_role;


--
-- Name: FUNCTION l2_distance(public.vector, public.vector); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.l2_distance(public.vector, public.vector) TO postgres;
GRANT ALL ON FUNCTION public.l2_distance(public.vector, public.vector) TO anon;
GRANT ALL ON FUNCTION public.l2_distance(public.vector, public.vector) TO authenticated;
GRANT ALL ON FUNCTION public.l2_distance(public.vector, public.vector) TO service_role;


--
-- Name: FUNCTION l2_norm(public.halfvec); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.l2_norm(public.halfvec) TO postgres;
GRANT ALL ON FUNCTION public.l2_norm(public.halfvec) TO anon;
GRANT ALL ON FUNCTION public.l2_norm(public.halfvec) TO authenticated;
GRANT ALL ON FUNCTION public.l2_norm(public.halfvec) TO service_role;


--
-- Name: FUNCTION l2_norm(public.sparsevec); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.l2_norm(public.sparsevec) TO postgres;
GRANT ALL ON FUNCTION public.l2_norm(public.sparsevec) TO anon;
GRANT ALL ON FUNCTION public.l2_norm(public.sparsevec) TO authenticated;
GRANT ALL ON FUNCTION public.l2_norm(public.sparsevec) TO service_role;


--
-- Name: FUNCTION l2_normalize(public.halfvec); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.l2_normalize(public.halfvec) TO postgres;
GRANT ALL ON FUNCTION public.l2_normalize(public.halfvec) TO anon;
GRANT ALL ON FUNCTION public.l2_normalize(public.halfvec) TO authenticated;
GRANT ALL ON FUNCTION public.l2_normalize(public.halfvec) TO service_role;


--
-- Name: FUNCTION l2_normalize(public.sparsevec); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.l2_normalize(public.sparsevec) TO postgres;
GRANT ALL ON FUNCTION public.l2_normalize(public.sparsevec) TO anon;
GRANT ALL ON FUNCTION public.l2_normalize(public.sparsevec) TO authenticated;
GRANT ALL ON FUNCTION public.l2_normalize(public.sparsevec) TO service_role;


--
-- Name: FUNCTION l2_normalize(public.vector); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.l2_normalize(public.vector) TO postgres;
GRANT ALL ON FUNCTION public.l2_normalize(public.vector) TO anon;
GRANT ALL ON FUNCTION public.l2_normalize(public.vector) TO authenticated;
GRANT ALL ON FUNCTION public.l2_normalize(public.vector) TO service_role;


--
-- Name: FUNCTION match_puestos_votacion(query_embedding public.vector, match_count integer, filter jsonb); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.match_puestos_votacion(query_embedding public.vector, match_count integer, filter jsonb) TO anon;
GRANT ALL ON FUNCTION public.match_puestos_votacion(query_embedding public.vector, match_count integer, filter jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.match_puestos_votacion(query_embedding public.vector, match_count integer, filter jsonb) TO service_role;


--
-- Name: FUNCTION match_votantes(query_embedding public.vector, match_count integer, filter jsonb); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.match_votantes(query_embedding public.vector, match_count integer, filter jsonb) TO anon;
GRANT ALL ON FUNCTION public.match_votantes(query_embedding public.vector, match_count integer, filter jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.match_votantes(query_embedding public.vector, match_count integer, filter jsonb) TO service_role;


--
-- Name: FUNCTION puede_administrar_campana(p_id_campana bigint); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.puede_administrar_campana(p_id_campana bigint) TO anon;
GRANT ALL ON FUNCTION public.puede_administrar_campana(p_id_campana bigint) TO authenticated;
GRANT ALL ON FUNCTION public.puede_administrar_campana(p_id_campana bigint) TO service_role;


--
-- Name: FUNCTION puede_editar_campana(p_id_campana bigint); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.puede_editar_campana(p_id_campana bigint) TO anon;
GRANT ALL ON FUNCTION public.puede_editar_campana(p_id_campana bigint) TO authenticated;
GRANT ALL ON FUNCTION public.puede_editar_campana(p_id_campana bigint) TO service_role;


--
-- Name: FUNCTION puede_leer_campana(p_id_campana bigint); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.puede_leer_campana(p_id_campana bigint) TO anon;
GRANT ALL ON FUNCTION public.puede_leer_campana(p_id_campana bigint) TO authenticated;
GRANT ALL ON FUNCTION public.puede_leer_campana(p_id_campana bigint) TO service_role;


--
-- Name: FUNCTION sparsevec_cmp(public.sparsevec, public.sparsevec); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.sparsevec_cmp(public.sparsevec, public.sparsevec) TO postgres;
GRANT ALL ON FUNCTION public.sparsevec_cmp(public.sparsevec, public.sparsevec) TO anon;
GRANT ALL ON FUNCTION public.sparsevec_cmp(public.sparsevec, public.sparsevec) TO authenticated;
GRANT ALL ON FUNCTION public.sparsevec_cmp(public.sparsevec, public.sparsevec) TO service_role;


--
-- Name: FUNCTION sparsevec_eq(public.sparsevec, public.sparsevec); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.sparsevec_eq(public.sparsevec, public.sparsevec) TO postgres;
GRANT ALL ON FUNCTION public.sparsevec_eq(public.sparsevec, public.sparsevec) TO anon;
GRANT ALL ON FUNCTION public.sparsevec_eq(public.sparsevec, public.sparsevec) TO authenticated;
GRANT ALL ON FUNCTION public.sparsevec_eq(public.sparsevec, public.sparsevec) TO service_role;


--
-- Name: FUNCTION sparsevec_ge(public.sparsevec, public.sparsevec); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.sparsevec_ge(public.sparsevec, public.sparsevec) TO postgres;
GRANT ALL ON FUNCTION public.sparsevec_ge(public.sparsevec, public.sparsevec) TO anon;
GRANT ALL ON FUNCTION public.sparsevec_ge(public.sparsevec, public.sparsevec) TO authenticated;
GRANT ALL ON FUNCTION public.sparsevec_ge(public.sparsevec, public.sparsevec) TO service_role;


--
-- Name: FUNCTION sparsevec_gt(public.sparsevec, public.sparsevec); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.sparsevec_gt(public.sparsevec, public.sparsevec) TO postgres;
GRANT ALL ON FUNCTION public.sparsevec_gt(public.sparsevec, public.sparsevec) TO anon;
GRANT ALL ON FUNCTION public.sparsevec_gt(public.sparsevec, public.sparsevec) TO authenticated;
GRANT ALL ON FUNCTION public.sparsevec_gt(public.sparsevec, public.sparsevec) TO service_role;


--
-- Name: FUNCTION sparsevec_l2_squared_distance(public.sparsevec, public.sparsevec); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.sparsevec_l2_squared_distance(public.sparsevec, public.sparsevec) TO postgres;
GRANT ALL ON FUNCTION public.sparsevec_l2_squared_distance(public.sparsevec, public.sparsevec) TO anon;
GRANT ALL ON FUNCTION public.sparsevec_l2_squared_distance(public.sparsevec, public.sparsevec) TO authenticated;
GRANT ALL ON FUNCTION public.sparsevec_l2_squared_distance(public.sparsevec, public.sparsevec) TO service_role;


--
-- Name: FUNCTION sparsevec_le(public.sparsevec, public.sparsevec); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.sparsevec_le(public.sparsevec, public.sparsevec) TO postgres;
GRANT ALL ON FUNCTION public.sparsevec_le(public.sparsevec, public.sparsevec) TO anon;
GRANT ALL ON FUNCTION public.sparsevec_le(public.sparsevec, public.sparsevec) TO authenticated;
GRANT ALL ON FUNCTION public.sparsevec_le(public.sparsevec, public.sparsevec) TO service_role;


--
-- Name: FUNCTION sparsevec_lt(public.sparsevec, public.sparsevec); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.sparsevec_lt(public.sparsevec, public.sparsevec) TO postgres;
GRANT ALL ON FUNCTION public.sparsevec_lt(public.sparsevec, public.sparsevec) TO anon;
GRANT ALL ON FUNCTION public.sparsevec_lt(public.sparsevec, public.sparsevec) TO authenticated;
GRANT ALL ON FUNCTION public.sparsevec_lt(public.sparsevec, public.sparsevec) TO service_role;


--
-- Name: FUNCTION sparsevec_ne(public.sparsevec, public.sparsevec); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.sparsevec_ne(public.sparsevec, public.sparsevec) TO postgres;
GRANT ALL ON FUNCTION public.sparsevec_ne(public.sparsevec, public.sparsevec) TO anon;
GRANT ALL ON FUNCTION public.sparsevec_ne(public.sparsevec, public.sparsevec) TO authenticated;
GRANT ALL ON FUNCTION public.sparsevec_ne(public.sparsevec, public.sparsevec) TO service_role;


--
-- Name: FUNCTION sparsevec_negative_inner_product(public.sparsevec, public.sparsevec); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.sparsevec_negative_inner_product(public.sparsevec, public.sparsevec) TO postgres;
GRANT ALL ON FUNCTION public.sparsevec_negative_inner_product(public.sparsevec, public.sparsevec) TO anon;
GRANT ALL ON FUNCTION public.sparsevec_negative_inner_product(public.sparsevec, public.sparsevec) TO authenticated;
GRANT ALL ON FUNCTION public.sparsevec_negative_inner_product(public.sparsevec, public.sparsevec) TO service_role;


--
-- Name: FUNCTION subarbol_votantes(id_votante_raiz bigint); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.subarbol_votantes(id_votante_raiz bigint) TO anon;
GRANT ALL ON FUNCTION public.subarbol_votantes(id_votante_raiz bigint) TO authenticated;
GRANT ALL ON FUNCTION public.subarbol_votantes(id_votante_raiz bigint) TO service_role;


--
-- Name: FUNCTION subvector(public.halfvec, integer, integer); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.subvector(public.halfvec, integer, integer) TO postgres;
GRANT ALL ON FUNCTION public.subvector(public.halfvec, integer, integer) TO anon;
GRANT ALL ON FUNCTION public.subvector(public.halfvec, integer, integer) TO authenticated;
GRANT ALL ON FUNCTION public.subvector(public.halfvec, integer, integer) TO service_role;


--
-- Name: FUNCTION subvector(public.vector, integer, integer); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.subvector(public.vector, integer, integer) TO postgres;
GRANT ALL ON FUNCTION public.subvector(public.vector, integer, integer) TO anon;
GRANT ALL ON FUNCTION public.subvector(public.vector, integer, integer) TO authenticated;
GRANT ALL ON FUNCTION public.subvector(public.vector, integer, integer) TO service_role;


--
-- Name: FUNCTION validar_lider_misma_campana(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.validar_lider_misma_campana() TO anon;
GRANT ALL ON FUNCTION public.validar_lider_misma_campana() TO authenticated;
GRANT ALL ON FUNCTION public.validar_lider_misma_campana() TO service_role;


--
-- Name: FUNCTION vector_accum(double precision[], public.vector); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.vector_accum(double precision[], public.vector) TO postgres;
GRANT ALL ON FUNCTION public.vector_accum(double precision[], public.vector) TO anon;
GRANT ALL ON FUNCTION public.vector_accum(double precision[], public.vector) TO authenticated;
GRANT ALL ON FUNCTION public.vector_accum(double precision[], public.vector) TO service_role;


--
-- Name: FUNCTION vector_add(public.vector, public.vector); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.vector_add(public.vector, public.vector) TO postgres;
GRANT ALL ON FUNCTION public.vector_add(public.vector, public.vector) TO anon;
GRANT ALL ON FUNCTION public.vector_add(public.vector, public.vector) TO authenticated;
GRANT ALL ON FUNCTION public.vector_add(public.vector, public.vector) TO service_role;


--
-- Name: FUNCTION vector_avg(double precision[]); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.vector_avg(double precision[]) TO postgres;
GRANT ALL ON FUNCTION public.vector_avg(double precision[]) TO anon;
GRANT ALL ON FUNCTION public.vector_avg(double precision[]) TO authenticated;
GRANT ALL ON FUNCTION public.vector_avg(double precision[]) TO service_role;


--
-- Name: FUNCTION vector_cmp(public.vector, public.vector); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.vector_cmp(public.vector, public.vector) TO postgres;
GRANT ALL ON FUNCTION public.vector_cmp(public.vector, public.vector) TO anon;
GRANT ALL ON FUNCTION public.vector_cmp(public.vector, public.vector) TO authenticated;
GRANT ALL ON FUNCTION public.vector_cmp(public.vector, public.vector) TO service_role;


--
-- Name: FUNCTION vector_combine(double precision[], double precision[]); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.vector_combine(double precision[], double precision[]) TO postgres;
GRANT ALL ON FUNCTION public.vector_combine(double precision[], double precision[]) TO anon;
GRANT ALL ON FUNCTION public.vector_combine(double precision[], double precision[]) TO authenticated;
GRANT ALL ON FUNCTION public.vector_combine(double precision[], double precision[]) TO service_role;


--
-- Name: FUNCTION vector_concat(public.vector, public.vector); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.vector_concat(public.vector, public.vector) TO postgres;
GRANT ALL ON FUNCTION public.vector_concat(public.vector, public.vector) TO anon;
GRANT ALL ON FUNCTION public.vector_concat(public.vector, public.vector) TO authenticated;
GRANT ALL ON FUNCTION public.vector_concat(public.vector, public.vector) TO service_role;


--
-- Name: FUNCTION vector_dims(public.halfvec); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.vector_dims(public.halfvec) TO postgres;
GRANT ALL ON FUNCTION public.vector_dims(public.halfvec) TO anon;
GRANT ALL ON FUNCTION public.vector_dims(public.halfvec) TO authenticated;
GRANT ALL ON FUNCTION public.vector_dims(public.halfvec) TO service_role;


--
-- Name: FUNCTION vector_dims(public.vector); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.vector_dims(public.vector) TO postgres;
GRANT ALL ON FUNCTION public.vector_dims(public.vector) TO anon;
GRANT ALL ON FUNCTION public.vector_dims(public.vector) TO authenticated;
GRANT ALL ON FUNCTION public.vector_dims(public.vector) TO service_role;


--
-- Name: FUNCTION vector_eq(public.vector, public.vector); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.vector_eq(public.vector, public.vector) TO postgres;
GRANT ALL ON FUNCTION public.vector_eq(public.vector, public.vector) TO anon;
GRANT ALL ON FUNCTION public.vector_eq(public.vector, public.vector) TO authenticated;
GRANT ALL ON FUNCTION public.vector_eq(public.vector, public.vector) TO service_role;


--
-- Name: FUNCTION vector_ge(public.vector, public.vector); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.vector_ge(public.vector, public.vector) TO postgres;
GRANT ALL ON FUNCTION public.vector_ge(public.vector, public.vector) TO anon;
GRANT ALL ON FUNCTION public.vector_ge(public.vector, public.vector) TO authenticated;
GRANT ALL ON FUNCTION public.vector_ge(public.vector, public.vector) TO service_role;


--
-- Name: FUNCTION vector_gt(public.vector, public.vector); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.vector_gt(public.vector, public.vector) TO postgres;
GRANT ALL ON FUNCTION public.vector_gt(public.vector, public.vector) TO anon;
GRANT ALL ON FUNCTION public.vector_gt(public.vector, public.vector) TO authenticated;
GRANT ALL ON FUNCTION public.vector_gt(public.vector, public.vector) TO service_role;


--
-- Name: FUNCTION vector_l2_squared_distance(public.vector, public.vector); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.vector_l2_squared_distance(public.vector, public.vector) TO postgres;
GRANT ALL ON FUNCTION public.vector_l2_squared_distance(public.vector, public.vector) TO anon;
GRANT ALL ON FUNCTION public.vector_l2_squared_distance(public.vector, public.vector) TO authenticated;
GRANT ALL ON FUNCTION public.vector_l2_squared_distance(public.vector, public.vector) TO service_role;


--
-- Name: FUNCTION vector_le(public.vector, public.vector); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.vector_le(public.vector, public.vector) TO postgres;
GRANT ALL ON FUNCTION public.vector_le(public.vector, public.vector) TO anon;
GRANT ALL ON FUNCTION public.vector_le(public.vector, public.vector) TO authenticated;
GRANT ALL ON FUNCTION public.vector_le(public.vector, public.vector) TO service_role;


--
-- Name: FUNCTION vector_lt(public.vector, public.vector); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.vector_lt(public.vector, public.vector) TO postgres;
GRANT ALL ON FUNCTION public.vector_lt(public.vector, public.vector) TO anon;
GRANT ALL ON FUNCTION public.vector_lt(public.vector, public.vector) TO authenticated;
GRANT ALL ON FUNCTION public.vector_lt(public.vector, public.vector) TO service_role;


--
-- Name: FUNCTION vector_mul(public.vector, public.vector); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.vector_mul(public.vector, public.vector) TO postgres;
GRANT ALL ON FUNCTION public.vector_mul(public.vector, public.vector) TO anon;
GRANT ALL ON FUNCTION public.vector_mul(public.vector, public.vector) TO authenticated;
GRANT ALL ON FUNCTION public.vector_mul(public.vector, public.vector) TO service_role;


--
-- Name: FUNCTION vector_ne(public.vector, public.vector); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.vector_ne(public.vector, public.vector) TO postgres;
GRANT ALL ON FUNCTION public.vector_ne(public.vector, public.vector) TO anon;
GRANT ALL ON FUNCTION public.vector_ne(public.vector, public.vector) TO authenticated;
GRANT ALL ON FUNCTION public.vector_ne(public.vector, public.vector) TO service_role;


--
-- Name: FUNCTION vector_negative_inner_product(public.vector, public.vector); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.vector_negative_inner_product(public.vector, public.vector) TO postgres;
GRANT ALL ON FUNCTION public.vector_negative_inner_product(public.vector, public.vector) TO anon;
GRANT ALL ON FUNCTION public.vector_negative_inner_product(public.vector, public.vector) TO authenticated;
GRANT ALL ON FUNCTION public.vector_negative_inner_product(public.vector, public.vector) TO service_role;


--
-- Name: FUNCTION vector_norm(public.vector); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.vector_norm(public.vector) TO postgres;
GRANT ALL ON FUNCTION public.vector_norm(public.vector) TO anon;
GRANT ALL ON FUNCTION public.vector_norm(public.vector) TO authenticated;
GRANT ALL ON FUNCTION public.vector_norm(public.vector) TO service_role;


--
-- Name: FUNCTION vector_spherical_distance(public.vector, public.vector); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.vector_spherical_distance(public.vector, public.vector) TO postgres;
GRANT ALL ON FUNCTION public.vector_spherical_distance(public.vector, public.vector) TO anon;
GRANT ALL ON FUNCTION public.vector_spherical_distance(public.vector, public.vector) TO authenticated;
GRANT ALL ON FUNCTION public.vector_spherical_distance(public.vector, public.vector) TO service_role;


--
-- Name: FUNCTION vector_sub(public.vector, public.vector); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.vector_sub(public.vector, public.vector) TO postgres;
GRANT ALL ON FUNCTION public.vector_sub(public.vector, public.vector) TO anon;
GRANT ALL ON FUNCTION public.vector_sub(public.vector, public.vector) TO authenticated;
GRANT ALL ON FUNCTION public.vector_sub(public.vector, public.vector) TO service_role;


--
-- Name: FUNCTION apply_rls(wal jsonb, max_record_bytes integer); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO postgres;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO anon;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO authenticated;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO service_role;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO supabase_realtime_admin;


--
-- Name: FUNCTION broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) TO postgres;
GRANT ALL ON FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) TO dashboard_user;


--
-- Name: FUNCTION build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO postgres;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO anon;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO authenticated;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO service_role;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO supabase_realtime_admin;


--
-- Name: FUNCTION "cast"(val text, type_ regtype); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO postgres;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO dashboard_user;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO anon;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO authenticated;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO service_role;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO supabase_realtime_admin;


--
-- Name: FUNCTION check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO postgres;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO anon;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO authenticated;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO service_role;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO supabase_realtime_admin;


--
-- Name: FUNCTION check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text, negate boolean); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text, negate boolean) TO postgres;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text, negate boolean) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text, negate boolean) TO anon;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text, negate boolean) TO authenticated;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text, negate boolean) TO service_role;


--
-- Name: FUNCTION is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO postgres;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO anon;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO authenticated;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO service_role;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO supabase_realtime_admin;


--
-- Name: FUNCTION list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO postgres;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO dashboard_user;


--
-- Name: FUNCTION quote_wal2json(entity regclass); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO postgres;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO anon;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO authenticated;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO service_role;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO supabase_realtime_admin;


--
-- Name: FUNCTION send(payload jsonb, event text, topic text, private boolean); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) TO postgres;
GRANT ALL ON FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) TO dashboard_user;


--
-- Name: FUNCTION send_binary(payload bytea, event text, topic text, private boolean); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.send_binary(payload bytea, event text, topic text, private boolean) TO postgres;
GRANT ALL ON FUNCTION realtime.send_binary(payload bytea, event text, topic text, private boolean) TO dashboard_user;


--
-- Name: FUNCTION subscription_check_filters(); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO postgres;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO dashboard_user;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO anon;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO authenticated;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO service_role;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO supabase_realtime_admin;


--
-- Name: FUNCTION to_regrole(role_name text); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO postgres;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO anon;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO authenticated;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO service_role;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO supabase_realtime_admin;


--
-- Name: FUNCTION topic(); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.topic() TO postgres;
GRANT ALL ON FUNCTION realtime.topic() TO dashboard_user;


--
-- Name: FUNCTION wal2json_escape_identifier(name text); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.wal2json_escape_identifier(name text) TO postgres;
GRANT ALL ON FUNCTION realtime.wal2json_escape_identifier(name text) TO dashboard_user;


--
-- Name: FUNCTION _crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault._crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault._crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea) TO service_role;


--
-- Name: FUNCTION create_secret(new_secret text, new_name text, new_description text, new_key_id uuid); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault.create_secret(new_secret text, new_name text, new_description text, new_key_id uuid) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault.create_secret(new_secret text, new_name text, new_description text, new_key_id uuid) TO service_role;


--
-- Name: FUNCTION update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault.update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault.update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid) TO service_role;


--
-- Name: FUNCTION avg(public.halfvec); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.avg(public.halfvec) TO postgres;
GRANT ALL ON FUNCTION public.avg(public.halfvec) TO anon;
GRANT ALL ON FUNCTION public.avg(public.halfvec) TO authenticated;
GRANT ALL ON FUNCTION public.avg(public.halfvec) TO service_role;


--
-- Name: FUNCTION avg(public.vector); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.avg(public.vector) TO postgres;
GRANT ALL ON FUNCTION public.avg(public.vector) TO anon;
GRANT ALL ON FUNCTION public.avg(public.vector) TO authenticated;
GRANT ALL ON FUNCTION public.avg(public.vector) TO service_role;


--
-- Name: FUNCTION sum(public.halfvec); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.sum(public.halfvec) TO postgres;
GRANT ALL ON FUNCTION public.sum(public.halfvec) TO anon;
GRANT ALL ON FUNCTION public.sum(public.halfvec) TO authenticated;
GRANT ALL ON FUNCTION public.sum(public.halfvec) TO service_role;


--
-- Name: FUNCTION sum(public.vector); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.sum(public.vector) TO postgres;
GRANT ALL ON FUNCTION public.sum(public.vector) TO anon;
GRANT ALL ON FUNCTION public.sum(public.vector) TO authenticated;
GRANT ALL ON FUNCTION public.sum(public.vector) TO service_role;


--
-- Name: TABLE audit_log_entries; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.audit_log_entries TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.audit_log_entries TO postgres;
GRANT SELECT ON TABLE auth.audit_log_entries TO postgres WITH GRANT OPTION;


--
-- Name: TABLE custom_oauth_providers; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.custom_oauth_providers TO postgres;
GRANT ALL ON TABLE auth.custom_oauth_providers TO dashboard_user;


--
-- Name: TABLE flow_state; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.flow_state TO postgres;
GRANT SELECT ON TABLE auth.flow_state TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.flow_state TO dashboard_user;


--
-- Name: TABLE identities; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.identities TO postgres;
GRANT SELECT ON TABLE auth.identities TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.identities TO dashboard_user;


--
-- Name: TABLE instances; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.instances TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.instances TO postgres;
GRANT SELECT ON TABLE auth.instances TO postgres WITH GRANT OPTION;


--
-- Name: TABLE mfa_amr_claims; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.mfa_amr_claims TO postgres;
GRANT SELECT ON TABLE auth.mfa_amr_claims TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_amr_claims TO dashboard_user;


--
-- Name: TABLE mfa_challenges; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.mfa_challenges TO postgres;
GRANT SELECT ON TABLE auth.mfa_challenges TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_challenges TO dashboard_user;


--
-- Name: TABLE mfa_factors; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.mfa_factors TO postgres;
GRANT SELECT ON TABLE auth.mfa_factors TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_factors TO dashboard_user;


--
-- Name: TABLE oauth_authorizations; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.oauth_authorizations TO postgres;
GRANT ALL ON TABLE auth.oauth_authorizations TO dashboard_user;


--
-- Name: TABLE oauth_client_states; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.oauth_client_states TO postgres;
GRANT ALL ON TABLE auth.oauth_client_states TO dashboard_user;


--
-- Name: TABLE oauth_clients; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.oauth_clients TO postgres;
GRANT ALL ON TABLE auth.oauth_clients TO dashboard_user;


--
-- Name: TABLE oauth_consents; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.oauth_consents TO postgres;
GRANT ALL ON TABLE auth.oauth_consents TO dashboard_user;


--
-- Name: TABLE one_time_tokens; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.one_time_tokens TO postgres;
GRANT SELECT ON TABLE auth.one_time_tokens TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.one_time_tokens TO dashboard_user;


--
-- Name: TABLE refresh_tokens; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.refresh_tokens TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.refresh_tokens TO postgres;
GRANT SELECT ON TABLE auth.refresh_tokens TO postgres WITH GRANT OPTION;


--
-- Name: SEQUENCE refresh_tokens_id_seq; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON SEQUENCE auth.refresh_tokens_id_seq TO dashboard_user;
GRANT ALL ON SEQUENCE auth.refresh_tokens_id_seq TO postgres;


--
-- Name: TABLE saml_providers; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.saml_providers TO postgres;
GRANT SELECT ON TABLE auth.saml_providers TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.saml_providers TO dashboard_user;


--
-- Name: TABLE saml_relay_states; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.saml_relay_states TO postgres;
GRANT SELECT ON TABLE auth.saml_relay_states TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.saml_relay_states TO dashboard_user;


--
-- Name: TABLE schema_migrations; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT SELECT ON TABLE auth.schema_migrations TO postgres WITH GRANT OPTION;


--
-- Name: TABLE sessions; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.sessions TO postgres;
GRANT SELECT ON TABLE auth.sessions TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sessions TO dashboard_user;


--
-- Name: TABLE sso_domains; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.sso_domains TO postgres;
GRANT SELECT ON TABLE auth.sso_domains TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sso_domains TO dashboard_user;


--
-- Name: TABLE sso_providers; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.sso_providers TO postgres;
GRANT SELECT ON TABLE auth.sso_providers TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sso_providers TO dashboard_user;


--
-- Name: TABLE users; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.users TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.users TO postgres;
GRANT SELECT ON TABLE auth.users TO postgres WITH GRANT OPTION;


--
-- Name: TABLE webauthn_challenges; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.webauthn_challenges TO postgres;
GRANT ALL ON TABLE auth.webauthn_challenges TO dashboard_user;


--
-- Name: TABLE webauthn_credentials; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.webauthn_credentials TO postgres;
GRANT ALL ON TABLE auth.webauthn_credentials TO dashboard_user;


--
-- Name: TABLE pg_stat_statements; Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON TABLE extensions.pg_stat_statements FROM postgres;
GRANT ALL ON TABLE extensions.pg_stat_statements TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE extensions.pg_stat_statements TO dashboard_user;


--
-- Name: TABLE pg_stat_statements_info; Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON TABLE extensions.pg_stat_statements_info FROM postgres;
GRANT ALL ON TABLE extensions.pg_stat_statements_info TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE extensions.pg_stat_statements_info TO dashboard_user;


--
-- Name: TABLE barrios; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.barrios TO anon;
GRANT ALL ON TABLE public.barrios TO authenticated;
GRANT ALL ON TABLE public.barrios TO service_role;


--
-- Name: SEQUENCE barrios_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.barrios_id_seq TO anon;
GRANT ALL ON SEQUENCE public.barrios_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.barrios_id_seq TO service_role;


--
-- Name: TABLE campanas; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.campanas TO anon;
GRANT ALL ON TABLE public.campanas TO authenticated;
GRANT ALL ON TABLE public.campanas TO service_role;


--
-- Name: SEQUENCE campanas_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.campanas_id_seq TO anon;
GRANT ALL ON SEQUENCE public.campanas_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.campanas_id_seq TO service_role;


--
-- Name: TABLE caracteristicas_campana; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.caracteristicas_campana TO anon;
GRANT ALL ON TABLE public.caracteristicas_campana TO authenticated;
GRANT ALL ON TABLE public.caracteristicas_campana TO service_role;


--
-- Name: TABLE clientes; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.clientes TO anon;
GRANT ALL ON TABLE public.clientes TO authenticated;
GRANT ALL ON TABLE public.clientes TO service_role;


--
-- Name: SEQUENCE clientes_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.clientes_id_seq TO anon;
GRANT ALL ON SEQUENCE public.clientes_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.clientes_id_seq TO service_role;


--
-- Name: TABLE comunas; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.comunas TO anon;
GRANT ALL ON TABLE public.comunas TO authenticated;
GRANT ALL ON TABLE public.comunas TO service_role;


--
-- Name: SEQUENCE comunas_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.comunas_id_seq TO anon;
GRANT ALL ON SEQUENCE public.comunas_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.comunas_id_seq TO service_role;


--
-- Name: TABLE configuracion_integracion_plataforma; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.configuracion_integracion_plataforma TO anon;
GRANT ALL ON TABLE public.configuracion_integracion_plataforma TO authenticated;
GRANT ALL ON TABLE public.configuracion_integracion_plataforma TO service_role;


--
-- Name: TABLE configuracion_marca_plataforma; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.configuracion_marca_plataforma TO anon;
GRANT ALL ON TABLE public.configuracion_marca_plataforma TO authenticated;
GRANT ALL ON TABLE public.configuracion_marca_plataforma TO service_role;


--
-- Name: TABLE cuarentena_votantes; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.cuarentena_votantes TO anon;
GRANT ALL ON TABLE public.cuarentena_votantes TO authenticated;
GRANT ALL ON TABLE public.cuarentena_votantes TO service_role;


--
-- Name: SEQUENCE cuarentena_votantes_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.cuarentena_votantes_id_seq TO anon;
GRANT ALL ON SEQUENCE public.cuarentena_votantes_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.cuarentena_votantes_id_seq TO service_role;


--
-- Name: TABLE datos_trabajador_votante; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.datos_trabajador_votante TO anon;
GRANT ALL ON TABLE public.datos_trabajador_votante TO authenticated;
GRANT ALL ON TABLE public.datos_trabajador_votante TO service_role;


--
-- Name: SEQUENCE datos_trabajador_votante_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.datos_trabajador_votante_id_seq TO anon;
GRANT ALL ON SEQUENCE public.datos_trabajador_votante_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.datos_trabajador_votante_id_seq TO service_role;


--
-- Name: TABLE exportaciones_campana; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.exportaciones_campana TO anon;
GRANT ALL ON TABLE public.exportaciones_campana TO authenticated;
GRANT ALL ON TABLE public.exportaciones_campana TO service_role;


--
-- Name: SEQUENCE exportaciones_campana_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.exportaciones_campana_id_seq TO anon;
GRANT ALL ON SEQUENCE public.exportaciones_campana_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.exportaciones_campana_id_seq TO service_role;


--
-- Name: TABLE integraciones_campana; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.integraciones_campana TO anon;
GRANT ALL ON TABLE public.integraciones_campana TO authenticated;
GRANT ALL ON TABLE public.integraciones_campana TO service_role;


--
-- Name: SEQUENCE integraciones_campana_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.integraciones_campana_id_seq TO anon;
GRANT ALL ON SEQUENCE public.integraciones_campana_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.integraciones_campana_id_seq TO service_role;


--
-- Name: TABLE lugares_trabajo; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.lugares_trabajo TO anon;
GRANT ALL ON TABLE public.lugares_trabajo TO authenticated;
GRANT ALL ON TABLE public.lugares_trabajo TO service_role;


--
-- Name: SEQUENCE lugares_trabajo_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.lugares_trabajo_id_seq TO anon;
GRANT ALL ON SEQUENCE public.lugares_trabajo_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.lugares_trabajo_id_seq TO service_role;


--
-- Name: TABLE miembros_campana; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.miembros_campana TO anon;
GRANT ALL ON TABLE public.miembros_campana TO authenticated;
GRANT ALL ON TABLE public.miembros_campana TO service_role;


--
-- Name: SEQUENCE miembros_campana_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.miembros_campana_id_seq TO anon;
GRANT ALL ON SEQUENCE public.miembros_campana_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.miembros_campana_id_seq TO service_role;


--
-- Name: TABLE miembros_cliente; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.miembros_cliente TO anon;
GRANT ALL ON TABLE public.miembros_cliente TO authenticated;
GRANT ALL ON TABLE public.miembros_cliente TO service_role;


--
-- Name: SEQUENCE miembros_cliente_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.miembros_cliente_id_seq TO anon;
GRANT ALL ON SEQUENCE public.miembros_cliente_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.miembros_cliente_id_seq TO service_role;


--
-- Name: TABLE miembros_plataforma; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.miembros_plataforma TO anon;
GRANT ALL ON TABLE public.miembros_plataforma TO authenticated;
GRANT ALL ON TABLE public.miembros_plataforma TO service_role;


--
-- Name: TABLE novedades; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.novedades TO anon;
GRANT ALL ON TABLE public.novedades TO authenticated;
GRANT ALL ON TABLE public.novedades TO service_role;


--
-- Name: SEQUENCE novedades_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.novedades_id_seq TO anon;
GRANT ALL ON SEQUENCE public.novedades_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.novedades_id_seq TO service_role;


--
-- Name: TABLE procesos_electorales; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.procesos_electorales TO anon;
GRANT ALL ON TABLE public.procesos_electorales TO authenticated;
GRANT ALL ON TABLE public.procesos_electorales TO service_role;


--
-- Name: SEQUENCE procesos_electorales_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.procesos_electorales_id_seq TO anon;
GRANT ALL ON SEQUENCE public.procesos_electorales_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.procesos_electorales_id_seq TO service_role;


--
-- Name: TABLE puestos_votacion; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.puestos_votacion TO anon;
GRANT ALL ON TABLE public.puestos_votacion TO authenticated;
GRANT ALL ON TABLE public.puestos_votacion TO service_role;


--
-- Name: SEQUENCE puestos_votacion_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.puestos_votacion_id_seq TO anon;
GRANT ALL ON SEQUENCE public.puestos_votacion_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.puestos_votacion_id_seq TO service_role;


--
-- Name: TABLE recolectores_telegram; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.recolectores_telegram TO anon;
GRANT ALL ON TABLE public.recolectores_telegram TO authenticated;
GRANT ALL ON TABLE public.recolectores_telegram TO service_role;


--
-- Name: SEQUENCE recolectores_telegram_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.recolectores_telegram_id_seq TO anon;
GRANT ALL ON SEQUENCE public.recolectores_telegram_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.recolectores_telegram_id_seq TO service_role;


--
-- Name: TABLE registro_auditoria; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.registro_auditoria TO anon;
GRANT ALL ON TABLE public.registro_auditoria TO authenticated;
GRANT ALL ON TABLE public.registro_auditoria TO service_role;


--
-- Name: SEQUENCE registro_auditoria_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.registro_auditoria_id_seq TO anon;
GRANT ALL ON SEQUENCE public.registro_auditoria_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.registro_auditoria_id_seq TO service_role;


--
-- Name: TABLE roles; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.roles TO anon;
GRANT ALL ON TABLE public.roles TO authenticated;
GRANT ALL ON TABLE public.roles TO service_role;


--
-- Name: SEQUENCE roles_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.roles_id_seq TO anon;
GRANT ALL ON SEQUENCE public.roles_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.roles_id_seq TO service_role;


--
-- Name: TABLE sesiones_captura_telegram; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.sesiones_captura_telegram TO anon;
GRANT ALL ON TABLE public.sesiones_captura_telegram TO authenticated;
GRANT ALL ON TABLE public.sesiones_captura_telegram TO service_role;


--
-- Name: SEQUENCE sesiones_captura_telegram_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.sesiones_captura_telegram_id_seq TO anon;
GRANT ALL ON SEQUENCE public.sesiones_captura_telegram_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.sesiones_captura_telegram_id_seq TO service_role;


--
-- Name: TABLE sesiones_captura_whatsapp; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.sesiones_captura_whatsapp TO anon;
GRANT ALL ON TABLE public.sesiones_captura_whatsapp TO authenticated;
GRANT ALL ON TABLE public.sesiones_captura_whatsapp TO service_role;


--
-- Name: SEQUENCE sesiones_captura_whatsapp_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.sesiones_captura_whatsapp_id_seq TO anon;
GRANT ALL ON SEQUENCE public.sesiones_captura_whatsapp_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.sesiones_captura_whatsapp_id_seq TO service_role;


--
-- Name: TABLE tipos_novedad; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.tipos_novedad TO anon;
GRANT ALL ON TABLE public.tipos_novedad TO authenticated;
GRANT ALL ON TABLE public.tipos_novedad TO service_role;


--
-- Name: SEQUENCE tipos_novedad_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.tipos_novedad_id_seq TO anon;
GRANT ALL ON SEQUENCE public.tipos_novedad_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.tipos_novedad_id_seq TO service_role;


--
-- Name: TABLE uso_campana; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.uso_campana TO anon;
GRANT ALL ON TABLE public.uso_campana TO authenticated;
GRANT ALL ON TABLE public.uso_campana TO service_role;


--
-- Name: SEQUENCE uso_campana_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.uso_campana_id_seq TO anon;
GRANT ALL ON SEQUENCE public.uso_campana_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.uso_campana_id_seq TO service_role;


--
-- Name: TABLE verificaciones_registraduria; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.verificaciones_registraduria TO anon;
GRANT ALL ON TABLE public.verificaciones_registraduria TO authenticated;
GRANT ALL ON TABLE public.verificaciones_registraduria TO service_role;


--
-- Name: SEQUENCE verificaciones_registraduria_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.verificaciones_registraduria_id_seq TO anon;
GRANT ALL ON SEQUENCE public.verificaciones_registraduria_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.verificaciones_registraduria_id_seq TO service_role;


--
-- Name: TABLE votantes; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.votantes TO anon;
GRANT ALL ON TABLE public.votantes TO authenticated;
GRANT ALL ON TABLE public.votantes TO service_role;


--
-- Name: SEQUENCE votantes_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.votantes_id_seq TO anon;
GRANT ALL ON SEQUENCE public.votantes_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.votantes_id_seq TO service_role;


--
-- Name: TABLE messages; Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON TABLE realtime.messages TO postgres;
GRANT ALL ON TABLE realtime.messages TO dashboard_user;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO anon;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO authenticated;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO service_role;


--
-- Name: TABLE schema_migrations; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.schema_migrations TO postgres;
GRANT ALL ON TABLE realtime.schema_migrations TO dashboard_user;
GRANT SELECT ON TABLE realtime.schema_migrations TO anon;
GRANT SELECT ON TABLE realtime.schema_migrations TO authenticated;
GRANT SELECT ON TABLE realtime.schema_migrations TO service_role;
GRANT ALL ON TABLE realtime.schema_migrations TO supabase_realtime_admin;


--
-- Name: TABLE subscription; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.subscription TO postgres;
GRANT ALL ON TABLE realtime.subscription TO dashboard_user;
GRANT SELECT ON TABLE realtime.subscription TO anon;
GRANT SELECT ON TABLE realtime.subscription TO authenticated;
GRANT SELECT ON TABLE realtime.subscription TO service_role;
GRANT ALL ON TABLE realtime.subscription TO supabase_realtime_admin;


--
-- Name: SEQUENCE subscription_id_seq; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO postgres;
GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO dashboard_user;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO anon;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO service_role;
GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO supabase_realtime_admin;


--
-- Name: TABLE buckets; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

REVOKE ALL ON TABLE storage.buckets FROM supabase_storage_admin;
GRANT ALL ON TABLE storage.buckets TO supabase_storage_admin WITH GRANT OPTION;
GRANT ALL ON TABLE storage.buckets TO service_role;
GRANT ALL ON TABLE storage.buckets TO authenticated;
GRANT ALL ON TABLE storage.buckets TO anon;
GRANT ALL ON TABLE storage.buckets TO postgres WITH GRANT OPTION;


--
-- Name: TABLE buckets_analytics; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.buckets_analytics TO service_role;
GRANT ALL ON TABLE storage.buckets_analytics TO authenticated;
GRANT ALL ON TABLE storage.buckets_analytics TO anon;


--
-- Name: TABLE buckets_vectors; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT SELECT ON TABLE storage.buckets_vectors TO service_role;
GRANT SELECT ON TABLE storage.buckets_vectors TO authenticated;
GRANT SELECT ON TABLE storage.buckets_vectors TO anon;


--
-- Name: TABLE objects; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

REVOKE ALL ON TABLE storage.objects FROM supabase_storage_admin;
GRANT ALL ON TABLE storage.objects TO supabase_storage_admin WITH GRANT OPTION;
GRANT ALL ON TABLE storage.objects TO service_role;
GRANT ALL ON TABLE storage.objects TO authenticated;
GRANT ALL ON TABLE storage.objects TO anon;
GRANT ALL ON TABLE storage.objects TO postgres WITH GRANT OPTION;


--
-- Name: TABLE s3_multipart_uploads; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.s3_multipart_uploads TO service_role;
GRANT SELECT ON TABLE storage.s3_multipart_uploads TO authenticated;
GRANT SELECT ON TABLE storage.s3_multipart_uploads TO anon;


--
-- Name: TABLE s3_multipart_uploads_parts; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.s3_multipart_uploads_parts TO service_role;
GRANT SELECT ON TABLE storage.s3_multipart_uploads_parts TO authenticated;
GRANT SELECT ON TABLE storage.s3_multipart_uploads_parts TO anon;


--
-- Name: TABLE vector_indexes; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT SELECT ON TABLE storage.vector_indexes TO service_role;
GRANT SELECT ON TABLE storage.vector_indexes TO authenticated;
GRANT SELECT ON TABLE storage.vector_indexes TO anon;


--
-- Name: TABLE secrets; Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT SELECT,REFERENCES,DELETE,TRUNCATE ON TABLE vault.secrets TO postgres WITH GRANT OPTION;
GRANT SELECT,DELETE ON TABLE vault.secrets TO service_role;


--
-- Name: TABLE decrypted_secrets; Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT SELECT,REFERENCES,DELETE,TRUNCATE ON TABLE vault.decrypted_secrets TO postgres WITH GRANT OPTION;
GRANT SELECT,DELETE ON TABLE vault.decrypted_secrets TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON SEQUENCES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON FUNCTIONS TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON TABLES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON SEQUENCES TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON FUNCTIONS TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON TABLES TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON SEQUENCES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON FUNCTIONS TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON TABLES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO service_role;


--
-- Name: issue_graphql_placeholder; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_graphql_placeholder ON sql_drop
         WHEN TAG IN ('DROP EXTENSION')
   EXECUTE FUNCTION extensions.set_graphql_placeholder();


ALTER EVENT TRIGGER issue_graphql_placeholder OWNER TO supabase_admin;

--
-- Name: issue_pg_cron_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_cron_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_cron_access();


ALTER EVENT TRIGGER issue_pg_cron_access OWNER TO supabase_admin;

--
-- Name: issue_pg_graphql_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_graphql_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_graphql_access();


ALTER EVENT TRIGGER issue_pg_graphql_access OWNER TO supabase_admin;

--
-- Name: issue_pg_net_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_net_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_net_access();


ALTER EVENT TRIGGER issue_pg_net_access OWNER TO supabase_admin;

--
-- Name: pgrst_ddl_watch; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER pgrst_ddl_watch ON ddl_command_end
   EXECUTE FUNCTION extensions.pgrst_ddl_watch();


ALTER EVENT TRIGGER pgrst_ddl_watch OWNER TO supabase_admin;

--
-- Name: pgrst_drop_watch; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER pgrst_drop_watch ON sql_drop
   EXECUTE FUNCTION extensions.pgrst_drop_watch();


ALTER EVENT TRIGGER pgrst_drop_watch OWNER TO supabase_admin;

--
-- PostgreSQL database dump complete
--

\unrestrict yI56ORYt5V4stQ6GPG4jZWkDLVcstu8WXPLHQeu99tzoRaKfUq9725kCBe1faW1

