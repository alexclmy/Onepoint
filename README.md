# 🎯 Onepoint AI Consulting Tool

Un outil de consulting stratégique professionnel propulsé par l'IA, utilisant un système **multi-agents avancé** pour générer des analyses stratégiques de qualité consulting grâce à des débats d'experts IA.

---

## 📋 Table des Matières

- [Vue d'ensemble](#vue-densemble)
- [Fonctionnalités](#fonctionnalités)
- [Système Multi-Agents](#système-multi-agents)
  - [Architecture d'Orchestration](#architecture-dorchestration)
  - [Processus Multi-Phases](#processus-multi-phases)
  - [Flux des Appels LLM](#flux-des-appels-llm)
- [Les 25 Experts IA](#les-25-experts-ia)
- [Les 14 Analyses Stratégiques](#les-14-analyses-stratégiques)
- [Stack Technique](#stack-technique)
- [Architecture du Projet](#architecture-du-projet)
- [Installation](#installation)
- [Configuration](#configuration)
- [Utilisation](#utilisation)
- [Base de Données](#base-de-données)
- [Coûts et Performance](#coûts-et-performance)
- [Déploiement](#déploiement)
- [Roadmap](#roadmap)

---

## 🌟 Vue d'ensemble

**Onepoint AI Consulting Tool** est une application Next.js 15 qui révolutionne le consulting stratégique en combinant :

- 🤖 **25 experts IA** avec des personnalités distinctes (personnages de fiction)
- 📊 **14 types d'analyses stratégiques** (SWOT, PESTEL, Porter, BCG, etc.)
- 💬 **Système de débat multi-agents** pour des analyses approfondies
- 🏢 **Gestion multi-entreprises** avec contexte enrichi
- 📄 **Rapports Markdown professionnels** avec mise en forme avancée
- 🌐 **Recherche web native** intégrée via OpenAI Responses API
- 🔍 **Mode Debug complet** pour transparence des appels LLM
- ⚙️ **Configuration LLM flexible** avec support GPT-5 et modèles de raisonnement
- 🎨 **Interface moderne** avec shadcn/ui

### Principe de Fonctionnement

1. **Vous sélectionnez** : Une ou plusieurs analyses + Experts pertinents + Entreprise (optionnel)
2. **Les experts débattent** : Chaque expert analyse, réagit aux autres, affine sa position sur plusieurs rounds
3. **Consensus émerge** : Les multiples itérations permettent une convergence vers des insights de qualité
4. **Rapport final** : Synthèse structurée avec recommandations actionnables

---

## ✨ Fonctionnalités

### 🎯 Analyses Stratégiques
- ✅ 14 types d'analyses professionnelles disponibles
- ✅ Sélection multi-actions (maximum 3) pour rapports combinés
- ✅ Templates de sortie structurés
- ✅ Estimation de durée par analyse
- ✅ Rapports au format Markdown avec mise en forme professionnelle

### 👥 Système Multi-Agents Avancé
- ✅ 24 experts prédéfinis (personnages de fiction)
- ✅ Création d'experts personnalisés avec system prompts
- ✅ Sélection multi-experts (maximum 3) pour analyses croisées
- ✅ Débats itératifs pour convergence vers un consensus
- ✅ Contributions catégorisées (analyse, débat, consensus, synthèse)
- ✅ Mode Debug complet avec accès aux prompts, config LLM et recherches web

### 🏢 Gestion d'Entreprises
- ✅ CRUD complet connecté à Supabase
- ✅ Contexte enrichi (mission, vision, valeurs, concurrents, USPs)
- ✅ Glossaire personnalisé de termes métier
- ✅ Sélection d'entreprise lors des analyses

### 📊 Résultats et Visualisation
- ✅ Timeline des contributions en temps réel (SSE streaming avec buffering)
- ✅ Affichage des discussions entre experts
- ✅ Contributions expansibles/collapsables avec rendu Markdown
- ✅ Badges de type de contribution
- ✅ Rapport final structuré au format Markdown professionnel
- ✅ Auto-scroll vers les résultats au lancement de l'analyse
- ✅ Bouton Debug par contribution (prompts, config LLM, recherches web)

### 📄 Export et Sauvegarde
- ✅ Génération PDF avec branding Onepoint
- ✅ Historique des analyses (interface prête, sauvegarde à implémenter)
- ✅ Téléchargement des rapports

### ⚙️ Configuration Flexible
- ✅ Configuration LLM (provider, model, temperature, max_output_tokens)
- ✅ Support des modèles GPT-5 (GPT-5.2, GPT-5.1, GPT-5, GPT-5-mini)
- ✅ Support des modèles de raisonnement (o3, o4-mini) et modèles de code
- ✅ Recherche web native via OpenAI Responses API (optionnelle)
- ✅ Gestion automatique des paramètres selon le modèle (temperature pour modèles non-reasoning)
- ✅ Sauvegarde des configs en base Supabase
- ✅ Interface de gestion des experts custom
- ✅ Interface de gestion des entreprises

---

## 🤖 Système Multi-Agents

Le cœur de l'application est un **système d'orchestration multi-agents** qui simule des discussions d'experts pour produire des analyses de haute qualité, propulsé par la dernière **OpenAI Responses API** (Mars 2025) avec recherche web native.

### 🆕 OpenAI Responses API (Mars 2025)

L'application utilise la **nouvelle Responses API** d'OpenAI qui remplace l'ancienne Chat Completions API :

**Avantages** :
- ✅ **Recherche web native** : Aucun outil externe (Tavily) nécessaire
- ✅ **Citations automatiques** : Sources web extraites et référencées
- ✅ **Meilleure performance** : 3-5% d'amélioration sur les benchmarks
- ✅ **Réduction des coûts** : 40-80% moins cher que Chat Completions
- ✅ **Filtrage de domaines** : Contrôle des sources web (allowed_domains)
- ✅ **Support des modèles de raisonnement** : o3, o4-mini pour math/science/coding

**Implémentation** :
- Client Responses API : `/lib/openai/responses-client.ts`
- Agent utilisant Responses API : `/lib/agents/responses-agent.ts`
- Orchestrateur hybride : `/lib/agents/hybrid-orchestrator.ts`

**Gestion intelligente des paramètres** :
- Les modèles GPT-5 et o-series (raisonnement) ne supportent **pas** le paramètre `temperature`
- Le système détecte automatiquement le type de modèle et ajuste les paramètres
- Utilisation de `max_output_tokens` (nouveau standard) au lieu de `max_tokens`

### Architecture d'Orchestration

Le système d'orchestration utilise un **Hybrid Orchestrator** qui combine la Responses API avec un workflow multi-phases personnalisé.

#### Pourquoi Plusieurs Contributions avec 1 Seul Expert ?

Même avec **un seul expert**, l'orchestrateur exécute un **processus multi-phases** :

```
┌─────────────────────────────────────────────────────┐
│  PHASE 1: ANALYSE INITIALE                          │
│  [Expert] → API Call #1 → Type: "analysis"         │
└─────────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────┐
│  PHASE 2: DÉBAT ROUND 1                             │
│  [Expert] → API Call #2 → Type: "debate"           │
│  (L'expert réfléchit et affine sa position)         │
└─────────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────┐
│  PHASE 2: DÉBAT ROUND 2                             │
│  [Expert] → API Call #3 → Type: "consensus"        │
│  (L'expert construit un consensus)                  │
└─────────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────┐
│  PHASE 3: SYNTHÈSE DE L'ACTION                      │
│  [Expert] → API Call #4 → Type: "summary"          │
│  (Résumé structuré de l'analyse)                    │
└─────────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────┐
│  PHASE 4: SYNTHÈSE FINALE                           │
│  [Expert] → API Call #5 → Type: "summary"          │
│  (Rapport exécutif final)                           │
└─────────────────────────────────────────────────────┘

RÉSULTAT: 5 contributions pour 1 expert sur 1 action
```

**Total avec 1 expert + 1 action (PESTEL)** : **5 contributions**

### Processus Multi-Phases

L'orchestrateur (`/lib/agents/orchestrator.ts`) exécute le workflow suivant :

#### Phase 1 : Analyse Initiale
Chaque expert analyse individuellement la demande selon son domaine d'expertise.

```typescript
for (const agent of relevantAgents) {
  const prompt = `En tant qu'expert ${expert.role}, analyse la demande suivante :

  "${userInput}"

  Focus sur ${action.name}. Sois spécifique et actionnable.`;

  const response = await agent.generate(prompt);
  // Type de contribution : "analysis"
}
```

**Input à GPT-4** :
- System prompt (personnalité de l'expert)
- User input (demande de l'utilisateur)
- Contexte de l'entreprise (si sélectionnée)
- Template de l'action (ex: structure PESTEL)

**Output** : Analyse initiale de l'expert

#### Phase 2 : Débat et Raffinement (2 rounds)
Les experts réagissent aux contributions précédentes pour affiner, compléter ou challenger.

```typescript
for (let round = 0; round < 2; round++) {
  for (const agent of relevantAgents) {
    const recentContributions = this.contributions.slice(-relevantAgents.length * 2);
    const reaction = await agent.react(recentContributions);

    const contributionType = round === 0 ? "debate" : "consensus";
    // Round 1 → Type: "debate"
    // Round 2 → Type: "consensus"
  }
}
```

**Input à GPT-4** :
- System prompt de l'expert
- Historique de conversation précédent
- Contributions des autres experts (ou ses propres contributions si seul)
- Prompt de réaction

**Output** :
- Round 1 : Points de désaccord, compléments, questions
- Round 2 : Convergence vers un consensus

#### Phase 3 : Synthèse de l'Action
Un expert "stratégiste" crée un résumé structuré de l'analyse.

```typescript
const synthesisPrompt = `Crée un résumé structuré de l'analyse ${action.name}.

Contributions des experts :
${allContributions}

Structure ton résumé de manière claire avec des sections et des recommandations actionnables.`;

const synthesis = await strategist.generate(synthesisPrompt);
// Type de contribution : "summary"
```

**Output** : Synthèse structurée selon le template de l'action

#### Phase 4 : Synthèse Finale Cross-Actions
Si plusieurs actions ont été sélectionnées, une synthèse finale combine tous les insights.

```typescript
const finalSynthesisPrompt = `Tu es le super consultant qui crée le rapport final exécutif.

Synthèses par action :
${allSummaries}

Crée un rapport exécutif cohérent avec :
1. Vue d'ensemble
2. Insights clés de chaque analyse
3. Recommandations stratégiques prioritaires
4. Plan d'action concret`;

const finalOutput = await strategist.generate(finalSynthesisPrompt);
```

**Output** : Rapport exécutif final intégré

### Flux des Appels LLM

Chaque contribution représente **1 appel à l'API OpenAI** avec cette structure :

```typescript
{
  model: "gpt-4-turbo-preview",  // Depuis llm_configs
  temperature: 0.7,               // Depuis llm_configs
  max_tokens: 4000,              // Depuis llm_configs
  messages: [
    {
      role: "system",
      content: expert.systemPrompt  // Personnalité de l'expert
    },
    {
      role: "system",
      content: "Voici les contributions précédentes:\n\n[contexte]"
    },
    ...conversationHistory,  // Historique des échanges
    {
      role: "user",
      content: prompt  // Prompt spécifique à la phase
    }
  ]
}
```

### Exemples de Scénarios

#### Scénario 1 : 1 Expert + 1 Action (PESTEL)
- Phase 1 : 1 contribution (analyse)
- Phase 2 : 2 contributions (débat x2)
- Phase 3 : 1 contribution (synthèse)
- Phase 4 : 1 contribution (synthèse finale)
- **Total : 5 contributions**

#### Scénario 2 : 3 Experts + 1 Action (SWOT)
- Phase 1 : 3 contributions (1 par expert)
- Phase 2 Round 1 : 3 contributions (débat)
- Phase 2 Round 2 : 3 contributions (consensus)
- Phase 3 : 1 contribution (synthèse)
- Phase 4 : 1 contribution (synthèse finale)
- **Total : 11 contributions**

#### Scénario 3 : 1 Expert + 2 Actions (SWOT + PESTEL)
- Action 1 (SWOT) : 4 contributions
- Action 2 (PESTEL) : 4 contributions
- Phase 4 : 1 contribution (synthèse finale cross-actions)
- **Total : 9 contributions**

### Interaction Entre Experts

#### Avec 1 Seul Expert
L'expert **réagit à ses propres contributions** pour :
- Affiner sa pensée
- Ajouter des détails oubliés
- Corriger ou nuancer son analyse
- Construire une réflexion itérative

#### Avec Plusieurs Experts
Les experts **débattent entre eux** :
- Chaque expert voit les analyses des autres
- Perspectives complémentaires émergent
- Désaccords constructifs sont exprimés
- Consensus se construit par itérations

---

## 👥 Les 25 Experts IA

### 24 Experts Prédéfinis

L'application inclut 24 experts avec des personnalités de personnages de fiction :

| Expert | Personnage | Expertise | Tone |
|--------|-----------|-----------|------|
| **Super Consultant Onepoint** | Aragorn | Consulting stratégique généraliste, synthèse, facilitation | Strategic |
| **Expert RH** | Hermione Granger | Gestion des talents, culture d'entreprise, organisation | Pragmatic |
| **Expert Communication** | Gandalf | Communication corporate, relations publiques, messaging | Creative |
| **Expert Produit** | Light Yagami | Product management, stratégie produit, roadmap | Strategic |
| **Expert UX** | Edward Elric | UX/UI design, recherche utilisateur, design thinking | Creative |
| **Expert Marketing** | Tyrion Lannister | Marketing stratégique, acquisition, growth | Strategic |
| **Expert Financier / CFO** | Lucius Malfoy | Finance d'entreprise, modélisation financière, valorisation | Analytical |
| **Expert Stratégie d'Entreprise** | Albus Dumbledore | Stratégie corporate, M&A, transformation | Strategic |
| **Expert Innovation & R&D** | Tony Stark | Innovation, R&D, nouvelles technologies | Creative |
| **Expert Business Model** | Lelouch vi Britannia | Modèles économiques, monétisation, pricing | Analytical |
| **Expert Transformation Digitale** | Neo | Digital transformation, change management, tech adoption | Strategic |
| **Expert Supply Chain / Logistique** | Samwise Gamgee | Supply chain, logistique, opérations | Pragmatic |
| **Expert IT / Systèmes d'Information** | L Lawliet | Architecture IT, infrastructure, sécurité | Analytical |
| **Expert Data & Analytics** | Shikamaru Nara | Data science, analytics, business intelligence | Analytical |
| **Expert Qualité / Process** | Levi Ackerman | Qualité, amélioration continue, processus | Pragmatic |
| **Expert Legal & Compliance** | Harvey Specter | Droit des affaires, conformité, réglementation | Formal |
| **Expert Customer Success** | Naruto Uzumaki | Satisfaction client, retention, support | Pragmatic |
| **Expert Sales / Commercial** | Jack Sparrow | Vente, développement commercial, négociation | Strategic |
| **Expert Pricing & Monétisation** | Cersei Lannister | Stratégie de prix, monétisation, revenue optimization | Analytical |
| **Expert Competitive Intelligence** | Arya Stark | Veille concurrentielle, analyse de marché, benchmarking | Analytical |
| **Expert Market Research** | Sherlock Holmes | Études de marché, segmentation, tendances | Analytical |
| **Expert Sustainability / RSE** | Pocahontas | Développement durable, RSE, impact environnemental | Formal |
| **Expert Change Management** | Morpheus | Conduite du changement, transformation organisationnelle | Pragmatic |
| **Expert Risk Management** | Nick Fury | Gestion des risques, compliance, audit | Formal |
| **Expert Cybersécurité** | Batman | Sécurité informatique, protection des données, cyber-risques | Analytical |

### Experts Personnalisés

Vous pouvez créer vos propres experts via l'interface `/experts` :
- ✅ Nom et rôle personnalisés
- ✅ Expertise détaillée
- ✅ Ton de communication (formal, creative, analytical, strategic, pragmatic)
- ✅ System prompt complet (personnalité de l'expert)
- ✅ Couleur et avatar optionnels
- ✅ Sauvegarde en base Supabase
- ✅ Utilisation dans les analyses au même titre que les experts prédéfinis

---

## 📊 Les 14 Analyses Stratégiques

| Action | Description | Experts Recommandés | Durée Estimée |
|--------|-------------|---------------------|---------------|
| **SWOT** | Analyse Forces, Faiblesses, Opportunités, Menaces | Stratégie, Competitive Intelligence, Market Research, Finance | 15 min |
| **PESTEL** | Analyse Politique, Économique, Socioculturelle, Technologique, Environnementale, Légale | Stratégie, Market Research, Legal, Sustainability, Innovation | 20 min |
| **5 Forces de Porter** | Analyse de l'intensité concurrentielle du secteur | Stratégie, Competitive Intelligence, Market Research | 18 min |
| **Matrice BCG** | Positionnement du portefeuille produits/activités | Stratégie, Produit, Finance, Marketing | 15 min |
| **Business Model Canvas** | Modélisation du modèle économique complet | Business Model, Stratégie, Finance, Marketing | 25 min |
| **Value Proposition Canvas** | Alignement produit/marché et proposition de valeur | Produit, UX, Marketing, Customer Success | 20 min |
| **Analyse Concurrentielle** | Étude approfondie des concurrents | Competitive Intelligence, Market Research, Produit, Marketing | 30 min |
| **Market Sizing (TAM/SAM/SOM)** | Estimation de la taille du marché addressable | Market Research, Finance, Stratégie | 25 min |
| **Feature Prioritization (RICE/MoSCoW)** | Priorisation des fonctionnalités produit | Produit, UX, Data, Customer Success | 20 min |
| **User Journey Mapping** | Cartographie du parcours utilisateur | UX, Customer Success, Produit, Marketing | 25 min |
| **Product Roadmap** | Feuille de route produit stratégique | Produit, Stratégie, Innovation, Data | 22 min |
| **UX Audit** | Audit de l'expérience utilisateur | UX, Customer Success, Data | 30 min |
| **Risk Assessment** | Évaluation et gestion des risques | Risk Management, Legal, Finance, Cybersécurité | 28 min |
| **Rapport Complet** | Analyse exhaustive combinant plusieurs frameworks | Stratégie, Finance, Market Research, Competitive Intelligence, Produit, UX, Risk Management, Innovation | 60 min |

Chaque analyse dispose d'un **template de sortie structuré** qui guide les experts dans leur réponse.

---

## 🛠️ Stack Technique

### Frontend
- **Framework** : Next.js 15 (App Router)
- **Language** : TypeScript 5
- **UI Library** : shadcn/ui (Radix UI primitives)
- **Styling** : Tailwind CSS 3.4
- **Icons** : Lucide React
- **State Management** : Zustand 5
- **Date Utilities** : date-fns 4
- **Markdown Rendering** : react-markdown + remark-gfm

### Backend
- **Runtime** : Node.js (Next.js API Routes)
- **Database** : Supabase (PostgreSQL)
- **AI** : OpenAI Responses API (Mars 2025)
  - Modèles supportés : GPT-5.2, GPT-5.1, GPT-5, GPT-5-mini, o3, o4-mini, GPT-5-codex, et plus
  - Recherche web native intégrée
- **PDF Generation** : jsPDF + jspdf-autotable

### Déploiement
- **Hosting** : Vercel
- **Database** : Supabase Cloud
- **Streaming** : Server-Sent Events (SSE) avec buffering

---

## 🏗️ Architecture du Projet

```
onepoint-ai-consulting/
├── app/
│   ├── layout.tsx                    # Layout racine
│   ├── page.tsx                      # Page d'accueil (nouvelle analyse)
│   ├── actions/                      # Pages des 14 analyses
│   │   ├── swot/page.tsx
│   │   ├── pestel/page.tsx
│   │   ├── porter/page.tsx
│   │   ├── bcg/page.tsx
│   │   ├── business-model-canvas/page.tsx
│   │   ├── value-proposition-canvas/page.tsx
│   │   ├── competitive-analysis/page.tsx
│   │   ├── market-sizing/page.tsx
│   │   ├── feature-prioritization/page.tsx
│   │   ├── user-journey-mapping/page.tsx
│   │   ├── product-roadmap/page.tsx
│   │   ├── ux-audit/page.tsx
│   │   └── risk-assessment/page.tsx
│   ├── company/page.tsx              # Gestion des entreprises
│   ├── experts/page.tsx              # Gestion des experts custom
│   ├── config/page.tsx               # Configuration LLM
│   ├── history/page.tsx              # Historique des analyses
│   └── api/
│       ├── analyze/route.ts          # Endpoint analyse (SSE streaming)
│       └── generate-pdf/route.ts     # Endpoint génération PDF
│
├── components/
│   ├── ui/                           # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── textarea.tsx
│   │   ├── select.tsx
│   │   ├── dialog.tsx
│   │   ├── badge.tsx
│   │   ├── scroll-area.tsx
│   │   └── ...
│   ├── layout/
│   │   └── sidebar.tsx               # Navigation latérale
│   ├── analysis/
│   │   ├── action-selector.tsx       # Sélecteur d'actions (max 3)
│   │   ├── expert-selector.tsx       # Sélecteur d'experts (max 3, avec custom)
│   │   ├── company-selector.tsx      # Sélecteur d'entreprise
│   │   ├── analysis-input.tsx        # Zone de saisie contexte
│   │   ├── timeline.tsx              # Timeline avec Debug dialog
│   │   └── swot-matrix.tsx           # Matrice SWOT structurée (optionnel)
│   ├── markdown/
│   │   └── markdown-renderer.tsx     # 🆕 Rendu Markdown professionnel
│   └── actions/
│       ├── action-page-template.tsx  # Template réutilisable pour pages actions
│       └── analysis-results.tsx      # Affichage résultats avec timeline + rapport
│
├── lib/
│   ├── agents/
│   │   ├── hybrid-orchestrator.ts    # 🎯 Orchestrateur hybride (CŒUR)
│   │   ├── responses-agent.ts        # 🆕 Agent utilisant Responses API
│   │   ├── orchestrator.ts           # [BACKUP] Ancien orchestrateur
│   │   └── agent-base.ts             # Classe Agent individuel
│   ├── actions/
│   │   └── action-definitions.ts     # Définitions des 14 analyses
│   ├── experts/
│   │   └── predefined-experts.ts     # 24 experts prédéfinis
│   ├── openai/
│   │   ├── responses-client.ts       # 🆕 Client Responses API avec web search
│   │   └── client.ts                 # Client OpenAI Chat Completions
│   ├── pdf/
│   │   └── generator.ts              # Générateur de PDF
│   └── supabase/
│       ├── client.ts                 # Client Supabase (lazy initialization)
│       └── schema.sql                # Schéma de base de données
│
├── types/
│   └── index.ts                      # Types TypeScript centralisés
│
├── .env.local                        # Variables d'environnement (local)
├── package.json                      # Dépendances NPM
├── tsconfig.json                     # Configuration TypeScript
├── tailwind.config.ts                # Configuration Tailwind
└── next.config.js                    # Configuration Next.js
```

### Fichiers Clés

#### `/lib/agents/hybrid-orchestrator.ts`
**Nouveau cœur du système multi-agents** utilisant Responses API. Gère :
- Initialisation des agents selon experts sélectionnés
- Exécution des 4 phases (analyse initiale, débats, synthèse action, synthèse finale)
- Streaming des contributions en temps réel via SSE
- Intégration de la recherche web native
- Génération de prompts optimisés pour Markdown
- Logging complet pour mode Debug (prompts, config, recherches web)
- Gestion du contexte entre phases

#### `/lib/agents/responses-agent.ts`
Classe Agent utilisant la nouvelle Responses API. Fonctionnalités :
- `generate(prompt, context)` : Génère une réponse via Responses API
- `react(previousContributions)` : Réagit aux contributions précédentes
- Support optionnel de la recherche web
- Gestion automatique des paramètres selon le modèle (temperature, max_output_tokens)
- Extraction des citations web
- Historique de conversation maintenu pour cohérence

#### `/lib/openai/responses-client.ts`
Client pour OpenAI Responses API. Fonctionnalités clés :
- `createResponse()` : Appel de base à l'API Responses
- `createResponseWithWebSearch()` : Appel avec recherche web native activée
- `isReasoningModel()` : Détection des modèles de raisonnement (GPT-5, o-series)
- Gestion conditionnelle du paramètre `temperature`
- Extraction automatique des citations web
- Support du filtrage par domaines (allowed_domains)

#### `/components/markdown/markdown-renderer.tsx`
Composant de rendu Markdown professionnel :
- Utilise react-markdown + remark-gfm
- Styles améliorés pour headers, tableaux, listes, citations
- Support du mode sombre
- Mise en forme professionnelle des rapports d'analyse
- Optimisé pour la lisibilité (typographie, spacing, couleurs)

#### `/components/analysis/timeline.tsx`
Timeline des contributions avec fonctionnalités avancées :
- Affichage en temps réel des contributions SSE
- Bouton Debug par contribution avec Dialog complet
- Rendu Markdown des contenus
- Badges de type (analysis, debate, consensus, summary)
- Expand/collapse pour chaque contribution
- Indicateur du nombre de recherches web effectuées

#### `/components/actions/action-page-template.tsx`
Template réutilisable pour les 14 pages d'action. Gère :
- Formulaire de saisie (contexte, experts, entreprise)
- Lancement de l'analyse via `/api/analyze`
- Affichage des résultats avec `AnalysisResults`
- Génération et téléchargement du PDF

#### `/components/actions/analysis-results.tsx`
Affichage complet des résultats :
- Header de statut (en cours / terminé / erreur)
- Timeline des contributions avec expand/collapse
- Badges de type (analysis, debate, consensus, summary)
- Section rapport final

#### `/app/api/analyze/route.ts`
API route principale pour les analyses :
- Charge les experts custom depuis Supabase
- Charge la configuration LLM depuis Supabase
- Initialise le HybridOrchestrator avec Responses API
- Stream les contributions via SSE avec format structuré
- Envoie les données de debug (prompts, config, recherches web)
- Gestion des erreurs avec logging détaillé
- Retourne le résultat final

#### `/app/page.tsx`
Page d'accueil pour créer de nouvelles analyses :
- Sélection d'actions (max 3) et experts (max 3)
- Sélection optionnelle d'entreprise
- Auto-scroll vers résultats au lancement
- **SSE streaming avec buffering** pour éviter les erreurs de parsing
- Affichage en temps réel de la Timeline
- Gestion robuste des chunks SSE partiels

---

## 📦 Installation

### Prérequis
- Node.js 20+
- NPM ou Yarn
- Un compte Supabase (gratuit)
- Une clé API OpenAI

### Étapes

1. **Cloner le repository**
```bash
git clone <repo-url>
cd Onepoint
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer les variables d'environnement**

Créez un fichier `.env.local` à la racine :

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# OpenAI
OPENAI_API_KEY=sk-your-openai-api-key

# App (optionnel)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. **Configurer la base de données Supabase**

- Créez un projet sur [supabase.com](https://supabase.com)
- Allez dans l'éditeur SQL
- Copiez-collez le contenu de `/lib/supabase/schema.sql`
- Exécutez le script

5. **Lancer le serveur de développement**
```bash
npm run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

---

## ⚙️ Configuration

### Configuration LLM

Accédez à `/config` pour configurer :
- **Provider** : openai, anthropic (à venir), custom
- **Model** : Dropdown complet avec tous les modèles OpenAI officiels
  - **GPT-5 Series** : GPT-5.2 (recommandé), GPT-5.1, GPT-5, GPT-5-mini
  - **Coding Models** : GPT-5.1-codex-max, GPT-5-codex
  - **Reasoning Models** : o3, o4-mini (pour math/science/coding)
  - **GPT-4.1 Series** : GPT-4.1, GPT-4.1-mini
  - **GPT-4o Series** : GPT-4o, GPT-4o-mini
  - **Legacy** : GPT-4-turbo, GPT-4, GPT-3.5-turbo
- **Temperature** : 0-1 (0.7 recommandé, non applicable aux modèles de raisonnement)
- **Max Output Tokens** : 1000-8000 (4000 recommandé)
- **Web Search** : Activer/désactiver la recherche web native

Les configurations sont **sauvegardées en base Supabase** et appliquées à toutes les analyses.

**Notes importantes** :
- Les modèles GPT-5 et o-series ne supportent pas le paramètre `temperature`
- Le système ajuste automatiquement les paramètres selon le modèle sélectionné
- La recherche web utilise la Responses API native (pas d'API externe nécessaire)

### Gestion des Entreprises

Accédez à `/company` pour :
- Créer des profils d'entreprises complets
- Ajouter contexte métier (mission, vision, valeurs)
- Définir concurrents et USPs
- Créer un glossaire de termes spécifiques
- Modifier ou supprimer des entreprises

Les entreprises peuvent être **sélectionnées lors des analyses** pour contextualiser les réponses des experts.

### Gestion des Experts Personnalisés

Accédez à `/experts` pour :
- Voir les 24 experts prédéfinis
- Créer vos propres experts avec :
  - Nom et rôle
  - Domaine d'expertise
  - Ton de communication
  - System prompt complet (personnalité, instructions)
  - Couleur et avatar
- Modifier vos experts custom
- Supprimer vos experts custom

Les experts custom apparaissent dans le sélecteur d'experts de toutes les pages d'action.

### Mode Debug

Chaque contribution d'agent dispose d'un **bouton Debug** qui ouvre une dialog avec des informations techniques complètes :

**Informations affichées** :
- 📝 **Prompt complet** envoyé au modèle LLM
- ⚙️ **Configuration LLM** utilisée (model, temperature, max_output_tokens)
- 🌐 **Recherches web** effectuées avec :
  - Query de recherche
  - Snippets de résultats
  - URLs des sources
  - Domaines autorisés (si configuré)
- 🤖 **Nom de l'agent** et son rôle
- 📊 **Type de contribution** (analysis, debate, consensus, summary)

**Accès au Debug** :
- Pendant l'analyse en cours : Bouton Debug dans chaque carte de contribution
- Dans l'historique : Bouton Debug également disponible pour toutes les analyses passées
- Badge indicateur du nombre de recherches web (pastille verte)

Cette fonctionnalité assure une **transparence totale** sur le fonctionnement des LLM et permet de :
- Vérifier que la configuration est correctement appliquée
- Comprendre le raisonnement de chaque agent
- Auditer les sources utilisées pour les analyses
- Débugger et optimiser les prompts

---

## 🎯 Utilisation

### Lancer une Analyse

1. **Depuis la page d'accueil** ou **une page d'action spécifique** (`/actions/swot`, `/actions/pestel`, etc.)

2. **Remplir le formulaire** :
   - **Contexte** : Décrivez votre demande, projet ou situation à analyser
   - **Entreprise** : (Optionnel) Sélectionnez une entreprise pour contextualiser
   - **Experts** : Sélectionnez un ou plusieurs experts pertinents
     - Les experts recommandés sont pré-sélectionnés
     - Vous pouvez ajouter/retirer des experts selon vos besoins

3. **Lancer l'analyse**

4. **Suivre en temps réel** :
   - Les contributions apparaissent au fur et à mesure
   - Header indique le statut (en cours / terminé)
   - Timeline des discussions entre experts
   - Cliquez sur une contribution pour l'agrandir

5. **Consulter le rapport final** :
   - Section "Rapport final" en bas de page
   - Synthèse structurée avec recommandations
   - Bouton de téléchargement PDF (à venir)

### Exemples de Prompts

#### SWOT pour une Startup SaaS
```
Analyse SWOT pour une startup SaaS B2B de gestion de projet collaborative.
Secteur : Productivité / Collaboration
Cible : PME 50-500 employés
Concurrent principal : Asana, Monday.com
Différenciation : IA pour priorisation automatique des tâches
```

#### PESTEL pour Expansion Internationale
```
Analyse PESTEL pour l'expansion de notre marketplace e-commerce en Allemagne.
Contexte : Actuellement présent en France (500k users)
Secteur : E-commerce vêtements seconde main
Objectif : Lancement Q3 2025
```

#### Business Model Canvas pour Pivot
```
Business Model Canvas pour pivoter notre modèle freemium vers un modèle enterprise B2B.
Produit actuel : 100k utilisateurs gratuits, 2k payants (9€/mois)
Nouveau modèle envisagé : Enterprise licenses (500€+/mois) avec onboarding dédié
```

---

## 🗄️ Base de Données

### Schéma Supabase (PostgreSQL)

#### Table `experts`
Stocke les experts personnalisés créés par les utilisateurs.

```sql
CREATE TABLE experts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  expertise TEXT NOT NULL,
  tone TEXT NOT NULL CHECK (tone IN ('formal', 'creative', 'analytical', 'strategic', 'pragmatic')),
  system_prompt TEXT NOT NULL,
  is_custom BOOLEAN DEFAULT false,
  avatar TEXT,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Table `company`
Stocke les profils d'entreprises avec contexte enrichi.

```sql
CREATE TABLE company (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  industry TEXT NOT NULL,
  description TEXT NOT NULL,
  size TEXT,
  location TEXT,
  website TEXT,
  founded_year INTEGER,
  mission TEXT,
  vision TEXT,
  values JSONB DEFAULT '[]',
  target_market TEXT,
  competitors JSONB DEFAULT '[]',
  unique_selling_points JSONB DEFAULT '[]',
  glossary JSONB NOT NULL DEFAULT '[]',
  custom_context TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Table `llm_configs`
Stocke la configuration du modèle LLM.

```sql
CREATE TABLE llm_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL CHECK (provider IN ('openai', 'anthropic', 'custom')),
  model TEXT NOT NULL,
  temperature DECIMAL(3, 2) NOT NULL DEFAULT 0.7,
  max_tokens INTEGER NOT NULL DEFAULT 4000,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Table `analyses` (à venir)
Stockera l'historique des analyses pour consultation ultérieure.

```sql
CREATE TABLE analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_input TEXT NOT NULL,
  selected_actions JSONB NOT NULL,
  selected_experts JSONB NOT NULL,
  user_involved BOOLEAN DEFAULT false,
  status TEXT NOT NULL CHECK (status IN ('pending', 'running', 'waiting_user', 'completed', 'failed')),
  timeline JSONB NOT NULL DEFAULT '[]',
  result TEXT,
  pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Indexes

```sql
CREATE INDEX idx_analyses_created_at ON analyses(created_at DESC);
CREATE INDEX idx_experts_is_custom ON experts(is_custom);
```

---

## 💰 Coûts et Performance

### Estimation des Coûts OpenAI

Les coûts varient selon le nombre d'experts et d'actions sélectionnés.

#### Exemple : 1 Expert + 1 Action (PESTEL)

| Phase | Appels API | Input Tokens | Output Tokens |
|-------|------------|--------------|---------------|
| Analyse initiale | 1 | ~500 | ~800 |
| Débat Round 1 | 1 | ~1,500 | ~500 |
| Débat Round 2 | 1 | ~2,500 | ~500 |
| Synthèse action | 1 | ~3,500 | ~1,000 |
| Synthèse finale | 1 | ~4,500 | ~1,200 |
| **TOTAL** | **5** | **~12,500** | **~4,000** |

**Coût GPT-4-turbo** (tarifs approximatifs 2024):
- Input: 12,500 tokens × $0.01/1K = **$0.125**
- Output: 4,000 tokens × $0.03/1K = **$0.120**
- **Total : ~$0.25 par analyse**

#### Exemple : 3 Experts + 1 Action
- **Total : ~$0.75 par analyse**

#### Exemple : 1 Expert + Rapport Complet (14 actions)
- **Total : ~$3.50 par analyse**

### Optimisations Possibles

Si vous souhaitez réduire les coûts ou le nombre de contributions :

1. **Réduire les rounds de débat** dans `/lib/agents/orchestrator.ts:92` :
```typescript
// Passer de 2 à 1 round
for (let round = 0; round < 1; round++) {
```

2. **Utiliser GPT-3.5-turbo** au lieu de GPT-4 (10x moins cher, qualité moindre)

3. **Créer un mode "Fast Analysis"** : Analyse initiale + synthèse uniquement (sauter les débats)

### Performance

- **Temps d'exécution** : 15-60 secondes selon nombre d'experts et d'actions
- **Streaming SSE** : Résultats affichés en temps réel au fur et à mesure
- **Concurrent requests** : OpenAI API gère ~3500 requests/min

---

## 🚀 Déploiement

### Déploiement sur Vercel (Recommandé)

1. **Push vers GitHub**
```bash
git add .
git commit -m "Initial deployment"
git push origin main
```

2. **Connecter à Vercel**
- Allez sur [vercel.com](https://vercel.com)
- Cliquez "Import Project"
- Sélectionnez votre repository GitHub
- Vercel détecte automatiquement Next.js

3. **Configurer les variables d'environnement**

Dans Vercel → Settings → Environment Variables, ajoutez :

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
OPENAI_API_KEY=sk-your-openai-api-key
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

4. **Déployer**
- Cliquez "Deploy"
- Vercel build et déploie automatiquement
- Accédez à votre app via l'URL fournie

### Déploiement sur d'autres plateformes

L'application est compatible avec toute plateforme supportant Next.js :
- **Railway** : [railway.app](https://railway.app)
- **Render** : [render.com](https://render.com)
- **AWS Amplify** : [aws.amazon.com/amplify](https://aws.amazon.com/amplify/)
- **Netlify** : [netlify.com](https://www.netlify.com)

---

## 🎨 Design System

### Palette de Couleurs

- **Noir & Blanc** : Couleurs principales (fond, texte)
- **Bleu #009DDF** : Couleur accent (primary) - Branding Onepoint
- **Tons de gris** : Composants UI (cartes, bordures)

### Typographie
- **Font** : Inter (via Next.js Font)
- **Tailles** : System Tailwind (text-sm, text-base, text-lg, etc.)

### Composants UI
Tous les composants proviennent de **shadcn/ui** :
- Design system cohérent et moderne
- Accessibilité intégrée (ARIA)
- Personnalisable via Tailwind

---

## 📅 Roadmap

### ✅ Fonctionnalités Implémentées (v2.0)

**Core Features** :
- [x] 24 experts prédéfinis avec personnalités + experts personnalisés
- [x] 14 analyses stratégiques complètes
- [x] Système multi-agents avec débats itératifs (Hybrid Orchestrator)
- [x] OpenAI Responses API avec recherche web native
- [x] Support GPT-5, o-series, et modèles de code
- [x] Streaming temps réel SSE avec buffering robuste
- [x] Rapports Markdown professionnels (react-markdown + remark-gfm)
- [x] Mode Debug complet (prompts, config, recherches web)

**Data Management** :
- [x] Gestion d'entreprises (CRUD Supabase)
- [x] Gestion d'experts custom (CRUD Supabase)
- [x] Configuration LLM flexible (20+ modèles OpenAI)
- [x] Sélection limitée (max 3 experts, max 3 analyses)

**UI/UX** :
- [x] Interface moderne avec shadcn/ui
- [x] Auto-scroll vers résultats
- [x] Timeline avec expand/collapse et badges
- [x] Bouton Debug par contribution
- [x] Indicateurs de recherches web
- [x] Génération PDF basique

**Déploiement** :
- [x] Déploiement Vercel
- [x] Bundle optimisé (-36% vs version Mermaid)

### 🚧 En Cours / À Venir

- [ ] **Sauvegarde des analyses en base** (table `analyses`)
- [ ] **Historique des analyses** avec recherche et filtres
- [ ] **Amélioration PDF** : Mise en page professionnelle avec branding
- [ ] **Export Word/PowerPoint**
- [ ] **Mode "Fast Analysis"** (sans débats) pour réduire coûts
- [ ] **Authentification utilisateurs** (Supabase Auth)
- [ ] **Multi-tenancy** : Workspace par entreprise
- [ ] **Partage d'analyses** : Liens publics, collaboration
- [ ] **Templates d'analyse prédéfinis** : Prompts pré-remplis par secteur
- [ ] **Support multi-langues** (français, anglais)
- [ ] **Intégration Anthropic Claude** comme provider alternatif
- [ ] **Mode collaboratif temps réel** : Plusieurs utilisateurs sur une analyse
- [ ] **API publique** pour intégrations
- [ ] **Webhooks** pour notifications
- [ ] **Dashboard analytics** : Métriques d'utilisation, coûts
- [ ] **Fine-tuning** : Modèles personnalisés par secteur

### 💡 Idées Futures

- [ ] **Mode vocal** : Transcription audio → Analyse
- [ ] **Intégration Slack/Teams** : Lancer analyses depuis chat
- [ ] **Connecteurs data** : Import CRM, Analytics, etc.
- [ ] **Agents spécialisés par secteur** : HealthTech, FinTech, etc.
- [ ] **Simulations Monte Carlo** pour projections financières
- [ ] **Visualisations interactives** : Graphiques, matrices dynamiques
- [ ] **Benchmarking automatique** via web scraping
- [ ] **Veille concurrentielle automatique** : Alertes sur mouvements marché

---

## 🆕 Nouveautés (Décembre 2024)

### Version 2.0 - OpenAI Responses API & Markdown

**Migration vers Responses API** :
- ✅ Implémentation complète de la nouvelle OpenAI Responses API (Mars 2025)
- ✅ Recherche web native intégrée (remplacement de Tavily)
- ✅ Réduction des coûts de 40-80% par rapport à Chat Completions
- ✅ Support des nouveaux modèles GPT-5 (5.2, 5.1, 5, mini)
- ✅ Support des modèles de raisonnement (o3, o4-mini)
- ✅ Gestion intelligente des paramètres selon type de modèle

**Amélioration de la Présentation** :
- ✅ Rapports au format Markdown professionnel
- ✅ Rendu avec react-markdown + remark-gfm
- ✅ Mise en forme avancée (headers, tableaux, listes, citations, code blocks)
- ✅ Optimisation typographique et espacement
- ✅ Réduction du bundle de 36% (retrait de Mermaid)

**Mode Debug Complet** :
- ✅ Bouton Debug sur chaque contribution
- ✅ Affichage du prompt complet envoyé au LLM
- ✅ Configuration LLM utilisée (model, temperature, tokens)
- ✅ Détails des recherches web (queries, sources, citations)
- ✅ Disponible en temps réel et dans l'historique

**Améliorations UX** :
- ✅ Limite de sélection : maximum 3 experts et 3 analyses
- ✅ Auto-scroll vers résultats au lancement d'analyse
- ✅ SSE streaming avec buffering robuste (fix Timeline disparition)
- ✅ Indicateur visuel du nombre de recherches web par contribution
- ✅ Loader immédiat au démarrage de l'analyse

**Configuration LLM** :
- ✅ Dropdown avec 20+ modèles OpenAI officiels organisés par série
- ✅ Option recherche web native activable/désactivable
- ✅ Paramètre `max_output_tokens` (nouveau standard)
- ✅ Détection automatique des modèles ne supportant pas temperature

**Corrections de Bugs** :
- ✅ Fix erreur "Unknown parameter: 'max_tokens'" → Migration vers `max_output_tokens`
- ✅ Fix erreur "Unsupported parameter: 'temperature'" → Détection des modèles de raisonnement
- ✅ Fix Timeline disparaissant pendant l'analyse → Buffering SSE amélioré
- ✅ Fix bouton Debug manquant dans historique → Ajout dans Timeline component

---

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. **Fork** le repository
2. **Créez une branche** : `git checkout -b feature/ma-fonctionnalite`
3. **Committez** : `git commit -m "Ajout de ma fonctionnalité"`
4. **Pushez** : `git push origin feature/ma-fonctionnalite`
5. **Ouvrez une Pull Request**

### Guidelines

- Suivre les conventions TypeScript et Next.js
- Utiliser les composants shadcn/ui existants
- Ajouter des types TypeScript pour toute nouvelle entité
- Tester localement avant de soumettre
- Documenter les nouvelles fonctionnalités dans le README

---

## 📄 License

MIT License

Copyright (c) 2024 Onepoint

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

---

## 🙏 Remerciements

Propulsé par des technologies open-source exceptionnelles :

- **OpenAI GPT-4** : Intelligence artificielle de pointe
- **Next.js** : Framework React moderne et performant
- **shadcn/ui** : Design system élégant et accessible
- **Supabase** : Backend-as-a-Service avec PostgreSQL
- **Vercel** : Plateforme de déploiement optimale pour Next.js
- **Radix UI** : Primitives UI accessibles
- **Tailwind CSS** : Framework CSS utility-first

---

## 📞 Support

Pour toute question, bug ou suggestion :

- **Issues GitHub** : [github.com/your-repo/issues](https://github.com/your-repo/issues)
- **Email** : support@onepoint.com (exemple)
- **Documentation** : Ce README + commentaires dans le code

---

## 🎯 À Propos de Onepoint

[Onepoint](https://www.onepoint.com) est un cabinet de conseil en transformation digitale et innovation. Cet outil a été développé pour démocratiser l'accès à des analyses stratégiques de qualité consulting grâce à l'intelligence artificielle.

**Made with ❤️ by Onepoint**
