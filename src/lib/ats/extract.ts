import {
  ALIAS_INDEX,
  extractPhraseKeywords,
  normalizeToken,
  SKILL_TAXONOMY,
} from "@/lib/skills/taxonomy";
import type { ExtractedSkill, SkillCategory } from "@/lib/types";

export interface DocumentSignals {
  skills: ExtractedSkill[];
  hardSkills: ExtractedSkill[];
  softSkills: ExtractedSkill[];
  keywords: string[];
  yearsExperience: number | null;
  titles: string[];
  rawNormalized: string;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function containsSkill(text: string, skill: ExtractedSkill): boolean {
  const candidates = [skill.name, ...(skill.aliases ?? [])];
  for (const candidate of candidates) {
    const token = normalizeToken(candidate);
    if (!token) continue;
    // Word-boundary-ish match; allow . # + / in tokens
    const pattern = new RegExp(
      `(^|[^a-z0-9])${escapeRegExp(token)}([^a-z0-9]|$)`,
      "i"
    );
    if (pattern.test(text)) return true;
  }
  return false;
}

function extractYears(text: string): number | null {
  const matches = [
    ...text.matchAll(/(\d+)\+?\s*\+?\s*years?(?:\s+of)?\s+experience/gi),
    ...text.matchAll(/experience\s*(?:of|:)?\s*(\d+)\+?\s*years?/gi),
  ];
  if (!matches.length) return null;
  return Math.max(...matches.map((m) => Number(m[1])).filter(Boolean));
}

function extractTitles(text: string): string[] {
  const titlePatterns = [
    /(?:title|role|position)\s*[:\-]\s*([^\n,]{3,60})/gi,
    /\b((?:senior|staff|principal|lead|junior|associate)?\s?(?:software|product|data|ml|ai|hr|people|marketing|sales|full[\s-]?stack|front[\s-]?end|back[\s-]?end)\s?(?:engineer|developer|manager|scientist|analyst|designer|recruiter|partner)?)\b/gi,
  ];
  const titles = new Set<string>();
  for (const pattern of titlePatterns) {
    for (const match of text.matchAll(pattern)) {
      const value = match[1]?.trim();
      if (value && value.length > 3) titles.add(value.replace(/\s+/g, " "));
    }
  }
  return Array.from(titles).slice(0, 8);
}

export function extractSignals(text: string): DocumentSignals {
  const rawNormalized = normalizeToken(text);
  const skills: ExtractedSkill[] = [];
  const seen = new Set<string>();

  for (const skill of SKILL_TAXONOMY) {
    if (containsSkill(rawNormalized, skill) && !seen.has(skill.name)) {
      seen.add(skill.name);
      skills.push(skill);
    }
  }

  // Catch taxonomy aliases that appear as standalone tokens via index
  for (const [alias, skill] of ALIAS_INDEX) {
    if (seen.has(skill.name)) continue;
    const pattern = new RegExp(
      `(^|[^a-z0-9])${escapeRegExp(alias)}([^a-z0-9]|$)`,
      "i"
    );
    if (pattern.test(rawNormalized)) {
      seen.add(skill.name);
      skills.push(skill);
    }
  }

  const hardSkills = skills.filter((s) => s.category === "hard" || s.category === "tool");
  const softSkills = skills.filter((s) => s.category === "soft");

  const taxonomyNames = new Set(skills.map((s) => normalizeToken(s.name)));
  const keywords = extractPhraseKeywords(text)
    .filter((k) => !taxonomyNames.has(normalizeToken(k)))
    .filter((k) => !ALIAS_INDEX.has(normalizeToken(k)));

  return {
    skills,
    hardSkills,
    softSkills,
    keywords,
    yearsExperience: extractYears(text),
    titles: extractTitles(text),
    rawNormalized,
  };
}

export function findEvidence(resumeText: string, skill: ExtractedSkill): string | undefined {
  const lines = resumeText.split(/\n+/).map((l) => l.trim()).filter(Boolean);
  for (const line of lines) {
    if (containsSkill(normalizeToken(line), skill)) {
      return line.length > 160 ? `${line.slice(0, 157)}...` : line;
    }
  }
  return undefined;
}

export function skillPresent(signals: DocumentSignals, name: string): boolean {
  const key = normalizeToken(name);
  return signals.skills.some(
    (s) =>
      normalizeToken(s.name) === key ||
      (s.aliases ?? []).some((a) => normalizeToken(a) === key)
  );
}

export function categorizeKeyword(keyword: string): SkillCategory {
  const hit = ALIAS_INDEX.get(normalizeToken(keyword));
  return hit?.category ?? "keyword";
}
