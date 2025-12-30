# Analyse Multi-Agents

## Vue d'ensemble

L'analyse multi-agents est la fonctionnalité principale de l'application. Elle permet d'analyser une question business complexe en orchestrant plusieurs agents IA experts qui travaillent de concert pour fournir une analyse approfondie et multi-dimensionnelle.

## 🎯 Objectif

Simuler une équipe de consultants experts qui :
1. Analysent individuellement la question
2. Débattent et enrichissent leurs perspectives
3. Synthétisent leurs conclusions par domaine d'expertise
4. Produisent une synthèse globale actionnaire

## User Flow

### Étape 1 : Configuration de l'analyse

**Interface utilisateur:**
- Sélection de l'entreprise (optionnel)
- Choix des axes d'analyse (Stratégie, Opérations, Finance, Technique, Marketing, RH)
- Saisie de la question business

**Actions utilisateur:**
1. Cliquer sur "Nouvelle Analyse"
2. (Optionnel) Sélectionner une entreprise dans la liste déroulante
3. Cocher les axes d'analyse pertinents (minimum 1)
4. Saisir la question dans le champ texte
5. Cliquer sur "Lancer l'analyse"

**Validations:**
- Au moins 1 axe sélectionné
- Question non vide
- Minimum 10 caractères pour la question

### Étape 2 : Exécution de l'analyse

**Affichage en temps réel:**
- Badge "En cours" sur la carte principale
- Timeline interactive montrant les contributions au fur et à mesure
- Chaque contribution affiche :
  - Nom de l'agent (ex: "Expert Stratégie")
  - Phase (Analyse initiale / Débat Round 1 / Débat Round 2)
  - Contenu en markdown
  - Informations de debug (si activées)

**Phases d'exécution:**

1. **Analyse initiale** (parallèle)
   - Chaque expert analyse indépendamment la question
   - Affichage progressif des contributions
   - Durée: ~30-60 secondes

2. **Round de débat 1** (parallèle)
   - Les experts lisent les analyses des autres
   - Affinent/Challengent/Enrichissent
   - Durée: ~30-60 secondes

3. **Round de débat 2** (parallèle)
   - Convergence vers un consensus
   - Approfondissement des points clés
   - Durée: ~30-60 secondes

4. **Synthèses par action** (parallèle)
   - Une synthèse par axe d'analyse
   - Agrégation des points clés
   - Durée: ~20-40 secondes

5. **Synthèse globale** (séquentielle)
   - Rapport final cross-actions
   - Recommandations stratégiques
   - Durée: ~20-40 secondes

### Étape 3 : Consultation des résultats

**Interface finale:**
- Badge "Terminé" avec statut success
- Timeline complète de toutes les contributions
- Bouton "Télécharger PDF" (à droite)
- Expansion/collapse des contributions individuelles

**Actions disponibles:**
- Cliquer sur une contribution pour l'agrandir
- Télécharger le rapport en PDF
- Copier le markdown d'une contribution
- Retour à la liste des analyses

### Étape 4 : Consultation dans l'historique

**Interface historique:**
- Liste de toutes les analyses passées
- Filtres par entreprise, date, statut
- Recherche par mots-clés
- Clic sur une analyse pour voir le détail complet

## Implémentation Technique

### Architecture

```
┌─────────────────┐
│   Page (UI)     │
│   app/page.tsx  │
└────────┬────────┘
         │
         ├─ SSE Request
         ↓
┌─────────────────────────┐
│  API Route              │
│  /api/analyze/route.ts  │
└──────────┬──────────────┘
           │
           ├─ Orchestrator
           ↓
┌───────────────────────────────┐
│  HybridOrchestrator           │
│  lib/agents/hybrid-           │
│  orchestrator.ts              │
└──────────┬────────────────────┘
           │
           ├─ Multiple ResponsesAgent
           ↓
┌────────────────────────────┐
│  ResponsesAgent (x N)      │
│  lib/agents/responses-     │
│  agent.ts                  │
└──────────┬─────────────────┘
           │
           ├─ OpenAI Responses API
           ↓
┌────────────────────────────┐
│  ResponsesClient           │
│  lib/openai/responses-     │
│  client.ts                 │
└────────────────────────────┘
```

### Composants Principaux

#### 1. Page Component (`app/page.tsx`)

**Responsabilités:**
- Gestion de l'état UI (form, entreprise, axes)
- Connexion SSE pour recevoir les événements
- Affichage de la timeline en temps réel

**États clés:**
```typescript
const [question, setQuestion] = useState("")
const [selectedActions, setSelectedActions] = useState<string[]>([])
const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null)
const [isAnalyzing, setIsAnalyzing] = useState(false)
const [contributions, setContributions] = useState<Contribution[]>([])
```

**Flux SSE:**
```typescript
const response = await fetch("/api/analyze", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ question, selectedActions, companyId }),
});

const reader = response.body?.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  // Parse SSE events
  const chunk = decoder.decode(value);
  const lines = chunk.split("\n");

  for (const line of lines) {
    if (line.startsWith("data:")) {
      const data = JSON.parse(line.substring(6));
      // Handle different event types
      if (data.type === "contribution") {
        setContributions(prev => [...prev, data.contribution]);
      }
    }
  }
}
```

#### 2. API Route (`/api/analyze/route.ts`)

**Responsabilités:**
- Validation des paramètres
- Chargement du contexte entreprise (si sélectionné)
- Initialisation de l'orchestrateur
- Stream SSE des événements

**Événements SSE émis:**
```typescript
// Status updates
{ type: "status", message: "Démarrage de l'analyse..." }

// Individual contributions
{
  type: "contribution",
  contribution: {
    id: string,
    agentName: string,
    action: string,
    phase: "initial" | "debate_1" | "debate_2",
    content: string,
    timestamp: string,
    debug: { ... }
  }
}

// Action synthesis
{
  type: "actionSynthesis",
  action: string,
  synthesis: string
}

// Final synthesis
{ type: "finalSynthesis", synthesis: string }

// Completion
{ type: "complete" }

// Error
{ type: "error", error: string }
```

#### 3. HybridOrchestrator (`lib/agents/hybrid-orchestrator.ts`)

**Responsabilités:**
- Orchestration des agents experts
- Gestion des rounds de débat
- Génération des synthèses

**Configuration:**
```typescript
interface HybridOrchestratorConfig {
  question: string;
  selectedActions: string[];
  companyContext?: string;
  model: string;
  onEvent: (event: any) => void;
}
```

**Flux d'exécution:**
```typescript
async executeAnalysis() {
  // 1. Initial analysis (parallel)
  const initialAnalyses = await Promise.all(
    this.agents.map(agent => agent.analyze())
  );

  // 2. Debate rounds (parallel per round)
  for (let round = 1; round <= 2; round++) {
    const debateContributions = await Promise.all(
      this.agents.map(agent => agent.debate(allContributions, round))
    );
  }

  // 3. Action syntheses (parallel)
  const syntheses = await Promise.all(
    this.config.selectedActions.map(action =>
      this.synthesizeAction(action, relevantContributions)
    )
  );

  // 4. Final synthesis (sequential)
  const finalSynthesis = await this.synthesizeFinal(syntheses);

  return finalSynthesis;
}
```

#### 4. ResponsesAgent (`lib/agents/responses-agent.ts`)

**Responsabilités:**
- Représentation d'un expert individuel
- Gestion de l'historique de conversation
- Appels à l'API OpenAI Responses

**Configuration d'un agent:**
```typescript
{
  name: "Expert Stratégie",
  action: "strategy",
  systemPrompt: `Tu es un expert en stratégie d'entreprise...`,
  model: "gpt-4o",
  useWebSearch: false
}
```

**Méthodes principales:**
```typescript
// Analyse initiale
async analyze(question: string): Promise<string>

// Participation au débat
async debate(
  question: string,
  contributions: Contribution[],
  round: number
): Promise<string>

// Reset de l'historique
reset(): void
```

### Base de Données (Supabase)

#### Table `analyses`

```sql
CREATE TABLE analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question TEXT NOT NULL,
  selected_actions TEXT[] NOT NULL,
  company_id UUID REFERENCES company(id),
  contributions JSONB NOT NULL,
  action_syntheses JSONB,
  final_synthesis TEXT,
  status TEXT DEFAULT 'completed',
  model_used TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Champs:**
- `question`: La question business analysée
- `selected_actions`: Liste des axes d'analyse
- `company_id`: Référence à l'entreprise (nullable)
- `contributions`: Array JSON de toutes les contributions
- `action_syntheses`: Object JSON { action: synthesis }
- `final_synthesis`: Synthèse finale markdown
- `model_used`: Modèle OpenAI utilisé
- `status`: 'completed', 'in_progress', 'error'

### Système de Logging

**Logger modulaire:**
```typescript
import { createModuleLogger } from "@/lib/utils/logger";

const log = createModuleLogger('HybridOrchestrator');

log.info('Starting analysis', { actionsCount, model });
log.debug('Agent initialized', { agentName, action });
log.warn('No web search results', { query });
log.error('API call failed', error, { model, attempt });
```

**Niveaux de log:**
- `debug`: Informations de débogage (seulement en dev ou DEBUG=true)
- `info`: Informations générales d'exécution
- `warn`: Avertissements non critiques
- `error`: Erreurs avec stack trace

## Points Techniques Importants

### 1. Gestion des Modèles de Reasoning

Les modèles GPT-5 et o-series ne supportent pas `temperature`. Le code détecte automatiquement :

```typescript
function isReasoningModel(model: string): boolean {
  return model.startsWith("gpt-5") ||
         model.startsWith("o1") ||
         model.startsWith("o3") ||
         model.startsWith("o4");
}

if (!isReasoningModel(model)) {
  completionOptions.temperature = 0.7;
}
```

### 2. Server-Sent Events (SSE)

Format des événements :
```
event: contribution
data: {"type":"contribution","contribution":{...}}

event: status
data: {"type":"status","message":"..."}
```

Parsing côté client :
```typescript
if (line.startsWith("event:")) {
  currentEventType = line.substring(7).trim();
}

if (line.startsWith("data:")) {
  const data = JSON.parse(line.substring(6));
  // Handle based on currentEventType
}
```

### 3. Responsive Design

Mobile breakpoints:
```typescript
// Tailwind classes
className="text-2xl md:text-3xl" // Mobile: 2xl, Desktop: 3xl
className="p-4 md:p-8"           // Mobile: p-4, Desktop: p-8
className="hidden md:block"      // Hidden on mobile, visible desktop
```

### 4. Performance

**Parallélisation:**
- Initial analysis: Tous les agents en parallèle
- Debate rounds: Tous les agents en parallèle
- Action syntheses: Toutes en parallèle
- Final synthesis: Séquentiel (dépend des synthèses d'actions)

**Optimisations:**
- Utilisation de `Promise.all()` pour les tâches parallèles
- Stream SSE pour feedback temps réel
- Pas de re-rendering global, ajout incrémental des contributions

## Troubleshooting

### Problème: L'analyse se bloque
**Cause possible:** Timeout API OpenAI
**Solution:** Vérifier les logs, retry automatique après 2-4-8 secondes

### Problème: Contributions dupliquées
**Cause possible:** Re-parsing SSE du même chunk
**Solution:** Utiliser `currentEventType` pour tracker l'événement en cours

### Problème: Pas de synthèse finale
**Cause possible:** Erreur lors de la génération
**Solution:** Vérifier les logs côté serveur, s'assurer que toutes les synthèses d'actions sont complètes

## Tests Recommandés

1. **Test avec 1 action** : Vérifier le flux minimal
2. **Test avec 6 actions** : Vérifier la performance avec charge maximale
3. **Test avec entreprise** : Vérifier l'injection du contexte
4. **Test avec erreur réseau** : Vérifier la gestion d'erreur
5. **Test mobile** : Vérifier le responsive design

## Évolutions Futures

- [ ] Export en différents formats (Word, Excel)
- [ ] Comparaison d'analyses multiples
- [ ] Templates de questions prédéfinis
- [ ] Personnalisation des rounds de débat
- [ ] Ajout d'agents personnalisés dynamiquement
