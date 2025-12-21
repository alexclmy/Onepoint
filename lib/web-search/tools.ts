/**
 * OpenAI Function Calling Tools for Web Search
 */

export const webSearchTool = {
  type: "function" as const,
  function: {
    name: "search_web",
    description:
      "🔍 OUTIL DE RECHERCHE WEB - UTILISE-LE SYSTÉMATIQUEMENT pour enrichir tes analyses. " +
      "Recherche des informations récentes, actuelles et vérifiées sur internet. " +
      "CAS D'USAGE OBLIGATOIRES : " +
      "1) Analyses d'entreprises (cherche actualités, résultats financiers, stratégie) " +
      "2) Données de marché (tendances, tailles de marché, statistiques) " +
      "3) Informations concurrentielles (parts de marché, positionnement) " +
      "4) Technologies et innovations (dernières avancées, adoption) " +
      "5) Toute information postérieure à ta date de coupure de connaissance. " +
      "CONSIGNE : Si la demande porte sur une entreprise, un marché ou un secteur, tu DOIS faire au moins une recherche web avant de répondre.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description:
            "La requête de recherche. SOIT TRÈS SPÉCIFIQUE et inclus l'année 2025 pour les données récentes. " +
            "BONNES requêtes : 'Tesla financial results 2025', 'SaaS market trends France 2025', 'Salesforce vs HubSpot comparison 2025'. " +
            "MAUVAISES requêtes : 'Tesla', 'marché SaaS', 'concurrents' (trop vagues)",
        },
        search_depth: {
          type: "string",
          enum: ["basic", "advanced"],
          description:
            "Profondeur de recherche. 'basic' (5 sources, rapide) pour un premier aperçu. " +
            "'advanced' (10+ sources, approfondi) pour analyses détaillées et comparaisons.",
          default: "basic",
        },
      },
      required: ["query"],
    },
  },
};

export const availableTools = [webSearchTool];
