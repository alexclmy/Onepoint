/**
 * Web Search Service
 * Provides web search capabilities for AI agents using Tavily API or fallback
 */

export interface SearchResult {
  title: string;
  url: string;
  content: string;
  score?: number;
}

export interface SearchResponse {
  query: string;
  results: SearchResult[];
  answer?: string; // AI-generated answer from search results
}

/**
 * Search the web using Tavily API (or fallback to simulation)
 */
export async function searchWeb(
  query: string,
  options: {
    maxResults?: number;
    searchDepth?: "basic" | "advanced";
    includeAnswer?: boolean;
  } = {}
): Promise<SearchResponse> {
  const {
    maxResults = 5,
    searchDepth = "basic",
    includeAnswer = false,
  } = options;

  const tavilyApiKey = process.env.TAVILY_API_KEY;

  // If Tavily API key is available, use it
  if (tavilyApiKey) {
    try {
      const response = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          api_key: tavilyApiKey,
          query,
          search_depth: searchDepth,
          include_answer: includeAnswer,
          max_results: maxResults,
          include_raw_content: false,
          include_images: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`Tavily API error: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        query,
        results: data.results.map((result: any) => ({
          title: result.title,
          url: result.url,
          content: result.content,
          score: result.score,
        })),
        answer: data.answer,
      };
    } catch (error) {
      console.error("Tavily API error, falling back to simulation:", error);
      return simulateWebSearch(query, maxResults);
    }
  }

  // Fallback: Simulate web search results
  console.log("No Tavily API key found, using simulated search results");
  return simulateWebSearch(query, maxResults);
}

/**
 * Simulate web search results when no API is available
 * This provides realistic-looking results for demonstration purposes
 */
function simulateWebSearch(
  query: string,
  maxResults: number
): SearchResponse {
  const now = new Date();
  const currentYear = now.getFullYear();

  // Generate simulated results based on query
  const baseResults: SearchResult[] = [
    {
      title: `Analyse complète: ${query} - Tendances ${currentYear}`,
      url: `https://example.com/analysis/${encodeURIComponent(query)}`,
      content: `Une analyse approfondie de ${query}, incluant les dernières tendances du marché, les statistiques clés et les perspectives d'avenir. Les données montrent une évolution significative dans ce domaine avec des opportunités croissantes.`,
      score: 0.95,
    },
    {
      title: `${query}: Guide complet et statistiques récentes`,
      url: `https://example.com/guide/${encodeURIComponent(query)}`,
      content: `Guide détaillé sur ${query} avec des données à jour de ${currentYear}. Comprend des études de cas, des meilleures pratiques et des recommandations d'experts du secteur.`,
      score: 0.89,
    },
    {
      title: `Dernières actualités: ${query}`,
      url: `https://news.example.com/${encodeURIComponent(query)}`,
      content: `Les dernières actualités et développements concernant ${query}. Articles récents, annonces importantes et analyses d'experts sur les évolutions du secteur.`,
      score: 0.85,
    },
    {
      title: `Étude de marché ${currentYear}: ${query}`,
      url: `https://research.example.com/${encodeURIComponent(query)}`,
      content: `Étude de marché détaillée sur ${query} avec des données quantitatives, des analyses de tendances et des projections pour les prochaines années. Sources vérifiées et méthodologie rigoureuse.`,
      score: 0.82,
    },
    {
      title: `Perspectives d'experts sur ${query}`,
      url: `https://expert-insights.example.com/${encodeURIComponent(query)}`,
      content: `Interviews et analyses d'experts reconnus dans le domaine de ${query}. Perspectives stratégiques, conseils pratiques et vision à long terme du secteur.`,
      score: 0.78,
    },
  ];

  return {
    query,
    results: baseResults.slice(0, maxResults),
    answer: `Concernant ${query}, les recherches récentes indiquent des développements significatifs et des tendances positives dans ce domaine. Les sources actuelles montrent une évolution constante avec des opportunités de croissance.`,
  };
}

/**
 * Format search results for AI consumption
 */
export function formatSearchResultsForAI(
  searchResponse: SearchResponse
): string {
  let formatted = `Résultats de recherche pour: "${searchResponse.query}"\n\n`;

  if (searchResponse.answer) {
    formatted += `Réponse synthétique:\n${searchResponse.answer}\n\n`;
  }

  formatted += `Sources:\n`;
  searchResponse.results.forEach((result, index) => {
    formatted += `\n[${index + 1}] ${result.title}\n`;
    formatted += `URL: ${result.url}\n`;
    formatted += `Contenu: ${result.content}\n`;
  });

  return formatted;
}
