-- Script pour désactiver temporairement le RLS sur le bucket objects
-- À exécuter dans l'éditeur SQL de Supabase

-- Vérifier si le bucket existe
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'objects') 
    THEN 'Bucket objects existe' 
    ELSE 'Bucket objects n''existe pas' 
  END as bucket_status;

-- Créer le bucket s'il n'existe pas
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'objects',
  'objects',
  true,
  10485760, -- 10MB en bytes
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Désactiver temporairement le RLS sur le bucket objects
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Supprimer toutes les politiques existantes sur storage.objects
DROP POLICY IF EXISTS "Object images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload object images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their object images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their object images" ON storage.objects;

-- Créer une politique permissive temporaire pour tous les utilisateurs authentifiés
CREATE POLICY "Temporary permissive policy for objects bucket"
  ON storage.objects FOR ALL
  TO authenticated
  USING (bucket_id = 'objects')
  WITH CHECK (bucket_id = 'objects');

-- Vérifier la configuration
SELECT 
  'Configuration appliquée' as status,
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE id = 'objects';

-- Vérifier les politiques
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage';
