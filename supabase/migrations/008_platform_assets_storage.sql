-- Bucket público para logo, favicon y assets de plataforma.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'platform-assets',
  'platform-assets',
  true,
  2097152,
  ARRAY[
    'image/png',
    'image/jpeg',
    'image/webp',
    'image/svg+xml',
    'image/x-icon',
    'image/vnd.microsoft.icon'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

CREATE POLICY platform_assets_public_read
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'platform-assets');

CREATE POLICY platform_assets_insert
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'platform-assets'
    AND es_dueno_plataforma()
  );

CREATE POLICY platform_assets_update
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'platform-assets' AND es_dueno_plataforma())
  WITH CHECK (bucket_id = 'platform-assets' AND es_dueno_plataforma());

CREATE POLICY platform_assets_delete
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'platform-assets' AND es_dueno_plataforma());
