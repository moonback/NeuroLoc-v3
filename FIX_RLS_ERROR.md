# 🚨 Solution Rapide - Erreur RLS Bucket Objects

## ❌ Problème Identifié
```
StorageApiError: new row violates row-level security policy
```

**Cause**: Le bucket `objects` n'existe pas ou les politiques RLS bloquent l'upload.

## ⚡ Solution Immédiate

### Étape 1: Appliquer le Script de Désactivation RLS
1. **Ouvrir Supabase Dashboard**
   - Aller sur [supabase.com](https://supabase.com)
   - Sélectionner votre projet NeuroLoc

2. **Accéder à l'Éditeur SQL**
   - Cliquer sur "SQL Editor"
   - Cliquer sur "New query"

3. **Copier et Exécuter**
   ```sql
   -- Copier tout le contenu du fichier:
   -- supabase/scripts/disable_rls_objects_bucket.sql
   ```

4. **Vérifier le Résultat**
   - Le script devrait afficher: "Configuration appliquée"
   - Vérifier qu'il n'y a pas d'erreurs

### Étape 2: Tester l'Upload
- Retourner sur la page `/test-images`
- Essayer d'uploader une image
- L'upload devrait maintenant fonctionner

## 🔧 Alternative: Script Direct

Si vous préférez, voici le script minimal à exécuter :

```sql
-- Créer le bucket objects
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'objects',
  'objects',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Désactiver RLS temporairement
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Politique permissive temporaire
CREATE POLICY "Temporary permissive policy for objects bucket"
  ON storage.objects FOR ALL
  TO authenticated
  USING (bucket_id = 'objects')
  WITH CHECK (bucket_id = 'objects');
```

## ✅ Vérification

### Dans l'Éditeur SQL
```sql
-- Vérifier le bucket
SELECT * FROM storage.buckets WHERE id = 'objects';

-- Vérifier les politiques
SELECT policyname, cmd FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';
```

### Résultat Attendu
```sql
-- Bucket objects créé
id      | name    | public | file_size_limit | allowed_mime_types
objects | objects | true   | 10485760       | {image/jpeg,image/png,image/webp,image/gif}

-- Politique temporaire
policyname                                    | cmd
Temporary permissive policy for objects bucket | ALL
```

## 🔒 Réactivation de la Sécurité (Plus Tard)

Une fois les tests terminés, exécuter :
```sql
-- Contenu du fichier: supabase/scripts/enable_rls_objects_bucket.sql
```

## 🐛 Dépannage

### Erreur: "Bucket already exists"
- **Normal**: Le script utilise `ON CONFLICT DO NOTHING`
- **Action**: Continuer, c'est prévu

### Erreur: "Policy already exists"
- **Cause**: Politique déjà créée
- **Solution**: Le script gère les conflits automatiquement

### Upload toujours bloqué
- **Vérifier**: Que l'utilisateur est bien connecté
- **Vérifier**: Que le script s'est exécuté sans erreur
- **Vérifier**: Que le bucket `objects` existe

## 📋 Checklist

- [ ] Script `disable_rls_objects_bucket.sql` exécuté
- [ ] Bucket `objects` créé
- [ ] RLS désactivé temporairement
- [ ] Politique permissive créée
- [ ] Test d'upload réussi
- [ ] Images s'affichent correctement

## 🚀 Prochaines Étapes

1. **Tester l'upload** sur `/test-images`
2. **Intégrer dans les formulaires** d'objets
3. **Réactiver la sécurité** avec `enable_rls_objects_bucket.sql`
4. **Supprimer les fichiers de test**

## ⚠️ Important

- **Temporaire**: Le RLS est désactivé pour les tests
- **Sécurité**: Réactiver le RLS après les tests
- **Production**: Ne jamais laisser le RLS désactivé en production
