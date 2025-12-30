# Gestion des Experts

## Vue d'ensemble

La gestion des experts permet de configurer et personnaliser les agents IA qui participent aux analyses multi-agents. Le système propose des experts prédéfinis et permet de créer des experts personnalisés adaptés à des besoins spécifiques.

## 🎯 Objectif

Offrir une flexibilité complète dans la configuration des experts pour :
- Adapter les analyses à des domaines d'expertise spécifiques
- Créer des personnalités d'experts personnalisées
- Configurer le ton, le style et les instructions de chaque expert
- Maintenir un portfolio d'experts réutilisables

## User Flow

### Étape 1 : Accès à la page Experts

**Navigation :**
- Cliquer sur "Gestion des Experts" dans le sidebar
- Affichage de la liste complète des experts

**Organisation :**
- **Experts Personnalisés** : En haut, créés par l'utilisateur
- **Experts Prédéfinis** : En bas, fournis par défaut (ScrollArea)

**Barre de recherche :**
- Recherche par nom, rôle ou expertise
- Filtrage en temps réel

### Étape 2 : Consultation d'un expert

**Carte Expert affiche :**
- Pastille de couleur (identité visuelle)
- Nom de l'expert
- Rôle (sous-titre en couleur primaire)
- Expertise (description)
- Badges : Tone of voice, Custom, Super Consultant
- Boutons : Éditer, Supprimer (si custom)

**Experts prédéfinis :**
- Modifiables mais non supprimables
- Peuvent être personnalisés pour un projet

### Étape 3 : Création d'un expert personnalisé

**Actions :**
1. Cliquer sur "Créer un Expert"
2. Remplir le formulaire :

**Champs obligatoires :**
- **Nom** : Ex: "Marie Dubois"
- **Rôle** : Ex: "Expert DevOps"
- **Expertise** : Ex: "Infrastructure cloud, CI/CD, conteneurisation"
- **Instructions (System Prompt)** : Définit le comportement de l'expert

**Champs optionnels :**
- **Tone of Voice** : Formel, Créatif, Analytique, Stratégique, Pragmatique
- **Couleur** : Color picker pour l'identité visuelle (#009DDF par défaut)

3. Cliquer sur "Enregistrer"
4. L'expert apparaît dans "Experts Personnalisés"

### Étape 4 : Modification d'un expert

**Actions :**
1. Cliquer sur l'icône "Éditer" sur une carte
2. Modification des champs (tous sauf ID)
3. Enregistrement des modifications

**Cas d'usage :**
- Affiner les instructions d'un expert prédéfini
- Adapter le ton d'un expert existant
- Corriger une typo dans l'expertise

### Étape 5 : Suppression d'un expert personnalisé

**Actions :**
1. Cliquer sur l'icône "Supprimer" (uniquement pour custom)
2. Confirmation de suppression
3. Suppression définitive

**Note :** Les experts prédéfinis ne peuvent pas être supprimés.

### Étape 6 : Utilisation dans une analyse

**Intégration :**
- Lors de la création d'une analyse multi-agents
- Les experts sont automatiquement sélectionnés selon les actions choisies
- Chaque expert utilise son system prompt personnalisé
- Le tone of voice influence le style des réponses

## Implémentation Technique

### Architecture

```
┌─────────────────────┐
│  ExpertsPage        │
│  app/experts/       │
│  page.tsx           │
└──────────┬──────────┘
           │
           ├─ Supabase Client
           ↓
┌──────────────────────┐
│  Supabase Database   │
│  Table: experts      │
└──────────────────────┘
           ↓
┌──────────────────────┐
│  HybridOrchestrator  │
│  Uses expert config  │
└──────────────────────┘
```

### Composant Principal

**File:** `/app/experts/page.tsx`

**État clé :**
```typescript
const [experts, setExperts] = useState<Expert[]>([]);
const [searchQuery, setSearchQuery] = useState("");
const [editingExpert, setEditingExpert] = useState<Expert | null>(null);
const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
const [isLoading, setIsLoading] = useState(true);
const [isSaving, setIsSaving] = useState(false);
```

**Chargement des experts :**
```typescript
const loadAllExperts = async () => {
  const { data, error } = await supabase
    .from("experts")
    .select("*")
    .order("is_predefined", { ascending: false })
    .order("created_at", { ascending: false });

  const transformedData = (data || []).map((expert) => ({
    id: expert.id,
    name: expert.name,
    role: expert.role,
    expertise: expert.expertise,
    tone: expert.tone as Expert["tone"],
    systemPrompt: expert.system_prompt,
    isCustom: expert.is_custom,
    isPredefined: expert.is_predefined,
    color: expert.color || "#009DDF",
    avatar: expert.avatar,
  }));

  setExperts(transformedData);
};
```

**Création/Mise à jour :**
```typescript
const handleSaveEdit = async () => {
  // Validation
  if (!editingExpert.name ||
      !editingExpert.role ||
      !editingExpert.expertise ||
      !editingExpert.systemPrompt) {
    alert("Veuillez remplir tous les champs obligatoires");
    return;
  }

  const supabaseData = {
    name: editingExpert.name,
    role: editingExpert.role,
    expertise: editingExpert.expertise,
    tone: editingExpert.tone,
    system_prompt: editingExpert.systemPrompt,
    is_custom: editingExpert.isCustom !== undefined
      ? editingExpert.isCustom
      : true,
    is_predefined: editingExpert.isPredefined || false,
    color: editingExpert.color || "#009DDF",
    avatar: editingExpert.avatar || null,
  };

  const isNewExpert = editingExpert.id.startsWith("custom-");

  if (isNewExpert) {
    await supabase
      .from("experts")
      .insert([supabaseData])
      .select()
      .single();
  } else {
    await supabase
      .from("experts")
      .update(supabaseData)
      .eq("id", editingExpert.id);
  }

  await loadAllExperts();
};
```

**Suppression :**
```typescript
const handleDelete = async (expertId: string) => {
  if (!confirm("Êtes-vous sûr de vouloir supprimer cet expert ?")) {
    return;
  }

  await supabase
    .from("experts")
    .delete()
    .eq("id", expertId);

  await loadAllExperts();
};
```

### Base de Données

**Table:** `experts`

```sql
CREATE TABLE experts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  expertise TEXT NOT NULL,
  tone TEXT DEFAULT 'pragmatic',
  system_prompt TEXT NOT NULL,
  is_custom BOOLEAN DEFAULT true,
  is_predefined BOOLEAN DEFAULT false,
  color TEXT DEFAULT '#009DDF',
  avatar TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_experts_is_predefined ON experts(is_predefined);
CREATE INDEX idx_experts_is_custom ON experts(is_custom);
```

**Champs :**
- `name`, `role`, `expertise`, `system_prompt` : Obligatoires
- `tone` : "formal", "creative", "analytical", "strategic", "pragmatic"
- `is_custom` : Créé par l'utilisateur (true) ou prédéfini (false)
- `is_predefined` : Expert fourni par défaut du système
- `color` : Code hexadécimal pour l'identité visuelle
- `avatar` : URL d'une image (optionnel)

### Type TypeScript

```typescript
interface Expert {
  id: string;
  name: string;
  role: string;
  expertise: string;
  tone: "formal" | "creative" | "analytical" | "strategic" | "pragmatic";
  systemPrompt: string;
  isCustom?: boolean;
  isPredefined?: boolean;
  color?: string;
  avatar?: string;
}
```

### System Prompt Guidelines

**Structure recommandée :**
```
Tu es [Nom], [Rôle] spécialisé(e) en [domaine].

**Expertise :**
- [Compétence 1]
- [Compétence 2]
- [Compétence 3]

**Approche :**
[Décris comment tu analyses les problèmes]

**Style de réponse :**
- [Caractéristique 1 du style]
- [Caractéristique 2 du style]
- [Format des recommandations]

**Tu dois toujours :**
- Fournir des insights actionnables
- Justifier tes recommandations
- Identifier les risques et opportunités
```

**Exemple complet :**
```
Tu es Marie Dubois, Expert DevOps spécialisée en infrastructure cloud et CI/CD.

**Expertise :**
- Architecture cloud native (AWS, Azure, GCP)
- Pipelines CI/CD (GitLab, Jenkins, GitHub Actions)
- Conteneurisation et orchestration (Docker, Kubernetes)
- Infrastructure as Code (Terraform, Ansible)
- Monitoring et observabilité (Prometheus, Grafana, ELK)

**Approche :**
Tu analyses les infrastructures sous l'angle de la fiabilité, scalabilité
et coût. Tu priorises l'automatisation et les best practices DevOps.

**Style de réponse :**
- Pragmatique et orienté solutions
- Structure en problèmes → solutions → bénéfices
- Recommandations avec estimation de complexité (Simple/Moyen/Complexe)
- Citations de best practices et standards de l'industrie

**Tu dois toujours :**
- Évaluer l'impact sur la disponibilité et performance
- Proposer des métriques de suivi
- Identifier les risques techniques et de sécurité
- Suggérer des outils et technologies adaptés
```

### Intégration avec les Analyses

**Utilisation dans HybridOrchestrator :**
```typescript
// Load experts from database
const { data: expertConfigs } = await supabase
  .from("experts")
  .select("*");

// Map experts to selected actions
const agents = selectedActions.map((action) => {
  const expertConfig = expertConfigs.find((e) => e.action === action);

  return new ResponsesAgent({
    name: expertConfig.name,
    action: expertConfig.role,
    systemPrompt: expertConfig.system_prompt,
    model: config.model,
    useWebSearch: expertConfig.use_web_search || false,
  });
});

// Use agents in orchestration
for (const agent of agents) {
  const contribution = await agent.analyze(question, companyContext);
  // ...
}
```

**Tone of Voice Impact :**
```typescript
function enhanceSystemPromptWithTone(
  basePrompt: string,
  tone: Expert["tone"]
): string {
  const toneInstructions = {
    formal: "Utilise un langage formel, professionnel et structuré.",
    creative: "Sois créatif, original et propose des angles innovants.",
    analytical: "Adopte une approche data-driven avec chiffres et analyses.",
    strategic: "Pense long-terme avec vision stratégique et anticipation.",
    pragmatic: "Reste pragmatique, concret et orienté résultats immédiats.",
  };

  return `${basePrompt}\n\n**Ton de communication:**\n${toneInstructions[tone]}`;
}
```

## UI Components

### Expert Card

```tsx
function ExpertCard({ expert, onEdit, onDelete, isCustom }: Props) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: expert.color }}
            />
            <CardTitle className="text-base">{expert.name}</CardTitle>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(expert)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            {isCustom && (
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive"
                onClick={() => onDelete(expert.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        <CardDescription className="text-sm font-medium text-primary">
          {expert.role}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{expert.expertise}</p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="text-xs">
            {expert.tone}
          </Badge>
          {isCustom && <Badge className="text-xs">Custom</Badge>}
          {expert.id === "super-consultant-onepoint" && (
            <Badge className="bg-primary text-xs">⭐ Super Consultant</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

### Edit Dialog

```tsx
<Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>
        {editingExpert.name ? `Modifier ${editingExpert.name}` : "Nouvel Expert"}
      </DialogTitle>
      <DialogDescription>
        Configurez les détails de l'expert et ses instructions
      </DialogDescription>
    </DialogHeader>
    <div className="grid gap-4 py-4">
      {/* Nom et Rôle */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nom</Label>
          <Input
            id="name"
            value={editingExpert.name}
            onChange={(e) =>
              setEditingExpert({ ...editingExpert, name: e.target.value })
            }
            placeholder="Ex: Marie Dubois"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">Rôle</Label>
          <Input
            id="role"
            value={editingExpert.role}
            onChange={(e) =>
              setEditingExpert({ ...editingExpert, role: e.target.value })
            }
            placeholder="Ex: Expert DevOps"
          />
        </div>
      </div>

      {/* Expertise */}
      <div className="space-y-2">
        <Label htmlFor="expertise">Expertise</Label>
        <Input
          id="expertise"
          value={editingExpert.expertise}
          onChange={(e) =>
            setEditingExpert({ ...editingExpert, expertise: e.target.value })
          }
          placeholder="Ex: Infrastructure cloud, CI/CD, conteneurisation"
        />
      </div>

      {/* Tone et Couleur */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="tone">Tone of Voice</Label>
          <Select
            value={editingExpert.tone}
            onValueChange={(value) =>
              setEditingExpert({ ...editingExpert, tone: value as Expert["tone"] })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="formal">Formel</SelectItem>
              <SelectItem value="creative">Créatif</SelectItem>
              <SelectItem value="analytical">Analytique</SelectItem>
              <SelectItem value="strategic">Stratégique</SelectItem>
              <SelectItem value="pragmatic">Pragmatique</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="color">Couleur</Label>
          <Input
            id="color"
            type="color"
            value={editingExpert.color || "#009DDF"}
            onChange={(e) =>
              setEditingExpert({ ...editingExpert, color: e.target.value })
            }
          />
        </div>
      </div>

      {/* System Prompt */}
      <div className="space-y-2">
        <Label htmlFor="systemPrompt">Instructions (System Prompt)</Label>
        <Textarea
          id="systemPrompt"
          value={editingExpert.systemPrompt}
          onChange={(e) =>
            setEditingExpert({ ...editingExpert, systemPrompt: e.target.value })
          }
          placeholder="Tu es [Nom], expert en [domaine]..."
          className="min-h-[200px] font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground">
          Définissez le comportement, l'expertise et le style de réponse de l'expert
        </p>
      </div>
    </div>
    <DialogFooter>
      <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
        Annuler
      </Button>
      <Button onClick={handleSaveEdit} disabled={isSaving}>
        {isSaving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Enregistrement...
          </>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" />
            Enregistrer
          </>
        )}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

## Exemples d'Experts

### Expert Marketing Digital

```
Nom: Sophie Martin
Rôle: Expert Marketing Digital
Expertise: Stratégie digitale, SEO/SEA, Social Media, Growth Hacking
Tone: Creative
Couleur: #FF6B6B

System Prompt:
Tu es Sophie Martin, Expert Marketing Digital spécialisée en acquisition
et fidélisation client sur les canaux digitaux.

**Expertise :**
- Stratégie de contenu et inbound marketing
- SEO technique et sémantique
- Campagnes SEA (Google Ads, Meta Ads)
- Social Media Marketing et community management
- Growth hacking et optimisation de conversion
- Analytics et attribution multi-touch

**Approche :**
Tu analyses les problématiques marketing avec créativité tout en restant
data-driven. Tu privilégies les quick wins et l'expérimentation rapide.

**Style de réponse :**
- Créatif avec exemples concrets de campagnes
- Propose des stratégies en entonnoir (TOFU/MOFU/BOFU)
- Recommandations avec KPIs de succès
- Insights basés sur les tendances actuelles

**Tu dois toujours :**
- Proposer des tests A/B et méthodes de validation
- Estimer les coûts d'acquisition (CAC) et ROI
- Identifier les canaux les plus performants
- Suggérer des outils marketing adaptés
```

### Expert Data Science

```
Nom: Thomas Leroy
Rôle: Expert Data Science & IA
Expertise: Machine Learning, Big Data, Data Engineering, MLOps
Tone: Analytical
Couleur: #4ECDC4

System Prompt:
Tu es Thomas Leroy, Expert Data Science spécialisé en ML, analytics
et exploitation de données à grande échelle.

**Expertise :**
- Machine Learning (supervised, unsupervised, deep learning)
- Data Engineering et pipelines ETL/ELT
- Big Data (Spark, Hadoop, Databricks)
- MLOps et déploiement de modèles
- Data visualization et storytelling
- SQL avancé et optimisation de requêtes

**Approche :**
Tu analyses les problématiques avec rigueur scientifique. Tu évalues
toujours la faisabilité technique, la qualité des données et les métriques
de performance.

**Style de réponse :**
- Analytique et data-driven
- Structure en : données → modèle → métriques → déploiement
- Recommandations avec benchmarks et références académiques
- Évaluation critique des solutions proposées

**Tu dois toujours :**
- Évaluer la qualité et disponibilité des données
- Proposer des métriques d'évaluation pertinentes
- Identifier les biais potentiels et risques éthiques
- Suggérer une roadmap progressive (MVP → Production)
```

## Troubleshooting

### Problème : Expert non pris en compte dans l'analyse

**Cause possible :** L'expert n'est pas mappé à une action
**Solution :** Vérifier que le champ `action` de l'expert correspond à une action disponible

### Problème : System prompt trop long

**Cause possible :** Dépasse la limite de tokens
**Solution :** Réduire le system prompt à l'essentiel (< 500 tokens recommandé)

### Problème : Réponses incohérentes avec le tone of voice

**Cause possible :** Ton mal défini dans le system prompt
**Solution :** Ajouter des instructions explicites de style dans le system prompt

## Évolutions Futures

- [ ] Bibliothèque d'experts partagée (marketplace)
- [ ] Import/Export d'experts (JSON)
- [ ] Templates de system prompts par domaine
- [ ] A/B testing entre différents experts
- [ ] Statistiques de performance par expert
- [ ] Versioning des experts (historique des modifications)
- [ ] Tags et catégories d'experts
- [ ] Rating et feedback sur les contributions d'experts
