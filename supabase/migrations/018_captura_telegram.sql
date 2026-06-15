-- Captura de votantes vía bot Telegram por campaña.
-- Requiere 001_platform_core.sql y 002_domain_schema.sql.

CREATE TABLE recolectores_telegram (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_campana uuid NOT NULL REFERENCES campanas (id) ON DELETE CASCADE,
  id_usuario uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  telegram_user_id bigint NOT NULL,
  telegram_username text,
  creado_en timestamptz NOT NULL DEFAULT now(),
  UNIQUE (id_campana, telegram_user_id),
  UNIQUE (id_campana, id_usuario)
);

CREATE INDEX recolectores_telegram_campana_idx ON recolectores_telegram (id_campana);

CREATE TABLE sesiones_captura_telegram (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_campana uuid NOT NULL REFERENCES campanas (id) ON DELETE CASCADE,
  chat_id bigint NOT NULL,
  telegram_user_id bigint NOT NULL,
  id_usuario uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  paso text NOT NULL DEFAULT 'inicio',
  datos_parciales jsonb NOT NULL DEFAULT '{}'::jsonb,
  creado_en timestamptz NOT NULL DEFAULT now(),
  actualizado_en timestamptz NOT NULL DEFAULT now(),
  UNIQUE (id_campana, chat_id)
);

CREATE INDEX sesiones_captura_telegram_campana_idx
  ON sesiones_captura_telegram (id_campana);

CREATE TRIGGER sesiones_captura_telegram_actualizado_en
  BEFORE UPDATE ON sesiones_captura_telegram
  FOR EACH ROW EXECUTE FUNCTION establecer_actualizado_en();

ALTER TABLE recolectores_telegram ENABLE ROW LEVEL SECURITY;
ALTER TABLE sesiones_captura_telegram ENABLE ROW LEVEL SECURITY;

CREATE POLICY recolectores_telegram_select ON recolectores_telegram
  FOR SELECT TO authenticated
  USING (puede_leer_campana(id_campana));

CREATE POLICY sesiones_captura_telegram_select ON sesiones_captura_telegram
  FOR SELECT TO authenticated
  USING (puede_leer_campana(id_campana));
