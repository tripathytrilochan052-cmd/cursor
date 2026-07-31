import { findEvidence, type DocumentSignals } from "@/lib/ats/extract";
import { normalizeToken } from "@/lib/skills/taxonomy";
import type { GapAnalysis, ScoreBreakdown, SkillMatch } from "@/lib/types";

function ratio(matched: number, total: number): number {
  if (total <= 0) return 100;
  return Math.round((matched / total) * 100);
}

function clamp(n: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, n));
}

function titleOverlap(jd: DocumentSignals, resume: DocumentSignals): number {
  if (!jd.titles.length || !resume.titles.length) {
    // Fallback: shared significant tokens in titles vs resume text
    if (!jd.titles.length) return 70;
    const resumeText = resume.rawNormalized;
    const hits = jd.titles.filter((t) =>
      normalizeToken(t)
        .split(" ")
        .filter((w) => w.length > 3)
        .some((w) => resumeText.includes(w))
    );
    return ratio(hits.length, jd.titles.length);
  }

  let best = 0;
  for (const jdTitle of jd.titles) {
    const jdTokens = new Set(
      normalizeToken(jdTitle).split(" ").filter((w) => w.length > 2)
    );
    for (const resumeTitle of resume.titles) {
      const resumeTokens = normalizeToken(resumeTitle)
        .split(" ")
        .filter((w) => w.length > 2);
      const overlap = resumeTokens.filter((t) => jdTokens.has(t)).length;
      const score = ratio(overlap, Math.max(jdTokens.size, 1));
      best = Math.max(best, score);
    }
  }
  return best;
}

function yearsAlignment(jd: DocumentSignals, resume: DocumentSignals): number {
  if (jd.yearsExperience == null) return 80;
  if (resume.yearsExperience == null) return 55;
  if (resume.yearsExperience >= jd.yearsExperience) return 100;
  const deficit = jd.yearsExperience - resume.yearsExperience;
  return clamp(100 - deficit * 12);
}

export function computeScore(
  jd: DocumentSignals,
  resume: DocumentSignals
): ScoreBreakdown {
  const hardTotal = jd.hardSkills.length;
  const hardMatched = jd.hardSkills.filter((s) =>
    resume.skills.some((r) => r.name === s.name)
  ).length;

  const softTotal = jd.softSkills.length;
  const softMatched = jd.softSkills.filter((s) =>
    resume.skills.some((r) => r.name === s.name)
  ).length;

  const keywordTotal = Math.min(jd.keywords.length, 20);
  const keywordMatched = jd.keywords.slice(0, keywordTotal).filter((k) => {
    const token = normalizeToken(k);
    if (resume.rawNormalized.includes(token)) return true;
    // Partial credit: majority of meaningful tokens appear in the resume
    const parts = token.split(/[\s/-]+/).filter((w) => w.length > 3);
    if (parts.length < 2) return false;
    const hits = parts.filter((p) => resume.rawNormalized.includes(p)).length;
    return hits / parts.length >= 0.6;
  }).length;

  const hardSkills = ratio(hardMatched, hardTotal);
  const softSkills = ratio(softMatched, softTotal);
  const keywords = ratio(keywordMatched, keywordTotal);
  const experienceAlignment = Math.round(
    titleOverlap(jd, resume) * 0.55 + yearsAlignment(jd, resume) * 0.45
  );

  const coveragePool = hardTotal + softTotal + keywordTotal;
  const coverageHits = hardMatched + softMatched + keywordMatched;
  const coverage = ratio(coverageHits, coveragePool);

  // Weighted overall — hard skills dominate ATS filters
  const overall = clamp(
    Math.round(
      hardSkills * 0.4 +
        keywords * 0.2 +
        softSkills * 0.15 +
        experienceAlignment * 0.15 +
        coverage * 0.1
    )
  );

  return {
    overall,
    hardSkills,
    softSkills,
    keywords,
    experienceAlignment,
    coverage,
  };
}

export function buildGapAnalysis(
  jd: DocumentSignals,
  resume: DocumentSignals,
  resumeText: string
): GapAnalysis {
  const toMatch = (
    skillName: string,
    category: SkillMatch["category"],
    present: boolean,
    evidence?: string
  ): SkillMatch => ({
    skill: skillName,
    category,
    status: present ? "matched" : "missing",
    resumeEvidence: evidence,
  });

  const matchedHard: SkillMatch[] = [];
  const missingHard: SkillMatch[] = [];
  for (const skill of jd.hardSkills) {
    const present = resume.skills.some((r) => r.name === skill.name);
    const item = toMatch(
      skill.name,
      "hard",
      present,
      present ? findEvidence(resumeText, skill) : undefined
    );
    (present ? matchedHard : missingHard).push(item);
  }

  const matchedSoft: SkillMatch[] = [];
  const missingSoft: SkillMatch[] = [];
  for (const skill of jd.softSkills) {
    const present = resume.skills.some((r) => r.name === skill.name);
    const item = toMatch(
      skill.name,
      "soft",
      present,
      present ? findEvidence(resumeText, skill) : undefined
    );
    (present ? matchedSoft : missingSoft).push(item);
  }

  const matchedKeywords: SkillMatch[] = [];
  const missingKeywords: SkillMatch[] = [];
  for (const keyword of jd.keywords.slice(0, 25)) {
    const token = normalizeToken(keyword);
    let present = resume.rawNormalized.includes(token);
    if (!present) {
      const parts = token.split(/[\s/-]+/).filter((w) => w.length > 3);
      if (parts.length >= 2) {
        const hits = parts.filter((p) => resume.rawNormalized.includes(p)).length;
        present = hits / parts.length >= 0.6;
      }
    }
    const item: SkillMatch = {
      skill: keyword,
      category: "keyword",
      status: present ? "matched" : "missing",
    };
    (present ? matchedKeywords : missingKeywords).push(item);
  }

  const strengths: string[] = [];
  if (matchedHard.length) {
    strengths.push(
      `Strong alignment on ${matchedHard
        .slice(0, 5)
        .map((s) => s.skill)
        .join(", ")}.`
    );
  }
  if (matchedSoft.length) {
    strengths.push(
      `Soft skills already evidenced: ${matchedSoft
        .slice(0, 4)
        .map((s) => s.skill)
        .join(", ")}.`
    );
  }
  if (!strengths.length) {
    strengths.push(
      "Limited direct skill overlap — prioritize keyword reframing of existing experience."
    );
  }

  const priorities: string[] = [];
  if (missingHard.length) {
    priorities.push(
      `Surface or map existing work to: ${missingHard
        .slice(0, 6)
        .map((s) => s.skill)
        .join(", ")}. Do not invent experience you lack.`
    );
  }
  if (missingKeywords.length) {
    priorities.push(
      `Weave JD phrasing into true bullets where accurate: ${missingKeywords
        .slice(0, 6)
        .map((s) => s.skill)
        .join(", ")}.`
    );
  }
  if (missingSoft.length) {
    priorities.push(
      `Demonstrate soft skills with concrete outcomes rather than listing them: ${missingSoft
        .slice(0, 4)
        .map((s) => s.skill)
        .join(", ")}.`
    );
  }
  if (!priorities.length) {
    priorities.push(
      "Coverage is strong — tighten phrasing to mirror JD terminology and quantify impact."
    );
  }

  return {
    matchedHard,
    missingHard,
    matchedSoft,
    missingSoft,
    matchedKeywords,
    missingKeywords,
    strengths,
    priorities,
  };
}
