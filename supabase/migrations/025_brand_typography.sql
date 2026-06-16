-- Tipografía configurable: fuentes, colores y pesos por rol de texto.

ALTER TABLE configuracion_marca_plataforma
  ADD COLUMN IF NOT EXISTS fuente_titulos text,
  ADD COLUMN IF NOT EXISTS fuente_subtitulos text,
  ADD COLUMN IF NOT EXISTS fuente_cuerpo text,
  ADD COLUMN IF NOT EXISTS color_titulo text DEFAULT '#111827',
  ADD COLUMN IF NOT EXISTS color_subtitulo text DEFAULT '#6b7280',
  ADD COLUMN IF NOT EXISTS color_texto text DEFAULT '#374151',
  ADD COLUMN IF NOT EXISTS color_etiqueta text DEFAULT '#525252',
  ADD COLUMN IF NOT EXISTS peso_titulo integer DEFAULT 600,
  ADD COLUMN IF NOT EXISTS peso_subtitulo integer DEFAULT 400,
  ADD COLUMN IF NOT EXISTS peso_texto integer DEFAULT 400,
  ADD COLUMN IF NOT EXISTS peso_etiqueta integer DEFAULT 500;

UPDATE configuracion_marca_plataforma
SET
  fuente_titulos = COALESCE(fuente_titulos, familia_fuente, 'Inter'),
  fuente_subtitulos = COALESCE(fuente_subtitulos, familia_fuente, 'Inter'),
  fuente_cuerpo = COALESCE(fuente_cuerpo, familia_fuente, 'Inter')
WHERE id = 1;
