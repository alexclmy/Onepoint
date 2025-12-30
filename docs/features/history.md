# Historique des Analyses et Veilles

## Vue d'ensemble

L'historique centralise toutes les analyses multi-agents et veilles stratégiques effectuées. Cette page permet de consulter, télécharger et gérer l'ensemble des rapports générés.

## 🎯 Objectif

Offrir un accès centralisé à tous les rapports pour :
- Consulter les analyses et veilles passées
- Télécharger les rapports en PDF
- Comparer les résultats dans le temps
- Réutiliser les insights précédents
- Supprimer les rapports obsolètes

## User Flow

### Étape 1 : Accès à l'historique

**Navigation :**
- Cliquer sur "Historique" dans le sidebar
- Chargement parallèle des analyses et veilles
- Affichage unifié dans une liste chronologique

**Statistiques affichées :**
- **Total** : Nombre total de rapports (analyses + veilles)
- **Analyses** : Nombre d'analyses multi-agents
- **Veilles** : Nombre de veilles stratégiques
- **Ce mois-ci** : Rapports créés ce mois

### Étape 2 : Navigation dans la liste

**Organisation :**
- Liste unifiée triée par date (plus récent en premier)
- ScrollArea avec 500px de hauteur
- Alternance analyses (🔵 bleues) et veilles (🟣 violettes)

**Chaque rapport affiche :**
- **Icône** : FileText (analyse) ou Radar (veille)
- **Titre** : Question/sujet de la recherche
- **Badge** : Type (Analyse / Veille)
- **Métadonnées** :
  - Date de création
  - Pour analyses : nombre d'experts, statut
  - Pour veilles : nombre de recherches, modèle utilisé
- **Actions** : Voir, Télécharger PDF, Supprimer

### Étape 3 : Consultation d'une analyse

**Navigation :**
1. Cliquer sur l'icône "👁️ Voir" d'une analyse
2. Redirection vers `/analysis/[id]`

**Page de détail affiche :**
- **Header** :
  - Titre "Détails de l'Analyse"
  - Date de création
  - Bouton "Télécharger PDF"
  - Bouton "Retour à l'historique"

- **Informations de l'analyse** :
  - Demande (question business)
  - Actions sélectionnées (badges)
  - Experts consultés
  - Nombre de contributions

- **Synthèse Exécutive** :
  - Rapport final markdown
  - Recommandations stratégiques
  - Affichage avec MarkdownRenderer

- **Timeline des Contributions** :
  - Toutes les contributions des experts
  - Phases : Initial, Débat 1, Débat 2
  - Expansion/collapse par contribution
  - Debug info si disponible

### Étape 4 : Consultation d'une veille

**Navigation :**
1. Cliquer sur l'icône "👁️ Voir" d'une veille
2. Redirection vers `/veille/[id]`

**Page de détail affiche :**
- **Header** :
  - Titre "Rapport de Veille"
  - Date de création
  - Bouton "Télécharger PDF"
  - Bouton "Retour à l'historique"

- **Requête de Veille** :
  - Sujet de la veille

- **Paramètres d'Analyse** :
  - Géographie : Local → Global (slider visual)
  - Temporalité : Récent → Historique (slider visual)
  - Focus : Business → Technique (slider visual)

- **Mots-clés Sélectionnés** :
  - Badges des keywords utilisés

- **Axes de Recherche** :
  - Liste numérotée des sous-questions
  - Affichage en cartes bordées

- **Rapport de Veille Stratégique** :
  - Rapport final markdown
  - Sources et citations
  - Modèle utilisé (badge)

### Étape 5 : Téléchargement PDF

**Depuis l'historique :**
1. Cliquer sur l'icône "📥 Télécharger"
2. Toast "Génération du PDF..."
3. Appel API `/api/generate-pdf`
4. Téléchargement automatique du fichier
5. Nom : `analyse-YYYY-MM-DD.pdf` ou `veille-YYYY-MM-DD.pdf`

**Depuis la page de détail :**
1. Cliquer sur "Télécharger PDF"
2. Même processus que ci-dessus

**Format PDF :**
- En-tête avec logo et date
- Question/Sujet en titre
- Pour analyses : Timeline complète des contributions
- Pour veilles : Rapport de synthèse complet
- Synthèse exécutive en conclusion

### Étape 6 : Suppression d'un rapport

**Actions :**
1. Cliquer sur l'icône "🗑️ Supprimer"
2. Confirmation : "Êtes-vous sûr de vouloir supprimer cette [analyse/veille] ?"
3. Si confirmé :
   - DELETE request à l'API
   - Suppression en base de données
   - Rechargement de la liste
   - Toast "Analyse/Veille supprimée avec succès"

**Note :** La suppression est définitive et ne peut être annulée.

## Implémentation Technique

### Architecture

```
┌──────────────────────┐
│   HistoryPage        │
│   app/history/       │
│   page.tsx           │
└──────────┬───────────┘
           │
           ├─ Parallel API Calls
           ↓
┌─────────────────────────────────┐
│  GET /api/analyses?stats=true   │
│  GET /api/veilles               │
└─────────────┬───────────────────┘
              │
              ├─ Supabase
              ↓
┌──────────────────────┐
│  analyses table      │
│  veille_history      │
└──────────────────────┘
```

### Composant Principal

**File:** `/app/history/page.tsx`

**État clé :**
```typescript
const [reports, setReports] = useState<Report[]>([]);
const [stats, setStats] = useState<HistoryStats>({
  total: 0,
  totalAnalyses: 0,
  totalVeilles: 0,
  thisMonth: 0,
  averageDuration: 0,
});
const [isLoading, setIsLoading] = useState(true);
const [deletingId, setDeletingId] = useState<string | null>(null);
```

**Chargement parallèle :**
```typescript
const loadReports = async () => {
  // Load analyses and veilles in parallel
  const [analysesResponse, veillesResponse] = await Promise.all([
    fetch("/api/analyses?stats=true"),
    fetch("/api/veilles"),
  ]);

  const analysesData = await analysesResponse.json();
  const veillesData = await veillesResponse.json();

  // Transform dates
  const analyses: Analysis[] = analysesData.analyses.map((a: any) => ({
    ...a,
    createdAt: new Date(a.createdAt),
    updatedAt: new Date(a.updatedAt),
  }));

  const veilles: VeilleHistory[] = veillesData.veilles.map((v: any) => ({
    id: v.id,
    query: v.query,
    parameters: v.parameters,
    keywords: v.keywords,
    companyId: v.company_id,
    subQueries: v.sub_queries,
    results: v.results,
    finalReport: v.final_report,
    modelUsed: v.model_used,
    createdAt: new Date(v.created_at),
    updatedAt: new Date(v.updated_at),
  }));

  // Unify and sort
  const allReports: Report[] = [
    ...analyses.map((a) => ({ type: "analysis" as const, data: a })),
    ...veilles.map((v) => ({ type: "veille" as const, data: v })),
  ];

  allReports.sort((a, b) => {
    return b.data.createdAt.getTime() - a.data.createdAt.getTime();
  });

  setReports(allReports);

  // Calculate stats
  const now = new Date();
  const thisMonthReports = allReports.filter((r) => {
    const createdAt = r.data.createdAt;
    return (
      createdAt.getMonth() === now.getMonth() &&
      createdAt.getFullYear() === now.getFullYear()
    );
  });

  setStats({
    total: allReports.length,
    totalAnalyses: analyses.length,
    totalVeilles: veilles.length,
    thisMonth: thisMonthReports.length,
    averageDuration: analysesData.stats?.averageDuration || 0,
  });
};
```

**Suppression :**
```typescript
const handleDelete = async (report: Report) => {
  const itemType = report.type === "analysis" ? "analyse" : "veille";
  if (!confirm(`Êtes-vous sûr de vouloir supprimer cette ${itemType} ?`)) {
    return;
  }

  setDeletingId(report.data.id);

  let response;
  if (report.type === "analysis") {
    response = await fetch(`/api/analyses/${report.data.id}`, {
      method: "DELETE",
    });
  } else {
    response = await fetch(`/api/veilles?id=${report.data.id}`, {
      method: "DELETE",
    });
  }

  if (!response.ok) {
    throw new Error(`Failed to delete ${itemType}`);
  }

  toast({
    title: "Succès",
    description: `${itemType.charAt(0).toUpperCase() + itemType.slice(1)} supprimée`,
  });

  loadReports(); // Reload list
  setDeletingId(null);
};
```

**Navigation :**
```typescript
const handleView = (report: Report) => {
  if (report.type === "analysis") {
    router.push(`/analysis/${report.data.id}`);
  } else {
    router.push(`/veille/${report.data.id}`);
  }
};
```

**Téléchargement PDF :**
```typescript
const handleDownloadPDF = async (report: Report) => {
  toast({
    title: "Génération du PDF",
    description: "Veuillez patienter...",
  });

  const requestBody = report.type === "analysis"
    ? {
        userInput: (report.data as Analysis).userInput,
        actions: (report.data as Analysis).selectedActions,
        timeline: (report.data as Analysis).timeline,
        executiveSummary: (report.data as Analysis).result || "",
      }
    : {
        userInput: (report.data as VeilleHistory).query,
        actions: [],
        timeline: [],
        executiveSummary: (report.data as VeilleHistory).finalReport,
        isVeille: true,
      };

  const response = await fetch("/api/generate-pdf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    throw new Error("Failed to generate PDF");
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = report.type === "analysis"
    ? `analyse-${format(report.data.createdAt, "yyyy-MM-dd")}.pdf`
    : `veille-${format(report.data.createdAt, "yyyy-MM-dd")}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  toast({
    title: "Succès",
    description: "PDF téléchargé avec succès",
  });
};
```

### API Routes

**GET /api/analyses**

```typescript
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const includeStats = searchParams.get("stats") === "true";

  const { analyses, error } = await getAllAnalyses();

  if (error) {
    return NextResponse.json(
      { error: "Failed to fetch analyses" },
      { status: 500 }
    );
  }

  if (includeStats) {
    const stats = await getAnalysesStats();
    return NextResponse.json({ analyses, stats });
  }

  return NextResponse.json({ analyses });
}
```

**GET /api/veilles**

```typescript
export async function GET(request: NextRequest) {
  const { veilles, error } = await getAllVeilles();

  if (error) {
    return NextResponse.json(
      { error: "Failed to fetch veilles" },
      { status: 500 }
    );
  }

  return NextResponse.json({ veilles });
}
```

**DELETE /api/analyses/[id]**

```typescript
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  const { error } = await supabase
    .from("analyses")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json(
      { error: "Failed to delete analysis" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
```

**DELETE /api/veilles**

```typescript
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Missing veille ID" },
      { status: 400 }
    );
  }

  const { success, error } = await deleteVeille(id);

  if (!success || error) {
    return NextResponse.json(
      { error: error || "Failed to delete veille" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
```

### Type TypeScript

```typescript
type Report =
  | { type: "analysis"; data: Analysis }
  | { type: "veille"; data: VeilleHistory };

interface HistoryStats {
  total: number;
  totalAnalyses: number;
  totalVeilles: number;
  thisMonth: number;
  averageDuration: number;
}
```

## Pages de Détail

### Analysis Detail Page

**File:** `/app/analysis/[id]/page.tsx`

**Chargement :**
```typescript
const loadAnalysis = async () => {
  const response = await fetch(`/api/analyses/${analysisId}`);
  const data = await response.json();
  setAnalysis(data.analysis);
};
```

**Affichage :**
- Informations générales (question, actions, experts, contributions)
- Synthèse exécutive (markdown)
- Timeline complète des contributions

### Veille Detail Page

**File:** `/app/veille/[id]/page.tsx`

**Chargement :**
```typescript
const loadVeille = async (id: string) => {
  const { data, error } = await supabase
    .from("veille_history")
    .select("*")
    .eq("id", id)
    .single();

  if (data) {
    setVeille({
      id: data.id,
      query: data.query,
      parameters: data.parameters,
      keywords: data.keywords,
      companyId: data.company_id,
      subQueries: data.sub_queries,
      results: data.results,
      finalReport: data.final_report,
      modelUsed: data.model_used,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    });
  }
};
```

**Slider Labels :**
```typescript
const getSliderLabel = (
  value: number,
  type: "geography" | "temporality" | "focus"
) => {
  const ranges = {
    geography: ["Local", "Régional", "National", "Continental", "Global"],
    temporality: [
      "Dernière semaine",
      "Dernier mois",
      "3 derniers mois",
      "6 derniers mois",
      "Historique",
    ],
    focus: [
      "Business pur",
      "Mix Business",
      "Équilibré",
      "Mix Technique",
      "Technique pur",
    ],
  };
  const index = Math.floor((value / 100) * (ranges[type].length - 1));
  return ranges[type][index];
};
```

**Affichage :**
- Requête de veille
- Paramètres (géographie, temporalité, focus)
- Mots-clés sélectionnés
- Axes de recherche (sub-queries)
- Rapport final de veille (markdown)

## UI Components

### Stats Cards

```tsx
<div className="grid gap-4 md:grid-cols-4">
  <Card>
    <CardHeader className="pb-3">
      <CardDescription>Total</CardDescription>
      <CardTitle className="text-3xl">{stats.total}</CardTitle>
    </CardHeader>
  </Card>
  {/* Analyses, Veilles, Ce mois-ci */}
</div>
```

### Report List Item

```tsx
<div className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50">
  <div className="flex-1 space-y-2">
    <div className="flex items-center gap-2">
      {isAnalysis ? (
        <FileText className="h-4 w-4 text-primary" />
      ) : (
        <Radar className="h-4 w-4 text-purple-600" />
      )}
      <h3 className="font-medium">
        {isAnalysis
          ? (data as Analysis).userInput
          : (data as VeilleHistory).query}
      </h3>
      <Badge
        variant="outline"
        className={isAnalysis
          ? "bg-blue-50 text-blue-700 border-blue-200"
          : "bg-purple-50 text-purple-700 border-purple-200"}
      >
        {isAnalysis ? "Analyse" : "Veille"}
      </Badge>
    </div>
    {/* Metadata: actions/keywords, date, status */}
  </div>
  <div className="flex gap-2">
    <Button
      variant="outline"
      size="icon"
      onClick={() => handleView(report)}
      title="Voir les détails"
    >
      <Eye className="h-4 w-4" />
    </Button>
    <Button
      variant="outline"
      size="icon"
      onClick={() => handleDownloadPDF(report)}
      title="Télécharger le PDF"
    >
      <Download className="h-4 w-4" />
    </Button>
    <Button
      variant="outline"
      size="icon"
      className="text-destructive"
      onClick={() => handleDelete(report)}
      disabled={deletingId === data.id}
      title="Supprimer"
    >
      {deletingId === data.id ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
    </Button>
  </div>
</div>
```

## Troubleshooting

### Problème : Historique vide malgré des analyses créées

**Cause possible :** Erreur de transformation des dates
**Solution :** Vérifier que `createdAt` et `updatedAt` sont bien convertis en Date objects

### Problème : Statistiques incorrectes

**Cause possible :** Mauvais calcul du mois en cours
**Solution :** Vérifier la logique de filtrage par mois et année

### Problème : PDF non généré

**Cause possible :** `/api/generate-pdf` échoue
**Solution :** Vérifier les logs serveur et le format des données envoyées

### Problème : Suppression qui échoue

**Cause possible :** ID invalide ou permissions insuffisantes
**Solution :** Vérifier les permissions Supabase et la validité de l'ID

## Évolutions Futures

- [ ] Filtres avancés (par date, type, entreprise, expert)
- [ ] Recherche full-text dans les rapports
- [ ] Export multiple (sélection + download en batch)
- [ ] Favoris et tags personnalisés
- [ ] Comparaison côte à côte de rapports
- [ ] Statistiques d'utilisation (graphiques, trends)
- [ ] Archivage automatique des vieux rapports
- [ ] Notifications de nouveaux rapports
