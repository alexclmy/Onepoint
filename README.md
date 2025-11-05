# Onepoint AI Consulting Tool

Un outil de consulting stratégique propulsé par l'IA utilisant un système multi-agents pour des analyses approfondies.

## 🚀 Fonctionnalités

### Analyses Stratégiques
- **SWOT** : Analyse Forces, Faiblesses, Opportunités, Menaces
- **PESTEL** : Analyse Politique, Économique, Socioculturelle, Technologique, Environnementale, Légale
- **5 Forces de Porter** : Analyse de l'intensité concurrentielle
- **Matrice BCG** : Positionnement du portefeuille produits
- **Business Model Canvas** : Modélisation du modèle économique
- **Value Proposition Canvas** : Alignement produit/marché
- **Analyse Concurrentielle** : Étude approfondie des concurrents
- **Market Sizing (TAM/SAM/SOM)** : Estimation de la taille du marché
- **Feature Prioritization (RICE/MoSCoW)** : Priorisation des fonctionnalités
- **User Journey Mapping** : Cartographie du parcours utilisateur
- **Product Roadmap** : Feuille de route produit
- **UX Audit** : Audit de l'expérience utilisateur
- **Risk Assessment** : Évaluation des risques
- **Rapport Complet** : Analyse exhaustive combinant plusieurs frameworks

### Système Multi-Agents
24+ experts IA spécialisés dans différents domaines :
- Expert RH
- Expert Communication
- Expert Produit
- Expert UX
- Expert Marketing
- Expert Financier / CFO
- Expert Stratégie d'Entreprise
- Expert Innovation & R&D
- Expert Business Model
- Expert Transformation Digitale
- Expert Supply Chain / Logistique
- Expert IT / Systèmes d'Information
- Expert Data & Analytics
- Expert Qualité / Process
- Expert Legal & Compliance
- Expert Customer Success
- Expert Sales / Commercial
- Expert Pricing & Monétisation
- Expert Competitive Intelligence
- Expert Market Research
- Expert Sustainability / RSE
- Expert Change Management
- Expert Risk Management
- Expert Cybersécurité

### Fonctionnalités Principales
- ✅ Sélection multi-actions
- ✅ Sélection multi-experts
- ✅ Timeline des contributions en temps réel
- ✅ Débats entre agents pour convergence
- ✅ Interaction utilisateur (réponses aux questions des agents)
- ✅ Génération de PDF avec branding
- ✅ Gestion des experts personnalisés
- ✅ Configuration LLM flexible
- ✅ Historique des analyses

## 🛠️ Stack Technique

- **Framework** : Next.js 15 (App Router)
- **Language** : TypeScript
- **UI** : shadcn/ui + Tailwind CSS
- **Database** : Supabase (PostgreSQL)
- **AI** : OpenAI GPT-4
- **PDF** : jsPDF + jspdf-autotable
- **Déploiement** : Vercel

## 📦 Installation

1. **Cloner le repository**
\`\`\`bash
git clone <repo-url>
cd Onepoint
\`\`\`

2. **Installer les dépendances**
\`\`\`bash
npm install
\`\`\`

3. **Configurer les variables d'environnement**
Créez un fichier \`.env.local\` à la racine :

\`\`\`env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# OpenAI
OPENAI_API_KEY=your-openai-api-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
\`\`\`

4. **Configurer la base de données Supabase**

Connectez-vous à votre projet Supabase et exécutez le script SQL situé dans \`lib/supabase/schema.sql\`

5. **Lancer le serveur de développement**
\`\`\`bash
npm run dev
\`\`\`

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

## 🎨 Design System

Le design utilise une palette de couleurs épurée :
- **Noir & Blanc** : Couleurs principales
- **Bleu #009DDF** : Couleur accent (primary)
- **Design** : Clean et minimaliste

## 📝 Utilisation

1. **Nouvelle Analyse**
   - Décrivez votre contexte et objectif
   - Sélectionnez une ou plusieurs actions d'analyse
   - Choisissez les experts pertinents
   - (Optionnel) Activez l'interaction pour répondre aux questions des agents
   - Lancez l'analyse

2. **Suivi en Temps Réel**
   - Visualisez la timeline des contributions des agents
   - Les agents débattent et convergent vers un consensus
   - Cliquez sur une contribution pour voir les détails

3. **Résultats**
   - Consultez la synthèse exécutive finale
   - Téléchargez le rapport PDF
   - Retrouvez l'analyse dans l'historique

4. **Gestion des Experts**
   - Consultez la liste des 24 experts prédéfinis
   - Créez vos propres experts personnalisés
   - Modifiez ou supprimez vos experts

5. **Configuration**
   - Ajustez les paramètres du modèle LLM
   - Configurez la température, max tokens, etc.

## 🚀 Déploiement sur Vercel

1. **Push vers GitHub**
\`\`\`bash
git add .
git commit -m "Initial commit"
git push origin main
\`\`\`

2. **Connecter à Vercel**
   - Allez sur [vercel.com](https://vercel.com)
   - Importez votre repository
   - Configurez les variables d'environnement
   - Déployez

3. **Configuration Supabase**
   - Créez un projet Supabase
   - Exécutez le schéma SQL
   - Ajoutez les credentials dans Vercel

## 🏗️ Architecture

\`\`\`
onepoint-ai-consulting/
├── app/
│   ├── (dashboard)/          # Pages protégées
│   │   ├── page.tsx          # Nouvelle analyse
│   │   ├── experts/          # Gestion experts
│   │   ├── config/           # Config LLM
│   │   └── history/          # Historique
│   ├── api/
│   │   ├── analyze/          # Endpoint analyse
│   │   └── generate-pdf/    # Endpoint PDF
│   └── layout.tsx
├── components/
│   ├── ui/                   # shadcn components
│   ├── analysis/             # Composants d'analyse
│   └── layout/               # Layout components
├── lib/
│   ├── agents/               # Système multi-agents
│   ├── actions/              # Définitions actions
│   ├── experts/              # Experts prédéfinis
│   ├── openai/               # Client OpenAI
│   ├── pdf/                  # Générateur PDF
│   └── supabase/             # Client Supabase
└── types/                    # TypeScript types
\`\`\`

## 🔑 Variables d'Environnement

| Variable | Description | Requis |
|----------|-------------|--------|
| \`NEXT_PUBLIC_SUPABASE_URL\` | URL du projet Supabase | Oui |
| \`NEXT_PUBLIC_SUPABASE_ANON_KEY\` | Clé anonyme Supabase | Oui |
| \`OPENAI_API_KEY\` | Clé API OpenAI | Oui |
| \`NEXT_PUBLIC_APP_URL\` | URL de l'application | Non |

## 📊 Roadmap Future

- [ ] Authentification utilisateurs
- [ ] Partage d'analyses
- [ ] Templates d'analyse prédéfinis
- [ ] Export Word/PowerPoint
- [ ] Support multi-langues
- [ ] Intégration Anthropic Claude
- [ ] Mode collaboratif temps réel
- [ ] API publique
- [ ] Webhooks

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

## 📄 License

MIT

## 🙏 Remerciements

Propulsé par :
- OpenAI GPT-4
- Next.js
- shadcn/ui
- Supabase
- Vercel
