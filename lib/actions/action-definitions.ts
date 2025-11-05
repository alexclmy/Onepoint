import { Action, ActionType } from "@/types";

export const ACTIONS: Record<ActionType, Action> = {
  swot: {
    id: "swot",
    name: "Analyse SWOT",
    description: "Analyse des Forces, Faiblesses, Opportunités et Menaces",
    recommendedExperts: [
      "strategy-expert",
      "competitive-intelligence-expert",
      "market-research-expert",
      "finance-expert",
    ],
    outputTemplate: `# Analyse SWOT

## Forces (Strengths)
[Liste des forces internes]

## Faiblesses (Weaknesses)
[Liste des faiblesses internes]

## Opportunités (Opportunities)
[Liste des opportunités externes]

## Menaces (Threats)
[Liste des menaces externes]

## Recommandations Stratégiques
[Actions prioritaires basées sur l'analyse]`,
    estimatedDuration: 15,
  },

  pestel: {
    id: "pestel",
    name: "Analyse PESTEL",
    description:
      "Analyse Politique, Économique, Socioculturelle, Technologique, Environnementale, Légale",
    recommendedExperts: [
      "strategy-expert",
      "market-research-expert",
      "legal-expert",
      "sustainability-expert",
      "innovation-expert",
    ],
    outputTemplate: `# Analyse PESTEL

## Politique
[Facteurs politiques et réglementaires]

## Économique
[Facteurs économiques et financiers]

## Socioculturel
[Tendances sociales et démographiques]

## Technologique
[Innovations et évolutions technologiques]

## Environnemental
[Impact environnemental et durabilité]

## Légal
[Cadre juridique et conformité]

## Synthèse et Implications
[Impact global sur le projet/l'entreprise]`,
    estimatedDuration: 20,
  },

  porter: {
    id: "porter",
    name: "5 Forces de Porter",
    description: "Analyse de l'intensité concurrentielle du secteur",
    recommendedExperts: [
      "strategy-expert",
      "competitive-intelligence-expert",
      "market-research-expert",
    ],
    outputTemplate: `# Analyse des 5 Forces de Porter

## 1. Rivalité entre concurrents existants
[Intensité de la concurrence]

## 2. Pouvoir de négociation des clients
[Influence des clients sur les prix et conditions]

## 3. Pouvoir de négociation des fournisseurs
[Dépendance vis-à-vis des fournisseurs]

## 4. Menace des nouveaux entrants
[Barrières à l'entrée et risque de nouveaux acteurs]

## 5. Menace des produits de substitution
[Alternatives disponibles]

## Attractivité du Secteur
[Évaluation globale et recommandations]`,
    estimatedDuration: 18,
  },

  bcg: {
    id: "bcg",
    name: "Matrice BCG",
    description: "Positionnement du portefeuille produits/activités",
    recommendedExperts: [
      "strategy-expert",
      "product-expert",
      "finance-expert",
      "marketing-expert",
    ],
    outputTemplate: `# Matrice BCG

## Stars (Étoiles)
[Produits à forte croissance et forte part de marché]

## Cash Cows (Vaches à lait)
[Produits à faible croissance et forte part de marché]

## Question Marks (Dilemmes)
[Produits à forte croissance et faible part de marché]

## Dogs (Poids morts)
[Produits à faible croissance et faible part de marché]

## Recommandations d'Allocation des Ressources
[Stratégies d'investissement par catégorie]`,
    estimatedDuration: 15,
  },

  "business-model-canvas": {
    id: "business-model-canvas",
    name: "Business Model Canvas",
    description: "Modélisation du modèle économique",
    recommendedExperts: [
      "business-model-expert",
      "strategy-expert",
      "finance-expert",
      "marketing-expert",
    ],
    outputTemplate: `# Business Model Canvas

## Segments de Clientèle
[Qui sont nos clients ?]

## Propositions de Valeur
[Quelle valeur délivrons-nous ?]

## Canaux
[Comment délivrons-nous la valeur ?]

## Relations Clients
[Quel type de relation établissons-nous ?]

## Flux de Revenus
[Comment générons-nous des revenus ?]

## Ressources Clés
[De quelles ressources avons-nous besoin ?]

## Activités Clés
[Quelles sont nos activités principales ?]

## Partenaires Clés
[Qui sont nos partenaires stratégiques ?]

## Structure de Coûts
[Quels sont nos coûts principaux ?]

## Analyse de Viabilité
[Évaluation du modèle économique]`,
    estimatedDuration: 25,
  },

  "value-proposition-canvas": {
    id: "value-proposition-canvas",
    name: "Value Proposition Canvas",
    description: "Alignement produit/marché et proposition de valeur",
    recommendedExperts: [
      "product-expert",
      "ux-expert",
      "marketing-expert",
      "customer-success-expert",
    ],
    outputTemplate: `# Value Proposition Canvas

## Profil Client
### Tâches Client (Jobs)
[Que cherche à accomplir le client ?]

### Problèmes (Pains)
[Quelles sont ses frustrations ?]

### Gains
[Quels résultats souhaite-t-il ?]

## Proposition de Valeur
### Produits & Services
[Ce que nous offrons]

### Réducteurs de Problèmes (Pain Relievers)
[Comment nous résolvons les problèmes]

### Créateurs de Gains (Gain Creators)
[Comment nous créons de la valeur]

## Fit Produit-Marché
[Degré d'alignement et recommandations]`,
    estimatedDuration: 20,
  },

  "competitive-analysis": {
    id: "competitive-analysis",
    name: "Analyse Concurrentielle",
    description: "Étude approfondie des concurrents",
    recommendedExperts: [
      "competitive-intelligence-expert",
      "market-research-expert",
      "product-expert",
      "marketing-expert",
    ],
    outputTemplate: `# Analyse Concurrentielle

## Paysage Concurrentiel
[Cartographie des acteurs]

## Analyse par Concurrent
[Profil détaillé de chaque concurrent majeur]
- Positionnement
- Forces/Faiblesses
- Stratégie
- Part de marché

## Analyse Comparative
[Tableau comparatif des fonctionnalités/offres]

## Positionnement Différenciant
[Notre avantage concurrentiel]

## Opportunités et Menaces
[Implications stratégiques]`,
    estimatedDuration: 30,
  },

  "market-sizing": {
    id: "market-sizing",
    name: "Sizing de Marché (TAM/SAM/SOM)",
    description: "Estimation de la taille du marché addressable",
    recommendedExperts: [
      "market-research-expert",
      "finance-expert",
      "strategy-expert",
    ],
    outputTemplate: `# Sizing de Marché

## TAM (Total Addressable Market)
[Marché total théorique]
- Définition
- Calcul et méthodologie
- Montant estimé

## SAM (Serviceable Addressable Market)
[Marché addressable par notre offre]
- Segmentation
- Calcul
- Montant estimé

## SOM (Serviceable Obtainable Market)
[Part de marché réaliste à court/moyen terme]
- Hypothèses
- Calcul
- Montant estimé

## Tendances et Croissance
[Évolution du marché]

## Recommandations
[Stratégie de pénétration]`,
    estimatedDuration: 25,
  },

  "feature-prioritization": {
    id: "feature-prioritization",
    name: "Priorisation Features (RICE/MoSCoW)",
    description: "Priorisation des fonctionnalités produit",
    recommendedExperts: [
      "product-expert",
      "ux-expert",
      "data-expert",
      "customer-success-expert",
    ],
    outputTemplate: `# Priorisation des Features

## Méthodologie RICE
[Reach x Impact x Confidence / Effort]

## Liste des Features Prioritaires
[Features triées par score RICE]

## Matrice MoSCoW
### Must Have (Indispensable)
[Features critiques]

### Should Have (Important)
[Features importantes]

### Could Have (Souhaitable)
[Features nice-to-have]

### Won't Have (Pas pour cette version)
[Features reportées]

## Roadmap Recommandée
[Phasage et planning]`,
    estimatedDuration: 20,
  },

  "user-journey-mapping": {
    id: "user-journey-mapping",
    name: "User Journey Mapping",
    description: "Cartographie du parcours utilisateur",
    recommendedExperts: [
      "ux-expert",
      "customer-success-expert",
      "product-expert",
      "marketing-expert",
    ],
    outputTemplate: `# User Journey Map

## Persona
[Profil de l'utilisateur cible]

## Phases du Journey
[Étapes du parcours]

## Pour chaque phase :
### Actions
[Ce que fait l'utilisateur]

### Points de Contact (Touchpoints)
[Où interagit-il ?]

### Pensées & Émotions
[Ressenti de l'utilisateur]

### Pain Points
[Frustrations]

### Opportunités
[Améliorations possibles]

## Recommandations UX
[Actions prioritaires pour améliorer le parcours]`,
    estimatedDuration: 25,
  },

  "product-roadmap": {
    id: "product-roadmap",
    name: "Product Roadmap",
    description: "Feuille de route produit stratégique",
    recommendedExperts: [
      "product-expert",
      "strategy-expert",
      "innovation-expert",
      "data-expert",
    ],
    outputTemplate: `# Product Roadmap

## Vision Produit
[Direction stratégique à long terme]

## Q1 - Court Terme (0-3 mois)
[Features et initiatives prioritaires]

## Q2-Q3 - Moyen Terme (3-9 mois)
[Développements planifiés]

## Q4+ - Long Terme (9-18 mois)
[Vision et innovations futures]

## Métriques de Succès
[KPIs par phase]

## Dépendances et Risques
[Éléments à surveiller]`,
    estimatedDuration: 22,
  },

  "ux-audit": {
    id: "ux-audit",
    name: "UX Audit",
    description: "Audit de l'expérience utilisateur",
    recommendedExperts: [
      "ux-expert",
      "customer-success-expert",
      "data-expert",
    ],
    outputTemplate: `# UX Audit

## Analyse Heuristique
[Respect des principes UX fondamentaux]

## Usabilité
[Facilité d'utilisation et navigation]

## Accessibilité
[Conformité WCAG et inclusivité]

## Performance Perçue
[Vitesse et réactivité]

## Design System
[Cohérence visuelle et composants]

## Points de Friction Identifiés
[Problèmes UX majeurs]

## Quick Wins
[Améliorations rapides]

## Recommandations Stratégiques
[Évolutions UX à moyen/long terme]`,
    estimatedDuration: 30,
  },

  "risk-assessment": {
    id: "risk-assessment",
    name: "Risk Assessment",
    description: "Évaluation et gestion des risques",
    recommendedExperts: [
      "risk-management-expert",
      "legal-expert",
      "finance-expert",
      "cybersecurity-expert",
    ],
    outputTemplate: `# Risk Assessment

## Risques Stratégiques
[Risques liés à la stratégie]

## Risques Opérationnels
[Risques processus et exécution]

## Risques Financiers
[Risques économiques et budgétaires]

## Risques Légaux et de Conformité
[Risques réglementaires]

## Risques Technologiques et Cyber
[Risques IT et sécurité]

## Matrice de Risques
[Probabilité x Impact]

## Plans de Mitigation
[Actions de réduction des risques]

## Plan de Contingence
[Mesures en cas de matérialisation]`,
    estimatedDuration: 28,
  },

  "full-report": {
    id: "full-report",
    name: "Rapport Complet",
    description: "Analyse exhaustive combinant plusieurs frameworks",
    recommendedExperts: [
      "strategy-expert",
      "finance-expert",
      "market-research-expert",
      "competitive-intelligence-expert",
      "product-expert",
      "ux-expert",
      "risk-management-expert",
      "innovation-expert",
    ],
    outputTemplate: `# Rapport d'Analyse Stratégique Complet

## Executive Summary
[Synthèse des conclusions clés]

## Analyse Stratégique
### SWOT
### PESTEL
### 5 Forces de Porter

## Analyse de Marché
### Sizing (TAM/SAM/SOM)
### Analyse Concurrentielle
### Positionnement

## Analyse Produit
### Value Proposition Canvas
### Product Roadmap
### Priorisation Features

## Business Model
### Business Model Canvas
### Stratégie de Monétisation
### Projections Financières

## Analyse des Risques
### Risques Identifiés
### Plans de Mitigation

## Recommandations Stratégiques
[Plan d'action prioritaire]

## Next Steps
[Étapes concrètes]`,
    estimatedDuration: 60,
  },
};

export const ACTION_LIST = Object.values(ACTIONS);
