-- Cuenta de acceso del cliente (usuario Auth vinculado al político)

ALTER TABLE clientes
  ADD COLUMN IF NOT EXISTS id_usuario uuid REFERENCES auth.users (id) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS clientes_id_usuario_unique
  ON clientes (id_usuario)
  WHERE id_usuario IS NOT NULL;
