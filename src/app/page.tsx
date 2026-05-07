"use client";

import { useState, useEffect } from "react";
import {
  LLMModel,
  CompanyProfile,
  IntegrationPreferences,
} from "@/lib/types";
import Header from "@/components/Header";
import ModelCard from "@/components/ModelCard";
import ComparisonTable from "@/components/ComparisonTable";
import WizardStep1 from "@/components/WizardStep1";
import WizardStep2 from "@/components/WizardStep2";
import Recommendation from "@/components/Recommendation";
import IntegrationChat from "@/components/IntegrationChat";
import {
  ArrowRight,
  LayoutGrid,
  Table,
  Filter,
  Sparkles,
  RefreshCw,
} from "lucide-react";

type View = "landing" | "wizard-1" | "wizard-2" | "results" | "chat";
type ViewMode = "cards" | "table";

const defaultCompany: CompanyProfile = {
  name: "",
  industry: "",
  size: "small",
  employeeCount: "",
  currentTools: [],
  budget: "medium",
  technicalTeam: true,
};

const defaultPreferences: IntegrationPreferences = {
  useCases: [],
  priority: "performance",
  timeline: "1month",
  dataPrivacy: "cloud",
  existingStack: [],
};

const stepLabels = ["Company", "Use Cases", "Recommendations", "AI Advisor"];

export default function Home() {
  const [view, setView] = useState<View>("landing");
  const [models, setModels] = useState<LLMModel[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("cards");
  const [filterTier, setFilterTier] = useState<string>("all");
  const [filterProvider, setFilterProvider] = useState<string>("all");
  const [company, setCompany] = useState<CompanyProfile>(defaultCompany);
  const [preferences, setPreferences] =
    useState<IntegrationPreferences>(defaultPreferences);

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/models");
      const data = await res.json();
      setModels(data.models);
      setLastUpdated(data.lastUpdated);
    } catch {
      // fallback handled by empty state
    } finally {
      setLoading(false);
    }
  };

  const filteredModels = models.filter((m) => {
    if (filterTier !== "all" && m.tier !== filterTier) return false;
    if (filterProvider !== "all" && m.provider !== filterProvider) return false;
    return true;
  });

  const providers = [...new Set(models.map((m) => m.provider))];

  const currentStep =
    view === "wizard-1"
      ? 1
      : view === "wizard-2"
        ? 2
        : view === "results"
          ? 3
          : view === "chat"
            ? 4
            : 0;

  const ProgressBar = () => (
    <div className="mb-8">
      <div className="mb-2 flex gap-2">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              s <= currentStep ? "bg-primary" : "bg-border"
            }`}
          />
        ))}
      </div>
      <div className="flex justify-between text-xs text-muted">
        {stepLabels.map((label, i) => (
          <span
            key={label}
            className={i + 1 <= currentStep ? "text-primary font-medium" : ""}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );

  if (view === "wizard-1") {
    return (
      <div className="flex min-h-screen flex-col">
        <Header showBack onBack={() => setView("landing")} />
        <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-8">
          <ProgressBar />
          <WizardStep1
            company={company}
            onChange={setCompany}
            onNext={() => setView("wizard-2")}
          />
        </main>
      </div>
    );
  }

  if (view === "wizard-2") {
    return (
      <div className="flex min-h-screen flex-col">
        <Header showBack onBack={() => setView("wizard-1")} />
        <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-8">
          <ProgressBar />
          <WizardStep2
            preferences={preferences}
            onChange={setPreferences}
            onNext={() => setView("results")}
            onBack={() => setView("wizard-1")}
          />
        </main>
      </div>
    );
  }

  if (view === "results") {
    return (
      <div className="flex min-h-screen flex-col">
        <Header showBack onBack={() => setView("wizard-2")} />
        <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">
          <ProgressBar />
          <Recommendation
            models={models}
            company={company}
            preferences={preferences}
            onStartChat={() => setView("chat")}
            onBack={() => setView("wizard-2")}
          />
        </main>
      </div>
    );
  }

  if (view === "chat") {
    return (
      <div className="flex min-h-screen flex-col">
        <Header showBack onBack={() => setView("results")} />
        <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-6">
          <ProgressBar />
          <IntegrationChat
            company={company}
            preferences={preferences}
            onBack={() => setView("results")}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
          <div className="relative mx-auto max-w-7xl px-6 py-20 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary-hover">
              <Sparkles size={14} />
              Compare. Choose. Integrate.
            </div>
            <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Find the Perfect LLM
              <br />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                for Your Company
              </span>
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-muted">
              Compare the latest AI models side-by-side, get personalized
              recommendations, and follow a step-by-step guide to fully
              integrate AI into your business.
            </p>
            <button
              onClick={() => setView("wizard-1")}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-primary-hover hover:shadow-lg hover:shadow-primary/25"
            >
              Get Your Integration Plan
              <ArrowRight size={20} />
            </button>
          </div>
        </section>

        {/* Models Section */}
        <section className="mx-auto max-w-7xl px-6 py-12">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold">LLM Landscape — May 2026</h2>
              <p className="text-sm text-muted">
                {lastUpdated &&
                  `Data verified ${new Date(lastUpdated).toLocaleDateString()}`}
                {" · "}
                {models.length} models tracked across{" "}
                {providers.length} providers
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchModels}
                className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs text-muted transition-colors hover:bg-card hover:text-foreground"
              >
                <RefreshCw size={12} />
                Refresh
              </button>

              <div className="flex items-center gap-1.5">
                <Filter size={14} className="text-muted" />
                <select
                  value={filterProvider}
                  onChange={(e) => setFilterProvider(e.target.value)}
                  className="rounded-lg border border-border bg-card px-3 py-2 text-xs text-foreground"
                >
                  <option value="all">All Providers</option>
                  {providers.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                <select
                  value={filterTier}
                  onChange={(e) => setFilterTier(e.target.value)}
                  className="rounded-lg border border-border bg-card px-3 py-2 text-xs text-foreground"
                >
                  <option value="all">All Tiers</option>
                  <option value="flagship">Flagship</option>
                  <option value="mid">Mid</option>
                  <option value="budget">Budget</option>
                </select>
              </div>

              <div className="flex rounded-lg border border-border">
                <button
                  onClick={() => setViewMode("cards")}
                  className={`rounded-l-lg p-2 transition-colors ${
                    viewMode === "cards"
                      ? "bg-primary/20 text-primary"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  <LayoutGrid size={16} />
                </button>
                <button
                  onClick={() => setViewMode("table")}
                  className={`rounded-r-lg p-2 transition-colors ${
                    viewMode === "table"
                      ? "bg-primary/20 text-primary"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  <Table size={16} />
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="shimmer h-72 rounded-xl border border-border bg-card"
                />
              ))}
            </div>
          ) : viewMode === "cards" ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredModels.map((model) => (
                <ModelCard key={model.id} model={model} />
              ))}
            </div>
          ) : (
            <ComparisonTable models={filteredModels} />
          )}

          {!loading && filteredModels.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-muted">
                No models match your filters. Try adjusting them.
              </p>
            </div>
          )}
        </section>

        {/* CTA */}
        <section className="border-t border-border">
          <div className="mx-auto max-w-7xl px-6 py-16 text-center">
            <h2 className="mb-3 text-2xl font-bold">
              Ready to integrate AI into your company?
            </h2>
            <p className="mb-6 text-muted">
              Answer a few questions and get a personalized recommendation with
              a step-by-step integration plan — no API key needed.
            </p>
            <button
              onClick={() => setView("wizard-1")}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 font-semibold text-white transition-all hover:bg-primary-hover hover:shadow-lg hover:shadow-primary/25"
            >
              Get Your Integration Plan
              <ArrowRight size={20} />
            </button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-6 text-center text-xs text-muted">
        LLM Advisor · Built to help companies adopt AI · Data verified May 2026
      </footer>
    </div>
  );
}
