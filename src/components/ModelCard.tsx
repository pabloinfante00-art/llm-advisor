"use client";

import { LLMModel } from "@/lib/types";
import {
  Zap,
  Brain,
  DollarSign,
  Eye,
  Lightbulb,
  ExternalLink,
} from "lucide-react";

const providerColors: Record<string, string> = {
  OpenAI: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  Anthropic: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  Google: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  Meta: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  Mistral: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  xAI: "bg-red-500/15 text-red-400 border-red-500/30",
};

const tierBadge: Record<string, string> = {
  flagship: "bg-amber-500/15 text-amber-400",
  mid: "bg-blue-500/15 text-blue-400",
  budget: "bg-green-500/15 text-green-400",
};

export default function ModelCard({ model }: { model: LLMModel }) {
  return (
    <div className="group relative rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:border-primary/40 hover:bg-card-hover hover:shadow-lg hover:shadow-primary/5">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span
              className={`rounded-md border px-2 py-0.5 text-xs font-medium ${providerColors[model.provider] || "bg-zinc-500/15 text-zinc-400 border-zinc-500/30"}`}
            >
              {model.provider}
            </span>
            <span
              className={`rounded-md px-2 py-0.5 text-xs font-medium ${tierBadge[model.tier]}`}
            >
              {model.tier}
            </span>
          </div>
          <h3 className="text-lg font-semibold">{model.name}</h3>
        </div>
        <div className="flex gap-1.5">
          {model.multimodal && (
            <span title="Multimodal">
              <Eye size={16} className="text-accent" />
            </span>
          )}
          {model.reasoning && (
            <span title="Reasoning">
              <Lightbulb size={16} className="text-warning" />
            </span>
          )}
        </div>
      </div>

      <p className="mb-4 text-sm leading-relaxed text-muted">
        {model.description}
      </p>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-background/60 px-3 py-2">
          <div className="flex items-center gap-1.5 text-xs text-muted">
            <Zap size={12} />
            Context
          </div>
          <p className="mt-0.5 text-sm font-medium">{model.contextWindow}</p>
        </div>
        <div className="rounded-lg bg-background/60 px-3 py-2">
          <div className="flex items-center gap-1.5 text-xs text-muted">
            <DollarSign size={12} />
            Input Price
          </div>
          <p className="mt-0.5 text-sm font-medium">{model.inputPrice}</p>
        </div>
        <div className="rounded-lg bg-background/60 px-3 py-2">
          <div className="flex items-center gap-1.5 text-xs text-muted">
            <DollarSign size={12} />
            Output Price
          </div>
          <p className="mt-0.5 text-sm font-medium">{model.outputPrice}</p>
        </div>
        <div className="rounded-lg bg-background/60 px-3 py-2">
          <div className="flex items-center gap-1.5 text-xs text-muted">
            <Brain size={12} />
            Released
          </div>
          <p className="mt-0.5 text-sm font-medium">{model.releaseDate}</p>
        </div>
      </div>

      <div className="mb-3">
        <p className="mb-1.5 text-xs font-medium text-muted">Strengths</p>
        <div className="flex flex-wrap gap-1.5">
          {model.strengths.map((s) => (
            <span
              key={s}
              className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs text-primary-hover"
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-xs font-medium text-muted">Best for</p>
        <div className="flex flex-wrap gap-1.5">
          {model.bestFor.map((b) => (
            <span
              key={b}
              className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs text-accent"
            >
              {b}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
