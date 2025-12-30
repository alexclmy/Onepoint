# Architecture Technique

## Vue d'ensemble

Onepoint AI Consulting Tool est une application full-stack Next.js 15 utilisant l'architecture App Router avec Server Components et Client Components.

## Stack Technologique

### Frontend
- **Framework**: Next.js 15.1.1 (App Router)
- **React**: 19.0.0
- **TypeScript**: 5.x
- **Styling**: TailwindCSS 3.x
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Icons**: Lucide React
- **Markdown**: react-markdown avec remark-gfm

### Backend
- **Runtime**: Node.js (Vercel Edge Function compatible)
- **API**: Next.js API Routes
- **Streaming**: Server-Sent Events (SSE)
- **Database**: Supabase (PostgreSQL)
- **ORM**: Supabase Client

### IA & ML
- **Provider**: OpenAI
- **API**: Responses API (2025) avec web search natif
- **Modèles supportés**:
  - GPT-4o, GPT-4o-mini
  - GPT-5, GPT-5-mini
  - o1-preview, o3-mini, o4-mini (reasoning)
- **Features**: Web search, multi-agent orchestration, streaming

### Déploiement
- **Plateforme**: Vercel
- **Build**: Next.js production build
- **Environnement**: Node.js serverless functions

## Architecture Globale

```
┌─────────────────────────────────────────────────────┐
│                   VERCEL CLOUD                      │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │         Next.js 15 Application               │  │
│  │                                              │  │
│  │  ┌────────────┐  ┌────────────┐             │  │
│  │  │   Pages    │  │  API Routes │             │  │
│  │  │  (RSC)     │  │   (SSE)     │             │  │
│  │  └─────┬──────┘  └──────┬─────┘             │  │
│  │        │                │                    │  │
│  │        │                │                    │  │
│  │  ┌─────▼────────────────▼─────┐             │  │
│  │  │    Shared Libraries        │             │  │
│  │  │  - agents/                 │             │  │
│  │  │  - openai/                 │             │  │
│  │  │  - utils/                  │             │  │
│  │  │  - supabase/               │             │  │
│  │  └────────────────────────────┘             │  │
│  └──────────────────────────────────────────────┘  │
│              │                   │                  │
│              │                   │                  │
└──────────────┼───────────────────┼──────────────────┘
               │                   │
               ▼                   ▼
       ┌───────────────┐   ┌──────────────┐
       │   Supabase    │   │   OpenAI     │
       │  PostgreSQL   │   │ Responses API│
       └───────────────┘   └──────────────┘
```

## Structure des Dossiers

```
Onepoint/
├── app/                        # Next.js App Router
│   ├── api/                    # API Routes
│   │   ├── analyze/            # Multi-agent analysis
│   │   └── oneveille/          # OneVeille endpoints
│   ├── analysis/               # Analysis history page
│   ├── oneveille/              # OneVeille page
│   ├── oneveille-history/      # OneVeille history
│   ├── companies/              # Companies management
│   ├── experts/                # Experts management
│   ├── settings/               # Settings (LLM config)
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Home (analysis creation)
│   └── globals.css             # Global styles
│
├── components/                 # React components
│   ├── ui/                     # shadcn/ui primitives
│   ├── analysis/               # Analysis components
│   ├── oneveille/              # OneVeille components
│   ├── layout/                 # Layout components (Sidebar)
│   └── markdown/               # Markdown renderer
│
├── lib/                        # Shared libraries
│   ├── agents/                 # Multi-agent system
│   │   ├── hybrid-orchestrator.ts
│   │   └── responses-agent.ts
│   ├── openai/                 # OpenAI clients
│   │   ├── client.ts
│   │   └── responses-client.ts
│   ├── supabase/               # Supabase client
│   │   └── client.ts
│   └── utils/                  # Utilities
│       ├── logger.ts           # Logging system
│       └── cn.ts               # Tailwind merge
│
├── public/                     # Static assets
│   └── favicon.svg
│
├── docs/                       # Documentation
│   ├── README.md
│   ├── features/
│   └── technical/
│
├── types/                      # TypeScript types
│   └── index.ts
│
└── Configuration files
    ├── next.config.ts
    ├── tailwind.config.ts
    ├── tsconfig.json
    └── .env.example
```

## Patterns d'Architecture

### 1. Server Components par Défaut

**App Router utilise RSC (React Server Components) par défaut:**

```typescript
// app/page.tsx - Server Component par défaut
export default async function HomePage() {
  // Peut faire des fetches directs côté serveur
  const data = await fetch(...);

  return <div>...</div>;
}
```

**Client Components quand nécessaire:**
```typescript
// components/analysis/timeline.tsx
"use client"; // Directive obligatoire

import { useState } from "react";

export function Timeline() {
  const [expanded, setExpanded] = useState(false);
  // ...
}
```

### 2. API Routes avec Streaming

**Server-Sent Events pour temps réel:**

```typescript
// app/api/analyze/route.ts
export async function POST(request: NextRequest) {
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      // Envoyer événements
      controller.enqueue(
        encoder.encode(`event: status\ndata: ${JSON.stringify({...})}\n\n`)
      );

      // ...

      controller.close();
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
```

### 3. Système de Logging Centralisé

**Logger modulaire avec niveaux:**

```typescript
// lib/utils/logger.ts
export const logger = {
  debug: (message: string, context?: LogContext) => { ... },
  info: (message: string, context?: LogContext) => { ... },
  warn: (message: string, context?: LogContext) => { ... },
  error: (message: string, error?: Error, context?: LogContext) => { ... }
};

export const createModuleLogger = (module: string) => {
  return {
    debug: (message, context) => logger.debug(message, { module, ...context }),
    // ...
  };
};

// Usage
const log = createModuleLogger('HybridOrchestrator');
log.info('Starting analysis', { actionsCount: 5 });
```

**Configuration:**
- Debug logs uniquement en dev ou si `DEBUG=true`
- Icons colorés par niveau (🐛 ℹ️ ⚠️ ❌)
- Context object pour données structurées

### 4. Multi-Agent Orchestration

**Pattern Orchestrator + Agents:**

```typescript
// Orchestrator
class HybridOrchestrator {
  private agents: Map<string, ResponsesAgent>;

  constructor(config: OrchestratorConfig) {
    this.agents = this.initializeAgents();
  }

  async executeAnalysis(): Promise<void> {
    // Phase 1: Initial (parallel)
    await Promise.all(
      Array.from(this.agents.values()).map(agent => agent.analyze())
    );

    // Phase 2-3: Debate rounds (parallel)
    for (let round = 1; round <= 2; round++) {
      await Promise.all(
        Array.from(this.agents.values()).map(agent => agent.debate(round))
      );
    }

    // Phase 4: Syntheses
    // ...
  }
}

// Agent
class ResponsesAgent {
  private conversationHistory: Message[] = [];

  async analyze(question: string): Promise<string> {
    this.conversationHistory.push({ role: "user", content: question });
    const response = await this.callAPI();
    this.conversationHistory.push({ role: "assistant", content: response });
    return response;
  }
}
```

### 5. Responsive Design Mobile-First

**Tailwind breakpoints:**
```typescript
// Mobile-first approach
className="
  text-2xl        // Mobile: 2xl
  md:text-3xl     // Desktop: 3xl

  p-4             // Mobile: padding 4
  md:p-8          // Desktop: padding 8

  hidden          // Hidden on mobile
  md:block        // Visible on desktop

  fixed           // Mobile: fixed sidebar
  md:relative     // Desktop: relative sidebar

  -translate-x-full     // Mobile: off-screen
  md:translate-x-0      // Desktop: on-screen
"
```

**Menu mobile:**
```tsx
const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

<div className="md:hidden">
  <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
    <Menu />
  </button>
</div>

<div className={cn(
  "fixed transition-transform",
  isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
  "md:translate-x-0"
)}>
  {/* Sidebar content */}
</div>
```

## Flux de Données

### 1. Analyse Multi-Agents

```
User Input
    ↓
[Form Validation]
    ↓
POST /api/analyze
    ↓
[Load LLM Config]
    ↓
[Load Company Context]
    ↓
[Initialize Orchestrator]
    ↓
┌─────────────────────────┐
│  executeAnalysis()      │
│                         │
│  ┌─────────────────┐    │
│  │ Initial Analysis│    │ ← Parallel
│  │  (Promise.all)  │    │
│  └─────────────────┘    │
│          ↓              │
│  ┌─────────────────┐    │
│  │  Debate Round 1 │    │ ← Parallel
│  └─────────────────┘    │
│          ↓              │
│  ┌─────────────────┐    │
│  │  Debate Round 2 │    │ ← Parallel
│  └─────────────────┘    │
│          ↓              │
│  ┌─────────────────┐    │
│  │ Action Syntheses│    │ ← Parallel
│  └─────────────────┘    │
│          ↓              │
│  ┌─────────────────┐    │
│  │ Final Synthesis │    │ ← Sequential
│  └─────────────────┘    │
└─────────────────────────┘
    ↓
[Save to Supabase]
    ↓
SSE: complete
    ↓
Client: Display results
```

### 2. OneVeille

```
User Input (Subject)
    ↓
POST /api/oneveille/analyze-query
    ↓
[AI suggests params, keywords, variations]
    ↓
User refines (sliders, keywords, final subject)
    ↓
POST /api/oneveille/execute-veille (SSE)
    ↓
[decompose() → 4-6 sub-queries]
    ↓
SSE: subQueries
    ↓
┌────────────────────────────────┐
│  For each sub-query (parallel) │
│                                │
│  [executeWebSearch()]          │
│       ↓                        │
│  [Responses API w/ web search] │
│       ↓                        │
│  SSE: searchDebug              │
│  SSE: searchResults            │
│  SSE: searchComplete           │
└────────────────────────────────┘
    ↓
[synthesizeFindings()]
    ↓
SSE: finalReport
    ↓
[Save to veille_history]
    ↓
SSE: saved, complete
    ↓
Client: Display report
```

## Sécurité

### 1. API Keys

**Protection côté serveur uniquement:**
```typescript
// .env.local (jamais committée)
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

// Utilisation
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Serveur uniquement
});
```

### 2. Validation des Entrées

**Validation côté API:**
```typescript
export async function POST(request: NextRequest) {
  const { question, selectedActions } = await request.json();

  if (!question || typeof question !== "string") {
    return NextResponse.json(
      { error: "Question is required" },
      { status: 400 }
    );
  }

  if (!Array.isArray(selectedActions) || selectedActions.length === 0) {
    return NextResponse.json(
      { error: "At least one action required" },
      { status: 400 }
    );
  }

  // ...
}
```

### 3. Rate Limiting

**Géré par Vercel:**
- Limites par fonction serverless
- Timeout max: 10 minutes (Pro plan)
- Concurrent executions limitées

### 4. Données Sensibles

**Pas de stockage de données sensibles:**
- Pas de mots de passe utilisateur
- Contexte entreprise: description publique uniquement
- Questions business: pas de données confidentielles

## Performance

### 1. Parallélisation

**Promise.all() pour tâches indépendantes:**
```typescript
// ✅ Bon: parallèle
const results = await Promise.all([
  agent1.analyze(),
  agent2.analyze(),
  agent3.analyze(),
]);

// ❌ Mauvais: séquentiel
const result1 = await agent1.analyze();
const result2 = await agent2.analyze();
const result3 = await agent3.analyze();
```

### 2. Streaming

**SSE pour feedback temps réel:**
- Pas d'attente de fin d'analyse complète
- Affichage incrémental des contributions
- Meilleure UX perçue

### 3. Caching

**Next.js caching:**
- Static pages: ISR (Incremental Static Regeneration)
- API routes: `no-cache` pour données temps réel
- Assets: CDN caching automatique

### 4. Code Splitting

**Next.js automatic code splitting:**
- Chaque page = bundle séparé
- Dynamic imports pour composants lourds
- Tree-shaking automatique

## Monitoring & Debugging

### 1. Logs Structurés

**Format:**
```typescript
log.info('Starting analysis', {
  actionsCount: 5,
  model: 'gpt-4o',
  hasCompanyContext: true,
});
// Output: ℹ️ Starting analysis { actionsCount: 5, model: 'gpt-4o', ... }
```

### 2. Debug Mode

**Activation:**
```bash
DEBUG=true npm run dev
# ou en production
DEBUG=true
```

**Features:**
- Logs debug visibles
- Informations de debug dans l'UI
- Détails des appels API
- Timing des opérations

### 3. Error Handling

**Try-catch avec logging:**
```typescript
try {
  const result = await riskyOperation();
} catch (error) {
  log.error('Operation failed', error, {
    operation: 'riskyOperation',
    timestamp: new Date().toISOString(),
  });
  throw error; // Re-throw si critique
}
```

## Déploiement

### 1. Vercel

**Configuration:**
```typescript
// next.config.ts
const nextConfig = {
  // ...
  env: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  },
};
```

**Variables d'environnement:**
- Production: Vercel Dashboard
- Preview: Vercel Dashboard
- Development: `.env.local`

### 2. Build

**Commands:**
```bash
npm run build  # Next.js production build
npm start      # Start production server
```

**Output:**
```
.next/
├── static/           # Static assets
├── server/           # Server bundles
└── standalone/       # Standalone deployment
```

### 3. Continuous Deployment

**Git workflow:**
```
main branch
    ↓
  [Push]
    ↓
Vercel auto-deploy
    ↓
Production: onepoint.vercel.app
```

**Preview deployments:**
- Chaque PR = preview deployment
- URL unique par preview
- Tests automatisés possibles

## Évolutions Futures

- [ ] Tests unitaires (Jest, React Testing Library)
- [ ] Tests E2E (Playwright)
- [ ] CI/CD pipelines (GitHub Actions)
- [ ] Monitoring (Sentry, Datadog)
- [ ] Analytics (Vercel Analytics, Posthog)
- [ ] A/B testing
- [ ] Feature flags
- [ ] Multi-tenancy
- [ ] API rate limiting personnalisé
- [ ] Webhooks pour événements
