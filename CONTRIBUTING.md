# Guide de Contribution

Merci de votre intérêt pour contribuer à **Onepoint AI Consulting Tool** ! 🎉

Ce guide vous aidera à contribuer efficacement au projet.

---

## 📋 Table des Matières

- [Code de Conduite](#code-de-conduite)
- [Comment Contribuer](#comment-contribuer)
- [Setup de Développement](#setup-de-développement)
- [Standards de Code](#standards-de-code)
- [Process de Pull Request](#process-de-pull-request)
- [Conventions de Commit](#conventions-de-commit)
- [Architecture du Projet](#architecture-du-projet)

---

## 🤝 Code de Conduite

En participant à ce projet, vous vous engagez à respecter un environnement respectueux et inclusif pour tous.

---

## 🚀 Comment Contribuer

### Types de Contributions

Nous acceptons plusieurs types de contributions :

1. **🐛 Corrections de bugs**
   - Signalez les bugs via les Issues GitHub
   - Proposez des corrections via Pull Requests

2. **✨ Nouvelles fonctionnalités**
   - Discutez d'abord dans une Issue avant de coder
   - Suivez l'architecture existante
   - Ajoutez des tests si applicable

3. **📚 Documentation**
   - Améliorations du README
   - Ajouts de commentaires dans le code
   - Guides d'utilisation
   - Traductions

4. **🎨 Améliorations UI/UX**
   - Propositions de design
   - Améliorations d'accessibilité
   - Optimisations de performance

---

## 🛠️ Setup de Développement

### Prérequis

- Node.js 20+
- npm ou yarn
- Git
- Compte Supabase (gratuit)
- Clé API OpenAI

### Installation

1. **Forker le repository**
   ```bash
   # Cliquez sur "Fork" sur GitHub
   ```

2. **Cloner votre fork**
   ```bash
   git clone https://github.com/VOTRE-USERNAME/Onepoint.git
   cd Onepoint
   ```

3. **Ajouter le repo upstream**
   ```bash
   git remote add upstream https://github.com/alexclmy/Onepoint.git
   ```

4. **Installer les dépendances**
   ```bash
   npm install
   ```

5. **Configurer l'environnement**
   ```bash
   cp .env.example .env.local
   # Éditez .env.local avec vos clés
   ```

6. **Lancer le serveur de dev**
   ```bash
   npm run dev
   ```

### Structure du Projet

```
onepoint-ai-consulting/
├── app/                    # Next.js App Router (pages & API routes)
├── components/             # Composants React réutilisables
├── lib/                    # Logique métier et helpers
│   ├── agents/            # Système multi-agents
│   ├── openai/            # Clients OpenAI
│   ├── supabase/          # Helpers Supabase
│   └── actions/           # Définitions d'analyses
├── types/                  # Types TypeScript
└── public/                 # Assets statiques
```

---

## 📏 Standards de Code

### TypeScript

- ✅ **Typage strict** : Utilisez TypeScript pour tout nouveau code
- ✅ **Pas de `any`** : Évitez `any`, utilisez `unknown` si nécessaire
- ✅ **Interfaces over types** : Préférez `interface` à `type` pour les objets
- ✅ **Exports nommés** : Utilisez des exports nommés plutôt que `export default`

```typescript
// ✅ Bon
export interface User {
  id: string;
  name: string;
}

export function getUser(id: string): Promise<User> {
  // ...
}

// ❌ Mauvais
export default function(id: any) {
  // ...
}
```

### React & Next.js

- ✅ **Functional Components** : Utilisez des composants fonctionnels avec hooks
- ✅ **Server Components** : Utilisez RSC (React Server Components) par défaut
- ✅ **Client Components** : Ajoutez `"use client"` seulement si nécessaire
- ✅ **Hooks** : Utilisez les hooks React (useState, useEffect, useCallback, etc.)

```tsx
// ✅ Bon
"use client";

import { useState, useCallback } from "react";

export function MyComponent() {
  const [count, setCount] = useState(0);

  const handleClick = useCallback(() => {
    setCount(prev => prev + 1);
  }, []);

  return <button onClick={handleClick}>{count}</button>;
}

// ❌ Mauvais
import React from "react";

class MyComponent extends React.Component {
  // ...
}
```

### Style & UI

- ✅ **Tailwind CSS** : Utilisez Tailwind pour tous les styles
- ✅ **shadcn/ui** : Utilisez les composants shadcn/ui existants
- ✅ **Responsive** : Testez sur mobile, tablette et desktop
- ✅ **Dark mode ready** : Assurez la compatibilité mode sombre

```tsx
// ✅ Bon
<div className="flex flex-col gap-4 p-6 rounded-lg bg-card text-card-foreground">
  <h2 className="text-2xl font-bold">Titre</h2>
  <p className="text-muted-foreground">Description</p>
</div>

// ❌ Mauvais
<div style={{ padding: "20px", background: "#fff" }}>
  <h2>Titre</h2>
</div>
```

### Bonnes Pratiques

#### Nomenclature

```typescript
// Composants : PascalCase
export function UserProfile() {}

// Fonctions/variables : camelCase
const getUserData = () => {};
let userName = "";

// Constantes : UPPER_SNAKE_CASE
const MAX_RETRIES = 3;
const API_URL = "https://api.example.com";

// Types/Interfaces : PascalCase
interface UserData {
  id: string;
}
```

#### Organisation des Fichiers

```
feature/
├── components/           # Composants spécifiques à la feature
│   ├── FeatureCard.tsx
│   └── FeatureForm.tsx
├── hooks/               # Custom hooks
│   └── useFeature.ts
├── utils/               # Fonctions utilitaires
│   └── featureHelpers.ts
└── page.tsx             # Page Next.js
```

#### Gestion d'Erreurs

```typescript
// ✅ Bon
try {
  const data = await fetchData();
  return data;
} catch (error) {
  console.error("Error fetching data:", error);
  toast({
    title: "Erreur",
    description: "Impossible de charger les données",
    variant: "destructive",
  });
  return null;
}

// ❌ Mauvais
try {
  return await fetchData();
} catch (e) {
  console.log(e);
}
```

#### Performance

- ✅ Utilisez `useCallback` pour les fonctions passées en props
- ✅ Utilisez `useMemo` pour les calculs coûteux
- ✅ Lazy load les composants lourds avec `dynamic`
- ✅ Optimisez les images avec `next/image`

```typescript
// ✅ Bon
const expensiveValue = useMemo(() => computeExpensive(data), [data]);

const handleClick = useCallback(() => {
  // ...
}, [dependency]);

// Lazy loading
const HeavyComponent = dynamic(() => import("./HeavyComponent"));
```

---

## 🔄 Process de Pull Request

### 1. Créer une Branche

```bash
git checkout -b feature/ma-fonctionnalite
# ou
git checkout -b fix/correction-bug
```

### 2. Développer

- Écrivez du code propre et testé
- Suivez les standards de code
- Ajoutez des commentaires si nécessaire
- Testez manuellement vos changements

### 3. Committer

Suivez les [Conventions de Commit](#conventions-de-commit)

```bash
git add .
git commit -m "feat: ajouter la fonctionnalité X"
```

### 4. Pousser

```bash
git push origin feature/ma-fonctionnalite
```

### 5. Créer la Pull Request

1. Allez sur GitHub
2. Cliquez sur "New Pull Request"
3. Remplissez le template de PR :
   - **Titre** : Résumé court (< 50 caractères)
   - **Description** : Expliquez quoi, pourquoi, comment
   - **Screenshots** : Si changements UI
   - **Tests** : Comment tester vos changements

### 6. Review & Merge

- Attendez la review d'un mainteneur
- Apportez les corrections demandées
- Une fois approuvée, la PR sera merged

---

## 📝 Conventions de Commit

Nous utilisons [Conventional Commits](https://www.conventionalcommits.org/fr/).

### Format

```
<type>(<scope>): <description courte>

<description détaillée optionnelle>

<footer optionnel>
```

### Types

- **feat** : Nouvelle fonctionnalité
- **fix** : Correction de bug
- **docs** : Documentation uniquement
- **style** : Formatage, point-virgules manquants, etc.
- **refactor** : Refactoring sans changement de comportement
- **perf** : Amélioration de performance
- **test** : Ajout ou correction de tests
- **chore** : Tâches de maintenance (build, deps, etc.)

### Exemples

```bash
# Feature
git commit -m "feat(oneveille): ajouter recherche web multi-agents"

# Fix
git commit -m "fix(history): corriger transformation des dates"

# Docs
git commit -m "docs: mettre à jour README avec OneVeille"

# Refactor
git commit -m "refactor(agents): extraire logique de décomposition"

# Chore
git commit -m "chore: mettre à jour dépendances Next.js"
```

### Scope

Le scope indique la partie du code affectée :

- `agents` : Système multi-agents
- `oneveille` : Fonctionnalité OneVeille
- `history` : Page historique
- `ui` : Composants UI
- `api` : Routes API
- `db` : Base de données
- `config` : Configuration

---

## 🏗️ Architecture du Projet

### Principes Architecturaux

1. **Separation of Concerns**
   - Logique métier dans `lib/`
   - UI dans `components/`
   - Pages dans `app/`

2. **Type Safety**
   - Tous les types dans `types/index.ts`
   - Pas de `any` (sauf cas extrêmes)

3. **Reusability**
   - Composants réutilisables dans `components/ui/`
   - Helpers réutilisables dans `lib/`

4. **Performance**
   - Server Components par défaut
   - Client Components seulement si nécessaire
   - Streaming avec SSE pour long-running tasks

### Patterns Utilisés

#### Multi-Agents Pattern

```typescript
// lib/agents/hybrid-orchestrator.ts
class HybridOrchestrator {
  async orchestrate() {
    // Phase 1: Analyse initiale
    await this.runInitialAnalysis();

    // Phase 2: Débats (2 rounds)
    await this.runDebateRounds();

    // Phase 3: Synthèse par action
    await this.runActionSynthesis();

    // Phase 4: Synthèse finale
    await this.runFinalSynthesis();
  }
}
```

#### Repository Pattern

```typescript
// lib/supabase/analyses.ts
export async function getAllAnalyses() {
  const { data, error } = await supabase
    .from("analyses")
    .select("*");

  return { analyses: data || [], error };
}
```

#### Server-Sent Events (SSE)

```typescript
// app/api/analyze/route.ts
const stream = new ReadableStream({
  async start(controller) {
    for await (const contribution of orchestrator.stream()) {
      controller.enqueue(encoder.encode(
        `data: ${JSON.stringify(contribution)}\n\n`
      ));
    }
    controller.close();
  }
});

return new Response(stream, {
  headers: {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
  },
});
```

---

## ❓ FAQ

### Comment ajouter un nouvel expert ?

1. Les experts prédéfinis sont dans `lib/experts/predefined-experts.ts`
2. Pour ajouter un expert custom via l'UI, utilisez `/experts`
3. Les experts sont stockés dans Supabase (`experts` table)

### Comment ajouter une nouvelle analyse ?

1. Ajoutez la définition dans `lib/actions/action-definitions.ts`
2. Créez la page dans `app/actions/[nom-analyse]/page.tsx`
3. Utilisez `ActionPageTemplate` pour la cohérence

### Comment débugger les appels LLM ?

- Utilisez le bouton "Debug" sur chaque contribution
- Inspectez les prompts, config LLM et recherches web
- Console logs dans `lib/agents/` pour tracer le flow

### Comment tester localement ?

```bash
# Dev mode
npm run dev

# Build production
npm run build
npm run start

# Linting
npm run lint

# Type checking
npm run type-check
```

---

## 📞 Contact

Questions ? Suggestions ?

- **Issues** : [GitHub Issues](https://github.com/alexclmy/Onepoint/issues)
- **Discussions** : [GitHub Discussions](https://github.com/alexclmy/Onepoint/discussions)

---

Merci de contribuer à **Onepoint AI Consulting Tool** ! 🚀
