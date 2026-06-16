-- Novedad de gestión en votantes (no se captura en registro; la completa el equipo en web).

ALTER TABLE votantes
  ADD COLUMN IF NOT EXISTS id_tipo_novedad uuid REFERENCES tipos_novedad (id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS detalle_novedad text;

CREATE INDEX IF NOT EXISTS votantes_id_tipo_novedad_idx ON votantes (id_tipo_novedad);

COMMENT ON COLUMN votantes.id_tipo_novedad IS
  'Tipo de novedad asignado por gestión web ante irregularidades en el votante.';
COMMENT ON COLUMN votantes.detalle_novedad IS
  'Detalle libre de la novedad; lo completa el gestor en la web.';
