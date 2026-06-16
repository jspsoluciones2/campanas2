-- Jerarquía organizacional sin tope fijo: 1 = más alto, niveles inferiores se agregan según necesidad.

ALTER TABLE roles
  DROP CONSTRAINT IF EXISTS roles_nivel_jerarquia_check;

ALTER TABLE roles
  ADD CONSTRAINT roles_nivel_jerarquia_check
  CHECK (nivel_jerarquia >= 1);

COMMENT ON COLUMN roles.nivel_jerarquia IS
  'Nivel en el árbol organizacional: 1 = más alto. Sin tope fijo; cada campaña puede extender la jerarquía.';
