# 📸 Système d'Upload d'Images pour Objets

## Vue d'ensemble

Le système d'upload d'images pour objets permet aux utilisateurs de télécharger jusqu'à 10 images par objet pour mieux présenter leurs articles à la location.

## 🏗️ Architecture

### Bucket de Stockage
- **Nom**: `objects`
- **Visibilité**: Publique (lecture)
- **Taille maximale**: 10MB par image
- **Types autorisés**: JPEG, PNG, WebP, GIF
- **Structure**: `images/{objectId}-{timestamp}-{random}.{ext}`

### Sécurité (RLS)
- ✅ Lecture publique des images d'objets
- ✅ Upload réservé aux utilisateurs authentifiés
- ✅ Modification/suppression uniquement pour le propriétaire
- ✅ Nettoyage automatique lors de la suppression d'objets

## 📁 Fichiers Créés

### Services
- `src/services/objectImages.service.ts` - Service principal pour la gestion des images

### Composants
- `src/components/objects/ImageUpload.tsx` - Composant d'upload avec drag & drop

### Migrations
- `supabase/migrations/20250123150000_005_create_objects_bucket.sql` - Migration principale
- `supabase/scripts/create_objects_bucket.sql` - Script SQL direct

### Scripts
- `scripts/setup-objects-bucket.sh` - Script d'installation

## 🚀 Installation

### Option 1: Via Supabase CLI
```bash
# Appliquer la migration
supabase db push

# Ou utiliser le script
chmod +x scripts/setup-objects-bucket.sh
./scripts/setup-objects-bucket.sh
```

### Option 2: Via l'éditeur SQL Supabase
1. Ouvrir l'éditeur SQL dans le dashboard Supabase
2. Copier le contenu de `supabase/scripts/create_objects_bucket.sql`
3. Exécuter le script

## 💻 Utilisation

### Dans un Composant React
```tsx
import { ImageUpload } from '../components/objects/ImageUpload';

const MyComponent = () => {
  const [images, setImages] = useState<string[]>([]);

  return (
    <ImageUpload
      onImagesUploaded={setImages}
      existingImages={images}
      maxImages={10}
      disabled={false}
    />
  );
};
```

### Via le Service
```tsx
import { objectImagesService } from '../services/objectImages.service';

// Upload d'une image
const uploadImage = async (objectId: string, file: File) => {
  try {
    const url = await objectImagesService.uploadObjectImage(objectId, file);
    console.log('Image uploadée:', url);
  } catch (error) {
    console.error('Erreur upload:', error);
  }
};

// Upload de plusieurs images
const uploadMultipleImages = async (objectId: string, files: File[]) => {
  try {
    const urls = await objectImagesService.uploadMultipleImages(objectId, files);
    console.log('Images uploadées:', urls);
  } catch (error) {
    console.error('Erreur upload:', error);
  }
};

// Supprimer une image
const deleteImage = async (imageUrl: string) => {
  try {
    await objectImagesService.deleteObjectImage(imageUrl);
    console.log('Image supprimée');
  } catch (error) {
    console.error('Erreur suppression:', error);
  }
};
```

## 🔧 Fonctionnalités

### Composant ImageUpload
- **Drag & Drop**: Glisser-déposer de fichiers
- **Sélection multiple**: Jusqu'à 10 images
- **Prévisualisation**: Affichage des images uploadées
- **Suppression**: Bouton pour supprimer des images
- **Validation**: Vérification de la taille et du type
- **États de chargement**: Indicateurs visuels

### Service objectImagesService
- `uploadObjectImage()` - Upload d'une image
- `uploadMultipleImages()` - Upload de plusieurs images
- `deleteObjectImage()` - Suppression d'une image
- `deleteMultipleImages()` - Suppression de plusieurs images
- `validateImages()` - Validation des fichiers
- `extractFilePathFromUrl()` - Extraction du chemin depuis l'URL
- `getPublicUrl()` - Génération de l'URL publique
- `listObjectImages()` - Liste des images d'un objet

## 🛡️ Sécurité

### Politiques RLS
1. **Lecture publique**: Tous les utilisateurs peuvent voir les images d'objets
2. **Upload authentifié**: Seuls les utilisateurs connectés peuvent uploader
3. **Propriété**: Les utilisateurs ne peuvent modifier que leurs propres images
4. **Nettoyage automatique**: Suppression des images lors de la suppression d'objets

### Validation
- **Taille**: Maximum 10MB par image
- **Types**: JPEG, PNG, WebP, GIF uniquement
- **Quantité**: Maximum 10 images par objet
- **Sécurité**: Noms de fichiers sécurisés avec timestamps

## 🔄 Triggers Automatiques

### Nettoyage lors de la mise à jour
- Supprime automatiquement les anciennes images quand de nouvelles sont uploadées
- Évite l'accumulation d'images inutilisées

### Nettoyage lors de la suppression
- Supprime toutes les images associées à un objet lors de sa suppression
- Maintient la propreté du stockage

## 📊 Monitoring

### Vérification du Bucket
```sql
-- Vérifier que le bucket existe
SELECT * FROM storage.buckets WHERE id = 'objects';

-- Vérifier les politiques RLS
SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';
```

### Logs d'Upload
- Les erreurs sont loggées dans la console
- Messages de succès via toast notifications
- Validation côté client et serveur

## 🐛 Dépannage

### Erreurs Communes

1. **"Bucket not found"**
   - Vérifier que la migration a été appliquée
   - Exécuter le script SQL dans Supabase

2. **"RLS policy violation"**
   - Vérifier que l'utilisateur est authentifié
   - Vérifier les politiques RLS

3. **"File too large"**
   - Réduire la taille de l'image
   - Vérifier la limite de 10MB

4. **"Invalid file type"**
   - Utiliser uniquement JPEG, PNG, WebP, GIF
   - Vérifier l'extension du fichier

### Tests
```bash
# Tester l'upload d'images
# 1. Créer un objet avec des images
# 2. Vérifier l'affichage dans ObjectDetails
# 3. Tester la suppression d'images
# 4. Vérifier le nettoyage automatique
```

## 🔮 Améliorations Futures

- [ ] Compression automatique des images
- [ ] Génération de miniatures
- [ ] Support de formats supplémentaires (AVIF, HEIC)
- [ ] Upload progressif avec retry
- [ ] CDN pour l'accélération des images
- [ ] Watermarking automatique
- [ ] Détection de contenu inapproprié
- [ ] Optimisation pour mobile
