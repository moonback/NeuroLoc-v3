# 🚀 Guide Rapide - Application de la Migration Bucket Images

## ⚡ Application Immédiate

### Option 1: Via l'Éditeur SQL Supabase (Recommandé)
1. **Ouvrir Supabase Dashboard**
   - Aller sur [supabase.com](https://supabase.com)
   - Sélectionner votre projet NeuroLoc

2. **Accéder à l'Éditeur SQL**
   - Cliquer sur "SQL Editor" dans le menu de gauche
   - Cliquer sur "New query"

3. **Copier et Exécuter le Script**
   ```sql
   -- Copier tout le contenu du fichier:
   -- supabase/scripts/create_objects_bucket.sql
   ```
   - Coller le script dans l'éditeur
   - Cliquer sur "Run" ou appuyer sur Ctrl+Enter

4. **Vérifier le Résultat**
   - Le script devrait afficher: "Bucket objects créé"
   - Vérifier qu'il n'y a pas d'erreurs

### Option 2: Via Supabase CLI
```bash
# Dans le terminal du projet
supabase db push
```

## 🧪 Test du Système

### 1. Accéder à la Page de Test
- Se connecter à l'application
- Aller sur: `http://localhost:5173/test-images`

### 2. Tester l'Upload
- Glisser-déposer des images dans la zone
- Ou cliquer pour sélectionner des fichiers
- Vérifier que les images s'affichent

### 3. Tester les Fonctionnalités
- ✅ Upload multiple d'images
- ✅ Prévisualisation des images
- ✅ Suppression d'images individuelles
- ✅ Validation des types de fichiers
- ✅ Validation de la taille

## 🔧 Vérification du Bucket

### Dans l'Éditeur SQL Supabase
```sql
-- Vérifier que le bucket existe
SELECT * FROM storage.buckets WHERE id = 'objects';

-- Vérifier les politiques RLS
SELECT * FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage';
```

### Résultat Attendu
```sql
-- Bucket objects créé
id      | name    | public | file_size_limit | allowed_mime_types
objects | objects | true   | 10485760       | {image/jpeg,image/png,image/webp,image/gif}
```

## 🐛 Dépannage

### Erreur: "Bucket not found"
- **Cause**: Migration non appliquée
- **Solution**: Exécuter le script SQL dans Supabase

### Erreur: "RLS policy violation"
- **Cause**: Politiques RLS non configurées
- **Solution**: Vérifier que toutes les politiques ont été créées

### Erreur: "File too large"
- **Cause**: Image > 10MB
- **Solution**: Réduire la taille de l'image

### Erreur: "Invalid file type"
- **Cause**: Format non supporté
- **Solution**: Utiliser JPEG, PNG, WebP ou GIF uniquement

## 📋 Checklist de Validation

- [ ] Bucket 'objects' créé dans Supabase
- [ ] Politiques RLS configurées
- [ ] Triggers de nettoyage automatique créés
- [ ] Page de test accessible (`/test-images`)
- [ ] Upload d'images fonctionnel
- [ ] Affichage des images correct
- [ ] Suppression d'images fonctionnelle
- [ ] Validation des fichiers active

## 🧹 Nettoyage Après Tests

### Supprimer la Page de Test
```bash
# Supprimer les fichiers de test
rm src/pages/TestImagesPage.tsx
rm src/components/debug/ImageUploadTest.tsx

# Retirer la route de test dans App.tsx
# Supprimer l'import et la route /test-images
```

### Intégrer dans le Formulaire d'Objets
- Le composant `ImageUpload` est déjà intégré dans `ObjectForm`
- Prêt à être utilisé dans `CreateObject` et `EditObject`

## ✅ Prochaines Étapes

1. **Appliquer la migration** (script SQL)
2. **Tester le système** (page `/test-images`)
3. **Intégrer dans les formulaires** (déjà fait)
4. **Tester la création d'objets** avec images
5. **Nettoyer les fichiers de test**

## 📞 Support

Si vous rencontrez des problèmes:
1. Vérifier les logs de la console navigateur
2. Vérifier les logs Supabase
3. S'assurer que l'utilisateur est authentifié
4. Vérifier les politiques RLS
