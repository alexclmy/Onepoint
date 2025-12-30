# API Reference

## Vue d'ensemble

L'application expose plusieurs API routes pour les différentes fonctionnalités. Toutes les routes sont des Next.js API routes utilisant le pattern App Router.

## Analyse Multi-Agents

### POST /api/analyze

Lance une analyse multi-agents avec streaming SSE.

**Request:**
```typescript
{
  question: string;              // Question business à analyser
  selectedActions: string[];     // ["strategy", "operations", "finance", ...]
  companyId?: string;            // UUID de l'entreprise (optionnel)
}
```

**Response:** Server-Sent Events (text/event-stream)

**Events:**

| Event | Data | Description |
|-------|------|-------------|
| `status` | `{ phase: string, message: string }` | Mise à jour du statut |
| `contribution` | `{ contribution: Contribution }` | Nouvelle contribution d'agent |
| `actionSynthesis` | `{ action: string, synthesis: string }` | Synthèse par action |
| `finalSynthesis` | `{ synthesis: string }` | Synthèse finale globale |
| `complete` | `{ message: string }` | Analyse terminée |
| `error` | `{ error: string }` | Erreur survenue |

**Contribution Object:**
```typescript
{
  id: string;
  agentName: string;
  action: string;
  phase: "initial" | "debate_1" | "debate_2" | "action_synthesis" | "final_synthesis";
  content: string;           // Markdown
  timestamp: string;         // ISO 8601
  debug?: {
    inputTokens: number;
    outputTokens: number;
    model: string;
  };
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Comment améliorer notre stratégie digitale ?",
    "selectedActions": ["strategy", "marketing", "technical"]
  }'
```

## OneVeille

### POST /api/oneveille/analyze-query

Analyse un sujet de veille et suggère paramètres, mots-clés et variations.

**Request:**
```typescript
{
  query: string;  // Sujet de la veille
}
```

**Response:**
```typescript
{
  parameters: {
    geography: number;    // 0-100 (local → global)
    temporality: number;  // 0-100 (récent → historique)
    focus: number;        // 0-100 (business → technique)
  };
  keywords: string[];     // 8-12 mots-clés suggérés
  variations: string[];   // 3-4 variations du sujet
  reasoning: string;      // Explication des choix
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/oneveille/analyze-query \
  -H "Content-Type: application/json" \
  -d '{"query": "Tendances IA 2025"}'
```

### POST /api/oneveille/execute-veille

Exécute une veille stratégique avec streaming SSE.

**Request:**
```typescript
{
  query: string;              // Sujet final de la veille
  parameters: {
    geography: number;
    temporality: number;
    focus: number;
  };
  keywords: string[];         // 1-3 mots-clés sélectionnés
  companyId?: string;         // UUID (optionnel)
}
```

**Response:** Server-Sent Events (text/event-stream)

**Events:**

| Event | Data | Description |
|-------|------|-------------|
| `status` | `{ phase: string, message: string }` | Mise à jour du statut |
| `subQueries` | `{ subQueries: string[] }` | Axes de recherche générés |
| `searchStart` | `{ index: number, subQuery: string }` | Début recherche |
| `searchDebug` | `{ index, subQuery, debugInfo, timestamp }` | Détails de recherche |
| `searchResults` | `{ index, subQuery, resultsCount: number }` | Résultats trouvés |
| `searchComplete` | `{ index, subQuery, synthesis: string }` | Recherche terminée |
| `finalReport` | `{ report: string }` | Rapport final (markdown) |
| `saved` | `{ veilleId: string }` | Sauvegarde DB réussie |
| `complete` | `{ message: string }` | Veille terminée |
| `error` | `{ error: string }` | Erreur survenue |

**SearchDebugInfo:**
```typescript
{
  webSearchCalls: Array<{
    id: string;
    status: "completed" | "in_progress" | "failed";
    query?: string;
    sourcesFound: number;
    sources: Array<{
      url: string;
      title?: string;
    }>;
  }>;
  citationsCount: number;
  outputLength: number;
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/oneveille/execute-veille \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Tendances IA 2025",
    "parameters": {"geography": 75, "temporality": 80, "focus": 60},
    "keywords": ["LLM", "GPT-5", "agents"]
  }'
```

## Entreprises

### GET /api/companies

Récupère la liste des entreprises.

**Response:**
```typescript
{
  companies: Array<{
    id: string;
    name: string;
    sector: string;
    description: string;
    createdAt: string;
    updatedAt: string;
  }>;
}
```

### POST /api/companies

Crée une nouvelle entreprise.

**Request:**
```typescript
{
  name: string;
  sector: string;
  description: string;
}
```

**Response:**
```typescript
{
  company: {
    id: string;
    name: string;
    sector: string;
    description: string;
    createdAt: string;
    updatedAt: string;
  };
}
```

### PATCH /api/companies/[id]

Met à jour une entreprise.

**Request:**
```typescript
{
  name?: string;
  sector?: string;
  description?: string;
}
```

### DELETE /api/companies/[id]

Supprime une entreprise.

**Response:**
```typescript
{
  success: boolean;
}
```

## Experts

### GET /api/experts

Récupère la liste des experts.

**Response:**
```typescript
{
  experts: Array<{
    id: string;
    name: string;
    action: string;
    systemPrompt: string;
    useWebSearch: boolean;
    createdAt: string;
    updatedAt: string;
  }>;
}
```

### POST /api/experts

Crée un nouvel expert.

**Request:**
```typescript
{
  name: string;
  action: string;
  systemPrompt: string;
  useWebSearch: boolean;
}
```

### PATCH /api/experts/[id]

Met à jour un expert.

### DELETE /api/experts/[id]

Supprime un expert.

## Configuration

### GET /api/llm-configs

Récupère la configuration LLM active.

**Response:**
```typescript
{
  config: {
    id: string;
    model: string;
    temperature: number;
    maxTokens: number;
    createdAt: string;
    updatedAt: string;
  };
}
```

### POST /api/llm-configs

Crée ou met à jour la configuration LLM.

**Request:**
```typescript
{
  model: string;        // "gpt-4o", "gpt-5", etc.
  temperature: number;  // 0.0 - 2.0
  maxTokens: number;    // 1 - 128000
}
```

## Historiques

### GET /api/analyses

Récupère l'historique des analyses.

**Query Parameters:**
- `companyId?: string` - Filtrer par entreprise
- `limit?: number` - Nombre de résultats (défaut: 50)
- `offset?: number` - Pagination (défaut: 0)

**Response:**
```typescript
{
  analyses: Array<{
    id: string;
    question: string;
    selectedActions: string[];
    companyId?: string;
    contributions: Contribution[];
    actionSyntheses: Record<string, string>;
    finalSynthesis: string;
    status: string;
    modelUsed: string;
    createdAt: string;
    updatedAt: string;
  }>;
  total: number;
}
```

### GET /api/analyses/[id]

Récupère une analyse spécifique.

**Response:**
```typescript
{
  analysis: {
    id: string;
    question: string;
    selectedActions: string[];
    companyId?: string;
    contributions: Contribution[];
    actionSyntheses: Record<string, string>;
    finalSynthesis: string;
    status: string;
    modelUsed: string;
    createdAt: string;
    updatedAt: string;
  };
}
```

### GET /api/veilles

Récupère l'historique des veilles.

**Query Parameters:**
- `companyId?: string`
- `limit?: number`
- `offset?: number`

**Response:**
```typescript
{
  veilles: Array<{
    id: string;
    query: string;
    parameters: {
      geography: number;
      temporality: number;
      focus: number;
    };
    keywords: string[];
    companyId?: string;
    subQueries: string[];
    results: VeilleResult[];
    finalReport: string;
    modelUsed: string;
    createdAt: string;
    updatedAt: string;
  }>;
  total: number;
}
```

## Types TypeScript

### Contribution
```typescript
interface Contribution {
  id: string;
  agentName: string;
  action: string;
  phase: "initial" | "debate_1" | "debate_2" | "action_synthesis" | "final_synthesis";
  content: string;
  timestamp: string;
  debug?: {
    inputTokens: number;
    outputTokens: number;
    model: string;
  };
}
```

### VeilleResult
```typescript
interface VeilleResult {
  subQuery: string;
  searchResults: SearchResult[];
  synthesis: string;
}

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  relevance: number;
}
```

### Company
```typescript
interface Company {
  id: string;
  name: string;
  sector: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Expert
```typescript
interface Expert {
  id: string;
  name: string;
  action: string;
  systemPrompt: string;
  useWebSearch: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

## Error Handling

### Error Response Format

Toutes les erreurs suivent le format :
```typescript
{
  error: string;      // Message d'erreur
  status?: number;    // Code HTTP (400, 404, 500, etc.)
  details?: any;      // Détails additionnels (optionnel)
}
```

### Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request (validation failed) |
| 404 | Not Found |
| 500 | Internal Server Error |

### SSE Error Events

En cas d'erreur durant le streaming :
```
event: error
data: {"error":"Error message here"}
```

Le stream est fermé après l'événement d'erreur.

## Rate Limiting

**Vercel Limits:**
- Fonction duration: 10 min (Pro), 60s (Hobby)
- Invocations: 100/min (Hobby), Unlimited (Pro)
- Bandwidth: Unlimited

**OpenAI Limits:**
- Selon le tier de l'API key
- Gérés côté serveur avec retry logic

## Exemples d'Utilisation

### JavaScript/TypeScript Client

```typescript
// Analyse multi-agents
async function startAnalysis() {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question: "Comment optimiser notre supply chain ?",
      selectedActions: ["strategy", "operations"],
    }),
  });

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');

    for (const line of lines) {
      if (line.startsWith('data:')) {
        const data = JSON.parse(line.substring(6));
        console.log('Event:', data);
      }
    }
  }
}

// OneVeille
async function startVeille() {
  // 1. Analyze query
  const analysisRes = await fetch('/api/oneveille/analyze-query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: "IA dans la santé" }),
  });
  const { parameters, keywords } = await analysisRes.json();

  // 2. Execute veille
  const veilleRes = await fetch('/api/oneveille/execute-veille', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: "IA dans la santé",
      parameters,
      keywords: keywords.slice(0, 3),
    }),
  });

  // Stream SSE...
}
```

### cURL Examples

```bash
# Créer une entreprise
curl -X POST http://localhost:3000/api/companies \
  -H "Content-Type: application/json" \
  -d '{
    "name": "TechCorp",
    "sector": "Technology",
    "description": "Leading tech company"
  }'

# Récupérer les analyses
curl http://localhost:3000/api/analyses?limit=10

# Configurer le modèle LLM
curl -X POST http://localhost:3000/api/llm-configs \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o",
    "temperature": 0.7,
    "maxTokens": 4000
  }'
```

## Webhooks (Futur)

_À implémenter : Système de webhooks pour notifier des événements externes_

## GraphQL (Futur)

_À implémenter : Alternative GraphQL API pour queries complexes_
