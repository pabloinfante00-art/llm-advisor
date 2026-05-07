"use client";

import { LLMModel, CompanyProfile, IntegrationPreferences } from "@/lib/types";
import { recommendModels, IntegrationStep, generateIntegrationPlan } from "@/lib/recommend";
import {
  Trophy,
  Medal,
  DollarSign,
  CheckCircle,
  ChevronRight,
  Zap,
  Shield,
  Clock,
  Target,
  Star,
  ArrowRight,
  Wrench,
} from "lucide-react";

interface Props {
  models: LLMModel[];
  company: CompanyProfile;
  preferences: IntegrationPreferences;
  onStartChat: () => void;
  onBack: () => void;
}

const fitColors = {
  perfect: "text-emerald-400 bg-emerald-500/15 border-emerald-500/30",
  great: "text-blue-400 bg-blue-500/15 border-blue-500/30",
  good: "text-amber-400 bg-amber-500/15 border-amber-500/30",
  fair: "text-zinc-400 bg-zinc-500/15 border-zinc-500/30",
};

const fitLabels = {
  perfect: "Perfect Fit",
  great: "Great Fit",
  good: "Good Fit",
  fair: "Fair Fit",
};

const priorityIcons: Record<string, React.ReactNode> = {
  cost: <DollarSign size={14} />,
  performance: <Zap size={14} />,
  ease: <Clock size={14} />,
  security: <Shield size={14} />,
};

export default function Recommendation({
  models,
  company,
  preferences,
  onStartChat,
  onBack,
}: Props) {
  const scored = recommendModels(models, company, preferences);
  const top3 = scored.slice(0, 3);
  const rest = scored.slice(3);
  const plan = generateIntegrationPlan(top3, company, preferences);

  return (
    <div className="animate-fade-in space-y-10">
      {/* Header */}
      <div>
        <h2 className="mb-2 text-2xl font-bold">
          Your Personalized Recommendations
        </h2>
        <p className="text-muted">
          Based on {company.name}&apos;s profile — {company.industry},{" "}
          {company.size}, {preferences.useCases.length} use cases, priority:{" "}
          {preferences.priority}
        </p>
      </div>

      {/* Top 3 Picks */}
      <div className="space-y-4">
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          <Trophy size={20} className="text-amber-400" />
          Top Picks for You
        </h3>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {top3.map((item, i) => (
            <div
              key={item.model.id}
              className={`relative rounded-xl border p-5 transition-all ${
                i === 0
                  ? "border-primary/50 bg-primary/5 ring-1 ring-primary/30"
                  : "border-border bg-card"
              }`}
            >
              {i === 0 && (
                <div className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">
                  <Star size={16} />
                </div>
              )}

              <div className="mb-3 flex items-start justify-between">
                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-xs font-bold text-muted">
                      #{i + 1}
                    </span>
                    <span
                      className={`rounded-md border px-2 py-0.5 text-xs font-medium ${fitColors[item.fitLevel]}`}
                    >
                      {fitLabels[item.fitLevel]}
                    </span>
                  </div>
                  <h4 className="text-lg font-semibold">{item.model.name}</h4>
                  <p className="text-xs text-muted">{item.model.provider}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">
                    {item.score}
                  </div>
                  <p className="text-xs text-muted">/ 100</p>
                </div>
              </div>

              <p className="mb-3 text-sm text-muted">
                {item.model.description}
              </p>

              <div className="mb-3 rounded-lg bg-background/60 px-3 py-2">
                <div className="flex items-center gap-1.5 text-xs text-muted">
                  <DollarSign size={12} />
                  Estimated Monthly Cost
                </div>
                <p className="mt-0.5 text-sm font-semibold">
                  {item.estimatedMonthlyCost}
                </p>
              </div>

              <div className="mb-3 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg bg-background/60 px-2 py-1.5">
                  <span className="text-muted">Input:</span>{" "}
                  <span className="font-medium">{item.model.inputPrice}</span>
                </div>
                <div className="rounded-lg bg-background/60 px-2 py-1.5">
                  <span className="text-muted">Output:</span>{" "}
                  <span className="font-medium">{item.model.outputPrice}</span>
                </div>
                <div className="rounded-lg bg-background/60 px-2 py-1.5">
                  <span className="text-muted">Context:</span>{" "}
                  <span className="font-medium">
                    {item.model.contextWindow}
                  </span>
                </div>
                <div className="rounded-lg bg-background/60 px-2 py-1.5">
                  <span className="text-muted">Tier:</span>{" "}
                  <span className="font-medium capitalize">
                    {item.model.tier}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                {item.reasons.map((reason, j) => (
                  <div
                    key={j}
                    className="flex items-start gap-2 text-xs"
                  >
                    <CheckCircle
                      size={14}
                      className="mt-0.5 shrink-0 text-success"
                    />
                    <span>{reason}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Other models */}
      {rest.length > 0 && (
        <div>
          <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold">
            <Medal size={20} className="text-muted" />
            Other Options
          </h3>
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-card">
                  <th className="px-4 py-2.5 text-left font-medium text-muted">
                    Model
                  </th>
                  <th className="px-4 py-2.5 text-left font-medium text-muted">
                    Score
                  </th>
                  <th className="px-4 py-2.5 text-left font-medium text-muted">
                    Est. Cost
                  </th>
                  <th className="px-4 py-2.5 text-left font-medium text-muted">
                    Fit
                  </th>
                  <th className="px-4 py-2.5 text-left font-medium text-muted hidden sm:table-cell">
                    Key Reason
                  </th>
                </tr>
              </thead>
              <tbody>
                {rest.map((item) => (
                  <tr
                    key={item.model.id}
                    className="border-b border-border/50 hover:bg-card-hover transition-colors"
                  >
                    <td className="px-4 py-2.5">
                      <span className="font-medium">{item.model.name}</span>
                      <span className="ml-1.5 text-xs text-muted">
                        {item.model.provider}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 font-mono">{item.score}</td>
                    <td className="px-4 py-2.5 text-xs">
                      {item.estimatedMonthlyCost}
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`rounded-md border px-2 py-0.5 text-xs font-medium ${fitColors[item.fitLevel]}`}
                      >
                        {fitLabels[item.fitLevel]}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-muted hidden sm:table-cell">
                      {item.reasons[0] || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Integration Plan */}
      <div>
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <Wrench size={20} className="text-primary" />
          Step-by-Step Integration Plan
        </h3>
        <p className="mb-6 text-sm text-muted">
          A tailored roadmap to integrate {top3[0]?.model.name} into{" "}
          {company.name}. Based on your {preferences.timeline} timeline.
        </p>

        <div className="space-y-6">
          {plan.map((phase, i) => (
            <PhaseCard key={i} phase={phase} isLast={i === plan.length - 1} />
          ))}
        </div>
      </div>

      {/* CTA to Chat */}
      <div className="rounded-xl border border-primary/30 bg-primary/5 p-6 text-center">
        <h3 className="mb-2 text-xl font-bold">
          Want a Personalized Deep Dive?
        </h3>
        <p className="mb-4 text-sm text-muted">
          Chat with an AI advisor to customize this plan, ask questions about
          specific integrations, get code examples, and troubleshoot your setup.
        </p>
        <div className="flex justify-center gap-3">
          <button
            onClick={onBack}
            className="rounded-lg border border-border px-6 py-3 font-medium transition-all hover:bg-card"
          >
            Edit Preferences
          </button>
          <button
            onClick={onStartChat}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3 font-medium text-white transition-all hover:bg-primary-hover"
          >
            Chat with AI Advisor
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

function PhaseCard({
  phase,
  isLast,
}: {
  phase: IntegrationStep;
  isLast: boolean;
}) {
  return (
    <div className="relative">
      {!isLast && (
        <div className="absolute left-5 top-12 h-[calc(100%)] w-px bg-border" />
      )}
      <div className="flex gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
          {phase.phase}
        </div>
        <div className="flex-1 pb-6">
          <div className="mb-1 flex items-center gap-3">
            <h4 className="text-base font-semibold">{phase.title}</h4>
            <span className="flex items-center gap-1 rounded-full bg-card border border-border px-2.5 py-0.5 text-xs text-muted">
              <Clock size={10} />
              {phase.duration}
            </span>
          </div>

          <div className="mb-3 space-y-1.5">
            {phase.steps.map((step, j) => (
              <div key={j} className="flex items-start gap-2 text-sm">
                <ChevronRight
                  size={14}
                  className="mt-0.5 shrink-0 text-primary"
                />
                <span className="text-foreground/80">{step}</span>
              </div>
            ))}
          </div>

          {phase.tools.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {phase.tools.map((tool) => (
                <span
                  key={tool}
                  className="rounded-full border border-border bg-card px-2.5 py-0.5 text-xs text-muted"
                >
                  {tool}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
