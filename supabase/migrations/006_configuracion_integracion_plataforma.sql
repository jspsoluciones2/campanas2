-- Configuración global de APIs (Capsolver, IA) — solo dueños de plataforma.

CREATE TABLE configuracion_integracion_plataforma (
  proveedor proveedor_integracion PRIMARY KEY,
  configuracion jsonb NOT NULL DEFAULT '{}'::jsonb,
  activa boolean NOT NULL DEFAULT true,
  creado_en timestamptz NOT NULL DEFAULT now(),
  actualizado_en timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT configuracion_integracion_plataforma_proveedor_check CHECK (
    proveedor IN ('resolutor_captcha', 'ia_e14')
  )
);

CREATE TRIGGER configuracion_integracion_plataforma_actualizado_en
  BEFORE UPDATE ON configuracion_integracion_plataforma
  FOR EACH ROW EXECUTE FUNCTION establecer_actualizado_en();

ALTER TABLE configuracion_integracion_plataforma ENABLE ROW LEVEL SECURITY;

CREATE POLICY configuracion_integracion_plataforma_select
  ON configuracion_integracion_plataforma
  FOR SELECT TO authenticated
  USING (es_dueno_plataforma());

CREATE POLICY configuracion_integracion_plataforma_write
  ON configuracion_integracion_plataforma
  FOR ALL TO authenticated
  USING (es_dueno_plataforma())
  WITH CHECK (es_dueno_plataforma());
