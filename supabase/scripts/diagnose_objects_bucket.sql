-- Script de diagnostic pour le bucket objects
-- À exécuter pour vérifier l'état actuel

-- 1. Vérifier si le bucket objects existe
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'objects') 
    THEN '✅ Bucket objects existe' 
    ELSE '❌ Bucket objects n''existe pas' 
  END as bucket_status;

-- 2. Afficher tous les buckets existants
SELECT 
  'Buckets existants:' as info,
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets
ORDER BY id;

-- 3. Vérifier l'état du RLS sur storage.objects
SELECT 
  CASE 
    WHEN relrowsecurity = true THEN '🔒 RLS activé'
    ELSE '🔓 RLS désactivé'
  END as rls_status
FROM pg_class 
WHERE relname = 'objects' 
AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'storage');

-- 4. Lister toutes les politiques sur storage.objects
SELECT 
  CASE 
    WHEN COUNT(*) = 0 THEN '❌ Aucune politique trouvée'
    ELSE '✅ ' || COUNT(*) || ' politique(s) trouvée(s)'
  END as policies_status,
  string_agg(policyname, ', ') as policies
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage';

-- 5. Vérifier les permissions sur le bucket objects (si il existe)
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'objects') 
    THEN 'Bucket objects trouvé - vérification des permissions'
    ELSE 'Bucket objects non trouvé'
  END as permission_check,
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE id = 'objects';

-- 6. Vérifier l'utilisateur actuel
SELECT 
  'Utilisateur actuel:' as info,
  current_user as user_name,
  session_user as session_user;

-- 7. Vérifier les rôles de l'utilisateur
SELECT 
  'Rôles utilisateur:' as info,
  rolname as role_name,
  rolsuper as is_superuser,
  rolcreaterole as can_create_roles,
  rolcreatedb as can_create_databases
FROM pg_roles 
WHERE rolname = current_user;
