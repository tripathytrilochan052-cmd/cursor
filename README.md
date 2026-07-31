# AlignCV

AI-assisted ATS resume matcher: upload a resume (PDF/DOCX), paste a job description, get a match score, gap analysis, and an honest ATS-optimized rewrite.

## Features

1. **Document parsing** — PDF (`pdf-parse`) and DOCX (`mammoth`), plus paste-to-text.
2. **ATS match score (0–100%)** — Weighted hard skills, keywords, soft skills, experience alignment, and coverage.
3. **Gap analysis** — Matched vs missing hard/soft skills and JD keywords, with priorities.
4. **ATS rewrite** — Reorders skills and reframes bullets using only evidenced resume content. Missing JD skills are listed as warnings, never invented.
5. **Optional LLM polish** — If `OPENAI_API_KEY` is set, wording is polished under the same no-hallucination rules.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Use **Load sample resume + JD** to try without uploading.

### Optional OpenAI polish

```bash
export OPENAI_API_KEY=sk-...
# optional
export OPENAI_MODEL=gpt-4o-mini
npm run dev
```

Without a key, the deterministic rewrite engine still runs end-to-end.

## API

`POST /api/analyze`

- `multipart/form-data`: `resume` (file), `jdText` (string), optional `resumeText`
- or JSON: `{ "resumeText": "...", "jdText": "..." }`

Returns score breakdown, gap analysis, and rewrite payload.

## Stack

Next.js 15 · TypeScript · Tailwind CSS · mammoth · pdf-parse · OpenAI (optional)
