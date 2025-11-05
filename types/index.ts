// Expert/Agent Types
export interface Expert {
  id: string;
  name: string;
  role: string;
  expertise: string;
  tone: "formal" | "creative" | "analytical" | "strategic" | "pragmatic";
  systemPrompt: string;
  isCustom: boolean;
  avatar?: string;
  color?: string;
}

// Action Types
export type ActionType =
  | "swot"
  | "pestel"
  | "porter"
  | "bcg"
  | "business-model-canvas"
  | "value-proposition-canvas"
  | "competitive-analysis"
  | "market-sizing"
  | "feature-prioritization"
  | "user-journey-mapping"
  | "product-roadmap"
  | "ux-audit"
  | "risk-assessment"
  | "full-report";

export interface Action {
  id: ActionType;
  name: string;
  description: string;
  recommendedExperts: string[];
  outputTemplate: string;
  estimatedDuration: number; // in minutes
}

// Contribution Types
export interface Contribution {
  id: string;
  agentId: string;
  agentName: string;
  timestamp: Date;
  type: "analysis" | "debate" | "question" | "consensus" | "summary";
  content: string;
  replyTo?: string;
}

// Analysis Types
export interface Analysis {
  id: string;
  userInput: string;
  selectedActions: ActionType[];
  selectedExperts: string[];
  userInvolved: boolean;
  status: "pending" | "running" | "waiting_user" | "completed" | "failed";
  timeline: Contribution[];
  result?: string;
  pdfUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Agent Message Types
export interface AgentMessage {
  role: "system" | "user" | "assistant";
  content: string;
  name?: string;
}

// LLM Config
export interface LLMConfig {
  id: string;
  provider: "openai" | "anthropic" | "custom";
  model: string;
  temperature: number;
  maxTokens: number;
  apiKey?: string;
}

// User Question from Agents
export interface UserQuestion {
  id: string;
  analysisId: string;
  agentId: string;
  agentName: string;
  question: string;
  timestamp: Date;
  answer?: string;
  answeredAt?: Date;
}
