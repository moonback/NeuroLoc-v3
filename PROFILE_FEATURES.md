# Page de Profil - NeuroLoc

## Vue d'ensemble

La page de profil complète permet aux utilisateurs de gérer leurs informations personnelles, de modifier leur mot de passe, et de consulter leurs statistiques. Elle comprend également un système d'avis et d'évaluations.

## Fonctionnalités

### 1. Page de Profil Personnel (`/profile`)
- **Modification des informations personnelles** : nom, téléphone, biographie
- **Upload de photo de profil** : support des images jusqu'à 5MB
- **Changement de mot de passe** : avec validation et confirmation
- **Statistiques utilisateur** : objets publiés, réservations, revenus
- **Interface responsive** : adaptée aux mobiles et desktop

### 2. Profil Public (`/profile/:userId`)
- **Affichage des informations publiques** d'autres utilisateurs
- **Statistiques et performances** : note moyenne, nombre de locations
- **Avis et évaluations** : système de notation 1-5 étoiles
- **Informations de contact** : email, téléphone (si public)

### 3. Système d'Avis et Évaluations
- **Création d'avis** : après réservation terminée
- **Système de notation** : 1 à 5 étoiles
- **Commentaires** : texte libre avec validation
- **Affichage des avis** : avec répartition statistique

## Composants Créés

### Composants de Base
- `Avatar` : Composant réutilisable pour afficher les avatars
- `ProfileCard` : Carte compacte d'un profil utilisateur
- `ProfileStats` : Affichage des statistiques de profil
- `ReviewsList` : Liste des avis avec résumé statistique
- `ReviewForm` : Formulaire pour créer un avis
- `ReviewCard` : Carte individuelle d'un avis

### Hooks Personnalisés
- `useProfile` : Gestion des données de profil
- `useProfileStats` : Calcul et gestion des statistiques

### Services
- `reviewsService` : Gestion des avis et évaluations
- Extension de `authService` : méthodes pour les profils

## Structure des Fichiers

```
src/
├── pages/
│   ├── Profile.tsx           # Page de profil personnel
│   └── PublicProfile.tsx     # Page de profil public
├── components/
│   ├── common/
│   │   └── Avatar.tsx        # Composant avatar réutilisable
│   └── profile/
│       ├── ProfileCard.tsx   # Carte de profil
│       ├── ProfileStats.tsx  # Statistiques de profil
│       ├── ReviewsList.tsx   # Liste des avis
│       └── ReviewForm.tsx    # Formulaire d'avis
├── hooks/
│   ├── useProfile.ts         # Hook pour les profils
│   └── useProfileStats.ts    # Hook pour les statistiques
└── services/
    └── reviews.service.ts    # Service des avis
```

## Utilisation

### Navigation
- **Profil personnel** : Accessible via `/profile` (route protégée)
- **Profil public** : Accessible via `/profile/:userId` (route publique)
- **Lien dans la navbar** : Icône "Profil" dans le menu principal

### Fonctionnalités Principales

#### Modification du Profil
1. Cliquer sur "Modifier" dans la page de profil
2. Modifier les informations souhaitées
3. Uploader une nouvelle photo (optionnel)
4. Cliquer sur "Sauvegarder"

#### Changement de Mot de Passe
1. Cliquer sur "Changer le mot de passe"
2. Saisir le mot de passe actuel
3. Saisir le nouveau mot de passe
4. Confirmer le nouveau mot de passe
5. Cliquer sur "Mettre à jour"

#### Laisser un Avis
1. Accéder à une réservation terminée
2. Cliquer sur "Laisser un avis"
3. Sélectionner une note (1-5 étoiles)
4. Rédiger un commentaire (minimum 10 caractères)
5. Cliquer sur "Publier l'avis"

## Sécurité

- **Validation des fichiers** : Types et tailles d'images vérifiés
- **Validation des mots de passe** : Minimum 6 caractères
- **Protection des routes** : Profil personnel protégé par authentification
- **Validation des avis** : Contrôles de longueur et de contenu

## Responsive Design

- **Mobile-first** : Interface optimisée pour les petits écrans
- **Grille adaptative** : Layout qui s'adapte à la taille d'écran
- **Navigation mobile** : Menu hamburger avec liens de profil

## Intégration

La page de profil s'intègre parfaitement avec :
- **Système d'authentification** existant
- **Base de données Supabase** 
- **Système de réservations**
- **Système de messages**
- **Design system** existant (Tailwind CSS)

## Prochaines Améliorations

- [ ] Système de notifications pour les nouveaux avis
- [ ] Filtrage et tri des avis
- [ ] Export des données de profil
- [ ] Intégration avec les réseaux sociaux
- [ ] Système de badges/récompenses
- [ ] Historique des modifications de profil
