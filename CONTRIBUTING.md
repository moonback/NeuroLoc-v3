# Guide de contribution NeuroLoc

## Bienvenue ! 👋

Merci de votre intérêt pour contribuer à NeuroLoc ! Ce guide vous aidera à comprendre comment participer efficacement au développement de la plateforme.

## 🎯 Comment contribuer

### Signaler un bug
- Utilisez le template d'issue "Bug Report"
- Incluez des étapes de reproduction claires
- Ajoutez des captures d'écran si nécessaire
- Précisez votre environnement (OS, navigateur, version)

### Proposer une fonctionnalité
- Utilisez le template d'issue "Feature Request"
- Décrivez le problème que cela résout
- Expliquez la solution proposée
- Considérez les alternatives

### Contribuer au code
- Forkez le repository
- Créez une branche pour votre fonctionnalité
- Suivez les conventions de code
- Ajoutez des tests si nécessaire
- Soumettez une Pull Request

## 🛠️ Configuration de l'environnement

### Prérequis
- Node.js 18+
- npm ou yarn
- Git
- Compte Supabase (pour les tests)
- Compte Stripe (pour les tests)

### Installation
```bash
# Cloner le repository
git clone https://github.com/votre-username/neuroloc.git
cd neuroloc

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos clés de test
```

### Scripts de développement
```bash
npm run dev          # Serveur de développement
npm run build        # Build de production
npm run lint         # Vérification ESLint
npm run typecheck    # Vérification TypeScript
npm run test         # Tests unitaires (à venir)
```

## 📝 Conventions de code

### Structure des commits
Utilisez le format [Conventional Commits](https://www.conventionalcommits.org/) :

```
type(scope): description

feat(auth): add password reset functionality
fix(ui): resolve mobile navigation issue
docs(readme): update installation instructions
refactor(api): simplify user service methods
```

**Types disponibles :**
- `feat`: Nouvelle fonctionnalité
- `fix`: Correction de bug
- `docs`: Documentation
- `style`: Formatage, point-virgules, etc.
- `refactor`: Refactoring de code
- `test`: Ajout de tests
- `chore`: Tâches de maintenance

### Conventions de nommage

#### Variables et fonctions
```typescript
// camelCase pour les variables et fonctions
const userName = 'john_doe';
const calculateTotalPrice = (price: number, days: number) => price * days;

// PascalCase pour les composants React
const UserProfile = () => { /* ... */ };

// UPPER_SNAKE_CASE pour les constantes
const API_BASE_URL = 'https://api.neuroloc.com';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
```

#### Fichiers et dossiers
```
// kebab-case pour les fichiers
user-profile.tsx
auth-service.ts
object-card.tsx

// PascalCase pour les composants React
UserProfile.tsx
AuthService.ts
ObjectCard.tsx
```

#### Types et interfaces
```typescript
// PascalCase pour les types et interfaces
interface UserProfile {
  id: string;
  name: string;
}

type ReservationStatus = 'pending' | 'confirmed' | 'completed';
```

### Structure des composants React

```typescript
// 1. Imports
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Button } from './common/Button';

// 2. Types et interfaces
interface ComponentProps {
  title: string;
  onAction: () => void;
}

// 3. Composant principal
export const ComponentName: React.FC<ComponentProps> = ({ 
  title, 
  onAction 
}) => {
  // 4. Hooks
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // 5. Handlers
  const handleClick = async () => {
    setIsLoading(true);
    try {
      await onAction();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 6. Effects
  useEffect(() => {
    // Side effects
  }, []);

  // 7. Render
  return (
    <div className="component-container">
      <h2>{title}</h2>
      <Button 
        onClick={handleClick}
        loading={isLoading}
        disabled={!user}
      >
        Action
      </Button>
    </div>
  );
};
```

### Gestion des erreurs

```typescript
// Toujours utiliser try/catch pour les opérations async
try {
  const result = await apiService.createObject(data);
  toast.success('Objet créé avec succès');
  return result;
} catch (error) {
  console.error('Error creating object:', error);
  toast.error(error.message || 'Une erreur est survenue');
  throw error;
}

// Validation des données d'entrée
const validateObjectData = (data: CreateObjectInput): string[] => {
  const errors: string[] = [];
  
  if (!data.title?.trim()) {
    errors.push('Le titre est requis');
  }
  
  if (data.price_per_day <= 0) {
    errors.push('Le prix doit être positif');
  }
  
  return errors;
};
```

### Gestion d'état

```typescript
// Utiliser des hooks personnalisés pour la logique métier
export const useObjects = (filters?: SearchFilters) => {
  const [objects, setObjects] = useState<RentalObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchObjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await objectsService.getObjects(filters);
      setObjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchObjects();
  }, [fetchObjects]);

  return { objects, loading, error, refetch: fetchObjects };
};
```

## 🧪 Tests

### Tests unitaires (à venir)
```typescript
// Exemple de test avec Jest et React Testing Library
import { render, screen, fireEvent } from '@testing-library/react';
import { ObjectCard } from './ObjectCard';

describe('ObjectCard', () => {
  const mockObject = {
    id: '1',
    title: 'Test Object',
    price_per_day: 10,
    // ... autres propriétés
  };

  it('should render object information', () => {
    render(<ObjectCard object={mockObject} />);
    
    expect(screen.getByText('Test Object')).toBeInTheDocument();
    expect(screen.getByText('10€/jour')).toBeInTheDocument();
  });

  it('should handle click events', () => {
    const onSelect = jest.fn();
    render(<ObjectCard object={mockObject} onSelect={onSelect} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(onSelect).toHaveBeenCalledWith(mockObject);
  });
});
```

### Tests d'intégration
- Tests des services API
- Tests des hooks personnalisés
- Tests des flux utilisateur complets

## 📚 Documentation

### Documentation du code
```typescript
/**
 * Calcule le prix total d'une réservation
 * @param pricePerDay - Prix par jour en euros
 * @param startDate - Date de début (format ISO)
 * @param endDate - Date de fin (format ISO)
 * @returns Prix total calculé
 * @throws {Error} Si les dates sont invalides
 */
export const calculateTotalPrice = (
  pricePerDay: number,
  startDate: string,
  endDate: string
): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (start >= end) {
    throw new Error('La date de fin doit être après la date de début');
  }
  
  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return pricePerDay * days;
};
```

### Documentation des composants
```typescript
/**
 * Composant de carte d'objet pour l'affichage dans les listes
 * 
 * @example
 * ```tsx
 * <ObjectCard 
 *   object={rentalObject}
 *   onSelect={(obj) => navigate(`/objects/${obj.id}`)}
 * />
 * ```
 */
interface ObjectCardProps {
  /** Objet à afficher */
  object: RentalObject;
  /** Callback appelé lors de la sélection */
  onSelect?: (object: RentalObject) => void;
  /** Afficher le bouton de sélection */
  showSelectButton?: boolean;
}
```

## 🔍 Code Review

### Checklist pour les Pull Requests

#### Fonctionnalité
- [ ] La fonctionnalité répond au besoin exprimé
- [ ] Le code est testé et fonctionne
- [ ] Les cas d'erreur sont gérés
- [ ] La performance est acceptable

#### Code Quality
- [ ] Le code suit les conventions établies
- [ ] Les noms de variables/fonctions sont explicites
- [ ] Pas de code dupliqué
- [ ] Les imports sont optimisés

#### Sécurité
- [ ] Pas de données sensibles exposées
- [ ] Validation des entrées utilisateur
- [ ] Gestion sécurisée des uploads
- [ ] Respect des policies RLS

#### Documentation
- [ ] Le code est documenté si nécessaire
- [ ] Les changements sont documentés
- [ ] Les tests sont ajoutés si applicable

### Processus de review

1. **Auto-review** : Vérifiez votre code avant de soumettre
2. **Tests** : Assurez-vous que tout fonctionne
3. **Documentation** : Mettez à jour la doc si nécessaire
4. **Soumission** : Créez une PR avec une description claire
5. **Review** : Répondez aux commentaires constructivement
6. **Merge** : Une fois approuvé, mergez proprement

## 🚀 Déploiement

### Branches
- `main` : Version de production stable
- `develop` : Branche de développement
- `feature/*` : Nouvelles fonctionnalités
- `hotfix/*` : Corrections urgentes
- `release/*` : Préparation des releases

### Processus de release
1. Créer une branche `release/v1.x.x`
2. Finaliser les fonctionnalités
3. Mettre à jour la documentation
4. Tester en environnement de staging
5. Créer un tag de version
6. Déployer en production
7. Merger vers `main`

## 🤝 Communication

### Channels de communication
- **Issues GitHub** : Bugs et fonctionnalités
- **Discussions GitHub** : Questions générales
- **Pull Requests** : Reviews et discussions techniques

### Guidelines de communication
- Soyez respectueux et constructif
- Utilisez le français pour la communication
- Soyez précis dans vos descriptions
- Répondez dans des délais raisonnables

## 📋 Templates

### Template d'issue - Bug Report
```markdown
## Description du bug
Une description claire du problème.

## Étapes de reproduction
1. Aller à '...'
2. Cliquer sur '...'
3. Voir l'erreur

## Comportement attendu
Ce qui devrait se passer.

## Environnement
- OS: [ex: Windows 10]
- Navigateur: [ex: Chrome 91]
- Version: [ex: 1.2.3]

## Captures d'écran
Si applicable, ajoutez des captures d'écran.
```

### Template d'issue - Feature Request
```markdown
## Description de la fonctionnalité
Une description claire de la fonctionnalité souhaitée.

## Problème résolu
Quel problème cette fonctionnalité résout-elle ?

## Solution proposée
Décrivez la solution que vous aimeriez voir.

## Alternatives considérées
Décrivez les alternatives que vous avez considérées.

## Contexte additionnel
Ajoutez tout autre contexte ou captures d'écran.
```

## 🎉 Reconnaissance

Les contributeurs seront reconnus dans :
- Le fichier CONTRIBUTORS.md
- Les release notes
- La documentation du projet

Merci de contribuer à faire de NeuroLoc une plateforme exceptionnelle ! 🚀
