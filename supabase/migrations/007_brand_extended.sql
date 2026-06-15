-- Branding de plataforma: identidad, colores del panel y pantalla de login.

ALTER TABLE configuracion_marca_plataforma
  ADD COLUMN IF NOT EXISTS color_acento text DEFAULT '#1e40af',
  ADD COLUMN IF NOT EXISTS color_fondo_sidebar text DEFAULT '#111827',
  ADD COLUMN IF NOT EXISTS color_fondo_pagina text DEFAULT '#f3f4f6',
  ADD COLUMN IF NOT EXISTS nombre_plataforma text DEFAULT 'Plataforma',
  ADD COLUMN IF NOT EXISTS etiqueta_panel text DEFAULT 'Panel Administrador',
  ADD COLUMN IF NOT EXISTS texto_alt_logo text DEFAULT 'Plataforma de campañas',
  ADD COLUMN IF NOT EXISTS url_favicon text,
  ADD COLUMN IF NOT EXISTS subtitulo_login text DEFAULT 'Accede con tu usuario y contraseña',
  ADD COLUMN IF NOT EXISTS texto_boton_login text DEFAULT 'INICIAR SESIÓN',
  ADD COLUMN IF NOT EXISTS login_fondo_exterior text DEFAULT '#4b5563',
  ADD COLUMN IF NOT EXISTS login_fondo_centro text DEFAULT '#9ca3af',
  ADD COLUMN IF NOT EXISTS login_panel_fondo text DEFAULT 'rgba(31, 41, 55, 0.55)',
  ADD COLUMN IF NOT EXISTS login_boton_fondo text DEFAULT '#111827';
