-- Rol organizacional del recolector Telegram (define qué niveles puede registrar).

ALTER TABLE recolectores_telegram
  ADD COLUMN IF NOT EXISTS id_rol uuid REFERENCES roles (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS recolectores_telegram_id_rol_idx
  ON recolectores_telegram (id_rol);

COMMENT ON COLUMN recolectores_telegram.id_rol IS
  'Cargo del recolector en la campaña. Solo puede registrar votantes con jerarquía inferior.';
