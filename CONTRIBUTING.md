# 🤝 Guide de Contribution NeuroLoc

## Bienvenue !

Merci de votre intérêt pour contribuer à NeuroLoc ! Ce guide vous aidera à comprendre comment participer efficacement au développement de la plateforme.

## 🚀 Premiers Pas

### Prérequis
- Connaissance de React, TypeScript et Tailwind CSS
- Compte GitHub
- Node.js 18+ installé
- Compte Supabase (pour les tests)

### Configuration de l'Environnement

1. **Fork et Clone**
```bash
git clone https://github.com/votre-username/neuroloc.git
cd neuroloc
```

2. **Installation**
```bash
npm install
```

3. **Configuration**
```bash
cp .env.example .env.local
# Remplir les variables d'environnement
```

4. **Vérification**
```bash
npm run dev
npm run lint
npm run typecheck
```

## 📋 Types de Contributions

### 🐛 Signalement de Bugs
- Utilisez le template d'issue GitHub
- Incluez des étapes de reproduction
- Ajoutez des captures d'écran si nécessaire
- Spécifiez votre environnement (OS, navigateur, version)

### ✨ Nouvelles Fonctionnalités
- Ouvrez d'abord une issue pour discuter
- Attendez l'approbation avant de commencer
- Suivez les conventions de code existantes
- Ajoutez des tests si applicable

### 📚 Documentation
- Améliorez la documentation existante
- Ajoutez des exemples d'utilisation
- Corrigez les erreurs de typographie
- Traduisez en d'autres langues

### 🎨 Améliorations UI/UX
- Respectez le design system existant
- Testez sur différents écrans
- Vérifiez l'accessibilité
- Incluez des maquettes si nécessaire

## 🛠️ Standards de Code

### Conventions de Nommage

#### Variables et Fonctions
```typescript
// ✅ Bon
const userName = 'john';
const calculateTotalPrice = () => {};

// ❌ Éviter
const user_name = 'john';
const CalculateTotalPrice = () => {};
```

#### Composants React
```typescript
// ✅ Bon
export const UserProfile: React.FC<UserProfileProps> = ({ user }) => {
  return <div>{user.name}</div>;
};

// ❌ Éviter
export const userProfile = ({ user }) => {
  return <div>{user.name}</div>;
};
```

#### Types et Interfaces
```typescript
// ✅ Bon
interface UserProfile {
  id: string;
  name: string;
}

type UserRole = 'client' | 'loueur' | 'admin';

// ❌ Éviter
interface userProfile {
  id: string;
  name: string;
}
```

### Structure des Composants

```typescript
// 1. Imports
import React, { useState, useEffect } from 'react';
import { Button } from '../common/Button';

// 2. Types
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
      <Button onClick={handleClick} loading={isLoading}>
        Action
      </Button>
    </div>
  );
};
```

### Gestion d'État

#### Hooks Personnalisés
```typescript
// ✅ Bon - Hook personnalisé
export const useObjects = () => {
  const [objects, setObjects] = useState<RentalObject[]>([]);
  const [loading, setLoading] = useState(true);
  
  const fetchObjects = useCallback(async () => {
    try {
      setLoading(true);
      const data = await objectsService.getObjects();
      setObjects(data);
    } catch (error) {
      console.error('Error fetching objects:', error);
    } finally {
      setLoading(false);
    }
  }, []);
  
  return { objects, loading, fetchObjects };
};
```

#### Éviter les Anti-patterns
```typescript
// ❌ Éviter - Props drilling
const Parent = () => {
  const [data, setData] = useState();
  return <Child data={data} setData={setData} />;
};

// ✅ Préférer - Hook personnalisé
const Parent = () => {
  const { data, setData } = useData();
  return <Child />;
};
```

### Styles et Design

#### Classes Tailwind
```typescript
// ✅ Bon - Classes cohérentes
<div className="bg-white rounded-xl shadow-soft p-6">
  <h2 className="text-heading text-xl font-semibold mb-4">
    Titre
  </h2>
  <p className="text-body">
    Contenu
  </p>
</div>

// ❌ Éviter - Classes incohérentes
<div className="bg-gray-100 rounded-lg shadow-md p-4">
  <h2 className="text-gray-900 text-lg font-bold mb-2">
    Titre
  </h2>
  <p className="text-gray-600">
    Contenu
  </p>
</div>
```

#### Composants Réutilisables
```typescript
// ✅ Bon - Utilisation des composants communs
import { Button, Card, CardContent } from '../common';

export const MyComponent = () => {
  return (
    <Card>
      <CardContent>
        <Button variant="primary" size="lg">
          Action
        </Button>
      </CardContent>
    </Card>
  );
};
```

## 🧪 Tests

### Tests Unitaires
```typescript
// Exemple de test
import { render, screen } from '@testing-library/react';
import { ObjectCard } from './ObjectCard';

describe('ObjectCard', () => {
  it('should display object title', () => {
    const mockObject = {
      id: '1',
      title: 'Test Object',
      price_per_day: 10
    };
    
    render(<ObjectCard object={mockObject} />);
    
    expect(screen.getByText('Test Object')).toBeInTheDocument();
  });
});
```

### Tests d'Intégration
- Testez les flux complets utilisateur
- Vérifiez les appels API
- Testez les interactions entre composants

## 📝 Commits et Pull Requests

### Messages de Commit
```bash
# Format : type(scope): description

feat(auth): add two-factor authentication
fix(ui): resolve button alignment issue
docs(readme): update installation instructions
style(components): format code with prettier
refactor(api): simplify user service
test(auth): add login component tests
```

### Pull Request

#### Template PR
```markdown
## Description
Brève description des changements

## Type de changement
- [ ] Bug fix
- [ ] Nouvelle fonctionnalité
- [ ] Breaking change
- [ ] Documentation

## Checklist
- [ ] Code testé localement
- [ ] Tests ajoutés/mis à jour
- [ ] Documentation mise à jour
- [ ] Pas de conflits avec la branche main
- [ ] Code review effectué
```

#### Processus de Review
1. **Auto-review** : Vérifiez votre propre code
2. **Tests** : Assurez-vous que tout fonctionne
3. **Documentation** : Mettez à jour si nécessaire
4. **Review** : Attendez l'approbation d'un mainteneur

## 🏗️ Architecture et Patterns

### Structure des Dossiers
```
src/
├── components/          # Composants React
│   ├── common/         # Composants réutilisables
│   ├── layout/         # Composants de mise en page
│   └── [feature]/      # Composants par fonctionnalité
├── pages/              # Pages de l'application
├── hooks/              # Hooks personnalisés
├── services/           # Services API
├── types/              # Types TypeScript
└── utils/              # Utilitaires
```

### Services API
```typescript
// Structure d'un service
export const objectsService = {
  async getObjects(): Promise<RentalObject[]> {
    try {
      const { data, error } = await supabase
        .from('objects')
        .select('*, owner:profiles(*)');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching objects:', error);
      throw error;
    }
  }
};
```

## 🐛 Débogage

### Outils Recommandés
- **React DevTools** : Inspection des composants
- **Supabase Dashboard** : Monitoring de la DB
- **Stripe Dashboard** : Suivi des paiements
- **Browser DevTools** : Debugging général

### Logs et Monitoring
```typescript
// ✅ Bon - Logging structuré
console.error('Error creating object:', {
  error: error.message,
  userId: user.id,
  objectData: objectData
});

// ❌ Éviter - Logs non structurés
console.log('Error');
```

## 📚 Ressources

### Documentation
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Supabase Docs](https://supabase.com/docs)

### Outils de Développement
- **VS Code** avec extensions React/TypeScript
- **ESLint** pour la qualité du code
- **Prettier** pour le formatage
- **GitHub Desktop** pour Git

## 🆘 Aide et Support

### Questions Fréquentes
- **Problème de build** : Vérifiez Node.js 18+
- **Erreurs Supabase** : Vérifiez les variables d'environnement
- **Problèmes de style** : Utilisez les classes Tailwind existantes

### Communication
- **GitHub Issues** : Pour les bugs et fonctionnalités
- **GitHub Discussions** : Pour les questions générales
- **Pull Request Comments** : Pour les discussions spécifiques

## 🎉 Reconnaissance

Les contributeurs sont reconnus dans :
- **README.md** : Liste des contributeurs
- **Releases** : Notes de version
- **GitHub** : Profils des contributeurs

---

Merci de contribuer à NeuroLoc ! Ensemble, nous construisons l'avenir de la location d'objets entre particuliers. 🚀