# Onepoint AI Consulting Tool - Documentation

## Vue d'ensemble

Onepoint AI Consulting Tool est une plateforme de conseil stratégique propulsée par l'IA, conçue pour aider les consultants et analystes à réaliser des analyses approfondies et des veilles stratégiques de manière efficace et structurée.

## 🎯 Objectif

L'application permet de :
- **Analyser** des questions business complexes avec plusieurs experts IA spécialisés
- **Effectuer des veilles** stratégiques automatisées avec recherche web native
- **Gérer** un portfolio d'entreprises et d'experts personnalisés
- **Consulter** l'historique complet de toutes les analyses et veilles

## 🌟 Fonctionnalités principales

### 1. Analyse Multi-Agents
Orchestration de plusieurs agents IA experts pour analyser une question business sous différents angles (stratégique, technique, opérationnel, financier, etc.)

[📖 Documentation détaillée](./features/multi-agent-analysis.md)

### 2. OneVeille - Veille Stratégique
Système de veille automatisé qui décompose un sujet, effectue des recherches web en parallèle et génère un rapport de synthèse complet.

[📖 Documentation détaillée](./features/oneveille.md)

### 3. Gestion des Entreprises
Interface pour créer et gérer les entreprises clientes avec leur contexte (secteur, description, enjeux).

[📖 Documentation détaillée](./features/companies.md)

### 4. Gestion des Experts
Configuration d'experts IA personnalisés avec des personnalités, expertises et prompts système spécifiques.

[📖 Documentation détaillée](./features/experts.md)

### 5. Historiques
Consultation et export des analyses et veilles passées avec filtres et recherche.

[📖 Documentation détaillée](./features/history.md)

## 🏗️ Architecture Technique

### Stack Technologique
- **Frontend**: Next.js 15, React 19, TailwindCSS, shadcn/ui
- **Backend**: Next.js API Routes, Server-Sent Events (SSE)
- **IA**: OpenAI GPT-4/GPT-5 via Responses API avec web search natif
- **Base de données**: Supabase (PostgreSQL)
- **Déploiement**: Vercel

[📖 Architecture détaillée](./technical/architecture.md)

### Fonctionnalités Techniques Clés
- **Logging centralisé** avec système modulaire
- **Responsive design** mobile-first
- **Real-time updates** via SSE
- **Web search natif** via OpenAI Responses API
- **Multi-agent orchestration** avec débat et synthèse

[📖 Guide technique](./technical/implementation.md)

## 📱 Interface Utilisateur

### Desktop
- Sidebar fixe avec navigation
- Timeline interactive pour les analyses
- Affichage en colonnes pour les résultats
- Markdown rendering avec support code

### Mobile
- Menu hamburger responsive
- Layout adaptatif avec scroll automatique
- Touch-friendly avec animations fluides
- Optimisé pour petits écrans

## 🚀 Démarrage Rapide

### Installation
```bash
npm install
```

### Configuration
Créez un fichier `.env.local` avec :
```bash
OPENAI_API_KEY=your_key_here
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
DEBUG=false
```

### Développement
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

## 📚 Documentation

- [User Flow - Analyse Multi-Agents](./features/multi-agent-analysis.md#user-flow)
- [User Flow - OneVeille](./features/oneveille.md#user-flow)
- [Architecture Système](./technical/architecture.md)
- [Guide d'Implémentation](./technical/implementation.md)
- [API Reference](./technical/api-reference.md)

## 🔧 Configuration

### LLM
L'application supporte plusieurs modèles OpenAI configurables :
- GPT-4o, GPT-4o-mini
- GPT-5, GPT-5-mini
- o1, o3, o4 (reasoning models)

### Debug Mode
Activez le mode debug en définissant `DEBUG=true` dans `.env.local` pour voir les logs détaillés en production.

## 📈 Versioning

Version actuelle : **v0.2.0 - Beta**

## 👨‍💻 Auteur

**Alexandre Coulmy** - Onepoint

---

Pour toute question ou suggestion, consultez les documentations détaillées dans le dossier `/docs`.
