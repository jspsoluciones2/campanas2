-- ID de catálogo unificado en columna `codigo` para todos los maestros de campaña.
-- Idempotente. Requiere 002_domain_schema.sql y migraciones 011-013 aplicadas.

-- Comunas: numero → codigo
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'comunas' AND column_name = 'numero'
  ) THEN
    ALTER TABLE comunas RENAME COLUMN numero TO codigo;
  END IF;
END $$;

-- Puestos: id_puesto o codigo_registraduria → codigo
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'puestos_votacion' AND column_name = 'id_puesto'
  ) THEN
    ALTER TABLE puestos_votacion RENAME COLUMN id_puesto TO codigo;
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'puestos_votacion' AND column_name = 'codigo_registraduria'
  ) THEN
    ALTER TABLE puestos_votacion RENAME COLUMN codigo_registraduria TO codigo;
  END IF;
END $$;

ALTER TABLE barrios ADD COLUMN IF NOT EXISTS codigo text;
ALTER TABLE roles ADD COLUMN IF NOT EXISTS codigo text;
ALTER TABLE tipos_novedad ADD COLUMN IF NOT EXISTS codigo text;
ALTER TABLE lugares_trabajo ADD COLUMN IF NOT EXISTS codigo text;

CREATE UNIQUE INDEX IF NOT EXISTS comunas_campana_codigo_unique
  ON comunas (id_campana, codigo)
  WHERE codigo IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS barrios_comuna_codigo_unique
  ON barrios (id_comuna, codigo)
  WHERE codigo IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS puestos_campana_codigo_unique
  ON puestos_votacion (id_campana, codigo)
  WHERE codigo IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS roles_campana_codigo_unique
  ON roles (id_campana, codigo)
  WHERE codigo IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS tipos_novedad_campana_codigo_unique
  ON tipos_novedad (id_campana, codigo)
  WHERE codigo IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS lugares_trabajo_campana_codigo_unique
  ON lugares_trabajo (id_campana, codigo)
  WHERE codigo IS NOT NULL;

COMMENT ON COLUMN comunas.codigo IS 'Identificador de la comuna en la campaña.';
COMMENT ON COLUMN barrios.codigo IS 'Identificador del barrio dentro de la comuna.';
COMMENT ON COLUMN puestos_votacion.codigo IS 'Identificador del puesto de votación en la campaña.';
COMMENT ON COLUMN roles.codigo IS 'Identificador del rol en la campaña.';
COMMENT ON COLUMN tipos_novedad.codigo IS 'Identificador del tipo de novedad en la campaña.';
COMMENT ON COLUMN lugares_trabajo.codigo IS 'Identificador del lugar de trabajo en la campaña.';
