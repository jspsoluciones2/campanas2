-- Recolectores Telegram sin cuenta en la plataforma (solo código de campaña).

ALTER TABLE recolectores_telegram
  ALTER COLUMN id_usuario DROP NOT NULL;

ALTER TABLE recolectores_telegram
  DROP CONSTRAINT IF EXISTS recolectores_telegram_id_campana_id_usuario_key;

CREATE UNIQUE INDEX recolectores_telegram_usuario_unico
  ON recolectores_telegram (id_campana, id_usuario)
  WHERE id_usuario IS NOT NULL;

COMMENT ON COLUMN recolectores_telegram.id_usuario IS
  'Usuario de plataforma opcional; los recolectores por Telegram suelen usar solo telegram_user_id.';
