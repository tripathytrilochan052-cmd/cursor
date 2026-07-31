"use client";

import clsx from "clsx";
import type { GapAnalysis, SkillMatch } from "@/lib/types";

interface GapAnalysisPanelProps {
  gaps: GapAnalysis;
}

function Chip({ item }: { item: SkillMatch }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center px-2.5 py-1 text-xs font-medium",
        item.status === "matched"
          ? "bg-teal/15 text-teal-ink"
          : "bg-coral/12 text-coral"
      )}
      title={item.resumeEvidence}
    >
      {item.skill}
    </span>
  );
}

function Group({
  title,
  items,
  empty,
}: {
  title: string;
  items: SkillMatch[];
  empty: string;
}) {
  return (
    <div>
      <h4 className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-ink/50">
        {title}
      </h4>
      {items.length ? (
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <Chip key={`${title}-${item.skill}`} item={item} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-ink/45">{empty}</p>
      )}
    </div>
  );
}

export function GapAnalysisPanel({ gaps }: GapAnalysisPanelProps) {
  return (
    <section className="animate-fade-up space-y-6 delay-100">
      <div>
        <h3 className="font-display text-2xl text-ink">Gap analysis</h3>
        <p className="mt-1 text-sm text-ink/65">
          Missing items are opportunities to rephrase true experience — not invent it.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Group
          title="Matched hard skills"
          items={gaps.matchedHard}
          empty="No hard-skill overlaps detected."
        />
        <Group
          title="Missing hard skills"
          items={gaps.missingHard}
          empty="No hard-skill gaps — strong technical coverage."
        />
        <Group
          title="Matched soft skills"
          items={gaps.matchedSoft}
          empty="No soft-skill overlaps detected."
        />
        <Group
          title="Missing soft skills"
          items={gaps.missingSoft}
          empty="Soft-skill coverage looks complete."
        />
        <Group
          title="Matched keywords"
          items={gaps.matchedKeywords}
          empty="No extra keyword overlaps."
        />
        <Group
          title="Missing keywords"
          items={gaps.missingKeywords}
          empty="Keyword coverage looks complete."
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="border-l-2 border-teal pl-4">
          <h4 className="text-sm font-semibold text-ink">Strengths</h4>
          <ul className="mt-2 space-y-2 text-sm text-ink/70">
            {gaps.strengths.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
        <div className="border-l-2 border-amber pl-4">
          <h4 className="text-sm font-semibold text-ink">Priorities</h4>
          <ul className="mt-2 space-y-2 text-sm text-ink/70">
            {gaps.priorities.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
