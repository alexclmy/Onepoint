/**
 * OpenAI Function Calling Tools for Web Search
 */

export const webSearchTool = {
  type: "function" as const,
  function: {
    name: "search_web",
    description:
      "Recherche des informations récentes sur le web. Utilise cet outil quand tu as besoin de données actuelles, de statistiques récentes, de tendances du marché, ou d'informations qui ne sont pas dans ta base de connaissances. Retourne des sources fiables avec du contenu pertinent.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description:
            "La requête de recherche. Soit spécifique et clair. Exemples: 'tendances marché SaaS 2025', 'statistiques e-commerce France', 'analyse concurrence Salesforce CRM'",
        },
        search_depth: {
          type: "string",
          enum: ["basic", "advanced"],
          description:
            "Profondeur de recherche. 'basic' pour des résultats rapides, 'advanced' pour une recherche approfondie avec plus de sources.",
          default: "basic",
        },
      },
      required: ["query"],
    },
  },
};

export const availableTools = [webSearchTool];
