-- Migration pour créer le bucket de stockage des avatars
-- Date: 2025-01-23
-- Description: Configuration du stockage Supabase pour les avatars de profil

-- Créer le bucket pour les avatars
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profiles',
  'profiles',
  true,
  5242880, -- 5MB en bytes
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- Politique pour permettre aux utilisateurs authentifiés de voir tous les avatars
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'profiles');

-- Politique pour permettre aux utilisateurs de télécharger leur propre avatar
CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'profiles' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Politique pour permettre aux utilisateurs de mettre à jour leur propre avatar
CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'profiles' AND
    auth.uid()::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'profiles' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Politique pour permettre aux utilisateurs de supprimer leur propre avatar
CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'profiles' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Fonction pour nettoyer automatiquement l'ancien avatar lors de l'upload d'un nouveau
CREATE OR REPLACE FUNCTION delete_old_avatar()
RETURNS TRIGGER AS $$
DECLARE
  old_avatar_url text;
  old_file_path text;
BEGIN
  -- Récupérer l'ancien avatar_url
  SELECT avatar_url INTO old_avatar_url
  FROM profiles
  WHERE id = NEW.id;
  
  -- Si il y avait un ancien avatar, le supprimer
  IF old_avatar_url IS NOT NULL AND old_avatar_url != '' THEN
    -- Extraire le chemin du fichier de l'URL
    old_file_path := substring(old_avatar_url from 'avatars/(.*)$');
    
    -- Supprimer l'ancien fichier du storage
    DELETE FROM storage.objects
    WHERE bucket_id = 'profiles'
    AND name = 'avatars/' || old_file_path;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour nettoyer l'ancien avatar lors de la mise à jour
CREATE TRIGGER cleanup_old_avatar
  BEFORE UPDATE OF avatar_url ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION delete_old_avatar();

-- Fonction pour nettoyer l'avatar lors de la suppression du profil
CREATE OR REPLACE FUNCTION cleanup_profile_avatar()
RETURNS TRIGGER AS $$
BEGIN
  -- Si le profil avait un avatar, le supprimer
  IF OLD.avatar_url IS NOT NULL AND OLD.avatar_url != '' THEN
    -- Extraire le chemin du fichier de l'URL
    DECLARE
      file_path text := substring(OLD.avatar_url from 'avatars/(.*)$');
    BEGIN
      -- Supprimer le fichier du storage
      DELETE FROM storage.objects
      WHERE bucket_id = 'profiles'
      AND name = 'avatars/' || file_path;
    END;
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour nettoyer l'avatar lors de la suppression du profil
CREATE TRIGGER cleanup_profile_avatar_on_delete
  BEFORE DELETE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION cleanup_profile_avatar();
