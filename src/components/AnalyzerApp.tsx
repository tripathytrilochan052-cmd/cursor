"use client";

import { useState, useTransition } from "react";
import { ArrowRight, LoaderCircle, Wand2 } from "lucide-react";
import { UploadPanel } from "@/components/UploadPanel";
import { JdPanel } from "@/components/JdPanel";
import { ScoreRing } from "@/components/ScoreRing";
import { GapAnalysisPanel } from "@/components/GapAnalysisPanel";
import { RewritePanel } from "@/components/RewritePanel";
import { SAMPLE_JD, SAMPLE_RESUME } from "@/lib/demo/sample";
import type { AnalyzeResult } from "@/lib/types";

export function AnalyzerApp() {
  const [file, setFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [jdText, setJdText] = useState("");
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function loadSample() {
    setFile(null);
    setResumeText(SAMPLE_RESUME);
    setJdText(SAMPLE_JD);
    setResult(null);
    setError(null);
  }

  function analyze() {
    setError(null);
    startTransition(async () => {
      try {
        let response: Response;
        if (file) {
          const form = new FormData();
          form.append("resume", file);
          form.append("jdText", jdText);
          response = await fetch("/api/analyze", { method: "POST", body: form });
        } else {
          response = await fetch("/api/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ resumeText, jdText }),
          });
        }
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Analysis failed");
        }
        setResult(data as AnalyzeResult);
      } catch (err) {
        setResult(null);
        setError(err instanceof Error ? err.message : "Analysis failed");
      }
    });
  }

  const canAnalyze =
    Boolean(jdText.trim()) && (Boolean(file) || Boolean(resumeText.trim()));

  return (
    <div className="relative">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 pb-20 pt-10 lg:grid-cols-2 lg:gap-12 lg:px-8">
        <UploadPanel
          file={file}
          resumeText={resumeText}
          onFileChange={setFile}
          onResumeTextChange={setResumeText}
        />
        <JdPanel value={jdText} onChange={setJdText} />
      </div>

      <div className="sticky bottom-0 z-20 border-t border-ink/10 bg-mist/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-4 lg:px-8">
          <button
            type="button"
            onClick={loadSample}
            className="text-sm font-medium text-teal underline-offset-4 hover:underline"
          >
            Load sample resume + JD
          </button>
          <button
            type="button"
            disabled={!canAnalyze || pending}
            onClick={analyze}
            className="inline-flex items-center gap-2 bg-teal px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-ink disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="h-4 w-4" />
            )}
            {pending ? "Analyzing…" : "Score & optimize"}
            {!pending && <ArrowRight className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {error && (
        <div className="mx-auto max-w-6xl px-5 pb-6 lg:px-8">
          <p className="border border-coral/30 bg-coral/10 px-4 py-3 text-sm text-coral">
            {error}
          </p>
        </div>
      )}

      {result && (
        <div className="mx-auto max-w-6xl space-y-12 px-5 pb-24 lg:px-8">
          <div className="border-t border-ink/10 pt-10">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/45">
              Results
              {result.parsedMeta.resumeFilename
                ? ` · ${result.parsedMeta.resumeFilename}`
                : ""}
            </p>
            <h2 className="mt-2 font-display text-3xl text-ink md:text-4xl">
              Your alignment report
            </h2>
          </div>
          <ScoreRing score={result.score} />
          <GapAnalysisPanel gaps={result.gaps} />
          <RewritePanel rewrite={result.rewrite} />
        </div>
      )}
    </div>
  );
}
