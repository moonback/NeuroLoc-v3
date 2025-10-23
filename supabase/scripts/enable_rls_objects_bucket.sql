-- Script pour réactiver le RLS sur le bucket objects avec des politiques sécurisées
-- À exécuter après avoir testé l'upload d'images

-- Supprimer la politique temporaire
DROP POLICY IF EXISTS "Temporary permissive policy for objects bucket" ON storage.objects;

-- Réactiver le RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Créer les politiques sécurisées
-- Politique pour permettre aux utilisateurs authentifiés de voir toutes les images d'objets
CREATE POLICY "Object images are publicly accessible"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'objects');

-- Politique pour permettre aux utilisateurs de télécharger des images pour leurs objets
CREATE POLICY "Users can upload object images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'objects' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Politique pour permettre aux utilisateurs de mettre à jour les images de leurs objets
CREATE POLICY "Users can update their object images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'objects' AND
    auth.uid()::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'objects' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Politique pour permettre aux utilisateurs de supprimer les images de leurs objets
CREATE POLICY "Users can delete their object images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'objects' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Vérifier la configuration finale
SELECT 
  'RLS réactivé avec politiques sécurisées' as status,
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE id = 'objects';

-- Vérifier les politiques
SELECT 
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
ORDER BY policyname;
