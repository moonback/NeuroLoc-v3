-- Migration pour créer le bucket de stockage des images d'objets
-- Date: 2025-01-23
-- Description: Configuration du bucket 'objects' pour les images d'objets

-- Créer le bucket pour les images d'objets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'objects',
  'objects',
  true,
  10485760, -- 10MB en bytes
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

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

-- Fonction pour nettoyer automatiquement les anciennes images lors de l'upload de nouvelles
CREATE OR REPLACE FUNCTION delete_old_object_images()
RETURNS TRIGGER AS $$
DECLARE
  old_images text[];
  image_path text;
BEGIN
  -- Récupérer les anciennes images
  SELECT images INTO old_images
  FROM objects
  WHERE id = NEW.id;
  
  -- Si il y avait des anciennes images, les supprimer
  IF old_images IS NOT NULL AND array_length(old_images, 1) > 0 THEN
    FOREACH image_path IN ARRAY old_images
    LOOP
      -- Extraire le chemin du fichier de l'URL
      DECLARE
        file_path text := substring(image_path from 'images/(.*)$');
      BEGIN
        -- Supprimer l'ancien fichier du storage
        DELETE FROM storage.objects
        WHERE bucket_id = 'objects'
        AND name = 'images/' || file_path;
      END;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour nettoyer les anciennes images lors de la mise à jour
CREATE TRIGGER cleanup_old_object_images
  BEFORE UPDATE OF images ON objects
  FOR EACH ROW
  EXECUTE FUNCTION delete_old_object_images();

-- Fonction pour nettoyer les images lors de la suppression d'un objet
CREATE OR REPLACE FUNCTION cleanup_object_images_on_delete()
RETURNS TRIGGER AS $$
DECLARE
  image_path text;
BEGIN
  -- Si l'objet avait des images, les supprimer
  IF OLD.images IS NOT NULL AND array_length(OLD.images, 1) > 0 THEN
    FOREACH image_path IN ARRAY OLD.images
    LOOP
      -- Extraire le chemin du fichier de l'URL
      DECLARE
        file_path text := substring(image_path from 'images/(.*)$');
      BEGIN
        -- Supprimer le fichier du storage
        DELETE FROM storage.objects
        WHERE bucket_id = 'objects'
        AND name = 'images/' || file_path;
      END;
    END LOOP;
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour nettoyer les images lors de la suppression d'un objet
CREATE TRIGGER cleanup_object_images_on_delete_trigger
  BEFORE DELETE ON objects
  FOR EACH ROW
  EXECUTE FUNCTION cleanup_object_images_on_delete();

-- Vérifier que le bucket a été créé correctement
SELECT 
  'Bucket objects créé' as status,
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE id = 'objects';
