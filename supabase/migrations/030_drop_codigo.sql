-- 030_drop_codigo.sql
-- Elimina la columna codigo, sus triggers, índices y la función asignar_codigo_serial.
-- El campo id (bigint secuencial) reemplaza a codigo como identificador visible.

BEGIN;

-- ============================================================================
-- PHASE 1: Drop triggers que usan asignar_codigo_serial
-- ============================================================================

DROP TRIGGER IF EXISTS comunas_asignar_codigo ON comunas;
DROP TRIGGER IF EXISTS barrios_asignar_codigo ON barrios;
DROP TRIGGER IF EXISTS puestos_asignar_codigo ON puestos_votacion;
DROP TRIGGER IF EXISTS roles_asignar_codigo ON roles;
DROP TRIGGER IF EXISTS tipos_novedad_asignar_codigo ON tipos_novedad;
DROP TRIGGER IF EXISTS lugares_trabajo_asignar_codigo ON lugares_trabajo;
DROP TRIGGER IF EXISTS clientes_asignar_codigo ON clientes;
DROP TRIGGER IF EXISTS procesos_electorales_asignar_codigo ON procesos_electorales;
DROP TRIGGER IF EXISTS campanas_asignar_codigo ON campanas;

-- ============================================================================
-- PHASE 2: Drop the function
-- ============================================================================

DROP FUNCTION IF EXISTS asignar_codigo_serial();

-- ============================================================================
-- PHASE 3: Drop unique indexes on codigo
-- ============================================================================

DROP INDEX IF EXISTS comunas_campana_codigo_unique;
DROP INDEX IF EXISTS barrios_comuna_codigo_unique;
DROP INDEX IF EXISTS puestos_campana_codigo_unique;
DROP INDEX IF EXISTS roles_campana_codigo_unique;
DROP INDEX IF EXISTS tipos_novedad_campana_codigo_unique;
DROP INDEX IF EXISTS lugares_trabajo_campana_codigo_unique;
DROP INDEX IF EXISTS clientes_codigo_unique;
DROP INDEX IF EXISTS procesos_electorales_codigo_unique;
DROP INDEX IF EXISTS campanas_codigo_unique;

-- ============================================================================
-- PHASE 4: Drop codigo columns
-- ============================================================================

ALTER TABLE comunas DROP COLUMN IF EXISTS codigo;
ALTER TABLE barrios DROP COLUMN IF EXISTS codigo;
ALTER TABLE puestos_votacion DROP COLUMN IF EXISTS codigo;
ALTER TABLE roles DROP COLUMN IF EXISTS codigo;
ALTER TABLE tipos_novedad DROP COLUMN IF EXISTS codigo;
ALTER TABLE lugares_trabajo DROP COLUMN IF EXISTS codigo;
ALTER TABLE clientes DROP COLUMN IF EXISTS codigo;
ALTER TABLE procesos_electorales DROP COLUMN IF EXISTS codigo;
ALTER TABLE campanas DROP COLUMN IF EXISTS codigo;

COMMIT;
