# 🌍 Géolocalisation et Géocodage - NeuroLoc

## Vue d'ensemble

Le système de géolocalisation de NeuroLoc permet aux utilisateurs de :
- **Détecter automatiquement leur position** via GPS
- **Rechercher et géocoder des adresses** avec autocomplétion
- **Stocker leurs coordonnées géographiques** pour faciliter les recherches d'objets à proximité

## 🚀 Fonctionnalités

### 1. Géolocalisation Automatique
- **Détection GPS** : Utilise l'API de géolocalisation du navigateur
- **Géocodage inverse** : Convertit les coordonnées en adresse lisible
- **Permissions** : Gestion des autorisations de géolocalisation
- **Fallback** : Gestion des erreurs et cas d'échec

### 2. Recherche d'Adresse avec Autocomplétion
- **API Nominatim** : Utilise OpenStreetMap pour le géocodage
- **Autocomplétion** : Suggestions en temps réel
- **Navigation clavier** : Support des flèches et Enter
- **Debouncing** : Optimisation des requêtes API

### 3. Stockage des Données Géographiques
- **Adresse complète** : Rue, ville, code postal, pays
- **Coordonnées précises** : Latitude et longitude
- **Validation** : Contrôles de cohérence des données
- **Indexation** : Optimisation des requêtes géographiques

## 🏗️ Architecture

### Services
- `geolocationService` : Service principal de géolocalisation
- `useGeolocation` : Hook React pour la géolocalisation
- `AddressAutocomplete` : Composant d'autocomplétion
- `GeolocationButton` : Bouton de détection automatique

### Base de Données
- **Nouveaux champs** dans la table `profiles`
- **Fonctions SQL** pour calculer les distances
- **Index géographiques** pour optimiser les performances
- **Contraintes de validation** pour les coordonnées

## 📊 Structure des Données

### Table `profiles` (nouveaux champs)
```sql
ALTER TABLE profiles ADD COLUMN:
- address text                    -- Adresse complète
- city text                       -- Ville
- postal_code text                -- Code postal
- country text                    -- Pays
- latitude decimal(10,8)          -- Latitude (précision 8 décimales)
- longitude decimal(11,8)         -- Longitude (précision 8 décimales)
```

### Types TypeScript
```typescript
interface Profile {
  // ... champs existants
  address: string | null;
  city: string | null;
  postal_code: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
}

interface GeocodeResult {
  address: string;
  city: string;
  postal_code: string;
  country: string;
  latitude: number;
  longitude: number;
  formatted_address: string;
}
```

## 🔧 Utilisation

### 1. Géolocalisation Automatique
```typescript
import { GeolocationButton } from '../components/common/GeolocationButton';

<GeolocationButton
  onLocationFound={(address, city, postalCode, country, lat, lng) => {
    // Mettre à jour les données du profil
    setFormData(prev => ({
      ...prev,
      address,
      city,
      postal_code: postalCode,
      country,
      latitude: lat,
      longitude: lng
    }));
  }}
/>
```

### 2. Recherche d'Adresse
```typescript
import { AddressAutocomplete } from '../components/common/AddressAutocomplete';

<AddressAutocomplete
  value={address}
  onChange={setAddress}
  onSelect={(address, formattedAddress) => {
    // Géocoder l'adresse sélectionnée
    geocodeAddress(formattedAddress);
  }}
  placeholder="Rechercher votre adresse..."
/>
```

### 3. Hook de Géolocalisation
```typescript
import { useGeolocation } from '../hooks/useGeolocation';

const {
  location,
  address,
  error,
  loading,
  getCurrentLocation,
  geocodeAddress,
  reverseGeocode
} = useGeolocation();
```

## 🌐 API Utilisée

### Nominatim (OpenStreetMap)
- **URL** : `https://nominatim.openstreetmap.org/`
- **Gratuit** : Pas de clé API requise
- **Limite** : 1 requête/seconde (respectée par le debouncing)
- **Langue** : Support du français (`accept-language=fr`)

### Endpoints Utilisés
```typescript
// Géocodage inverse (coordonnées → adresse)
GET /reverse?format=json&lat={lat}&lon={lng}&addressdetails=1

// Géocodage direct (adresse → coordonnées)
GET /search?format=json&q={address}&addressdetails=1&limit=1

// Recherche d'adresses
GET /search?format=json&q={query}&addressdetails=1&limit=5
```

## 🗄️ Fonctions SQL

### Calcul de Distance
```sql
-- Calculer la distance entre deux points (formule de Haversine)
SELECT calculate_distance(48.8566, 2.3522, 45.7640, 4.8357);
-- Résultat: 392.84 km (Paris → Lyon)
```

### Recherche d'Utilisateurs Proches
```sql
-- Trouver les utilisateurs dans un rayon de 10km
SELECT * FROM find_users_within_radius(48.8566, 2.3522, 10);
```

## 🔒 Sécurité et Confidentialité

### Permissions Navigateur
- **Demande explicite** : L'utilisateur doit autoriser la géolocalisation
- **Gestion d'erreurs** : Messages clairs en cas de refus
- **Fallback** : Possibilité de saisie manuelle

### Données Stockées
- **Coordonnées précises** : Stockées avec 8 décimales de précision
- **Adresses** : Stockées en texte libre
- **Pas de tracking** : Pas de surveillance continue de la position

### API Externe
- **Nominatim** : Service respectueux de la vie privée
- **Pas de cookies** : Requêtes anonymes
- **Rate limiting** : Respect des limites de l'API

## 🎨 Interface Utilisateur

### Composants Créés
1. **AddressAutocomplete** : Champ de recherche avec suggestions
2. **GeolocationButton** : Bouton de détection GPS
3. **LocationDisplay** : Affichage des coordonnées détectées

### Design
- **Responsive** : Adapté mobile et desktop
- **Accessibilité** : Navigation clavier, labels appropriés
- **Feedback visuel** : États de chargement, erreurs, succès
- **UX optimisée** : Debouncing, autocomplétion fluide

## 🚀 Déploiement

### Migration de Base de Données
```bash
# Appliquer la migration
supabase db push

# Vérifier les nouveaux champs
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('address', 'city', 'postal_code', 'country', 'latitude', 'longitude');
```

### Variables d'Environnement
Aucune variable d'environnement requise pour Nominatim.

## 🧪 Tests

### Tests Manuels
1. **Géolocalisation** : Tester la détection GPS
2. **Autocomplétion** : Tester la recherche d'adresses
3. **Géocodage** : Tester la conversion adresse → coordonnées
4. **Validation** : Tester les contraintes de coordonnées

### Cas d'Usage
- ✅ Utilisateur autorise la géolocalisation
- ✅ Utilisateur refuse la géolocalisation
- ✅ Géolocalisation indisponible
- ✅ Recherche d'adresse inexistante
- ✅ Coordonnées invalides

## 🔮 Améliorations Futures

### Fonctionnalités Avancées
- [ ] **Carte interactive** : Affichage sur carte OpenStreetMap
- [ ] **Historique des positions** : Suivi des déplacements
- [ ] **Notifications géographiques** : Alertes basées sur la position
- [ ] **Recherche par proximité** : Trouver des objets à proximité
- [ ] **Zones de livraison** : Définir des zones de service

### Optimisations
- [ ] **Cache local** : Mise en cache des résultats de géocodage
- [ ] **Service worker** : Géolocalisation en arrière-plan
- [ ] **Compression** : Optimisation des données stockées
- [ ] **CDN** : Mise en cache des tiles de carte

## 📚 Ressources

- 📖 [API Nominatim](https://nominatim.org/release-docs/develop/api/Overview/)
- 🗺️ [OpenStreetMap](https://www.openstreetmap.org/)
- 📱 [Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API)
- 🧮 [Formule de Haversine](https://en.wikipedia.org/wiki/Haversine_formula)
- 🔒 [Bonnes pratiques de géolocalisation](https://web.dev/user-location/)
