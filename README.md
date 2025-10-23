# NeuroLoc - Plateforme de location d'objets entre particuliers

NeuroLoc est une plateforme moderne et sécurisée permettant aux particuliers de louer et de mettre en location leurs objets du quotidien. Construite avec React, TypeScript, Supabase et Stripe, elle offre une expérience utilisateur fluide et des paiements sécurisés.

## 🚀 Fonctionnalités principales

### Authentification et profils
- **Inscription et connexion sécurisées** via Supabase Auth
- **Gestion de profil complète** avec avatar, informations personnelles et géolocalisation
- **Système de confiance** avec avis et évaluations entre utilisateurs

### Gestion des objets
- **Publication d'objets** avec photos, descriptions détaillées et géolocalisation
- **Catégorisation intelligente** (Bricolage, Jardinage, Sport, Électronique, etc.)
- **Recherche avancée** par mots-clés, catégorie, prix et localisation
- **Gestion des disponibilités** avec statuts en temps réel

### Système de réservation
- **Calendrier de disponibilité** intégré
- **Calcul automatique des prix** selon la durée de location
- **Paiements sécurisés** via Stripe Checkout
- **Suivi des réservations** avec statuts détaillés

### Communication
- **Messagerie temps réel** entre propriétaires et locataires
- **Notifications instantanées** via Supabase Realtime
- **Conversations groupées** par objet

### Tableau de bord
- **Vue d'ensemble** des objets publiés et réservations
- **Statistiques personnelles** et historique des transactions
- **Gestion centralisée** de tous les aspects du compte

## 🛠️ Stack technique

### Frontend
- **React 18** avec hooks et fonctionnalités modernes
- **TypeScript** pour la sécurité des types
- **Vite** pour un développement rapide et un build optimisé
- **Tailwind CSS** pour un design responsive et moderne
- **React Router v6** pour la navigation
- **React Hot Toast** pour les notifications

### Backend et infrastructure
- **Supabase** comme Backend-as-a-Service
  - Authentification et gestion des utilisateurs
  - Base de données PostgreSQL avec RLS
  - Storage pour les images
  - Realtime pour la messagerie
  - Edge Functions pour les intégrations
- **Stripe** pour les paiements sécurisés
- **PostgreSQL** avec fonctions géographiques avancées

### Outils de développement
- **ESLint** pour la qualité du code
- **TypeScript** pour la vérification des types
- **PostCSS** et **Autoprefixer** pour CSS
- **Git** pour le contrôle de version

## 📋 Prérequis

- **Node.js 18+** et npm
- **Compte Supabase** (gratuit)
- **Compte Stripe** (gratuit en mode test)
- **Git** pour cloner le projet

## 🚀 Installation et configuration

### 1. Cloner le projet

```bash
git clone <repository-url>
cd neuroloc
npm install
```

### 2. Configuration Supabase

1. Créez un projet sur [supabase.com](https://supabase.com)
2. Exécutez les migrations SQL dans l'ordre :
   ```bash
   # Appliquer le schéma initial
   supabase db reset
   
   # Ou appliquer les migrations une par une
   supabase migration up
   ```
3. Récupérez vos clés d'API dans Settings > API
4. Configurez les buckets Storage :
   - `profiles` (pour les avatars)
   - `objects` (pour les images d'objets)

### 3. Configuration Stripe

1. Créez un compte sur [stripe.com](https://stripe.com)
2. Récupérez vos clés API en mode test dans Developers > API keys
3. Pour les webhooks (optionnel en local) :
   ```bash
   # Installer Stripe CLI
   stripe login
   
   # Écouter les webhooks
   stripe listen --forward-to http://localhost:54321/functions/v1/stripe-webhook
   ```

### 4. Variables d'environnement

Créez un fichier `.env` à la racine du projet :

```env
# Supabase
VITE_SUPABASE_URL=votre_url_supabase
VITE_SUPABASE_ANON_KEY=votre_cle_anon_supabase

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=votre_cle_publique_stripe
```

Les variables suivantes sont automatiquement configurées dans Supabase :
- `STRIPE_SECRET_KEY` (dans les Edge Functions)
- `STRIPE_WEBHOOK_SECRET` (dans les Edge Functions)

### 5. Déployer les Edge Functions

```bash
# Déployer les fonctions Stripe
supabase functions deploy create-checkout
supabase functions deploy stripe-webhook
```

## 🏃‍♂️ Lancement du projet

### Mode développement

```bash
npm run dev
```

L'application sera accessible sur http://localhost:5173

### Mode production

```bash
npm run build
npm run preview
```

### Scripts disponibles

```bash
npm run dev          # Démarrage du serveur de développement
npm run build        # Build de production
npm run preview      # Aperçu du build de production
npm run lint         # Vérification ESLint
npm run typecheck    # Vérification TypeScript
```

## 📁 Structure du projet

```
neuroloc/
├── src/
│   ├── components/          # Composants réutilisables
│   │   ├── common/         # Boutons, inputs, loader, etc.
│   │   ├── layout/         # Navbar, footer
│   │   ├── objects/        # Composants liés aux objets
│   │   ├── profile/        # Composants de profil
│   │   └── chat/           # Composant de messagerie
│   ├── pages/              # Pages de l'application
│   ├── services/           # Services API (auth, objects, messages, etc.)
│   ├── hooks/              # Hooks React personnalisés
│   ├── types/              # Types TypeScript
│   └── utils/              # Utilitaires et constantes
├── supabase/
│   ├── migrations/         # Migrations SQL
│   ├── functions/          # Edge Functions
│   │   ├── create-checkout/
│   │   └── stripe-webhook/
│   └── scripts/            # Scripts utilitaires
├── scripts/                # Scripts de configuration
└── docs/                   # Documentation
```

## 🔧 Fonctionnalités détaillées

### Authentification
- Inscription avec email/password et informations personnelles
- Connexion/déconnexion avec gestion de session persistante
- Routes protégées avec redirection automatique
- Gestion des erreurs et validation côté client

### Gestion des objets
- Création d'objets avec titre, description, catégorie, prix et localisation
- Upload d'images multiples avec validation et compression
- Modification et suppression des objets
- Recherche et filtres avancés (texte, catégorie, prix, localisation)
- Géolocalisation avec coordonnées GPS

### Système de réservation
- Sélection de dates avec validation de disponibilité
- Calcul automatique du prix total selon la durée
- Paiement sécurisé via Stripe Checkout
- Confirmation automatique après paiement réussi
- Historique complet des réservations

### Messagerie temps réel
- Conversations groupées par objet ou utilisateur
- Messages en temps réel via Supabase Realtime
- Notifications de nouveaux messages
- Marquage des messages comme lus
- Interface de chat intuitive

### Système d'avis
- Évaluation des utilisateurs après réservation
- Notes de 1 à 5 étoiles avec commentaires
- Statistiques de réputation
- Avis publics consultables

## 🔒 Sécurité

- **Row Level Security (RLS)** activé sur toutes les tables
- **Policies restrictives** : les utilisateurs n'accèdent qu'à leurs données
- **Validation côté serveur** pour toutes les opérations sensibles
- **Paiements sécurisés** : aucune donnée bancaire stockée (géré par Stripe)
- **Upload sécurisé** avec validation des types et tailles de fichiers
- **Authentification JWT** avec refresh automatique

## 🧪 Tests et qualité

```bash
npm run typecheck    # Vérification TypeScript
npm run lint         # Linting ESLint
npm run build        # Build de production
```

## 🚀 Déploiement

### Frontend (Vercel/Netlify)

1. Connectez votre repository
2. Configurez les variables d'environnement
3. Déployez automatiquement

### Backend (Supabase)

Le backend est automatiquement hébergé sur Supabase. Vérifiez que :
- Les Edge Functions sont déployées
- Les buckets Storage sont configurés
- Les RLS policies sont actives
- Les migrations sont appliquées

## 📈 Roadmap

### Version 1.1 (Prochaine)
- [ ] Système d'avis et évaluations complet
- [ ] Géolocalisation avec carte interactive
- [ ] Notifications push
- [ ] Export des données utilisateur

### Version 1.2 (Future)
- [ ] Application mobile (React Native)
- [ ] Système de recommandations IA
- [ ] Intégration avec réseaux sociaux
- [ ] API publique pour développeurs

### Version 2.0 (Long terme)
- [ ] Marketplace multi-vendeurs
- [ ] Système de fidélité et points
- [ ] Assurance intégrée
- [ ] Support multi-langues

## 🤝 Contribution

Nous accueillons les contributions ! Consultez [CONTRIBUTING.md](./CONTRIBUTING.md) pour les guidelines détaillées.

## 📞 Support

Pour toute question ou problème :
- Créez une issue sur GitHub
- Consultez la documentation Supabase
- Consultez la documentation Stripe
- Contactez l'équipe de développement

## 📄 Licence

MIT License - Libre d'utilisation et de modification

---

**NeuroLoc** - Développé avec ❤️ en utilisant React, TypeScript, Supabase et Stripe