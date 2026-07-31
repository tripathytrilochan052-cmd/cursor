"use client";

import clsx from "clsx";
import { Upload, FileText, X } from "lucide-react";
import { useCallback, useId, useRef, useState } from "react";

interface UploadPanelProps {
  file: File | null;
  resumeText: string;
  onFileChange: (file: File | null) => void;
  onResumeTextChange: (text: string) => void;
}

function isSupportedResume(file: File): boolean {
  const lower = file.name.toLowerCase();
  if (lower.endsWith(".pdf") || lower.endsWith(".docx")) return true;
  if (file.type === "application/pdf") return true;
  if (
    file.type ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return true;
  }
  return false;
}

export function UploadPanel({
  file,
  resumeText,
  onFileChange,
  onResumeTextChange,
}: UploadPanelProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const acceptFile = useCallback(
    (next: File | null) => {
      setUploadError(null);
      if (!next) {
        onFileChange(null);
        return;
      }

      const lower = next.name.toLowerCase();
      if (lower.endsWith(".doc") && !lower.endsWith(".docx")) {
        setUploadError(
          "Old .doc files aren’t supported. Save as .docx or PDF, or paste the resume text below."
        );
        onFileChange(null);
        return;
      }

      if (!isSupportedResume(next)) {
        setUploadError("Please upload a PDF or DOCX file.");
        onFileChange(null);
        return;
      }

      if (next.size > 8 * 1024 * 1024) {
        setUploadError("Resume file must be under 8MB.");
        onFileChange(null);
        return;
      }

      onFileChange(next);
      onResumeTextChange("");
    },
    [onFileChange, onResumeTextChange]
  );

  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl tracking-tight text-ink">
            Resume
          </h2>
          <p className="mt-1 text-sm text-ink/65">
            Upload PDF/DOCX or paste text. We parse cleanly before scoring.
          </p>
        </div>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const dropped = e.dataTransfer.files?.[0] ?? null;
          acceptFile(dropped);
        }}
        className={clsx(
          "flex flex-col items-center justify-center gap-3 border border-dashed px-6 py-10 transition duration-300",
          dragOver
            ? "border-teal bg-teal/10 scale-[1.01]"
            : file
              ? "border-teal/50 bg-teal/5"
              : "border-ink/20 bg-white/50"
        )}
      >
        <Upload className="h-8 w-8 text-teal" />
        <div className="text-center">
          <p className="font-medium text-ink">
            {file ? "Resume file ready" : "Drop resume here"}
          </p>
          <p className="mt-1 text-sm text-ink/55">PDF or DOCX · max 8MB</p>
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-ink/90"
        >
          {file ? "Choose a different file" : "Choose PDF or DOCX"}
        </button>
        <input
          id={inputId}
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="sr-only"
          onChange={(e) => {
            acceptFile(e.target.files?.[0] ?? null);
            // Allow selecting the same file again later
            e.target.value = "";
          }}
        />
      </div>

      {uploadError && (
        <p className="border border-coral/30 bg-coral/10 px-3 py-2 text-sm text-coral">
          {uploadError}
        </p>
      )}

      {file && (
        <div className="flex items-center justify-between gap-3 border border-teal/30 bg-white/80 px-4 py-3 text-sm animate-fade-up">
          <div className="flex min-w-0 items-center gap-2 text-ink">
            <FileText className="h-4 w-4 shrink-0 text-teal" />
            <span className="truncate font-medium">{file.name}</span>
            <span className="shrink-0 text-ink/45">
              ({Math.max(1, Math.round(file.size / 1024))} KB)
            </span>
          </div>
          <button
            type="button"
            aria-label="Remove file"
            className="rounded p-1 text-ink/50 hover:bg-ink/5 hover:text-ink"
            onClick={() => {
              onFileChange(null);
              setUploadError(null);
            }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-ink/50">
          Or paste resume text
        </label>
        <textarea
          value={resumeText}
          onChange={(e) => {
            onResumeTextChange(e.target.value);
            if (e.target.value.trim()) {
              onFileChange(null);
              setUploadError(null);
            }
          }}
          placeholder="Paste resume content if you prefer not to upload a file…"
          rows={8}
          className="w-full resize-y border border-ink/15 bg-white/70 px-4 py-3 text-sm leading-relaxed text-ink outline-none transition focus:border-teal focus:ring-2 focus:ring-teal/20"
        />
      </div>
    </section>
  );
}
