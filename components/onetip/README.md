# OneTip - Composants

Ce dossier contient les composants de la fonctionnalité **OneTip**, une boîte à outils pour consultants.

## Composants

### `tip-card.tsx`
Carte affichant un tip dans la grille de la page principale.

**Props :**
- `tip: OneTip` - Les données du tip à afficher
- `onUpvote?: (id: string) => Promise<void>` - Fonction pour upvoter le tip

**Fonctionnalités :**
- Affichage du titre, description et catégorie
- Image de couverture (si présente)
- Bouton d'upvote avec animation
- Lien externe (si présent)
- Navigation vers la page détaillée au clic

### `tip-detail.tsx`
Page détaillée d'un tip avec tout son contenu.

**Props :**
- `tip: OneTip` - Les données du tip à afficher
- `onUpvote?: (id: string) => Promise<void>` - Fonction pour upvoter le tip

**Fonctionnalités :**
- Affichage complet du contenu HTML enrichi
- Image de couverture en grand format
- Bouton retour vers la liste
- Upvote avec compteur
- Lien externe (si présent)
- Styles optimisés pour le contenu (prose classes)

### `tip-form.tsx`
Formulaire modal pour ajouter un nouveau tip.

**Props :**
- `onSubmit: (tip: TipData) => Promise<void>` - Fonction appelée lors de la soumission

**Fonctionnalités :**
- Champs titre, description et catégorie
- Éditeur de texte riche (Tiptap) pour le contenu
- Upload d'image de couverture (fichier ou URL)
- Lien externe optionnel
- Validation des champs obligatoires
- Messages de succès/erreur

### `rich-text-editor.tsx`
Éditeur WYSIWYG basé sur Tiptap pour créer du contenu enrichi.

**Props :**
- `content: string` - Le contenu HTML initial
- `onChange: (content: string) => void` - Callback appelé à chaque changement
- `placeholder?: string` - Texte du placeholder

**Fonctionnalités de l'éditeur :**

#### Formatage de texte
- **Gras** (Ctrl+B)
- *Italique* (Ctrl+I)
- ~~Barré~~
- `Code inline`

#### Titres
- Titre 1 (H1)
- Titre 2 (H2)
- Titre 3 (H3)

#### Listes
- Liste à puces
- Liste numérotée
- Citation
- Bloc de code avec coloration syntaxique

#### Médias
- Insertion d'images (upload ou URL)
- Liens hypertexte

#### Actions
- Annuler (Ctrl+Z)
- Rétablir (Ctrl+Y)

**Coloration syntaxique :**
L'éditeur utilise `lowlight` pour la coloration syntaxique des blocs de code. Les langages supportés incluent :
- JavaScript/TypeScript
- Python
- HTML/CSS
- SQL
- JSON
- Et bien d'autres...

## Styles

Les styles de l'éditeur sont définis dans `/app/globals.css` avec la classe `.ProseMirror`.

Le contenu affiché dans `tip-detail.tsx` utilise les classes Tailwind prose pour un rendu optimal.

## Upload d'images

Les images sont uploadées vers Supabase Storage via l'API `/api/upload`.

**Configuration requise :**
1. Créer un bucket `images` dans Supabase Storage
2. Configurer le bucket en mode public
3. Voir `/lib/supabase/storage-setup.md` pour les instructions détaillées

**Limitations :**
- Taille maximale : 5MB
- Types acceptés : images uniquement (MIME type `image/*`)

## Exemple d'utilisation

```tsx
import { TipCard } from "@/components/onetip/tip-card";
import { TipForm } from "@/components/onetip/tip-form";

// Afficher une carte
<TipCard tip={tip} onUpvote={handleUpvote} />

// Formulaire d'ajout
<TipForm onSubmit={handleCreateTip} />
```

## Types

Les types TypeScript pour OneTip sont définis dans `/types/index.ts` :

```typescript
interface OneTip {
  id: string;
  title: string;
  description: string;
  content: string; // HTML enrichi
  imageUrl?: string;
  linkUrl?: string;
  category: string;
  upvotes: number;
  createdAt: Date;
  updatedAt: Date;
}

type TipCategory =
  | "llm"
  | "tools"
  | "process"
  | "communication"
  | "analysis"
  | "general";
```
