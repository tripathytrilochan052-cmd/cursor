"use client";

import { Check, Copy, Download, FileText } from "lucide-react";
import { useState } from "react";
import {
  downloadResumeDocx,
  downloadResumeText,
} from "@/lib/download/resume-export";
import type { FormattedResume } from "@/lib/types";

interface GeneratedResumePanelProps {
  resume: FormattedResume;
}

export function GeneratedResumePanel({ resume }: GeneratedResumePanelProps) {
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState<"docx" | null>(null);

  async function copyAll() {
    await navigator.clipboard.writeText(resume.plainText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  async function onDocx() {
    setBusy("docx");
    try {
      await downloadResumeDocx(resume);
    } catch (err) {
      alert(err instanceof Error ? err.message : "DOCX download failed.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="animate-fade-up space-y-5 delay-200">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-2xl text-ink">
            Generated ATS resume
          </h3>
          <p className="mt-1 text-sm text-ink/65">
            Full resume in standard ATS format, tailored to this JD from your
            existing experience only.
            {resume.targetRole ? ` · Target: ${resume.targetRole}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={copyAll}
            className="inline-flex items-center gap-2 border border-ink/15 bg-white/80 px-3 py-2 text-sm font-medium text-ink transition hover:bg-white"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied" : "Copy text"}
          </button>
          <button
            type="button"
            onClick={() => downloadResumeText(resume)}
            className="inline-flex items-center gap-2 border border-ink/15 bg-white/80 px-3 py-2 text-sm font-medium text-ink transition hover:bg-white"
          >
            <FileText className="h-4 w-4" />
            .txt
          </button>
          <button
            type="button"
            onClick={onDocx}
            disabled={busy === "docx"}
            className="inline-flex items-center gap-2 bg-ink px-3 py-2 text-sm font-medium text-mist transition hover:bg-ink/90 disabled:opacity-60"
          >
            <Download className="h-4 w-4" />
            {busy === "docx" ? "Preparing…" : "Download .docx"}
          </button>
        </div>
      </div>

      <article className="border border-ink/10 bg-white px-6 py-8 shadow-sm sm:px-10">
        <header className="border-b border-ink/15 pb-4 text-center">
          <h4 className="font-display text-2xl tracking-wide text-ink">
            {resume.contactName.toUpperCase()}
          </h4>
          {resume.contactLine && (
            <p className="mt-2 text-sm text-ink/65">{resume.contactLine}</p>
          )}
          {resume.targetRole && (
            <p className="mt-1 text-sm italic text-teal">
              Target role: {resume.targetRole}
            </p>
          )}
        </header>

        <div className="mt-6 space-y-6">
          <section>
            <h5 className="border-b border-ink/20 pb-1 text-xs font-bold uppercase tracking-[0.16em] text-ink">
              Professional summary
            </h5>
            <p className="mt-3 text-sm leading-relaxed text-ink">
              {resume.summary}
            </p>
          </section>

          <section>
            <h5 className="border-b border-ink/20 pb-1 text-xs font-bold uppercase tracking-[0.16em] text-ink">
              Core skills
            </h5>
            <p className="mt-3 text-sm leading-relaxed text-ink">
              {resume.skills.join(" · ")}
            </p>
          </section>

          <section>
            <h5 className="border-b border-ink/20 pb-1 text-xs font-bold uppercase tracking-[0.16em] text-ink">
              Professional experience
            </h5>
            <div className="mt-3 space-y-5">
              {resume.experience.map((role) => (
                <div key={`${role.title}-${role.company}-${role.dates}`}>
                  <p className="text-sm font-semibold text-ink">
                    {role.title}
                    {role.company ? ` — ${role.company}` : ""}
                    {role.dates ? (
                      <span className="font-normal text-ink/55">
                        {" "}
                        | {role.dates}
                      </span>
                    ) : null}
                  </p>
                  <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-ink">
                    {role.bullets.map((b) => (
                      <li key={b} className="flex gap-2">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              {!resume.experience.length && (
                <p className="text-sm text-ink/50">
                  Could not detect structured roles — download still includes
                  available content.
                </p>
              )}
            </div>
          </section>

          {resume.education.length > 0 && (
            <section>
              <h5 className="border-b border-ink/20 pb-1 text-xs font-bold uppercase tracking-[0.16em] text-ink">
                Education
              </h5>
              <ul className="mt-3 space-y-2 text-sm text-ink">
                {resume.education.map((edu) => (
                  <li key={`${edu.degree}-${edu.school}`}>
                    {[edu.degree, edu.school, edu.dates]
                      .filter(Boolean)
                      .join(" — ")}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </article>

      <ul className="space-y-1 text-xs text-ink/55">
        {resume.formatNotes.map((note) => (
          <li key={note}>• {note}</li>
        ))}
      </ul>
    </section>
  );
}
