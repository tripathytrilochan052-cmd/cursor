"use client";

import { Check, Copy, Sparkles } from "lucide-react";
import { useState } from "react";
import type { RewriteResult } from "@/lib/types";

interface RewritePanelProps {
  rewrite: RewriteResult;
}

export function RewritePanel({ rewrite }: RewritePanelProps) {
  const [copied, setCopied] = useState(false);

  async function copyAll() {
    await navigator.clipboard.writeText(rewrite.fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <section className="animate-fade-up space-y-5 delay-200">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-2xl text-ink">ATS-optimized rewrite</h3>
          <p className="mt-1 text-sm text-ink/65">
            Tailored to this JD using only facts already on your resume.
            {rewrite.usedLlm ? " · LLM polish applied" : " · Deterministic rewrite"}
          </p>
        </div>
        <button
          type="button"
          onClick={copyAll}
          className="inline-flex items-center gap-2 bg-ink px-4 py-2 text-sm font-medium text-mist transition hover:bg-ink/90"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied" : "Copy rewrite"}
        </button>
      </div>

      <div className="space-y-4 bg-white/75 p-5">
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/50">
            Summary
          </h4>
          <p className="mt-2 text-sm leading-relaxed text-ink">{rewrite.summary}</p>
        </div>
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/50">
            Core skills
          </h4>
          <p className="mt-2 text-sm leading-relaxed text-ink">{rewrite.skillsLine}</p>
        </div>
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/50">
            Experience highlights
          </h4>
          <ul className="mt-2 space-y-2 text-sm leading-relaxed text-ink">
            {rewrite.experienceBullets.map((b) => (
              <li key={b} className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {rewrite.changes.length > 0 && (
        <div className="flex gap-3 text-sm text-ink/70">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-teal" />
          <ul className="space-y-1">
            {rewrite.changes.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
      )}

      {rewrite.warnings.length > 0 && (
        <div className="border border-coral/30 bg-coral/8 px-4 py-3 text-sm text-coral">
          <p className="font-semibold">Honesty guardrails</p>
          <ul className="mt-1 space-y-1">
            {rewrite.warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
