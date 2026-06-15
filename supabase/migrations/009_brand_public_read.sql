-- Branding público: login y metadata deben leer la marca sin sesión iniciada.
CREATE POLICY marca_plataforma_select_anon ON configuracion_marca_plataforma
  FOR SELECT TO anon
  USING (true);
