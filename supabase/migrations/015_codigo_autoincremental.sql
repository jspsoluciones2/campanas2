-- IDs de catálogo y maestras autoincrementales (entero por ámbito).
-- Requiere 014_catalogos_codigo.sql aplicada previamente (o columnas codigo existentes).

DROP INDEX IF EXISTS comunas_campana_codigo_unique;
DROP INDEX IF EXISTS barrios_comuna_codigo_unique;
DROP INDEX IF EXISTS puestos_campana_codigo_unique;
DROP INDEX IF EXISTS roles_campana_codigo_unique;
DROP INDEX IF EXISTS tipos_novedad_campana_codigo_unique;
DROP INDEX IF EXISTS lugares_trabajo_campana_codigo_unique;

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
    USING (to_jsonb(NEW) ->> scope_col)::uuid;
  END IF;

  RETURN NEW;
END;
$$;

-- Comunas (por campaña)
ALTER TABLE comunas ADD COLUMN IF NOT EXISTS codigo_int integer;

UPDATE comunas c
SET codigo_int = sub.rn
FROM (
  SELECT id, ROW_NUMBER() OVER (
    PARTITION BY id_campana ORDER BY creado_en, id
  )::integer AS rn
  FROM comunas
) sub
WHERE c.id = sub.id AND c.codigo_int IS NULL;

ALTER TABLE comunas DROP COLUMN IF EXISTS codigo;
ALTER TABLE comunas DROP COLUMN IF EXISTS numero;
ALTER TABLE comunas RENAME COLUMN codigo_int TO codigo;
ALTER TABLE comunas ALTER COLUMN codigo SET NOT NULL;
CREATE UNIQUE INDEX comunas_campana_codigo_unique ON comunas (id_campana, codigo);

DROP TRIGGER IF EXISTS comunas_asignar_codigo ON comunas;
CREATE TRIGGER comunas_asignar_codigo
  BEFORE INSERT ON comunas
  FOR EACH ROW EXECUTE FUNCTION asignar_codigo_serial('id_campana');

-- Barrios (por comuna)
ALTER TABLE barrios ADD COLUMN IF NOT EXISTS codigo_int integer;

UPDATE barrios b
SET codigo_int = sub.rn
FROM (
  SELECT id, ROW_NUMBER() OVER (
    PARTITION BY id_comuna ORDER BY creado_en, id
  )::integer AS rn
  FROM barrios
) sub
WHERE b.id = sub.id AND b.codigo_int IS NULL;

ALTER TABLE barrios DROP COLUMN IF EXISTS codigo;
ALTER TABLE barrios RENAME COLUMN codigo_int TO codigo;
ALTER TABLE barrios ALTER COLUMN codigo SET NOT NULL;
CREATE UNIQUE INDEX barrios_comuna_codigo_unique ON barrios (id_comuna, codigo);

DROP TRIGGER IF EXISTS barrios_asignar_codigo ON barrios;
CREATE TRIGGER barrios_asignar_codigo
  BEFORE INSERT ON barrios
  FOR EACH ROW EXECUTE FUNCTION asignar_codigo_serial('id_comuna');

-- Puestos de votación (por campaña)
ALTER TABLE puestos_votacion ADD COLUMN IF NOT EXISTS codigo_int integer;

UPDATE puestos_votacion p
SET codigo_int = sub.rn
FROM (
  SELECT id, ROW_NUMBER() OVER (
    PARTITION BY id_campana ORDER BY creado_en, id
  )::integer AS rn
  FROM puestos_votacion
) sub
WHERE p.id = sub.id AND p.codigo_int IS NULL;

ALTER TABLE puestos_votacion DROP COLUMN IF EXISTS codigo;
ALTER TABLE puestos_votacion DROP COLUMN IF EXISTS id_puesto;
ALTER TABLE puestos_votacion DROP COLUMN IF EXISTS codigo_registraduria;
ALTER TABLE puestos_votacion RENAME COLUMN codigo_int TO codigo;
ALTER TABLE puestos_votacion ALTER COLUMN codigo SET NOT NULL;
CREATE UNIQUE INDEX puestos_campana_codigo_unique ON puestos_votacion (id_campana, codigo);

DROP TRIGGER IF EXISTS puestos_asignar_codigo ON puestos_votacion;
CREATE TRIGGER puestos_asignar_codigo
  BEFORE INSERT ON puestos_votacion
  FOR EACH ROW EXECUTE FUNCTION asignar_codigo_serial('id_campana');

-- Roles (por campaña)
ALTER TABLE roles ADD COLUMN IF NOT EXISTS codigo_int integer;

UPDATE roles r
SET codigo_int = sub.rn
FROM (
  SELECT id, ROW_NUMBER() OVER (
    PARTITION BY id_campana ORDER BY creado_en, id
  )::integer AS rn
  FROM roles
) sub
WHERE r.id = sub.id AND r.codigo_int IS NULL;

ALTER TABLE roles DROP COLUMN IF EXISTS codigo;
ALTER TABLE roles RENAME COLUMN codigo_int TO codigo;
ALTER TABLE roles ALTER COLUMN codigo SET NOT NULL;
CREATE UNIQUE INDEX roles_campana_codigo_unique ON roles (id_campana, codigo);

DROP TRIGGER IF EXISTS roles_asignar_codigo ON roles;
CREATE TRIGGER roles_asignar_codigo
  BEFORE INSERT ON roles
  FOR EACH ROW EXECUTE FUNCTION asignar_codigo_serial('id_campana');

-- Tipos de novedad (por campaña)
ALTER TABLE tipos_novedad ADD COLUMN IF NOT EXISTS codigo_int integer;

UPDATE tipos_novedad t
SET codigo_int = sub.rn
FROM (
  SELECT id, ROW_NUMBER() OVER (
    PARTITION BY id_campana ORDER BY creado_en, id
  )::integer AS rn
  FROM tipos_novedad
) sub
WHERE t.id = sub.id AND t.codigo_int IS NULL;

ALTER TABLE tipos_novedad DROP COLUMN IF EXISTS codigo;
ALTER TABLE tipos_novedad RENAME COLUMN codigo_int TO codigo;
ALTER TABLE tipos_novedad ALTER COLUMN codigo SET NOT NULL;
CREATE UNIQUE INDEX tipos_novedad_campana_codigo_unique ON tipos_novedad (id_campana, codigo);

DROP TRIGGER IF EXISTS tipos_novedad_asignar_codigo ON tipos_novedad;
CREATE TRIGGER tipos_novedad_asignar_codigo
  BEFORE INSERT ON tipos_novedad
  FOR EACH ROW EXECUTE FUNCTION asignar_codigo_serial('id_campana');

-- Lugares de trabajo (por campaña)
ALTER TABLE lugares_trabajo ADD COLUMN IF NOT EXISTS codigo_int integer;

UPDATE lugares_trabajo l
SET codigo_int = sub.rn
FROM (
  SELECT id, ROW_NUMBER() OVER (
    PARTITION BY id_campana ORDER BY creado_en, id
  )::integer AS rn
  FROM lugares_trabajo
) sub
WHERE l.id = sub.id AND l.codigo_int IS NULL;

ALTER TABLE lugares_trabajo DROP COLUMN IF EXISTS codigo;
ALTER TABLE lugares_trabajo RENAME COLUMN codigo_int TO codigo;
ALTER TABLE lugares_trabajo ALTER COLUMN codigo SET NOT NULL;
CREATE UNIQUE INDEX lugares_trabajo_campana_codigo_unique ON lugares_trabajo (id_campana, codigo);

DROP TRIGGER IF EXISTS lugares_trabajo_asignar_codigo ON lugares_trabajo;
CREATE TRIGGER lugares_trabajo_asignar_codigo
  BEFORE INSERT ON lugares_trabajo
  FOR EACH ROW EXECUTE FUNCTION asignar_codigo_serial('id_campana');

-- Maestras de plataforma (secuencia global por tabla)
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS codigo integer;
UPDATE clientes c
SET codigo = sub.rn
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY creado_en, id)::integer AS rn
  FROM clientes
) sub
WHERE c.id = sub.id AND c.codigo IS NULL;
ALTER TABLE clientes ALTER COLUMN codigo SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS clientes_codigo_unique ON clientes (codigo);

DROP TRIGGER IF EXISTS clientes_asignar_codigo ON clientes;
CREATE TRIGGER clientes_asignar_codigo
  BEFORE INSERT ON clientes
  FOR EACH ROW EXECUTE FUNCTION asignar_codigo_serial('');

ALTER TABLE procesos_electorales ADD COLUMN IF NOT EXISTS codigo integer;
UPDATE procesos_electorales p
SET codigo = sub.rn
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY creado_en, id)::integer AS rn
  FROM procesos_electorales
) sub
WHERE p.id = sub.id AND p.codigo IS NULL;
ALTER TABLE procesos_electorales ALTER COLUMN codigo SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS procesos_electorales_codigo_unique ON procesos_electorales (codigo);

DROP TRIGGER IF EXISTS procesos_electorales_asignar_codigo ON procesos_electorales;
CREATE TRIGGER procesos_electorales_asignar_codigo
  BEFORE INSERT ON procesos_electorales
  FOR EACH ROW EXECUTE FUNCTION asignar_codigo_serial('');

ALTER TABLE campanas ADD COLUMN IF NOT EXISTS codigo integer;
UPDATE campanas c
SET codigo = sub.rn
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY creado_en, id)::integer AS rn
  FROM campanas
) sub
WHERE c.id = sub.id AND c.codigo IS NULL;
ALTER TABLE campanas ALTER COLUMN codigo SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS campanas_codigo_unique ON campanas (codigo);

DROP TRIGGER IF EXISTS campanas_asignar_codigo ON campanas;
CREATE TRIGGER campanas_asignar_codigo
  BEFORE INSERT ON campanas
  FOR EACH ROW EXECUTE FUNCTION asignar_codigo_serial('');

COMMENT ON COLUMN comunas.codigo IS 'ID autoincremental por campaña.';
COMMENT ON COLUMN barrios.codigo IS 'ID autoincremental por comuna.';
COMMENT ON COLUMN puestos_votacion.codigo IS 'ID autoincremental por campaña.';
COMMENT ON COLUMN roles.codigo IS 'ID autoincremental por campaña.';
COMMENT ON COLUMN tipos_novedad.codigo IS 'ID autoincremental por campaña.';
COMMENT ON COLUMN lugares_trabajo.codigo IS 'ID autoincremental por campaña.';
COMMENT ON COLUMN clientes.codigo IS 'ID autoincremental global de la plataforma.';
COMMENT ON COLUMN procesos_electorales.codigo IS 'ID autoincremental global de la plataforma.';
COMMENT ON COLUMN campanas.codigo IS 'ID autoincremental global de la plataforma.';
