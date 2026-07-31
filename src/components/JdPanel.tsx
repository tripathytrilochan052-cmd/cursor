"use client";

interface JdPanelProps {
  value: string;
  onChange: (value: string) => void;
}

export function JdPanel({ value, onChange }: JdPanelProps) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="font-display text-2xl tracking-tight text-ink">
          Job description
        </h2>
        <p className="mt-1 text-sm text-ink/65">
          Paste the full JD — requirements, nice-to-haves, and responsibilities.
        </p>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste the job description here…"
        rows={16}
        className="w-full resize-y border border-ink/15 bg-white/70 px-4 py-3 text-sm leading-relaxed text-ink outline-none transition focus:border-teal focus:ring-2 focus:ring-teal/20"
      />
    </section>
  );
}
