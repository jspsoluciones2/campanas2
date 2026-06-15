-- Políticas de escritura para captura Telegram (Flask usa service_role y omite RLS).
-- Complementa 018_captura_telegram.sql si ya está aplicada.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'recolectores_telegram'
      AND policyname = 'recolectores_telegram_plataforma_write'
  ) THEN
    CREATE POLICY recolectores_telegram_plataforma_write ON recolectores_telegram
      FOR ALL TO authenticated
      USING (es_dueno_plataforma())
      WITH CHECK (es_dueno_plataforma());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'sesiones_captura_telegram'
      AND policyname = 'sesiones_captura_telegram_plataforma_write'
  ) THEN
    CREATE POLICY sesiones_captura_telegram_plataforma_write ON sesiones_captura_telegram
      FOR ALL TO authenticated
      USING (es_dueno_plataforma())
      WITH CHECK (es_dueno_plataforma());
  END IF;
END $$;
