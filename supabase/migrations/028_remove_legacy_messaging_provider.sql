-- Elimina el proveedor histórico de mensajería sin afectar los demás proveedores.
BEGIN;

DELETE FROM uso_campana
WHERE proveedor::text NOT IN ('resolutor_captcha', 'telegram', 'ia_e14', 'supabase');

DELETE FROM integraciones_campana
WHERE proveedor::text NOT IN ('resolutor_captcha', 'telegram', 'ia_e14', 'supabase');

DELETE FROM configuracion_integracion_plataforma
WHERE proveedor::text NOT IN ('resolutor_captcha', 'ia_e14');

ALTER TABLE configuracion_integracion_plataforma
  DROP CONSTRAINT IF EXISTS configuracion_integracion_plataforma_proveedor_check;

CREATE TYPE proveedor_integracion_nuevo AS ENUM (
  'resolutor_captcha',
  'telegram',
  'ia_e14',
  'supabase'
);

ALTER TABLE integraciones_campana
  ALTER COLUMN proveedor TYPE proveedor_integracion_nuevo
  USING proveedor::text::proveedor_integracion_nuevo;

ALTER TABLE uso_campana
  ALTER COLUMN proveedor TYPE proveedor_integracion_nuevo
  USING proveedor::text::proveedor_integracion_nuevo;

ALTER TABLE configuracion_integracion_plataforma
  ALTER COLUMN proveedor TYPE proveedor_integracion_nuevo
  USING proveedor::text::proveedor_integracion_nuevo;

DROP TYPE proveedor_integracion;
ALTER TYPE proveedor_integracion_nuevo RENAME TO proveedor_integracion;

ALTER TABLE configuracion_integracion_plataforma
  ADD CONSTRAINT configuracion_integracion_plataforma_proveedor_check
  CHECK (proveedor IN ('resolutor_captcha', 'ia_e14'));

COMMIT;
