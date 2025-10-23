-- Script de vérification et configuration du bucket profiles
-- À exécuter dans l'éditeur SQL de Supabase si nécessaire

-- Vérifier si le bucket existe
SELECT * FROM storage.buckets WHERE id = 'profiles';

-- Si le bucket n'existe pas, le créer manuellement
-- (Décommentez les lignes suivantes si nécessaire)

/*
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profiles',
  'profiles',
  true,
  5242880, -- 5MB en bytes
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);
*/

-- Vérifier les politiques de stockage
SELECT * FROM storage.policies WHERE bucket_id = 'profiles';

-- Vérifier les fonctions de nettoyage
SELECT proname, prosrc FROM pg_proc WHERE proname LIKE '%avatar%';

-- Vérifier les triggers
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_name LIKE '%avatar%';
