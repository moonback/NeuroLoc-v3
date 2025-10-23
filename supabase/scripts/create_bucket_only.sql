-- Script ultra-simple pour créer le bucket objects
-- Utilise uniquement les fonctions Supabase standard

-- Créer le bucket objects
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'objects',
  'objects',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Vérifier la création
SELECT 
  'Bucket objects créé' as status,
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE id = 'objects';
