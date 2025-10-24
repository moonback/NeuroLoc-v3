# 🏠 NeuroLoc

**Plateforme moderne de location d'objets entre particuliers** - Une solution complète pour louer et mettre en location vos objets du quotidien avec paiements sécurisés, géolocalisation et système de remise par QR code.

## 🚀 Technologies Utilisées

### Frontend
- **React 18** avec TypeScript
- **Vite** - Build tool moderne et rapide
- **Tailwind CSS** - Framework CSS utilitaire
- **React Router v6** - Navigation côté client
- **Lucide React** - Icônes modernes
- **React Hot Toast** - Notifications utilisateur

### Backend & Infrastructure
- **Supabase** - Backend-as-a-Service (PostgreSQL + Auth + Storage)
- **Stripe** - Paiements sécurisés
- **Edge Functions** - Fonctions serverless (Deno)

### Outils de Développement
- **TypeScript** - Typage statique
- **ESLint** - Linting du code
- **PostCSS** - Traitement CSS
- **QR Code** - Génération et lecture de codes QR

## ✨ Fonctionnalités Principales (MVP)

### 🔐 Authentification & Profils
- Inscription/Connexion sécurisée
- Profils utilisateurs complets
- Système de rôles (Client/Loueur/Admin)
- Géolocalisation et adresses

### 📦 Gestion d'Objets
- Publication d'objets avec photos
- Catégorisation et recherche
- Géolocalisation des objets
- Gestion des disponibilités

### 📅 Réservations & Paiements
- Système de réservation avec dates
- Paiements sécurisés via Stripe
- Gestion des statuts de réservation
- Calcul automatique des prix

### 💬 Communication
- Messagerie intégrée temps réel
- Conversations par objet
- Notifications en temps réel

### 📱 Système de Remise
- Génération de QR codes uniques
- Scanner QR code pour remise/retour
- Géolocalisation des points de remise
- Suivi des handovers

### ⭐ Avis & Évaluations
- Système de notation (1-5 étoiles)
- Commentaires sur les expériences
- Profils publics avec statistiques

## 📋 Prérequis

- **Node.js** 18+ 
- **npm** ou **yarn**
- **Compte Supabase** ([supabase.com](https://supabase.com))
- **Compte Stripe** ([stripe.com](https://stripe.com))
- **Git**

## 🛠️ Installation & Configuration

### 1. Cloner le Projet
```bash
git clone https://github.com/votre-username/neuroloc.git
cd neuroloc
```

### 2. Installer les Dépendances
```bash
npm install
```

### 3. Configuration Supabase

#### Créer un Projet Supabase
1. Allez sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Notez l'URL et la clé anonyme

#### Configurer la Base de Données
```bash
# Installer Supabase CLI
npm install -g supabase

# Initialiser Supabase (si pas déjà fait)
supabase init

# Appliquer les migrations
supabase db push
```

### 4. Configuration Stripe
1. Créez un compte sur [stripe.com](https://stripe.com)
2. Récupérez vos clés API (publishable et secret)
3. Configurez les webhooks pour les événements de paiement

### 5. Variables d'Environnement

Créez un fichier `.env.local` à la racine du projet :

```env
# Supabase
VITE_SUPABASE_URL=votre_url_supabase
VITE_SUPABASE_ANON_KEY=votre_cle_anonyme_supabase

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=votre_cle_publique_stripe
STRIPE_SECRET_KEY=votre_cle_secrete_stripe

# Optionnel - Géolocalisation
VITE_GOOGLE_MAPS_API_KEY=votre_cle_google_maps
```

### 6. Configuration Storage Supabase
```sql
-- Créer le bucket pour les images d'objets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('object-images', 'object-images', true);

-- Politique pour permettre l'upload d'images
CREATE POLICY "Allow authenticated users to upload images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'object-images' AND auth.role() = 'authenticated');
```

## 🚀 Lancement du Projet

### Mode Développement
```bash
npm run dev
```
L'application sera accessible sur `http://localhost:5173`

### Build de Production
```bash
npm run build
npm run preview
```

### Scripts Disponibles
```bash
npm run dev          # Serveur de développement
npm run build        # Build de production
npm run preview      # Aperçu du build
npm run lint         # Vérification du code
npm run typecheck    # Vérification TypeScript
```

## 📁 Structure du Projet

```
neuroloc/
├── public/                 # Fichiers statiques
├── src/
│   ├── components/         # Composants React
│   │   ├── common/        # Composants réutilisables
│   │   ├── layout/        # Composants de mise en page
│   │   ├── objects/       # Composants liés aux objets
│   │   ├── profile/       # Composants de profil
│   │   ├── chat/          # Composants de messagerie
│   │   ├── handovers/     # Composants de remise
│   │   └── payment/       # Composants de paiement
│   ├── pages/             # Pages de l'application
│   ├── hooks/             # Hooks personnalisés
│   ├── services/          # Services API
│   ├── types/             # Définitions TypeScript
│   ├── utils/             # Utilitaires
│   └── App.tsx           # Composant principal
├── supabase/
│   ├── migrations/        # Migrations de base de données
│   ├── functions/         # Edge Functions
│   └── scripts/           # Scripts utilitaires
├── docs/                  # Documentation
└── package.json
```

## 🔧 Variables d'Environnement

| Variable | Description | Obligatoire |
|----------|-------------|-------------|
| `VITE_SUPABASE_URL` | URL de votre projet Supabase | ✅ |
| `VITE_SUPABASE_ANON_KEY` | Clé anonyme Supabase | ✅ |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Clé publique Stripe | ✅ |
| `STRIPE_SECRET_KEY` | Clé secrète Stripe (Edge Functions) | ✅ |
| `VITE_GOOGLE_MAPS_API_KEY` | Clé API Google Maps (optionnel) | ❌ |

## 🤝 Contribution

### Bonnes Pratiques

1. **Code Style**
   - Utilisez TypeScript strict
   - Suivez les conventions ESLint
   - Nommage : camelCase pour variables, PascalCase pour composants
   - Commentaires en français

2. **Commits**
   - Messages clairs et descriptifs
   - Format : `type: description` (feat:, fix:, docs:, etc.)

3. **Pull Requests**
   - Description détaillée des changements
   - Tests manuels effectués
   - Screenshots si UI modifiée

### Workflow de Développement

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Committez vos changements (`git commit -m 'feat: ajouter nouvelle fonctionnalité'`)
4. Push vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🆘 Support

- **Documentation** : Consultez les fichiers dans `/docs`
- **Issues** : Utilisez GitHub Issues pour signaler des bugs
- **Discussions** : GitHub Discussions pour les questions générales

## 🗺️ Roadmap

Voir [ROADMAP.md](ROADMAP.md) pour les prochaines fonctionnalités prévues.

---

**NeuroLoc** - Révolutionnez la location d'objets entre particuliers ! 🚀