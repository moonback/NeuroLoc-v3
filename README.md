# NeuroLoc - Plateforme de location d'objets entre particuliers

NeuroLoc est une plateforme moderne et sécurisée permettant aux particuliers de louer et de mettre en location leurs objets. Construite avec React, TypeScript, Supabase et Stripe.

## Fonctionnalités principales

- **Authentification sécurisée** : Inscription et connexion via Supabase Auth
- **Gestion des objets** : Publier, modifier, supprimer des objets à louer
- **Recherche et filtres** : Recherche par catégorie, localisation et prix
- **Système de réservation** : Calendrier de disponibilité et calcul automatique des prix
- **Paiements Stripe** : Paiements sécurisés via Stripe Checkout
- **Messagerie temps réel** : Communication entre propriétaires et locataires via Supabase Realtime
- **Tableau de bord** : Gestion centralisée des objets et réservations
- **Design responsive** : Interface optimisée pour mobile et desktop

## Stack technique

- **Frontend** : React 18, TypeScript, Vite
- **Styling** : Tailwind CSS
- **Backend** : Supabase (Auth, Database, Storage, Realtime)
- **Paiements** : Stripe
- **Routing** : React Router v6
- **Notifications** : React Hot Toast

## Prérequis

- Node.js 18+ et npm
- Compte Supabase (gratuit)
- Compte Stripe (gratuit en mode test)

## Installation

### 1. Cloner le projet

```bash
git clone <repository-url>
cd neuroloc
npm install
```

### 2. Configuration Supabase

1. Créez un projet sur [supabase.com](https://supabase.com)
2. La base de données est déjà configurée avec le schéma initial
3. Récupérez vos clés d'API dans Settings > API

### 3. Configuration Stripe

1. Créez un compte sur [stripe.com](https://stripe.com)
2. Récupérez vos clés API en mode test dans Developers > API keys
3. Pour les webhooks (optionnel en local) :
   - Installez Stripe CLI : `stripe login`
   - Lancez : `stripe listen --forward-to http://localhost:54321/functions/v1/stripe-webhook`
   - Récupérez le webhook secret affiché

### 4. Variables d'environnement

Créez un fichier `.env` à la racine du projet :

```env
VITE_SUPABASE_URL=votre_url_supabase
VITE_SUPABASE_ANON_KEY=votre_cle_anon_supabase
VITE_STRIPE_PUBLISHABLE_KEY=votre_cle_publique_stripe
```

Les variables suivantes sont automatiquement configurées dans Supabase :
- `STRIPE_SECRET_KEY` (dans les Edge Functions)
- `STRIPE_WEBHOOK_SECRET` (dans les Edge Functions)

### 5. Déployer les Edge Functions

Les Edge Functions Stripe sont déjà créées et peuvent être déployées via l'interface Supabase ou les outils MCP.

### 6. Configuration du Storage

Créez deux buckets dans Supabase Storage :
1. `profiles` (pour les avatars)
2. `objects` (pour les images d'objets)

Configurez les politiques d'accès :
- Profiles : lecture publique, écriture pour les utilisateurs authentifiés
- Objects : lecture publique, écriture pour les utilisateurs authentifiés

## Lancement

```bash
npm run dev
```

L'application sera accessible sur http://localhost:5173

## Structure du projet

```
/src
├── components/       # Composants réutilisables
│   ├── common/      # Boutons, inputs, loader
│   ├── layout/      # Navbar, footer
│   ├── objects/     # Composants liés aux objets
│   └── chat/        # Composant de messagerie
├── pages/           # Pages de l'application
├── services/        # Services API (auth, objects, messages, etc.)
├── hooks/           # Hooks React personnalisés
├── types/           # Types TypeScript
└── utils/           # Utilitaires et constantes

/supabase
├── migrations/      # Migrations SQL
└── functions/       # Edge Functions
    ├── create-checkout/
    └── stripe-webhook/
```

## Fonctionnalités détaillées

### Authentification
- Inscription avec email/password
- Connexion/Déconnexion
- Gestion de session persistante
- Routes protégées

### Gestion des objets
- Créer un objet avec titre, description, catégorie, prix, localisation
- Upload d'images (Supabase Storage)
- Modifier ses objets
- Supprimer ses objets
- Recherche et filtres avancés

### Réservations
- Sélection de dates de location
- Calcul automatique du prix total
- Paiement sécurisé via Stripe Checkout
- Confirmation automatique après paiement
- Historique des réservations

### Messagerie
- Conversations groupées par objet
- Messages temps réel (Supabase Realtime)
- Notification de nouveaux messages
- Marquage comme lu

## Sécurité

- **Row Level Security (RLS)** : Activé sur toutes les tables
- **Policies restrictives** : Les utilisateurs n'accèdent qu'à leurs données
- **Validation côté serveur** : Toutes les opérations sensibles sont validées
- **Paiements sécurisés** : Aucune donnée bancaire n'est stockée (géré par Stripe)

## Tests

```bash
npm run typecheck  # Vérification TypeScript
npm run lint       # Linting ESLint
npm run build      # Build de production
```

## Déploiement

### Frontend (Vercel/Netlify)

```bash
npm run build
```

Configurez les variables d'environnement dans votre plateforme de déploiement.

### Backend (Supabase)

Le backend est automatiquement hébergé sur Supabase. Assurez-vous que :
- Les Edge Functions sont déployées
- Les buckets Storage sont configurés
- Les RLS policies sont actives

## Roadmap

- [ ] Système d'avis et évaluations
- [ ] Géolocalisation avec carte interactive
- [ ] Notifications push
- [ ] Export des données utilisateur
- [ ] Application mobile (React Native)

## Support

Pour toute question ou problème :
- Créez une issue sur GitHub
- Consultez la documentation Supabase
- Consultez la documentation Stripe

## Licence

MIT License - Libre d'utilisation et de modification

---

Développé avec React, TypeScript, Supabase et Stripe
