-- Estado inicial "registrado" para votantes capturados; duplicados van a cuarentena_votantes.
-- Requiere 002_domain_schema.sql aplicada previamente.

ALTER TYPE estado_votante ADD VALUE IF NOT EXISTS 'registrado';

UPDATE votantes
SET estado = 'registrado'
WHERE estado = 'pendiente_verificacion';

ALTER TABLE votantes
  ALTER COLUMN estado SET DEFAULT 'registrado';

DROP INDEX IF EXISTS votantes_documento_activo_unico;

CREATE UNIQUE INDEX votantes_documento_activo_unico
  ON votantes (id_campana, documento, tipo_documento)
  WHERE estado IN ('activo', 'registrado', 'pendiente_verificacion');
