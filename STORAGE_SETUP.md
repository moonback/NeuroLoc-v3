# Configuration du Bucket de Stockage Supabase

## Problème Résolu

L'erreur `StorageApiError: Bucket not found` indique que le bucket `profiles` n'existe pas dans votre configuration Supabase. Ce guide vous explique comment le créer et le configurer correctement.

## Solution

### 1. Appliquer la Migration

Exécutez la migration qui crée le bucket et configure les politiques de sécurité :

```bash
# Dans le terminal, à la racine de votre projet
supabase db push
```

### 2. Vérification Manuelle (si nécessaire)

Si la migration ne fonctionne pas, vous pouvez créer le bucket manuellement dans le dashboard Supabase :

1. **Accédez au Dashboard Supabase** : https://supabase.com/dashboard
2. **Sélectionnez votre projet**
3. **Allez dans Storage** (menu de gauche)
4. **Cliquez sur "New bucket"**
5. **Configurez le bucket** :
   - **Name** : `profiles`
   - **Public bucket** : ✅ Activé
   - **File size limit** : `5 MB`
   - **Allowed MIME types** : `image/jpeg, image/png, image/webp, image/gif`

### 3. Configuration des Politiques de Sécurité

Dans l'éditeur SQL de Supabase, exécutez les politiques suivantes :

```sql
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
```

## Structure du Bucket

```
profiles/
└── avatars/
    ├── user-id-1-timestamp.jpg
    ├── user-id-2-timestamp.png
    └── user-id-3-timestamp.webp
```

## Test de Fonctionnement

### 1. Composant de Test Intégré

Un composant de test a été ajouté temporairement à la page de profil (`/profile`) pour vérifier que le bucket fonctionne correctement.

### 2. Test Manuel

1. **Connectez-vous** à votre application
2. **Allez sur la page de profil** (`/profile`)
3. **Scrollez vers le bas** pour voir le composant "Test du Bucket de Stockage"
4. **Sélectionnez une image** (JPEG, PNG, WebP, ou GIF)
5. **Cliquez sur "Tester l'upload"**
6. **Vérifiez le résultat** :
   - ✅ Succès : Le bucket fonctionne correctement
   - ❌ Erreur : Vérifiez la configuration

### 3. Vérification dans le Dashboard

1. **Allez dans Storage** dans le dashboard Supabase
2. **Cliquez sur le bucket `profiles`**
3. **Vérifiez** qu'un dossier `avatars/` existe
4. **Vérifiez** que vos fichiers de test apparaissent

## Dépannage

### Erreur : "Bucket not found"
- ✅ **Solution** : Créer le bucket `profiles` manuellement
- ✅ **Vérification** : Exécuter `supabase db push`

### Erreur : "Permission denied"
- ✅ **Solution** : Vérifier les politiques de sécurité
- ✅ **Vérification** : S'assurer que l'utilisateur est authentifié

### Erreur : "File too large"
- ✅ **Solution** : Réduire la taille du fichier (< 5MB)
- ✅ **Vérification** : Vérifier la limite du bucket

### Erreur : "Invalid file type"
- ✅ **Solution** : Utiliser JPEG, PNG, WebP, ou GIF
- ✅ **Vérification** : Vérifier les types MIME autorisés

## Sécurité

### Politiques Implémentées

1. **Lecture publique** : Tous les avatars sont visibles par tous
2. **Écriture authentifiée** : Seuls les utilisateurs connectés peuvent uploader
3. **Propriété des fichiers** : Les utilisateurs ne peuvent modifier que leurs propres avatars
4. **Nettoyage automatique** : Les anciens avatars sont supprimés lors de l'upload d'un nouveau

### Bonnes Pratiques

- ✅ **Validation côté client** : Taille et type de fichier
- ✅ **Validation côté serveur** : Politiques de sécurité Supabase
- ✅ **Noms de fichiers sécurisés** : UUID + timestamp
- ✅ **Nettoyage automatique** : Suppression des anciens fichiers

## Suppression du Composant de Test

Une fois que le bucket fonctionne correctement, supprimez le composant de test :

1. **Supprimez l'import** dans `src/pages/Profile.tsx` :
   ```typescript
   import { StorageTest } from '../components/debug/StorageTest';
   ```

2. **Supprimez le composant** dans le JSX :
   ```typescript
   {/* Composant de test du stockage - À supprimer en production */}
   <div className="mt-8">
     <StorageTest />
   </div>
   ```

3. **Supprimez le fichier** `src/components/debug/StorageTest.tsx`

## Support

Si vous rencontrez encore des problèmes :

1. **Vérifiez les logs** dans la console du navigateur
2. **Vérifiez les logs** dans le dashboard Supabase
3. **Testez avec différents fichiers** (formats et tailles)
4. **Vérifiez la configuration** du projet Supabase

## Ressources

- 📚 [Documentation Supabase Storage](https://supabase.com/docs/guides/storage)
- 🔧 [Politiques de Sécurité](https://supabase.com/docs/guides/auth/row-level-security)
- 🚀 [Dashboard Supabase](https://supabase.com/dashboard)
