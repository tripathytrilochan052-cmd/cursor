"use client";

import clsx from "clsx";
import type { ScoreBreakdown } from "@/lib/types";

interface ScoreRingProps {
  score: ScoreBreakdown;
}

function tone(score: number): string {
  if (score >= 80) return "text-teal";
  if (score >= 60) return "text-amber";
  return "text-coral";
}

function label(score: number): string {
  if (score >= 85) return "Strong match";
  if (score >= 70) return "Good match";
  if (score >= 55) return "Partial match";
  return "Needs work";
}

export function ScoreRing({ score }: ScoreRingProps) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score.overall / 100) * circumference;

  const rows: { key: keyof ScoreBreakdown; label: string }[] = [
    { key: "hardSkills", label: "Hard skills" },
    { key: "keywords", label: "Keywords" },
    { key: "softSkills", label: "Soft skills" },
    { key: "experienceAlignment", label: "Experience fit" },
    { key: "coverage", label: "Coverage" },
  ];

  return (
    <section className="animate-fade-up">
      <div className="flex flex-col items-center gap-8 md:flex-row md:items-start md:justify-between">
        <div className="relative flex flex-col items-center">
          <svg width="140" height="140" className="rotate-[-90deg]">
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="10"
              className="text-ink/10"
            />
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className={clsx(tone(score.overall), "transition-all duration-1000 ease-out")}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={clsx("font-display text-4xl", tone(score.overall))}>
              {score.overall}%
            </span>
            <span className="text-xs uppercase tracking-[0.16em] text-ink/50">
              ATS match
            </span>
          </div>
          <p className="mt-3 text-sm font-medium text-ink/70">{label(score.overall)}</p>
        </div>

        <div className="w-full flex-1 space-y-3">
          {rows.map((row) => (
            <div key={row.key}>
              <div className="mb-1 flex justify-between text-sm">
                <span className="text-ink/70">{row.label}</span>
                <span className="font-medium text-ink">{score[row.key]}%</span>
              </div>
              <div className="h-2 overflow-hidden bg-ink/10">
                <div
                  className="h-full bg-teal transition-all duration-700 ease-out"
                  style={{ width: `${score[row.key]}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
