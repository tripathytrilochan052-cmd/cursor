# AlignCV

AI-assisted ATS resume matcher: upload a resume (PDF/DOCX), paste a job description, get a match score, gap analysis, and an honest ATS-optimized rewrite.

## Features

1. **Document parsing** — PDF (`pdf-parse`) and DOCX (`mammoth`), plus paste-to-text.
2. **ATS match score (0–100%)** — Weighted hard skills, keywords, soft skills, experience alignment, and coverage.
3. **Gap analysis** — Matched vs missing hard/soft skills and JD keywords, with priorities.
4. **ATS rewrite** — Reorders skills and reframes bullets using only evidenced resume content. Missing JD skills are listed as warnings, never invented.
5. **Generated ATS resume** — Full single-column resume (Contact → Summary → Skills → Experience → Education) tailored to the JD, with copy / `.txt` / `.docx` download.
6. **Optional LLM polish** — If `OPENAI_API_KEY` is set, wording is polished under the same no-hallucination rules.

## Quick start

```bash
git checkout cursor/ats-resume-matcher-c06c
git pull
npm install
npm run dev:clean
```

Open [http://localhost:3000](http://localhost:3000). Use **Load sample resume + JD** to try without uploading.

### Optional OpenAI polish

```bash
cp .env.example .env.local
# set OPENAI_API_KEY=sk-...
npm run dev
```

Without a key, the deterministic rewrite engine still runs end-to-end.

## Troubleshooting

**`Cannot find module './NNN.js'` or webpack `reading 'call'`**

Stale `.next` cache. Always restart clean:

```bash
rm -rf .next
npm run dev
```

(`npm run dev` now clears `.next` automatically.)


**Score & optimize stays disabled after inputs work**

You need *both* a resume (file or pasted text) *and* a JD in the right-hand box. The sticky bar shows what’s missing.

**`.doc` uploads fail**

Save as `.docx` or PDF, or paste resume text.

## API

`POST /api/analyze`

- `multipart/form-data`: `resume` (file), `jdText` (string), optional `resumeText`
- or JSON: `{ "resumeText": "...", "jdText": "..." }`

Returns score breakdown, gap analysis, and rewrite payload.

## Stack

Next.js 15 · TypeScript · Tailwind CSS · mammoth · pdf-parse · OpenAI (optional)
