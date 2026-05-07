"use client";

import { IntegrationPreferences } from "@/lib/types";
import { useCases, existingTools } from "@/data/models";
import {
  Mail,
  FileText,
  Table,
  Headphones,
  Code,
  Workflow,
  BookOpen,
  Sparkles,
  Shield,
  Clock,
  Target,
  Server,
} from "lucide-react";

interface Props {
  preferences: IntegrationPreferences;
  onChange: (prefs: IntegrationPreferences) => void;
  onNext: () => void;
  onBack: () => void;
}

const iconMap: Record<string, React.ReactNode> = {
  Mail: <Mail size={20} />,
  FileText: <FileText size={20} />,
  Table: <Table size={20} />,
  Headphones: <Headphones size={20} />,
  Code: <Code size={20} />,
  Workflow: <Workflow size={20} />,
  BookOpen: <BookOpen size={20} />,
  Sparkles: <Sparkles size={20} />,
};

const priorities = [
  { value: "cost", label: "Cost Efficiency", icon: <Target size={16} /> },
  { value: "performance", label: "Best Performance", icon: <Sparkles size={16} /> },
  { value: "ease", label: "Ease of Setup", icon: <Clock size={16} /> },
  { value: "security", label: "Security & Privacy", icon: <Shield size={16} /> },
] as const;

const timelines = [
  { value: "asap", label: "ASAP" },
  { value: "1month", label: "1 Month" },
  { value: "3months", label: "3 Months" },
  { value: "6months", label: "6 Months" },
] as const;

const privacyOptions = [
  { value: "cloud", label: "Cloud API", desc: "Data sent to provider" },
  { value: "hybrid", label: "Hybrid", desc: "Mix of cloud and local" },
  { value: "onprem", label: "On-Premise", desc: "All data stays local" },
] as const;

export default function WizardStep2({
  preferences,
  onChange,
  onNext,
  onBack,
}: Props) {
  const update = (patch: Partial<IntegrationPreferences>) =>
    onChange({ ...preferences, ...patch });

  const toggleUseCase = (id: string) => {
    const current = preferences.useCases;
    update({
      useCases: current.includes(id)
        ? current.filter((c) => c !== id)
        : [...current, id],
    });
  };

  const toggleTool = (tool: string) => {
    const current = preferences.existingStack;
    update({
      existingStack: current.includes(tool)
        ? current.filter((t) => t !== tool)
        : [...current, tool],
    });
  };

  const isValid = preferences.useCases.length > 0;

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <h2 className="mb-2 text-2xl font-bold">
          What do you want to use AI for?
        </h2>
        <p className="text-muted">
          Select all use cases that apply. This helps us recommend the right
          models and integration strategy.
        </p>
      </div>

      <div>
        <label className="mb-3 text-sm font-medium">Use Cases</label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {useCases.map((uc) => (
            <button
              key={uc.id}
              onClick={() => toggleUseCase(uc.id)}
              className={`flex items-start gap-3 rounded-lg border p-4 text-left transition-all ${
                preferences.useCases.includes(uc.id)
                  ? "border-primary bg-primary/10 ring-1 ring-primary"
                  : "border-border bg-card hover:border-primary/40"
              }`}
            >
              <div
                className={`mt-0.5 ${
                  preferences.useCases.includes(uc.id)
                    ? "text-primary"
                    : "text-muted"
                }`}
              >
                {iconMap[uc.icon]}
              </div>
              <div>
                <p className="font-medium">{uc.label}</p>
                <p className="text-xs text-muted">{uc.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-3 flex items-center gap-2 text-sm font-medium">
          <Target size={16} className="text-primary" />
          Top Priority
        </label>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {priorities.map((p) => (
            <button
              key={p.value}
              onClick={() => update({ priority: p.value })}
              className={`flex items-center gap-2 rounded-lg border p-3 transition-all ${
                preferences.priority === p.value
                  ? "border-primary bg-primary/10 ring-1 ring-primary"
                  : "border-border bg-card hover:border-primary/40"
              }`}
            >
              {p.icon}
              <span className="text-sm font-medium">{p.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className="mb-3 flex items-center gap-2 text-sm font-medium">
            <Clock size={16} className="text-primary" />
            Timeline
          </label>
          <div className="grid grid-cols-2 gap-2">
            {timelines.map((t) => (
              <button
                key={t.value}
                onClick={() => update({ timeline: t.value })}
                className={`rounded-lg border p-2.5 text-sm transition-all ${
                  preferences.timeline === t.value
                    ? "border-primary bg-primary/10 ring-1 ring-primary font-medium"
                    : "border-border bg-card hover:border-primary/40"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-3 flex items-center gap-2 text-sm font-medium">
            <Server size={16} className="text-primary" />
            Data Privacy
          </label>
          <div className="space-y-2">
            {privacyOptions.map((p) => (
              <button
                key={p.value}
                onClick={() => update({ dataPrivacy: p.value })}
                className={`w-full rounded-lg border p-2.5 text-left transition-all ${
                  preferences.dataPrivacy === p.value
                    ? "border-primary bg-primary/10 ring-1 ring-primary"
                    : "border-border bg-card hover:border-primary/40"
                }`}
              >
                <span className="text-sm font-medium">{p.label}</span>
                <span className="ml-2 text-xs text-muted">{p.desc}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className="mb-3 text-sm font-medium">
          Current Tools & Stack
        </label>
        <div className="flex flex-wrap gap-2">
          {existingTools.map((tool) => (
            <button
              key={tool}
              onClick={() => toggleTool(tool)}
              className={`rounded-full border px-3 py-1.5 text-xs transition-all ${
                preferences.existingStack.includes(tool)
                  ? "border-primary bg-primary/10 text-primary-hover font-medium"
                  : "border-border bg-card text-muted hover:border-primary/40"
              }`}
            >
              {tool}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="rounded-lg border border-border px-6 py-3 font-medium transition-all hover:bg-card"
        >
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!isValid}
          className="flex-1 rounded-lg bg-primary px-6 py-3 font-medium text-white transition-all hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-40"
        >
          Get My Integration Plan
        </button>
      </div>
    </div>
  );
}
