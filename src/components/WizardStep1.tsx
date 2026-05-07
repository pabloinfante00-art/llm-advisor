"use client";

import { CompanyProfile } from "@/lib/types";
import { industries } from "@/data/models";
import { Building2, Users, Wrench, Wallet } from "lucide-react";

interface Props {
  company: CompanyProfile;
  onChange: (company: CompanyProfile) => void;
  onNext: () => void;
}

const sizes = [
  { value: "startup", label: "Startup", desc: "1-10 employees" },
  { value: "small", label: "Small", desc: "11-50 employees" },
  { value: "medium", label: "Medium", desc: "51-200 employees" },
  { value: "large", label: "Large", desc: "201-1000 employees" },
  { value: "enterprise", label: "Enterprise", desc: "1000+ employees" },
] as const;

const budgets = [
  { value: "low", label: "Budget-friendly", desc: "< $500/mo" },
  { value: "medium", label: "Moderate", desc: "$500-$5K/mo" },
  { value: "high", label: "Significant", desc: "$5K-$50K/mo" },
  { value: "unlimited", label: "Unlimited", desc: "$50K+/mo" },
] as const;

export default function WizardStep1({ company, onChange, onNext }: Props) {
  const update = (patch: Partial<CompanyProfile>) =>
    onChange({ ...company, ...patch });

  const isValid = company.name && company.industry && company.size;

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <h2 className="mb-2 text-2xl font-bold">Tell us about your company</h2>
        <p className="text-muted">
          We&apos;ll use this to tailor our LLM recommendations to your specific
          needs.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="mb-2 flex items-center gap-2 text-sm font-medium">
            <Building2 size={16} className="text-primary" />
            Company Name
          </label>
          <input
            type="text"
            value={company.name}
            onChange={(e) => update({ name: e.target.value })}
            placeholder="Your company name"
            className="w-full rounded-lg border border-border bg-card px-4 py-3 text-foreground placeholder-muted/60 transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div>
          <label className="mb-2 flex items-center gap-2 text-sm font-medium">
            <Building2 size={16} className="text-primary" />
            Industry
          </label>
          <select
            value={company.industry}
            onChange={(e) => update({ industry: e.target.value })}
            className="w-full rounded-lg border border-border bg-card px-4 py-3 text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">Select your industry</option>
            {industries.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-3 flex items-center gap-2 text-sm font-medium">
            <Users size={16} className="text-primary" />
            Company Size
          </label>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {sizes.map((s) => (
              <button
                key={s.value}
                onClick={() =>
                  update({ size: s.value, employeeCount: s.desc })
                }
                className={`rounded-lg border p-3 text-left transition-all ${
                  company.size === s.value
                    ? "border-primary bg-primary/10 ring-1 ring-primary"
                    : "border-border bg-card hover:border-primary/40"
                }`}
              >
                <p className="text-sm font-medium">{s.label}</p>
                <p className="text-xs text-muted">{s.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-3 flex items-center gap-2 text-sm font-medium">
            <Wallet size={16} className="text-primary" />
            Monthly AI Budget
          </label>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {budgets.map((b) => (
              <button
                key={b.value}
                onClick={() => update({ budget: b.value })}
                className={`rounded-lg border p-3 text-left transition-all ${
                  company.budget === b.value
                    ? "border-primary bg-primary/10 ring-1 ring-primary"
                    : "border-border bg-card hover:border-primary/40"
                }`}
              >
                <p className="text-sm font-medium">{b.label}</p>
                <p className="text-xs text-muted">{b.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-3 flex items-center gap-2 text-sm font-medium">
            <Wrench size={16} className="text-primary" />
            Do you have a technical team?
          </label>
          <div className="flex gap-3">
            {[true, false].map((val) => (
              <button
                key={String(val)}
                onClick={() => update({ technicalTeam: val })}
                className={`flex-1 rounded-lg border p-3 transition-all ${
                  company.technicalTeam === val
                    ? "border-primary bg-primary/10 ring-1 ring-primary"
                    : "border-border bg-card hover:border-primary/40"
                }`}
              >
                <p className="text-sm font-medium">
                  {val ? "Yes, we have developers" : "No, non-technical team"}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={onNext}
        disabled={!isValid}
        className="w-full rounded-lg bg-primary px-6 py-3 font-medium text-white transition-all hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-40"
      >
        Continue to Use Cases
      </button>
    </div>
  );
}
