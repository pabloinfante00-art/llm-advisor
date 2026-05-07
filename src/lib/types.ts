export interface LLMModel {
  id: string;
  provider: string;
  name: string;
  description: string;
  contextWindow: string;
  inputPrice: string;
  outputPrice: string;
  strengths: string[];
  bestFor: string[];
  releaseDate: string;
  tier: "flagship" | "mid" | "budget";
  apiAvailable: boolean;
  multimodal: boolean;
  reasoning: boolean;
}

export interface CompanyProfile {
  name: string;
  industry: string;
  size: "startup" | "small" | "medium" | "large" | "enterprise";
  employeeCount: string;
  currentTools: string[];
  budget: "low" | "medium" | "high" | "unlimited";
  technicalTeam: boolean;
}

export interface UseCase {
  id: string;
  label: string;
  description: string;
  icon: string;
}

export interface IntegrationPreferences {
  useCases: string[];
  priority: "cost" | "performance" | "ease" | "security";
  timeline: "asap" | "1month" | "3months" | "6months";
  dataPrivacy: "cloud" | "hybrid" | "onprem";
  existingStack: string[];
}

export interface WizardState {
  step: number;
  company: CompanyProfile;
  preferences: IntegrationPreferences;
  recommendation: string | null;
  isGenerating: boolean;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}
