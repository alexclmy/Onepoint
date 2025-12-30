# Gestion des Entreprises

## Vue d'ensemble

La gestion des entreprises permet de créer et maintenir un portfolio d'entreprises clientes avec leur contexte métier. Ces informations enrichissent les analyses multi-agents en fournissant un contexte spécifique à chaque analyse.

## 🎯 Objectif

Centraliser les informations clés sur les entreprises clientes pour :
- Enrichir le contexte des analyses multi-agents
- Maintenir un référentiel de connaissances métier
- Personnaliser les recommandations stratégiques
- Créer un glossaire de termes spécifiques

## User Flow

### Étape 1 : Accès à la page Entreprises

**Navigation :**
- Cliquer sur "Mes Entreprises" dans le sidebar
- Affichage de la liste des entreprises existantes
- Barre de recherche pour filtrer par nom ou secteur

**Éléments affichés :**
- Carte par entreprise avec :
  - Nom et secteur
  - Description abrégée
  - Taille et localisation (badges)
  - Nombre de termes dans le glossaire
  - Boutons Éditer et Supprimer

### Étape 2 : Création d'une nouvelle entreprise

**Actions :**
1. Cliquer sur "Nouvelle Entreprise"
2. Remplir le formulaire en plusieurs sections :

**Section 1 : Informations Générales (obligatoires)**
- Nom de l'entreprise
- Secteur d'activité
- Description
- Taille (nombre d'employés)
- Localisation
- Année de création
- Site web

**Section 2 : Mission, Vision & Valeurs**
- Mission (textarea)
- Vision (textarea)
- Valeurs (liste avec ajout/suppression)

**Section 3 : Marché & Concurrence**
- Marché cible (textarea)
- Liste des concurrents (ajout/suppression)
- Points de différenciation / USP (ajout/suppression)

**Section 4 : Glossaire**
- Termes spécifiques avec définitions
- Format : Terme + Définition
- Ajout/suppression de termes

**Section 5 : Contexte Personnalisé**
- Champ texte libre pour informations supplémentaires

3. Cliquer sur "Enregistrer"
4. Confirmation de création

### Étape 3 : Modification d'une entreprise

**Actions :**
1. Cliquer sur l'icône "Éditer" sur une carte d'entreprise
2. Modification des champs dans le dialogue
3. Enregistrement des modifications

**Validations :**
- Nom obligatoire
- Secteur obligatoire
- Description obligatoire
- Autres champs optionnels

### Étape 4 : Suppression d'une entreprise

**Actions :**
1. Cliquer sur l'icône "Supprimer"
2. Confirmation de suppression
3. Suppression définitive de la base de données

**Note :** La suppression d'une entreprise ne supprime pas les analyses associées.

### Étape 5 : Utilisation dans les analyses

**Intégration :**
- Lors de la création d'une analyse multi-agents
- Sélectionner une entreprise dans le dropdown
- Le contexte entreprise est automatiquement injecté dans les prompts des agents
- Les agents tiennent compte des spécificités métier

**Contexte fourni aux agents :**
- Description de l'entreprise
- Secteur et marché cible
- Valeurs et mission
- Concurrents et USP
- Glossaire de termes
- Contexte personnalisé

## Implémentation Technique

### Architecture

```
┌─────────────────────┐
│  CompaniesPage      │
│  app/company/       │
│  page.tsx           │
└──────────┬──────────┘
           │
           ├─ Supabase Client
           ↓
┌──────────────────────┐
│  Supabase Database   │
│  Table: company      │
└──────────────────────┘
```

### Composant Principal

**File:** `/app/company/page.tsx`

**État clé :**
```typescript
const [companies, setCompanies] = useState<Company[]>([]);
const [searchQuery, setSearchQuery] = useState("");
const [editingCompany, setEditingCompany] = useState<Company | null>(null);
const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

// Form states
const [newValue, setNewValue] = useState("");
const [newCompetitor, setNewCompetitor] = useState("");
const [newUSP, setNewUSP] = useState("");
const [newGlossaryTerm, setNewGlossaryTerm] = useState({
  term: "",
  definition: ""
});
```

**Fonctions principales :**
```typescript
// Load companies from Supabase
const loadCompanies = async () => {
  const { data, error } = await supabase
    .from("company")
    .select("*")
    .order("created_at", { ascending: false });

  const transformedData = (data || []).map((company) => ({
    ...company,
    createdAt: new Date(company.created_at),
    updatedAt: new Date(company.updated_at),
  }));

  setCompanies(transformedData);
};

// Create or update company
const handleSave = async () => {
  const supabaseData = {
    name: editingCompany.name,
    industry: editingCompany.industry,
    description: editingCompany.description,
    size: editingCompany.size || null,
    location: editingCompany.location || null,
    website: editingCompany.website || null,
    founded_year: editingCompany.foundedYear || null,
    mission: editingCompany.mission || null,
    vision: editingCompany.vision || null,
    values: editingCompany.values || [],
    target_market: editingCompany.targetMarket || null,
    competitors: editingCompany.competitors || [],
    unique_selling_points: editingCompany.uniqueSellingPoints || [],
    glossary: editingCompany.glossary || [],
    custom_context: editingCompany.customContext || null,
  };

  if (exists) {
    await supabase
      .from("company")
      .update(supabaseData)
      .eq("id", editingCompany.id);
  } else {
    await supabase
      .from("company")
      .insert([supabaseData]);
  }

  await loadCompanies();
};

// Delete company
const handleDelete = async (companyId: string) => {
  if (!confirm("Êtes-vous sûr de vouloir supprimer cette entreprise ?")) {
    return;
  }

  await supabase
    .from("company")
    .delete()
    .eq("id", companyId);

  setCompanies(companies.filter((c) => c.id !== companyId));
};
```

### Base de Données

**Table:** `company`

```sql
CREATE TABLE company (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  industry TEXT NOT NULL,
  description TEXT NOT NULL,
  size TEXT,
  location TEXT,
  website TEXT,
  founded_year INTEGER,
  mission TEXT,
  vision TEXT,
  values TEXT[],
  target_market TEXT,
  competitors TEXT[],
  unique_selling_points TEXT[],
  glossary JSONB DEFAULT '[]'::jsonb,
  custom_context TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_company_name ON company(name);
CREATE INDEX idx_company_industry ON company(industry);
```

**Champs :**
- `name`, `industry`, `description` : Obligatoires
- `size`, `location`, `website`, `founded_year` : Métadonnées
- `mission`, `vision`, `values` : Identité
- `target_market`, `competitors`, `unique_selling_points` : Positionnement
- `glossary` : Array JSON de `{ term: string, definition: string }`
- `custom_context` : Champ texte libre

### Type TypeScript

```typescript
interface Company {
  id: string;
  name: string;
  industry: string;
  description: string;
  size?: string;
  location?: string;
  website?: string;
  foundedYear?: number;
  mission?: string;
  vision?: string;
  values: string[];
  targetMarket?: string;
  competitors: string[];
  uniqueSellingPoints: string[];
  glossary: GlossaryTerm[];
  customContext?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface GlossaryTerm {
  term: string;
  definition: string;
}
```

### Intégration avec les Analyses

**Contexte Builder :**
```typescript
function buildCompanyContext(company: Company): string {
  let context = `# Contexte Entreprise\n\n`;
  context += `**Nom:** ${company.name}\n`;
  context += `**Secteur:** ${company.industry}\n`;
  context += `**Description:** ${company.description}\n\n`;

  if (company.mission) {
    context += `**Mission:** ${company.mission}\n\n`;
  }

  if (company.values.length > 0) {
    context += `**Valeurs:** ${company.values.join(", ")}\n\n`;
  }

  if (company.competitors.length > 0) {
    context += `**Concurrents:** ${company.competitors.join(", ")}\n\n`;
  }

  if (company.uniqueSellingPoints.length > 0) {
    context += `**USP:** ${company.uniqueSellingPoints.join(", ")}\n\n`;
  }

  if (company.glossary.length > 0) {
    context += `**Glossaire:**\n`;
    company.glossary.forEach(({ term, definition }) => {
      context += `- ${term}: ${definition}\n`;
    });
  }

  if (company.customContext) {
    context += `\n${company.customContext}\n`;
  }

  return context;
}
```

**Utilisation dans l'analyse :**
```typescript
// app/api/analyze/route.ts
let companyContext = "";
if (companyId) {
  const { data: company } = await supabase
    .from("company")
    .select("*")
    .eq("id", companyId)
    .single();

  if (company) {
    companyContext = buildCompanyContext(company);
  }
}

// Passed to orchestrator
const orchestrator = new HybridOrchestrator({
  question,
  selectedActions,
  companyContext, // Injected here
  model,
  onEvent,
});
```

## UI Components

### Company Card

```tsx
<Card className="transition-shadow hover:shadow-md">
  <CardHeader>
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <CardTitle className="text-lg">{company.name}</CardTitle>
        <CardDescription className="mt-1">
          {company.industry}
        </CardDescription>
      </div>
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleEdit(company)}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-destructive"
          onClick={() => handleDelete(company.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  </CardHeader>
  <CardContent className="space-y-3">
    <p className="text-sm text-muted-foreground line-clamp-2">
      {company.description}
    </p>
    <div className="flex flex-wrap gap-2">
      {company.size && (
        <Badge variant="outline">{company.size}</Badge>
      )}
      {company.location && (
        <Badge variant="outline">{company.location}</Badge>
      )}
    </div>
    {company.glossary.length > 0 && (
      <p className="text-xs text-muted-foreground">
        📚 {company.glossary.length} terme(s) dans le glossaire
      </p>
    )}
  </CardContent>
</Card>
```

### Edit Dialog

```tsx
<Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>
        {editingCompany.name
          ? `Modifier ${editingCompany.name}`
          : "Nouvelle Entreprise"}
      </DialogTitle>
    </DialogHeader>
    <ScrollArea className="max-h-[70vh] pr-4">
      <div className="space-y-6 py-4">
        {/* Sections: Infos générales, Mission/Vision, Marché, Glossaire */}
      </div>
    </ScrollArea>
    <DialogFooter>
      <Button variant="outline" onClick={closeDialog}>
        Annuler
      </Button>
      <Button onClick={handleSave}>
        <Save className="mr-2 h-4 w-4" />
        Enregistrer
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Helper Functions

```typescript
// Add value to list
const addValue = () => {
  if (editingCompany && newValue.trim()) {
    setEditingCompany({
      ...editingCompany,
      values: [...(editingCompany.values || []), newValue.trim()],
    });
    setNewValue("");
  }
};

// Remove value from list
const removeValue = (index: number) => {
  if (editingCompany) {
    setEditingCompany({
      ...editingCompany,
      values: editingCompany.values?.filter((_, i) => i !== index) || [],
    });
  }
};

// Add glossary term
const addGlossaryTerm = () => {
  if (editingCompany &&
      newGlossaryTerm.term.trim() &&
      newGlossaryTerm.definition.trim()) {
    setEditingCompany({
      ...editingCompany,
      glossary: [...editingCompany.glossary, newGlossaryTerm],
    });
    setNewGlossaryTerm({ term: "", definition: "" });
  }
};
```

## Exemples d'Utilisation

### Exemple 1 : Entreprise Tech Startup

```
Nom: TechFlow AI
Secteur: SaaS / Intelligence Artificielle
Description: Startup développant des solutions IA pour l'automatisation
Taille: 50 employés
Localisation: Paris, France
Mission: Démocratiser l'IA pour les PME
Valeurs: ["Innovation", "Simplicité", "Impact"]
Concurrents: ["OpenAI", "Anthropic", "Mistral AI"]
USP: ["Interface no-code", "Prix accessible", "Support français"]
Glossaire: [
  { term: "LLM", definition: "Large Language Model" },
  { term: "RAG", definition: "Retrieval Augmented Generation" }
]
```

### Exemple 2 : Grande Distribution

```
Nom: SuperMarché Plus
Secteur: Distribution / Commerce de détail
Description: Chaîne de supermarchés avec 300+ magasins
Taille: 10000+ employés
Localisation: France
Mission: Offrir des produits de qualité à prix accessible
Vision: Devenir leader du commerce responsable
Valeurs: ["Proximité", "Qualité", "Durabilité"]
Marché cible: Familles françaises, zones urbaines et périurbaines
Concurrents: ["Carrefour", "Auchan", "Leclerc"]
USP: [
  "100% produits locaux",
  "Programme fidélité innovant",
  "Livraison en 2h"
]
```

## Troubleshooting

### Problème : Entreprise non créée

**Cause possible :** Champs obligatoires manquants
**Solution :** Vérifier que nom, secteur et description sont remplis

### Problème : Glossaire non pris en compte

**Cause possible :** Format JSON invalide
**Solution :** Vérifier que chaque terme a bien un term ET une definition

### Problème : Contexte non injecté dans l'analyse

**Cause possible :** Entreprise non sélectionnée
**Solution :** Vérifier que l'entreprise est bien sélectionnée dans le dropdown de création d'analyse

## Évolutions Futures

- [ ] Import/Export d'entreprises (JSON, CSV)
- [ ] Duplication d'entreprises (templates)
- [ ] Historique des modifications
- [ ] Attachement de documents (présentations, rapports)
- [ ] Tags et catégories personnalisés
- [ ] Relation entre entreprises (filiales, partenaires)
- [ ] Statistiques d'utilisation par entreprise
