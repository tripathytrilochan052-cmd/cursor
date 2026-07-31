"use client";

import clsx from "clsx";
import { Upload, FileText, X } from "lucide-react";
import { useCallback, useId, useState } from "react";

interface UploadPanelProps {
  file: File | null;
  resumeText: string;
  onFileChange: (file: File | null) => void;
  onResumeTextChange: (text: string) => void;
}

export function UploadPanel({
  file,
  resumeText,
  onFileChange,
  onResumeTextChange,
}: UploadPanelProps) {
  const inputId = useId();
  const [dragOver, setDragOver] = useState(false);

  const acceptFile = useCallback(
    (next: File | null) => {
      if (!next) {
        onFileChange(null);
        return;
      }
      const lower = next.name.toLowerCase();
      if (!lower.endsWith(".pdf") && !lower.endsWith(".docx")) {
        alert("Please upload a PDF or DOCX file.");
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

      <label
        htmlFor={inputId}
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
          "group flex cursor-pointer flex-col items-center justify-center gap-3 border border-dashed px-6 py-10 transition duration-300",
          dragOver
            ? "border-teal bg-teal/10 scale-[1.01]"
            : "border-ink/20 bg-white/50 hover:border-teal/60 hover:bg-white/80"
        )}
      >
        <Upload className="h-8 w-8 text-teal transition group-hover:-translate-y-0.5" />
        <div className="text-center">
          <p className="font-medium text-ink">Drop resume here</p>
          <p className="mt-1 text-sm text-ink/55">PDF or DOCX · max 8MB</p>
        </div>
        <input
          id={inputId}
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="sr-only"
          onChange={(e) => acceptFile(e.target.files?.[0] ?? null)}
        />
      </label>

      {file && (
        <div className="flex items-center justify-between gap-3 bg-white/70 px-4 py-3 text-sm animate-fade-up">
          <div className="flex items-center gap-2 text-ink">
            <FileText className="h-4 w-4 text-teal" />
            <span className="truncate font-medium">{file.name}</span>
            <span className="text-ink/45">
              ({Math.max(1, Math.round(file.size / 1024))} KB)
            </span>
          </div>
          <button
            type="button"
            aria-label="Remove file"
            className="rounded p-1 text-ink/50 hover:bg-ink/5 hover:text-ink"
            onClick={() => onFileChange(null)}
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
            if (e.target.value.trim()) onFileChange(null);
          }}
          placeholder="Paste resume content if you prefer not to upload a file…"
          rows={8}
          className="w-full resize-y border border-ink/15 bg-white/70 px-4 py-3 text-sm leading-relaxed text-ink outline-none transition focus:border-teal focus:ring-2 focus:ring-teal/20"
        />
      </div>
    </section>
  );
}
