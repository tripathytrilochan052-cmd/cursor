import type { DocumentSignals } from "@/lib/ats/extract";
import type { GapAnalysis, RewriteResult } from "@/lib/types";
import { normalizeToken } from "@/lib/skills/taxonomy";

const ACTION_VERBS = [
  "Led",
  "Built",
  "Designed",
  "Delivered",
  "Owned",
  "Improved",
  "Implemented",
  "Collaborated",
  "Optimized",
  "Launched",
  "Analyzed",
  "Automated",
  "Scaled",
  "Supported",
  "Developed",
];

function splitBullets(resumeText: string): string[] {
  const lines = resumeText
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean);

  const bullets = lines.filter(
    (l) =>
      /^[-•*●]/.test(l) ||
      /^\d+\./.test(l) ||
      /^(led|built|designed|developed|managed|created|implemented|improved|owned|delivered|collaborated|analyzed|optimized|launched|reduced|increased|automated|supported|drove)/i.test(
        l
      )
  );

  if (bullets.length >= 3) {
    return bullets.map((b) => b.replace(/^[-•*●]\s*/, "").replace(/^\d+\.\s*/, ""));
  }

  // Fallback: longer lines that look like accomplishments
  return lines
    .filter((l) => l.length > 40 && l.length < 280)
    .slice(0, 12);
}

function extractContactHeader(resumeText: string): string {
  const firstLines = resumeText.split(/\n+/).map((l) => l.trim()).filter(Boolean).slice(0, 4);
  return firstLines.join(" | ");
}

function detectSummary(resumeText: string): string | null {
  const match = resumeText.match(
    /(?:^|\n)\s*(?:summary|profile|about|objective)\s*[:\n]\s*([\s\S]{40,700}?)(?=\n\s*(?:experience|work experience|professional experience|skills|technical skills|education|work history)\b|\n{2,})/i
  );
  return match?.[1]?.replace(/\s+/g, " ").trim() ?? null;
}

function jdVocabulary(jd: DocumentSignals): string[] {
  return [
    ...jd.hardSkills.map((s) => s.name),
    ...jd.softSkills.map((s) => s.name),
    ...jd.keywords.slice(0, 12),
  ];
}

/**
 * Only inject a JD term into a bullet when the resume already contains an alias/token
 * that justifies the synonym swap — never invent new claims.
 */
function alignBulletToJd(bullet: string, jdTerms: string[], resumeNorm: string): {
  text: string;
  changed: boolean;
  note?: string;
} {
  let text = bullet.replace(/^[-•*●]\s*/, "").trim();
  let changed = false;
  let note: string | undefined;

  // Ensure action-oriented start without inventing content
  if (!/^[A-Z]/.test(text)) {
    text = text.charAt(0).toUpperCase() + text.slice(1);
  }

  for (const term of jdTerms) {
    const normTerm = normalizeToken(term);
    if (!normTerm || normalizeToken(text).includes(normTerm)) continue;

    // Synonym-style: if resume has related evidence elsewhere and bullet is topical
    const termTokens = normTerm.split(" ").filter(Boolean);
    const topical = termTokens.some(
      (t) => t.length > 3 && normalizeToken(text).includes(t)
    );
    if (!topical) continue;
    if (!resumeNorm.includes(normTerm) && !termTokens.every((t) => resumeNorm.includes(t))) {
      continue;
    }

    // Append parenthetical skill emphasis only when already evidenced in resume
    if (resumeNorm.includes(normTerm) && text.length < 200) {
      text = `${text.replace(/\.$/, "")} (${term}).`;
      changed = true;
      note = `Emphasized existing ${term} alignment`;
      break;
    }
  }

  // Soft rewrite: prefer strong verbs already implied
  const lower = text.toLowerCase();
  if (lower.startsWith("responsible for ")) {
    const rest = text.slice("responsible for ".length);
    const verb = ACTION_VERBS[rest.length % ACTION_VERBS.length];
    text = `${verb} ${rest}`;
    changed = true;
    note = note ?? "Converted duty phrasing to impact verb";
  }

  return { text, changed, note };
}

function buildSkillsLine(
  resume: DocumentSignals,
  jd: DocumentSignals
): string {
  const matched = jd.hardSkills
    .filter((s) => resume.skills.some((r) => r.name === s.name))
    .map((s) => s.name);
  const other = resume.hardSkills
    .map((s) => s.name)
    .filter((n) => !matched.includes(n));
  const ordered = [...matched, ...other].slice(0, 18);
  return ordered.join(" · ");
}

function buildSummary(
  existing: string | null,
  resume: DocumentSignals,
  jd: DocumentSignals,
  gaps: GapAnalysis
): string {
  const roleHint =
    jd.titles[0] ??
    (jd.hardSkills[0] ? `${jd.hardSkills[0].name} professional` : "professional");

  const matched = gaps.matchedHard.slice(0, 4).map((s) => s.skill);
  const years =
    resume.yearsExperience != null
      ? `${resume.yearsExperience}+ years of experience`
      : "proven experience";

  if (existing) {
    // Keep original claims; lightly append missing matched skills once at the end
    const missingMentioned = matched.filter(
      (skill) =>
        !normalizeToken(existing).includes(normalizeToken(skill)) &&
        resume.skills.some((s) => s.name === skill)
    );
    if (!missingMentioned.length) return existing;
    return `${existing.replace(/\.$/, "")}. Additional strengths include ${missingMentioned
      .slice(0, 4)
      .join(", ")}.`;
  }

  const skillClause = matched.length
    ? `with hands-on strength in ${matched.join(", ")}`
    : "focused on delivering measurable outcomes";

  return `${roleHint} with ${years} ${skillClause}. Skilled at translating requirements into shipped work while collaborating across teams.`.replace(
    /\s+/g,
    " "
  );
}

export function rewriteResume(options: {
  resumeText: string;
  jdText: string;
  resume: DocumentSignals;
  jd: DocumentSignals;
  gaps: GapAnalysis;
}): RewriteResult {
  const { resumeText, resume, jd, gaps } = options;
  const warnings: string[] = [];
  const changes: string[] = [];

  const header = extractContactHeader(resumeText);
  const existingSummary = detectSummary(resumeText);
  const summary = buildSummary(existingSummary, resume, jd, gaps);
  if (existingSummary && summary !== existingSummary) {
    changes.push("Refined professional summary using only skills evidenced on the resume.");
  } else if (!existingSummary) {
    changes.push("Generated a concise summary from detected resume skills (no new employers or titles invented).");
  }

  const skillsLine = buildSkillsLine(resume, jd);
  if (skillsLine) {
    changes.push("Reordered skills to lead with JD-matched hard skills.");
  }

  const jdTerms = jdVocabulary(jd);
  const bullets = splitBullets(resumeText);
  const experienceBullets: string[] = [];

  if (!bullets.length) {
    warnings.push(
      "Could not detect clear accomplishment bullets. Paste a clearer resume for richer rewrites."
    );
  }

  for (const bullet of bullets.slice(0, 10)) {
    const aligned = alignBulletToJd(bullet, jdTerms, resume.rawNormalized);
    experienceBullets.push(aligned.text);
    if (aligned.changed && aligned.note) changes.push(aligned.note);
  }

  // Missing hard skills: warn only — never fabricate
  if (gaps.missingHard.length) {
    warnings.push(
      `Not added (not evidenced on resume): ${gaps.missingHard
        .slice(0, 8)
        .map((s) => s.skill)
        .join(", ")}. Gain or demonstrate these before listing them.`
    );
  }

  const fullText = [
    header,
    "",
    "PROFESSIONAL SUMMARY",
    summary,
    "",
    "CORE SKILLS",
    skillsLine || "See experience section for demonstrated skills.",
    "",
    "EXPERIENCE HIGHLIGHTS (ATS-optimized phrasing)",
    ...experienceBullets.map((b) => `• ${b}`),
    "",
    "NOTES",
    "- Content above only reframes skills and accomplishments found in your original resume.",
    "- Missing JD requirements were not invented.",
  ].join("\n");

  return {
    summary,
    skillsLine,
    experienceBullets,
    fullText,
    changes: Array.from(new Set(changes)).slice(0, 12),
    warnings,
    usedLlm: false,
  };
}

/** Optional LLM polish — only rephrases provided text; still no new facts. */
export async function polishRewriteWithLlm(
  base: RewriteResult,
  resumeText: string,
  jdText: string
): Promise<RewriteResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return base;

  try {
    const OpenAI = (await import("openai")).default;
    const client = new OpenAI({ apiKey });
    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content: `You rewrite resumes for ATS alignment. STRICT RULES:
1) Use ONLY facts, employers, titles, dates, skills, and achievements present in the original resume.
2) Never invent experience, metrics, tools, or credentials.
3) You may reorder skills, mirror JD terminology when truthful, and strengthen action verbs.
4) If a JD skill is missing from the resume, omit it and mention it under warnings.
5) Return JSON with keys: summary (string), skillsLine (string), experienceBullets (string[]), changes (string[]), warnings (string[]).`,
        },
        {
          role: "user",
          content: JSON.stringify({
            jobDescription: jdText.slice(0, 6000),
            originalResume: resumeText.slice(0, 10000),
            draftRewrite: {
              summary: base.summary,
              skillsLine: base.skillsLine,
              experienceBullets: base.experienceBullets,
              warnings: base.warnings,
            },
          }),
        },
      ],
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) return base;
    const parsed = JSON.parse(raw) as Partial<RewriteResult>;

    const summary = parsed.summary ?? base.summary;
    const skillsLine = parsed.skillsLine ?? base.skillsLine;
    const experienceBullets =
      parsed.experienceBullets?.length ? parsed.experienceBullets : base.experienceBullets;
    const changes = [
      ...(parsed.changes ?? base.changes),
      "Polished wording with LLM under no-hallucination constraints.",
    ];
    const warnings = parsed.warnings ?? base.warnings;

    const header = resumeText.split(/\n+/).map((l) => l.trim()).filter(Boolean).slice(0, 3).join(" | ");
    const fullText = [
      header,
      "",
      "PROFESSIONAL SUMMARY",
      summary,
      "",
      "CORE SKILLS",
      skillsLine,
      "",
      "EXPERIENCE HIGHLIGHTS (ATS-optimized phrasing)",
      ...experienceBullets.map((b) => `• ${b}`),
      "",
      "NOTES",
      "- LLM polish applied with strict no-new-facts rules.",
    ].join("\n");

    return {
      summary,
      skillsLine,
      experienceBullets,
      fullText,
      changes: Array.from(new Set(changes)).slice(0, 14),
      warnings,
      usedLlm: true,
    };
  } catch {
    return {
      ...base,
      warnings: [
        ...base.warnings,
        "LLM polish unavailable — returned deterministic rewrite instead.",
      ],
    };
  }
}
