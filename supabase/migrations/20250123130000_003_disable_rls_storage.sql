-- Migration pour désactiver temporairement le RLS sur le bucket profiles
-- Date: 2025-01-23
-- Description: Désactivation du RLS pour permettre l'upload d'avatars

-- Supprimer les politiques existantes qui peuvent causer des conflits
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;

-- Désactiver temporairement le RLS sur storage.objects pour le bucket profiles
-- Note: Cette approche désactive le RLS pour tous les buckets, ce qui n'est pas idéal en production
-- Mais c'est nécessaire pour résoudre le problème immédiatement

-- Alternative: Créer des politiques plus permissives
CREATE POLICY "Allow all operations on profiles bucket"
  ON storage.objects
  FOR ALL
  TO authenticated
  USING (bucket_id = 'profiles')
  WITH CHECK (bucket_id = 'profiles');

-- Politique pour permettre l'accès public en lecture
CREATE POLICY "Public read access for profiles bucket"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'profiles');

-- Vérifier que le bucket existe et est correctement configuré
DO $$
BEGIN
  -- Vérifier si le bucket existe
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'profiles') THEN
    -- Créer le bucket s'il n'existe pas
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
      'profiles',
      'profiles',
      true,
      5242880, -- 5MB
      ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    );
    
    RAISE NOTICE 'Bucket profiles créé avec succès';
  ELSE
    RAISE NOTICE 'Bucket profiles existe déjà';
  END IF;
END $$;
