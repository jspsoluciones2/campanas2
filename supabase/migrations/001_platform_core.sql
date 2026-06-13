-- Phase 1: platform-core — tenants, campañas, integraciones, auditoría

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enums
CREATE TYPE campaign_status AS ENUM ('active', 'paused', 'ended', 'purged');
CREATE TYPE platform_role AS ENUM ('platform_owner');
CREATE TYPE campaign_role AS ENUM (
  'campaign_admin',
  'supervisor',
  'collector',
  'lawyer'
);
CREATE TYPE integration_provider AS ENUM (
  'twilio',
  'captcha_solver',
  'telegram',
  'e14_ai'
);

-- Procesos electorales (agrupa campañas para E14 compartido)
CREATE TABLE electoral_processes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  election_date date,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Clientes recurrentes (políticos)
CREATE TABLE clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  contact_email text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Campañas (silo operativo por elección)
CREATE TABLE campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients (id) ON DELETE RESTRICT,
  electoral_process_id uuid NOT NULL REFERENCES electoral_processes (id) ON DELETE RESTRICT,
  name text NOT NULL,
  status campaign_status NOT NULL DEFAULT 'active',
  started_at timestamptz,
  ended_at timestamptz,
  purged_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX campaigns_client_id_idx ON campaigns (client_id);
CREATE INDEX campaigns_status_idx ON campaigns (status);

-- Dueños del SaaS
CREATE TABLE platform_members (
  user_id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  role platform_role NOT NULL DEFAULT 'platform_owner',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Usuarios asignados a campaña
CREATE TABLE campaign_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES campaigns (id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  role campaign_role NOT NULL DEFAULT 'collector',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (campaign_id, user_id)
);

CREATE INDEX campaign_members_user_id_idx ON campaign_members (user_id);

-- Vínculo opcional usuario ↔ cliente (re-asignación)
CREATE TABLE client_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients (id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (client_id, user_id)
);

-- Feature flags por campaña
CREATE TABLE campaign_features (
  campaign_id uuid PRIMARY KEY REFERENCES campaigns (id) ON DELETE CASCADE,
  captcha_solver boolean NOT NULL DEFAULT false,
  e14_audit boolean NOT NULL DEFAULT false,
  whatsapp boolean NOT NULL DEFAULT false,
  telegram boolean NOT NULL DEFAULT false,
  web_capture boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Credenciales por campaña (cifrar en app; columna preparada para secrets)
CREATE TABLE campaign_integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES campaigns (id) ON DELETE CASCADE,
  provider integration_provider NOT NULL,
  config_encrypted text NOT NULL DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (campaign_id, provider)
);

-- Consumo interno — solo platform_owner
CREATE TABLE campaign_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES campaigns (id) ON DELETE CASCADE,
  provider integration_provider NOT NULL,
  metric text NOT NULL,
  quantity numeric NOT NULL DEFAULT 0,
  period_start timestamptz,
  period_end timestamptz,
  recorded_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX campaign_usage_campaign_id_idx ON campaign_usage (campaign_id);

-- Exportaciones generadas al cierre
CREATE TABLE campaign_exports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES campaigns (id) ON DELETE CASCADE,
  exported_by uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  storage_path text NOT NULL,
  file_size bigint,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Branding global de la plataforma (singleton)
CREATE TABLE platform_brand_config (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  logo_url text,
  primary_color text DEFAULT '#1e40af',
  secondary_color text DEFAULT '#64748b',
  font_family text DEFAULT 'Inter',
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO platform_brand_config (id) VALUES (1);

-- Auditoría global
CREATE TABLE audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  campaign_id uuid REFERENCES campaigns (id) ON DELETE SET NULL,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX audit_log_campaign_id_idx ON audit_log (campaign_id);
CREATE INDEX audit_log_created_at_idx ON audit_log (created_at DESC);

-- Triggers updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER campaigns_updated_at
  BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER campaign_features_updated_at
  BEFORE UPDATE ON campaign_features
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER campaign_integrations_updated_at
  BEFORE UPDATE ON campaign_integrations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER platform_brand_config_updated_at
  BEFORE UPDATE ON platform_brand_config
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Auto-crear campaign_features al insertar campaña
CREATE OR REPLACE FUNCTION create_campaign_features()
RETURNS trigger AS $$
BEGIN
  INSERT INTO campaign_features (campaign_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER campaigns_create_features
  AFTER INSERT ON campaigns
  FOR EACH ROW EXECUTE FUNCTION create_campaign_features();

-- Helpers RLS
CREATE OR REPLACE FUNCTION is_platform_owner()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM platform_members
    WHERE user_id = auth.uid()
      AND role = 'platform_owner'
  );
$$;

CREATE OR REPLACE FUNCTION user_campaign_ids()
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT campaign_id
  FROM campaign_members
  WHERE user_id = auth.uid();
$$;

-- RLS
ALTER TABLE electoral_processes ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_brand_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- electoral_processes
CREATE POLICY electoral_processes_select ON electoral_processes
  FOR SELECT TO authenticated
  USING (
    is_platform_owner()
    OR EXISTS (
      SELECT 1
      FROM campaigns c
      JOIN campaign_members cm ON cm.campaign_id = c.id
      WHERE c.electoral_process_id = electoral_processes.id
        AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY electoral_processes_write ON electoral_processes
  FOR ALL TO authenticated
  USING (is_platform_owner())
  WITH CHECK (is_platform_owner());

-- clients
CREATE POLICY clients_platform ON clients
  FOR ALL TO authenticated
  USING (is_platform_owner())
  WITH CHECK (is_platform_owner());

-- campaigns
CREATE POLICY campaigns_select ON campaigns
  FOR SELECT TO authenticated
  USING (
    is_platform_owner()
    OR id IN (SELECT user_campaign_ids())
  );

CREATE POLICY campaigns_write ON campaigns
  FOR ALL TO authenticated
  USING (is_platform_owner())
  WITH CHECK (is_platform_owner());

-- platform_members
CREATE POLICY platform_members_select ON platform_members
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR is_platform_owner());

CREATE POLICY platform_members_write ON platform_members
  FOR ALL TO authenticated
  USING (is_platform_owner())
  WITH CHECK (is_platform_owner());

-- campaign_members
CREATE POLICY campaign_members_select ON campaign_members
  FOR SELECT TO authenticated
  USING (
    is_platform_owner()
    OR campaign_id IN (SELECT user_campaign_ids())
  );

CREATE POLICY campaign_members_write ON campaign_members
  FOR ALL TO authenticated
  USING (is_platform_owner())
  WITH CHECK (is_platform_owner());

-- client_members
CREATE POLICY client_members_platform ON client_members
  FOR ALL TO authenticated
  USING (is_platform_owner())
  WITH CHECK (is_platform_owner());

-- campaign_features
CREATE POLICY campaign_features_select ON campaign_features
  FOR SELECT TO authenticated
  USING (
    is_platform_owner()
    OR campaign_id IN (SELECT user_campaign_ids())
  );

CREATE POLICY campaign_features_write ON campaign_features
  FOR ALL TO authenticated
  USING (is_platform_owner())
  WITH CHECK (is_platform_owner());

-- campaign_integrations (solo dueños)
CREATE POLICY campaign_integrations_platform ON campaign_integrations
  FOR ALL TO authenticated
  USING (is_platform_owner())
  WITH CHECK (is_platform_owner());

-- campaign_usage (solo dueños)
CREATE POLICY campaign_usage_platform ON campaign_usage
  FOR ALL TO authenticated
  USING (is_platform_owner())
  WITH CHECK (is_platform_owner());

-- campaign_exports
CREATE POLICY campaign_exports_select ON campaign_exports
  FOR SELECT TO authenticated
  USING (
    is_platform_owner()
    OR (
      campaign_id IN (SELECT user_campaign_ids())
      AND EXISTS (
        SELECT 1 FROM campaigns c
        WHERE c.id = campaign_exports.campaign_id
          AND c.status IN ('ended', 'purged')
      )
    )
  );

CREATE POLICY campaign_exports_write ON campaign_exports
  FOR ALL TO authenticated
  USING (is_platform_owner())
  WITH CHECK (is_platform_owner());

-- platform_brand_config
CREATE POLICY platform_brand_select ON platform_brand_config
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY platform_brand_write ON platform_brand_config
  FOR ALL TO authenticated
  USING (is_platform_owner())
  WITH CHECK (is_platform_owner());

-- audit_log
CREATE POLICY audit_log_select ON audit_log
  FOR SELECT TO authenticated
  USING (
    is_platform_owner()
    OR (
      campaign_id IS NOT NULL
      AND campaign_id IN (SELECT user_campaign_ids())
    )
  );

CREATE POLICY audit_log_insert ON audit_log
  FOR INSERT TO authenticated
  WITH CHECK (
    is_platform_owner()
    OR (
      campaign_id IS NOT NULL
      AND campaign_id IN (SELECT user_campaign_ids())
    )
  );
