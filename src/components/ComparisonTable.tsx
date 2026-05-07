"use client";

import { LLMModel } from "@/lib/types";
import { Check, X, Eye, Lightbulb } from "lucide-react";

export default function ComparisonTable({ models }: { models: LLMModel[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-card">
            <th className="px-4 py-3 text-left font-medium text-muted">
              Model
            </th>
            <th className="px-4 py-3 text-left font-medium text-muted">
              Provider
            </th>
            <th className="px-4 py-3 text-left font-medium text-muted">
              Context
            </th>
            <th className="px-4 py-3 text-left font-medium text-muted">
              Input
            </th>
            <th className="px-4 py-3 text-left font-medium text-muted">
              Output
            </th>
            <th className="px-4 py-3 text-center font-medium text-muted">
              <Eye size={14} className="mx-auto" />
            </th>
            <th className="px-4 py-3 text-center font-medium text-muted">
              <Lightbulb size={14} className="mx-auto" />
            </th>
            <th className="px-4 py-3 text-left font-medium text-muted">
              Tier
            </th>
          </tr>
        </thead>
        <tbody>
          {models.map((m, i) => (
            <tr
              key={m.id}
              className={`border-b border-border/50 transition-colors hover:bg-card-hover ${
                i % 2 === 0 ? "bg-background" : "bg-card/30"
              }`}
            >
              <td className="px-4 py-3 font-medium">{m.name}</td>
              <td className="px-4 py-3 text-muted">{m.provider}</td>
              <td className="px-4 py-3">{m.contextWindow}</td>
              <td className="px-4 py-3 font-mono text-xs">{m.inputPrice}</td>
              <td className="px-4 py-3 font-mono text-xs">{m.outputPrice}</td>
              <td className="px-4 py-3 text-center">
                {m.multimodal ? (
                  <Check size={16} className="mx-auto text-success" />
                ) : (
                  <X size={16} className="mx-auto text-danger" />
                )}
              </td>
              <td className="px-4 py-3 text-center">
                {m.reasoning ? (
                  <Check size={16} className="mx-auto text-success" />
                ) : (
                  <X size={16} className="mx-auto text-danger" />
                )}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    m.tier === "flagship"
                      ? "bg-amber-500/15 text-amber-400"
                      : m.tier === "mid"
                        ? "bg-blue-500/15 text-blue-400"
                        : "bg-green-500/15 text-green-400"
                  }`}
                >
                  {m.tier}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
