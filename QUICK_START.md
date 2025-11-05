# 🚀 Quick Start Guide - Onepoint AI Consulting Tool

## ✅ Ce qui a été créé

Votre **POC/MVP complet et solide** est prêt ! Voici ce qui a été développé :

### 📋 Fonctionnalités Principales

#### 1. **14 Actions d'Analyse Stratégique**
- ✅ SWOT (Forces, Faiblesses, Opportunités, Menaces)
- ✅ PESTEL (Politique, Économique, Social, Tech, Environnemental, Légal)
- ✅ 5 Forces de Porter
- ✅ Matrice BCG
- ✅ Business Model Canvas
- ✅ Value Proposition Canvas
- ✅ Analyse Concurrentielle
- ✅ Market Sizing (TAM/SAM/SOM)
- ✅ Feature Prioritization (RICE/MoSCoW)
- ✅ User Journey Mapping
- ✅ Product Roadmap
- ✅ UX Audit
- ✅ Risk Assessment
- ✅ Rapport Complet (combinant plusieurs analyses)

#### 2. **24 Experts IA Spécialisés**
Chaque expert a sa propre personnalité et expertise :
- Expert RH (Sophie Durand)
- Expert Communication (Marc Leblanc)
- Expert Produit (Laura Chen)
- Expert UX (Thomas Martin)
- Expert Marketing (Émilie Rousseau)
- Expert Financier / CFO (Jean-Pierre Moreau)
- Expert Stratégie d'Entreprise (Catherine Dubois)
- Expert Innovation & R&D (Alexandre Petit)
- Expert Business Model (Nathalie Lambert)
- Expert Transformation Digitale (Pierre Girard)
- Expert Supply Chain (Isabelle Fournier)
- Expert IT / SI (David Bernard)
- Expert Data & Analytics (Sarah Cohen)
- Expert Qualité / Process (Michel Roux)
- Expert Legal & Compliance (Valérie Blanc)
- Expert Customer Success (Julien Mercier)
- Expert Sales / Commercial (Stéphanie Leroy)
- Expert Pricing & Monétisation (François Garnier)
- Expert Competitive Intelligence (Caroline Dumas)
- Expert Market Research (Antoine Perrin)
- Expert Sustainability / RSE (Claire Fontaine)
- Expert Change Management (Olivier Morel)
- Expert Risk Management (Sylvie Bertrand)
- Expert Cybersécurité (Kevin Roussel)

#### 3. **Système Multi-Agents Intelligent**
- Débats entre agents pour convergence
- Timeline en temps réel des contributions
- Interactions utilisateur (réponses aux questions des agents)
- Génération de PDF avec branding

#### 4. **Interface Complète**
- Dashboard principal avec sélecteurs d'actions et d'experts
- Timeline des contributions cliquable (overview + détails)
- Page de gestion des experts (prédéfinis + personnalisés)
- Page de configuration LLM
- Page d'historique des analyses

---

## 🛠️ Prochaines Étapes (Setup)

### 1️⃣ Configurer Supabase

1. **Créer un compte Supabase** : [supabase.com](https://supabase.com)

2. **Créer un nouveau projet**
   - Nom : Onepoint AI
   - Mot de passe : (choisissez-en un fort)
   - Région : Europe (West - Ireland recommandé)

3. **Exécuter le schéma SQL**
   - Allez dans SQL Editor
   - Copiez/collez le contenu de `lib/supabase/schema.sql`
   - Exécutez le script

4. **Récupérer les credentials**
   - Settings → API
   - Copiez `Project URL` et `anon/public key`

### 2️⃣ Configurer OpenAI

1. **Créer un compte OpenAI** : [platform.openai.com](https://platform.openai.com)

2. **Générer une API Key**
   - API Keys → Create new secret key
   - Copiez la clé (elle ne sera affichée qu'une fois)

3. **Ajouter du crédit**
   - Billing → Add payment method
   - Recommandation : 50$ pour commencer

### 3️⃣ Configurer les Variables d'Environnement

Créez un fichier `.env.local` à la racine du projet :

\`\`\`env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# OpenAI
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
\`\`\`

### 4️⃣ Lancer le Projet en Local

\`\`\`bash
# Installer les dépendances (si pas déjà fait)
npm install

# Lancer le serveur de développement
npm run dev
\`\`\`

Ouvrez [http://localhost:3000](http://localhost:3000)

### 5️⃣ Tester le Workflow

1. **Créer une nouvelle analyse**
   - Entrez un contexte (ex: "Startup SaaS B2B dans la logistique")
   - Sélectionnez 1-2 actions (commencez simple : SWOT)
   - Sélectionnez 4-6 experts pertinents
   - Lancez l'analyse

2. **Observer la timeline**
   - Les agents vont débattre et converger
   - Cliquez sur les contributions pour voir les détails

3. **Télécharger le PDF**
   - Une fois l'analyse terminée, téléchargez le rapport

---

## 🚀 Déployer sur Vercel

### Option A : Via l'Interface Vercel

1. **Push vers GitHub** (déjà fait ✅)

2. **Connecter à Vercel**
   - Allez sur [vercel.com](https://vercel.com)
   - "New Project" → Importer votre repo
   - Sélectionnez la branche : `claude/ai-consulting-tool-planning-011CUpcGdeXGA4duyG7baQqF`

3. **Configurer les variables d'environnement**
   - Ajoutez les mêmes variables que dans `.env.local`
   - ⚠️ **Important** : Utilisez PRODUCTION keys, pas dev keys

4. **Déployer**
   - Cliquez "Deploy"
   - Attendez ~2-3 minutes

5. **Votre app sera live** à `https://votre-projet.vercel.app`

### Option B : Via CLI Vercel

\`\`\`bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter
vercel login

# Déployer
vercel --prod

# Configurer les variables d'environnement
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add OPENAI_API_KEY

# Redéployer avec les nouvelles variables
vercel --prod
\`\`\`

---

## 💡 Utilisation

### Créer une Nouvelle Analyse

1. **Page d'accueil** : Décrivez votre contexte
2. **Sélectionnez les actions** : SWOT, PESTEL, Porter, etc.
3. **Choisissez les experts** : Minimum 3-4 recommandé
4. **Options** :
   - ☑️ Cochez "M'impliquer" si vous voulez répondre aux questions
5. **Lancez** : Cliquez "Lancer l'Analyse"

### Pendant l'Analyse

- **Timeline en temps réel** : Voyez les agents contribuer
- **Cliquez sur une contribution** : Voir les détails
- **Types de contributions** :
  - 📄 Analyse (contribution initiale)
  - ⚠️ Débat (désaccord constructif)
  - ✅ Consensus (convergence)
  - 💬 Synthèse (résumé)
  - ❓ Question (si "M'impliquer" activé)

### Après l'Analyse

- **Télécharger le PDF** : Rapport complet avec branding
- **Retrouver dans l'historique** : Page "Historique"

### Gestion des Experts

- **Page Experts** : Voir les 24 experts prédéfinis
- **Créer un expert personnalisé** :
  - Nom, rôle, expertise
  - Tone of voice (formel, créatif, analytique...)
  - Instructions spécifiques (prompt system)

### Configuration LLM

- **Modèle** : gpt-4-turbo-preview (recommandé) ou gpt-3.5-turbo
- **Temperature** : 0.7 (bon équilibre créativité/cohérence)
- **Max Tokens** : 4000

---

## 📊 Coûts Estimés

### Par Analyse (estimation)

- **Simple** (1 action, 4 experts) : ~$0.50 - $1.50
- **Moyenne** (2-3 actions, 6-8 experts) : ~$2.00 - $5.00
- **Complète** (Rapport complet, 10+ experts) : ~$8.00 - $15.00

### Optimisation des Coûts

- Utilisez `gpt-3.5-turbo` pour tester (moins cher)
- Limitez le nombre d'experts aux plus pertinents
- Réglez `maxTokens` à 2000-3000 au lieu de 4000

---

## 🐛 Troubleshooting

### Build échoue
\`\`\`bash
# Nettoyer et réinstaller
rm -rf .next node_modules package-lock.json
npm install
npm run build
\`\`\`

### Erreur Supabase "Invalid API key"
- Vérifiez que la clé dans `.env.local` est bien la **anon/public key**
- Assurez-vous qu'il n'y a pas d'espaces avant/après

### Erreur OpenAI "Insufficient quota"
- Vérifiez votre crédit sur [platform.openai.com/usage](https://platform.openai.com/usage)
- Ajoutez du crédit si nécessaire

### Timeline ne s'affiche pas
- Ouvrez la console développeur (F12)
- Vérifiez les erreurs réseau
- Assurez-vous que l'API `/api/analyze` répond

---

## 🎯 Roadmap Future (Suggestions)

- [ ] Authentification utilisateurs (Supabase Auth)
- [ ] Partage d'analyses (liens publics)
- [ ] Templates prédéfinis (secteurs : SaaS, E-commerce, etc.)
- [ ] Export PowerPoint/Word
- [ ] Multi-langues (EN, ES, DE)
- [ ] Support Anthropic Claude
- [ ] Mode collaboratif temps réel
- [ ] API publique pour intégrations
- [ ] Webhooks pour automatisation

---

## 📞 Support

Pour toute question :
1. Consultez le `README.md`
2. Vérifiez la documentation Next.js : [nextjs.org/docs](https://nextjs.org/docs)
3. Vérifiez la documentation Supabase : [supabase.com/docs](https://supabase.com/docs)
4. Vérifiez la documentation OpenAI : [platform.openai.com/docs](https://platform.openai.com/docs)

---

## ✅ Checklist de Lancement

- [ ] Supabase configuré et schéma SQL exécuté
- [ ] OpenAI API key configurée avec crédit
- [ ] Variables d'environnement dans `.env.local`
- [ ] `npm run dev` fonctionne en local
- [ ] Test d'une analyse simple (SWOT)
- [ ] PDF généré et téléchargé
- [ ] Déployé sur Vercel
- [ ] Variables d'environnement configurées sur Vercel
- [ ] Test en production

---

**Votre outil est prêt ! 🚀**

Bon lancement et n'hésitez pas à itérer rapidement sur les retours utilisateurs !
