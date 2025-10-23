-- Script de test pour vérifier la configuration du bucket
-- À exécuter après avoir appliqué les corrections

-- 1. Vérifier que le bucket existe
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'profiles') 
    THEN '✅ Bucket profiles existe'
    ELSE '❌ Bucket profiles manquant'
  END as bucket_status;

-- 2. Vérifier la configuration du bucket
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  CASE 
    WHEN public = true THEN '✅ Public'
    ELSE '❌ Privé'
  END as visibility_status,
  CASE 
    WHEN file_size_limit = 5242880 THEN '✅ Limite correcte (5MB)'
    ELSE '❌ Limite incorrecte'
  END as size_limit_status
FROM storage.buckets 
WHERE id = 'profiles';

-- 3. Vérifier les politiques de sécurité
SELECT 
  policyname,
  cmd,
  roles,
  CASE 
    WHEN cmd = 'ALL' THEN '✅ Opérations complètes'
    WHEN cmd = 'SELECT' THEN '✅ Lecture seule'
    ELSE '⚠️ Autre'
  END as policy_type
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%profiles%';

-- 4. Test de permissions (simulation)
-- Cette requête devrait retourner des résultats si les permissions sont correctes
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM storage.objects 
      WHERE bucket_id = 'profiles' 
      LIMIT 1
    ) THEN '✅ Accès en lecture OK'
    ELSE '⚠️ Aucun fichier dans le bucket (normal si vide)'
  END as read_test;

-- 5. Vérifier l'utilisateur actuel
SELECT 
  auth.uid() as current_user_id,
  CASE 
    WHEN auth.uid() IS NOT NULL THEN '✅ Utilisateur authentifié'
    ELSE '❌ Utilisateur non authentifié'
  END as auth_status;
