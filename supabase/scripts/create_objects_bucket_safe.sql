-- Script alternatif pour créer le bucket objects sans modifier directement storage.objects
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Vérifier si le bucket existe déjà
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'objects') 
    THEN '✅ Bucket objects existe déjà' 
    ELSE '❌ Bucket objects n''existe pas - création nécessaire' 
  END as bucket_status;

-- 2. Créer le bucket objects (cette commande devrait fonctionner)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'objects',
  'objects',
  true,
  10485760, -- 10MB en bytes
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 3. Vérifier que le bucket a été créé
SELECT 
  'Bucket objects créé/mis à jour' as status,
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at,
  updated_at
FROM storage.buckets 
WHERE id = 'objects';

-- 4. Créer des politiques RLS permissives pour le bucket objects
-- Politique pour la lecture (publique)
CREATE POLICY "Objects bucket public read"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'objects');

-- Politique pour l'insertion (utilisateurs authentifiés)
CREATE POLICY "Objects bucket authenticated insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'objects');

-- Politique pour la mise à jour (utilisateurs authentifiés)
CREATE POLICY "Objects bucket authenticated update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'objects')
  WITH CHECK (bucket_id = 'objects');

-- Politique pour la suppression (utilisateurs authentifiés)
CREATE POLICY "Objects bucket authenticated delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'objects');

-- 5. Vérifier les politiques créées
SELECT 
  'Politiques créées pour le bucket objects' as status,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%Objects bucket%'
ORDER BY policyname;

-- 6. Test de vérification final
SELECT 
  'Configuration finale:' as info,
  CASE 
    WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'objects') 
    THEN '✅ Bucket objects configuré'
    ELSE '❌ Problème avec le bucket'
  END as bucket_check,
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage') 
    THEN '✅ Politiques RLS configurées'
    ELSE '❌ Problème avec les politiques'
  END as policies_check;
