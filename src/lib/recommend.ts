import { LLMModel, CompanyProfile, IntegrationPreferences } from "./types";

interface ScoredModel {
  model: LLMModel;
  score: number;
  reasons: string[];
  estimatedMonthlyCost: string;
  fitLevel: "perfect" | "great" | "good" | "fair";
}

function parsePrice(price: string): number {
  const match = price.match(/\$([\d.]+)/);
  return match ? parseFloat(match[1]) : 0;
}

function estimateMonthlyCost(
  model: LLMModel,
  size: string,
  useCases: string[]
): number {
  const inputPrice = parsePrice(model.inputPrice);
  const outputPrice = parsePrice(model.outputPrice);
  if (inputPrice === 0 && outputPrice === 0) return 0;

  const tokensPerEmployee: Record<string, number> = {
    startup: 500_000,
    small: 300_000,
    medium: 200_000,
    large: 150_000,
    enterprise: 100_000,
  };

  const useCaseMultiplier: Record<string, number> = {
    email: 1.2,
    documents: 1.5,
    spreadsheets: 1.0,
    "customer-support": 2.0,
    coding: 1.8,
    automation: 2.5,
    "knowledge-base": 1.3,
    general: 0.8,
  };

  const employeeCounts: Record<string, number> = {
    startup: 5,
    small: 30,
    medium: 100,
    large: 500,
    enterprise: 2000,
  };

  const baseTokens = tokensPerEmployee[size] || 200_000;
  const employees = employeeCounts[size] || 100;
  const ucMultiplier = useCases.reduce(
    (sum, uc) => sum + (useCaseMultiplier[uc] || 1),
    0
  );
  const avgMultiplier = ucMultiplier / Math.max(useCases.length, 1);

  const monthlyInputTokens = baseTokens * employees * avgMultiplier;
  const monthlyOutputTokens = monthlyInputTokens * 0.3;

  const inputCost = (monthlyInputTokens / 1_000_000) * inputPrice;
  const outputCost = (monthlyOutputTokens / 1_000_000) * outputPrice;

  return Math.round(inputCost + outputCost);
}

export function recommendModels(
  models: LLMModel[],
  company: CompanyProfile,
  preferences: IntegrationPreferences
): ScoredModel[] {
  const scored = models.map((model) => {
    let score = 50;
    const reasons: string[] = [];

    // Budget fit
    const cost = estimateMonthlyCost(model, company.size, preferences.useCases);
    const budgetLimits: Record<string, number> = {
      low: 500,
      medium: 5000,
      high: 50000,
      unlimited: Infinity,
    };
    const limit = budgetLimits[company.budget] || 5000;

    if (cost <= limit * 0.3) {
      score += 15;
      reasons.push("Well within your budget");
    } else if (cost <= limit * 0.7) {
      score += 10;
      reasons.push("Fits your budget comfortably");
    } else if (cost <= limit) {
      score += 5;
      reasons.push("Fits your budget");
    } else {
      score -= 15;
      reasons.push("May exceed your budget");
    }

    // Priority alignment
    if (preferences.priority === "cost") {
      const inputP = parsePrice(model.inputPrice);
      if (inputP === 0) {
        score += 20;
        reasons.push("Free — maximum cost savings");
      } else if (inputP <= 0.5) {
        score += 18;
        reasons.push("Extremely cost-efficient");
      } else if (inputP <= 2) {
        score += 12;
        reasons.push("Good price-performance ratio");
      } else if (inputP <= 5) {
        score += 5;
      } else {
        score -= 5;
      }
    }

    if (preferences.priority === "performance") {
      if (model.tier === "flagship") {
        score += 18;
        reasons.push("Top-tier performance");
      } else if (model.tier === "mid") {
        score += 8;
      }
      if (model.reasoning) {
        score += 8;
        reasons.push("Advanced reasoning capabilities");
      }
    }

    if (preferences.priority === "ease") {
      if (
        ["OpenAI", "Anthropic", "Google"].includes(model.provider)
      ) {
        score += 12;
        reasons.push("Excellent documentation and SDK support");
      }
      if (model.provider === "Meta") {
        score -= 8;
        reasons.push("Requires self-hosting infrastructure");
      }
      if (!company.technicalTeam && model.provider === "Meta") {
        score -= 15;
      }
    }

    if (preferences.priority === "security") {
      if (preferences.dataPrivacy === "onprem") {
        if (model.provider === "Meta" || model.provider === "DeepSeek") {
          score += 20;
          reasons.push("Open weights — can run fully on-premise");
        } else {
          score -= 10;
        }
      }
      if (model.provider === "Anthropic") {
        score += 8;
        reasons.push("Industry-leading safety and alignment");
      }
      if (model.provider === "Mistral") {
        score += 6;
        reasons.push("EU-based — strong GDPR compliance");
      }
    }

    // Use case matching
    const useCaseModelFit: Record<string, string[]> = {
      email: ["Speed", "Low cost", "Reliable", "Balanced performance"],
      documents: ["Long context", "Massive context", "Multimodal", "Reasoning"],
      spreadsheets: ["Coding", "Reasoning", "Function calling"],
      "customer-support": ["Speed", "Low cost", "Reliable", "Multilingual"],
      coding: ["Coding", "Reasoning", "Deep reasoning", "Adaptive reasoning"],
      automation: [
        "Tool coordination",
        "Function calling",
        "Agentic",
        "Reasoning",
      ],
      "knowledge-base": ["Long context", "Multimodal", "Reliable"],
      general: ["Balanced performance", "Multimodal", "Speed"],
    };

    let useCaseScore = 0;
    for (const uc of preferences.useCases) {
      const desiredTraits = useCaseModelFit[uc] || [];
      for (const trait of desiredTraits) {
        if (
          model.strengths.some((s) =>
            s.toLowerCase().includes(trait.toLowerCase())
          )
        ) {
          useCaseScore += 3;
        }
        if (
          model.bestFor.some((b) =>
            b.toLowerCase().includes(trait.toLowerCase())
          )
        ) {
          useCaseScore += 2;
        }
      }
    }
    score += Math.min(useCaseScore, 20);
    if (useCaseScore > 10) {
      reasons.push(
        `Strong match for your ${preferences.useCases.length} use case(s)`
      );
    }

    // Data privacy
    if (preferences.dataPrivacy === "onprem") {
      if (model.provider === "Meta" || model.provider === "DeepSeek") {
        score += 12;
      } else {
        score -= 8;
      }
    }
    if (preferences.dataPrivacy === "hybrid") {
      if (model.provider === "Meta" || model.provider === "DeepSeek") {
        score += 6;
      }
    }

    // Existing stack synergy
    if (
      preferences.existingStack.includes("Google Workspace") &&
      model.provider === "Google"
    ) {
      score += 10;
      reasons.push("Native Google Workspace integration");
    }
    if (
      preferences.existingStack.includes("Microsoft 365") &&
      model.provider === "OpenAI"
    ) {
      score += 10;
      reasons.push("Deep Microsoft/Azure integration");
    }
    if (
      preferences.existingStack.includes("AWS") &&
      model.provider === "Anthropic"
    ) {
      score += 8;
      reasons.push("Available on AWS Bedrock");
    }
    if (
      preferences.existingStack.includes("GitHub") &&
      model.strengths.some((s) => s.toLowerCase().includes("coding"))
    ) {
      score += 5;
    }

    // Technical team
    if (!company.technicalTeam) {
      if (model.provider === "Meta") {
        score -= 15;
        reasons.push("Requires technical team for self-hosting");
      }
      if (["OpenAI", "Google"].includes(model.provider)) {
        score += 5;
        reasons.push("User-friendly API and no-code options available");
      }
    }

    // Multimodal bonus for document-heavy use cases
    if (
      model.multimodal &&
      preferences.useCases.some((uc) =>
        ["documents", "email", "knowledge-base"].includes(uc)
      )
    ) {
      score += 5;
    }

    // Context window bonus for document/knowledge use cases
    if (
      model.contextWindow.includes("M") &&
      preferences.useCases.some((uc) =>
        ["documents", "knowledge-base"].includes(uc)
      )
    ) {
      score += 5;
      if (!reasons.some((r) => r.includes("context"))) {
        reasons.push("Large context window for document processing");
      }
    }

    const costStr =
      cost === 0 ? "Free (self-hosted)" : `~$${cost.toLocaleString()}/mo`;

    const fitLevel: ScoredModel["fitLevel"] =
      score >= 85
        ? "perfect"
        : score >= 70
          ? "great"
          : score >= 55
            ? "good"
            : "fair";

    return {
      model,
      score: Math.max(0, Math.min(100, score)),
      reasons: reasons.slice(0, 4),
      estimatedMonthlyCost: costStr,
      fitLevel,
    };
  });

  return scored.sort((a, b) => b.score - a.score);
}

export interface IntegrationStep {
  phase: string;
  title: string;
  duration: string;
  steps: string[];
  tools: string[];
}

export function generateIntegrationPlan(
  topModels: ScoredModel[],
  company: CompanyProfile,
  preferences: IntegrationPreferences
): IntegrationStep[] {
  const primary = topModels[0]?.model;
  if (!primary) return [];

  const isCloudApi = preferences.dataPrivacy !== "onprem";
  const isSelfHosted =
    primary.provider === "Meta" || primary.provider === "DeepSeek";
  const hasTechTeam = company.technicalTeam;

  const phases: IntegrationStep[] = [];

  // Phase 1: Setup
  if (isSelfHosted) {
    phases.push({
      phase: "1",
      title: "Infrastructure Setup",
      duration: preferences.timeline === "asap" ? "1-2 weeks" : "2-4 weeks",
      steps: [
        `Provision GPU servers (minimum A100 80GB for ${primary.name})`,
        "Set up container orchestration (Docker + Kubernetes recommended)",
        `Download ${primary.name} weights from Hugging Face or Meta`,
        "Deploy using vLLM or TGI for optimized inference",
        "Configure load balancing and auto-scaling",
        "Set up monitoring (Prometheus + Grafana)",
      ],
      tools: [
        "Docker",
        "Kubernetes",
        "vLLM or TGI",
        "NVIDIA drivers + CUDA",
        "Prometheus",
        "Grafana",
      ],
    });
  } else {
    phases.push({
      phase: "1",
      title: "API Setup & Authentication",
      duration: "1-3 days",
      steps: [
        `Create a ${primary.provider} developer account`,
        "Generate API keys and set up billing",
        "Install the official SDK in your project",
        `Test a basic API call to ${primary.name}`,
        "Set up API key rotation and secrets management",
        "Configure rate limiting based on your plan",
      ],
      tools: [
        `${primary.provider} Console`,
        `Official ${primary.provider} SDK`,
        "Environment variable manager (.env)",
        hasTechTeam ? "Git for version control" : "Zapier or Make for no-code",
      ],
    });
  }

  // Phase 2: Pilot
  const pilotUseCases = preferences.useCases.slice(0, 2);
  const pilotSteps: string[] = [
    `Start with ${pilotUseCases.length > 0 ? pilotUseCases.join(" and ") : "your primary use case"}`,
    "Build prompts and test with real company data",
    "Measure quality: accuracy, relevance, tone",
    "Track latency and cost per request",
    "Gather feedback from 5-10 pilot users",
    "Iterate on prompts based on feedback",
  ];

  const pilotTools: string[] = ["Prompt playground / testing tool"];
  if (preferences.existingStack.includes("Slack")) {
    pilotSteps.push("Deploy a Slack bot for easy pilot access");
    pilotTools.push("Slack Bot SDK");
  }
  if (preferences.useCases.includes("email")) {
    pilotTools.push("Email API (Gmail API or Microsoft Graph)");
  }
  if (preferences.useCases.includes("documents")) {
    pilotTools.push("Document parser (PDF.js, Unstructured.io)");
  }
  if (preferences.useCases.includes("spreadsheets")) {
    pilotTools.push("Google Sheets API or Excel API");
  }
  if (preferences.useCases.includes("customer-support")) {
    pilotTools.push("Helpdesk integration (Zendesk, Intercom)");
  }
  if (preferences.useCases.includes("coding")) {
    pilotTools.push("IDE plugin (VS Code, JetBrains)");
  }

  phases.push({
    phase: "2",
    title: "Pilot & Prompt Engineering",
    duration:
      preferences.timeline === "asap"
        ? "1-2 weeks"
        : preferences.timeline === "1month"
          ? "2-3 weeks"
          : "3-4 weeks",
    steps: pilotSteps,
    tools: pilotTools,
  });

  // Phase 3: Integration
  const integrationSteps: string[] = [];
  const integrationTools: string[] = [];

  if (preferences.useCases.includes("email")) {
    integrationSteps.push(
      "Connect email system via API (Gmail API or Microsoft Graph)"
    );
    integrationSteps.push(
      "Build email summarization and draft generation pipeline"
    );
    integrationTools.push("Gmail API / Microsoft Graph API");
  }
  if (preferences.useCases.includes("documents")) {
    integrationSteps.push(
      "Set up document ingestion pipeline (PDF, Word, etc.)"
    );
    integrationSteps.push(
      "Implement RAG (Retrieval-Augmented Generation) for company docs"
    );
    integrationTools.push("Vector database (Pinecone, Weaviate, or Chroma)");
    integrationTools.push("Document parser (Unstructured.io)");
  }
  if (preferences.useCases.includes("customer-support")) {
    integrationSteps.push("Build chatbot with conversation memory");
    integrationSteps.push(
      "Integrate with helpdesk for ticket routing and auto-responses"
    );
    integrationTools.push("Helpdesk API (Zendesk, Intercom, Freshdesk)");
  }
  if (preferences.useCases.includes("automation")) {
    integrationSteps.push(
      "Map existing workflows and identify automation points"
    );
    integrationSteps.push(
      "Build agent pipelines with tool use and function calling"
    );
    integrationTools.push(
      hasTechTeam ? "LangChain or custom agent framework" : "Zapier / Make"
    );
  }
  if (preferences.useCases.includes("coding")) {
    integrationSteps.push(
      "Set up IDE integration for code completion and review"
    );
    integrationSteps.push("Integrate with CI/CD for automated code review");
    integrationTools.push("VS Code extension / JetBrains plugin");
    integrationTools.push("GitHub Actions / GitLab CI");
  }
  if (preferences.useCases.includes("knowledge-base")) {
    integrationSteps.push("Index company knowledge base into vector store");
    integrationSteps.push(
      "Build RAG-powered Q&A bot for internal use"
    );
    integrationTools.push("Vector database");
    integrationTools.push("Embedding model");
  }

  if (integrationSteps.length === 0) {
    integrationSteps.push("Connect AI to your primary workflow tools");
    integrationSteps.push("Build input/output pipelines for your use cases");
  }

  integrationSteps.push("Implement error handling and fallback logic");
  integrationSteps.push("Add usage logging and cost tracking");

  for (const tool of preferences.existingStack) {
    if (!integrationTools.some((t) => t.includes(tool))) {
      integrationTools.push(`${tool} API/integration`);
    }
  }

  phases.push({
    phase: "3",
    title: "Full Integration",
    duration:
      preferences.timeline === "asap"
        ? "2-4 weeks"
        : preferences.timeline === "1month"
          ? "2-3 weeks"
          : "4-8 weeks",
    steps: integrationSteps,
    tools: integrationTools.slice(0, 8),
  });

  // Phase 4: Rollout
  phases.push({
    phase: "4",
    title: "Company-Wide Rollout",
    duration: "2-4 weeks",
    steps: [
      "Create user guides and training materials",
      "Run training sessions for each department",
      `Roll out to all ${company.employeeCount || company.size} users in waves`,
      "Set up feedback channels (Slack channel, form, etc.)",
      "Monitor adoption metrics and usage patterns",
      "Address common issues and update prompts",
    ],
    tools: [
      "Training docs / Notion wiki",
      "Usage analytics dashboard",
      "Feedback form",
    ],
  });

  // Phase 5: Optimization
  phases.push({
    phase: "5",
    title: "Optimize & Scale",
    duration: "Ongoing",
    steps: [
      "Analyze cost vs. value per use case",
      "Optimize prompts for quality and token efficiency",
      "Consider prompt caching for repeated queries (up to 90% savings)",
      "Evaluate adding a secondary model for simpler tasks (save costs)",
      topModels.length > 1
        ? `Consider ${topModels[1].model.name} as a cost-effective secondary model`
        : "Explore lighter models for high-volume, simple tasks",
      "Stay updated on new model releases and pricing changes",
    ],
    tools: [
      "Cost monitoring dashboard",
      "A/B testing framework",
      "Prompt versioning system",
    ],
  });

  return phases;
}
