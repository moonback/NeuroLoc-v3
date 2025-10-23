-- Script SQL à exécuter dans l'éditeur SQL de Supabase
-- Ce script résout immédiatement le problème de RLS

-- 1. Supprimer toutes les politiques existantes sur storage.objects
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Allow all operations on profiles bucket" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for profiles bucket" ON storage.objects;

-- 2. Créer une politique très permissive pour le bucket profiles
CREATE POLICY "Profiles bucket - All operations allowed"
  ON storage.objects
  FOR ALL
  TO authenticated
  USING (bucket_id = 'profiles')
  WITH CHECK (bucket_id = 'profiles');

-- 3. Créer une politique pour l'accès public en lecture
CREATE POLICY "Profiles bucket - Public read"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'profiles');

-- 4. Vérifier et créer le bucket si nécessaire
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profiles',
  'profiles',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- 5. Vérifier la configuration
SELECT 
  'Bucket créé/configuré' as status,
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE id = 'profiles';

-- 6. Vérifier les politiques
SELECT 
  'Politiques créées' as status,
  policyname,
  cmd,
  roles
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%profiles%';
