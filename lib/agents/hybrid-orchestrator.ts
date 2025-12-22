/**
 * Hybrid Orchestrator using Responses API
 * Simplified orchestration without LangGraph for now
 * Uses OpenAI Responses API with native web search
 */

import { ResponsesAgent } from "./responses-agent";
import { Expert, ActionType, Contribution, UserQuestion, ContributionDebugInfo } from "@/types";
import { ACTIONS } from "@/lib/actions/action-definitions";
import { PREDEFINED_EXPERTS } from "@/lib/experts/predefined-experts";

export interface HybridOrchestrationConfig {
  userInput: string;
  selectedActions: ActionType[];
  selectedExperts: string[]; // Expert IDs
  userInvolved: boolean;
  allExperts?: Expert[]; // Optional: provide all experts (predefined + custom)
  onContribution?: (contribution: Contribution) => void;
  onQuestion?: (question: UserQuestion) => Promise<string | null>;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  useWebSearch?: boolean; // Enable web search for agents
}

export interface HybridOrchestrationResult {
  timeline: Contribution[];
  finalOutput: string;
  questionsAsked: UserQuestion[];
}

export class HybridOrchestrator {
  private agents: Map<string, ResponsesAgent>;
  private contributions: Contribution[];
  private config: HybridOrchestrationConfig;
  private questionsAsked: UserQuestion[];

  constructor(config: HybridOrchestrationConfig) {
    this.config = config;
    this.agents = new Map();
    this.contributions = [];
    this.questionsAsked = [];
    this.initializeAgents();
  }

  private initializeAgents(): void {
    // Use provided experts or default to predefined experts
    const expertPool = this.config.allExperts || PREDEFINED_EXPERTS;

    const experts = expertPool.filter((e) =>
      this.config.selectedExperts.includes(e.id)
    );

    experts.forEach((expert) => {
      const agent = new ResponsesAgent(
        expert,
        this.config.model,
        this.config.temperature,
        this.config.maxTokens,
        this.config.useWebSearch || false
      );
      this.agents.set(expert.id, agent);
    });

    console.log("🔧 [HYBRID ORCHESTRATOR] Initialized with:", {
      agentsCount: this.agents.size,
      webSearch: this.config.useWebSearch,
      model: this.config.model,
      usingResponsesAPI: true,
    });
  }

  private addContribution(
    agentId: string,
    agentName: string,
    type: Contribution["type"],
    content: string,
    replyTo?: string,
    debug?: ContributionDebugInfo
  ): void {
    const contribution: Contribution = {
      id: `contrib-${Date.now()}-${Math.random()}`,
      agentId,
      agentName,
      timestamp: new Date(),
      type,
      content,
      replyTo,
      debug,
    };

    // Log debug status for troubleshooting
    if (!debug) {
      console.warn(`⚠️ [ORCHESTRATOR] Contribution sans debug pour ${agentName} (${type})`);
    } else {
      console.log(`✅ [ORCHESTRATOR] Contribution avec debug pour ${agentName}:`, {
        hasSystemPrompt: !!debug.systemPrompt,
        hasUserPrompt: !!debug.userPrompt,
        model: debug.model,
        temperature: debug.temperature,
        webSearchesCount: debug.webSearches?.length || 0,
      });
    }

    this.contributions.push(contribution);

    if (this.config.onContribution) {
      this.config.onContribution(contribution);
    }
  }

  private async askUserQuestion(
    agentId: string,
    agentName: string,
    question: string
  ): Promise<string | null> {
    if (!this.config.userInvolved || !this.config.onQuestion) {
      return null;
    }

    const userQuestion: UserQuestion = {
      id: `q-${Date.now()}`,
      analysisId: "current", // Will be set by the caller
      agentId,
      agentName,
      question,
      timestamp: new Date(),
    };

    this.questionsAsked.push(userQuestion);

    const answer = await this.config.onQuestion(userQuestion);

    if (answer) {
      userQuestion.answer = answer;
      userQuestion.answeredAt = new Date();
    }

    return answer;
  }

  async runAnalysis(): Promise<HybridOrchestrationResult> {
    console.log("🚀 [HYBRID ORCHESTRATOR] Starting multi-agent analysis with Responses API...");

    // Phase 1: Initial Analysis by each expert for each action
    for (const actionType of this.config.selectedActions) {
      const action = ACTIONS[actionType];
      console.log(`\n📋 Analyzing: ${action.name}`);

      // Get recommended experts for this action (or use all if not enough)
      const relevantAgents = Array.from(this.agents.values()).filter(
        (agent) =>
          action.recommendedExperts.includes(agent.getExpert().id) ||
          this.agents.size <= 4
      );

      // Round 1: Initial individual analyses
      for (const agent of relevantAgents) {
        const expert = agent.getExpert();

        let prompt = `En tant qu'expert ${expert.role}, analyse la demande suivante du point de vue de ton expertise :

Demande: ${this.config.userInput}

Action à réaliser: ${action.name} - ${action.description}`;

        // Add explicit web search instructions when enabled
        if (this.config.useWebSearch) {
          prompt += `

🔍 IMPORTANT - RECHERCHE WEB ACTIVÉE :
Tu as accès à des recherches web natives pour obtenir des informations récentes et actualisées.
UTILISE cette capacité pour :
- Obtenir des données à jour (chiffres, tendances, actualités 2025)
- Vérifier des informations sur des entreprises, marchés ou technologies
- Trouver des exemples concrets et des cas d'usage récents
- Enrichir ton analyse avec des sources fiables et actuelles

Les citations seront automatiquement ajoutées à ta réponse.`;
        }

        prompt += `

📝 FORMAT DE RÉPONSE REQUIS :
Utilise **Markdown** pour formater ta réponse de manière professionnelle et structurée :

**Structure recommandée :**
- **Headers** (## et ###) pour organiser les sections principales
- **Gras** pour mettre en avant les points clés et importants
- **Listes à puces** ou **numérotées** pour énumérer clairement les éléments
- **Tableaux** pour présenter des données comparatives ou des matrices
- **Citations** (>) pour souligner les insights et recommandations clés
- **Séparateurs horizontaux** (---) pour délimiter les grandes sections

**Présentation visuelle :**
- Utilise des tableaux pour les analyses comparatives (ex: SWOT, concurrence)
- Structure ton analyse avec des sections claires et hiérarchisées
- Mets en évidence les éléments prioritaires avec du gras
- Utilise des listes pour faciliter la lecture

**Exemple de structure :**
\`\`\`
## Analyse Principale

### Section 1
- Point important
- Détail complémentaire

### Section 2
| Critère | Évaluation | Impact |
|---------|------------|--------|
| ...     | ...        | ...    |

> 💡 **Recommandation clé** : ...

---

## Conclusion
\`\`\`

Fournis ton analyse initiale en te concentrant sur ton domaine d'expertise. Sois concis mais précis et visuellement clair.`;

        const response = await agent.generate(prompt);

        this.addContribution(
          expert.id,
          expert.name,
          "analysis",
          response.content,
          undefined,
          response.debug
        );
      }

      // Round 2: Debate and refinement
      console.log(`💬 Agents debating for ${action.name}...`);

      for (let round = 0; round < 2; round++) {
        for (const agent of relevantAgents) {
          const expert = agent.getExpert();

          // Get recent contributions from other agents
          const recentContributions = this.contributions
            .slice(-relevantAgents.length * 2)
            .filter((c) => c.agentId !== expert.id);

          if (recentContributions.length === 0) continue;

          const reaction = await agent.react(recentContributions);

          const contributionType: Contribution["type"] =
            round === 0 ? "debate" : "consensus";

          this.addContribution(
            expert.id,
            expert.name,
            contributionType,
            reaction.content,
            undefined,
            reaction.debug
          );
        }
      }

      // Ask user question if needed
      if (this.config.userInvolved && Math.random() > 0.5) {
        const randomAgent = relevantAgents[Math.floor(Math.random() * relevantAgents.length)];
        const expert = randomAgent.getExpert();

        const questionPrompt = `Pose UNE question pertinente à l'utilisateur qui pourrait clarifier un aspect important pour l'analyse ${action.name}. Sois direct et concis.`;

        const question = await randomAgent.generate(questionPrompt);

        this.addContribution(
          expert.id,
          expert.name,
          "question",
          question.content,
          undefined,
          question.debug
        );

        const answer = await this.askUserQuestion(expert.id, expert.name, question.content);

        if (answer) {
          this.addContribution(
            "user",
            "Utilisateur",
            "analysis",
            answer,
            this.contributions[this.contributions.length - 1].id
          );
        }
      }

      // Round 3: Synthesis for this action
      console.log(`✅ Synthesizing ${action.name}...`);

      const strategist = Array.from(this.agents.values()).find(
        (a) => a.getExpert().id === "strategy-expert"
      ) || relevantAgents[0];

      const synthesisPrompt = `En tant que synthétiseur, crée un résumé structuré de l'analyse ${action.name} en te basant sur toutes les contributions des experts.

Utilise ce template :
${action.outputTemplate}

Intègre les insights de tous les experts de manière cohérente et actionnable.`;

      const allContributions = this.contributions
        .filter((c) => c.type !== "question")
        .map((c) => `[${c.agentName}]: ${c.content}`);

      const synthesis = await strategist.generate(synthesisPrompt, allContributions);

      this.addContribution(
        strategist.getExpert().id,
        strategist.getExpert().name,
        "summary",
        synthesis.content,
        undefined,
        synthesis.debug
      );
    }

    // Final synthesis across all actions
    console.log("\n🎯 Creating final synthesis...");

    const finalSynthesisPrompt = `Crée une synthèse exécutive finale qui intègre toutes les analyses réalisées :

Actions analysées: ${this.config.selectedActions.map(a => ACTIONS[a].name).join(", ")}

La synthèse doit :
1. Présenter les conclusions clés de chaque analyse
2. Identifier les thèmes transverses
3. Proposer des recommandations stratégiques prioritaires
4. Être claire, actionnable et orientée business

Format attendu :
# Synthèse Exécutive

## Conclusions Clés par Analyse
[Résumé de chaque action]

## Insights Transverses
[Patterns et thèmes communs]

## Recommandations Stratégiques
[Actions prioritaires avec justification]

## Next Steps
[Étapes concrètes à court terme]
`;

    const strategist = Array.from(this.agents.values()).find(
      (a) => a.getExpert().id === "strategy-expert"
    ) || Array.from(this.agents.values())[0];

    const allSummaries = this.contributions
      .filter((c) => c.type === "summary")
      .map((c) => c.content);

    const finalOutput = await strategist.generate(finalSynthesisPrompt, allSummaries);

    this.addContribution(
      strategist.getExpert().id,
      strategist.getExpert().name,
      "summary",
      finalOutput.content,
      undefined,
      finalOutput.debug
    );

    console.log("✅ [HYBRID ORCHESTRATOR] Analysis complete!");

    return {
      timeline: this.contributions,
      finalOutput: finalOutput.content,
      questionsAsked: this.questionsAsked,
    };
  }
}
