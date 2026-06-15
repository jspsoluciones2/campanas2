-- Añade Supabase como proveedor para costos/uso en uso_campana e integraciones_campana

ALTER TYPE proveedor_integracion ADD VALUE IF NOT EXISTS 'supabase';
