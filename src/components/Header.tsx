"use client";

import { Brain, ArrowLeft } from "lucide-react";

interface HeaderProps {
  showBack?: boolean;
  onBack?: () => void;
}

export default function Header({ showBack, onBack }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-3">
          {showBack && (
            <button
              onClick={onBack}
              className="mr-2 rounded-lg p-2 text-muted transition-colors hover:bg-card hover:text-foreground"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/20">
            <Brain size={20} className="text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">LLM Advisor</h1>
            <p className="text-xs text-muted">AI Integration Guide for Companies</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted">
          <span className="flex h-2 w-2 rounded-full bg-success" />
          Live data
        </div>
      </div>
    </header>
  );
}
