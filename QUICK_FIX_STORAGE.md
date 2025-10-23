# 🚨 Solution Rapide : Erreur RLS sur le Bucket de Stockage

## Problème
```
StorageApiError: new row violates row-level security policy
```

Cette erreur indique que les politiques RLS (Row Level Security) bloquent l'upload d'avatars.

## ⚡ Solution Immédiate

### Étape 1 : Ouvrir l'éditeur SQL de Supabase
1. Allez sur https://supabase.com/dashboard
2. Sélectionnez votre projet
3. Cliquez sur "SQL Editor" dans le menu de gauche

### Étape 2 : Exécuter le script de correction
Copiez et collez ce script dans l'éditeur SQL :

```sql
-- Supprimer les politiques existantes
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;

-- Créer une politique permissive pour le bucket profiles
CREATE POLICY "Profiles bucket - All operations allowed"
  ON storage.objects
  FOR ALL
  TO authenticated
  USING (bucket_id = 'profiles')
  WITH CHECK (bucket_id = 'profiles');

-- Créer une politique pour l'accès public en lecture
CREATE POLICY "Profiles bucket - Public read"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'profiles');

-- Créer le bucket s'il n'existe pas
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profiles',
  'profiles',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
```

### Étape 3 : Cliquer sur "Run"
Exécutez le script en cliquant sur le bouton "Run" ou en appuyant sur `Ctrl+Enter`.

### Étape 4 : Tester l'upload
1. Retournez sur votre application
2. Allez sur la page de profil (`/profile`)
3. Essayez d'uploader un avatar
4. Le composant de test en bas de page devrait maintenant fonctionner

## ✅ Vérification

Après avoir exécuté le script, vous devriez voir :
- ✅ Bucket `profiles` créé et configuré
- ✅ Politiques de sécurité mises à jour
- ✅ Upload d'avatar fonctionnel

## 🔧 Alternative : Via le Dashboard

Si vous préférez utiliser l'interface graphique :

### 1. Créer le Bucket
1. Allez dans **Storage** dans le dashboard Supabase
2. Cliquez sur **"New bucket"**
3. Configurez :
   - **Name** : `profiles`
   - **Public bucket** : ✅ Activé
   - **File size limit** : `5 MB`
   - **Allowed MIME types** : `image/jpeg, image/png, image/webp, image/gif`

### 2. Configurer les Politiques
1. Cliquez sur le bucket `profiles`
2. Allez dans l'onglet **"Policies"**
3. Supprimez toutes les politiques existantes
4. Créez une nouvelle politique :
   - **Policy name** : `Profiles bucket - All operations allowed`
   - **Allowed operation** : `All`
   - **Target roles** : `authenticated`
   - **USING expression** : `bucket_id = 'profiles'`
   - **WITH CHECK expression** : `bucket_id = 'profiles'`

## 🧪 Test Final

Utilisez le composant de test intégré dans la page de profil :

1. **Connectez-vous** à votre application
2. **Allez sur** `/profile`
3. **Scrollez vers le bas** pour voir "Test du Bucket de Stockage"
4. **Sélectionnez une image** (JPEG, PNG, WebP, ou GIF)
5. **Cliquez sur "Tester l'upload"**
6. **Vérifiez le résultat** :
   - ✅ Succès : Le bucket fonctionne
   - ❌ Erreur : Vérifiez la configuration

## 🚨 Si le problème persiste

1. **Vérifiez les logs** dans la console du navigateur
2. **Vérifiez les logs** dans le dashboard Supabase (Logs > API)
3. **Testez avec un fichier plus petit** (< 1MB)
4. **Vérifiez que vous êtes connecté** (authentifié)

## 📝 Notes Importantes

- ⚠️ **Sécurité** : Cette solution désactive temporairement certaines restrictions RLS
- 🔒 **Production** : En production, vous devriez utiliser des politiques plus restrictives
- 🧹 **Nettoyage** : Supprimez le composant de test une fois que tout fonctionne

## 🆘 Support

Si vous avez encore des problèmes :
1. Vérifiez que le bucket `profiles` existe dans Storage
2. Vérifiez que les politiques sont correctement configurées
3. Testez avec différents formats d'image
4. Vérifiez que votre utilisateur est bien authentifié
