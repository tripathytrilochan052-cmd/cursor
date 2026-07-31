export type SkillCategory = "hard" | "soft" | "tool" | "keyword";

export interface ExtractedSkill {
  name: string;
  category: SkillCategory;
  aliases?: string[];
}

export interface SkillMatch {
  skill: string;
  category: SkillCategory;
  status: "matched" | "partial" | "missing";
  resumeEvidence?: string;
  jdContext?: string;
}

export interface GapAnalysis {
  matchedHard: SkillMatch[];
  missingHard: SkillMatch[];
  matchedSoft: SkillMatch[];
  missingSoft: SkillMatch[];
  matchedKeywords: SkillMatch[];
  missingKeywords: SkillMatch[];
  strengths: string[];
  priorities: string[];
}

export interface ScoreBreakdown {
  overall: number;
  hardSkills: number;
  softSkills: number;
  keywords: number;
  experienceAlignment: number;
  coverage: number;
}

export interface RewriteSection {
  title: string;
  content: string;
  notes?: string[];
}

export interface RewriteResult {
  summary: string;
  skillsLine: string;
  experienceBullets: string[];
  fullText: string;
  changes: string[];
  warnings: string[];
  usedLlm: boolean;
}

export interface FormattedResumeRole {
  title: string;
  company: string;
  dates: string;
  bullets: string[];
}

export interface FormattedEducation {
  degree: string;
  school: string;
  dates: string;
  details: string[];
}

/** Full ATS-formatted resume generated from the original + JD. */
export interface FormattedResume {
  contactName: string;
  contactLine: string;
  targetRole: string | null;
  summary: string;
  skills: string[];
  experience: FormattedResumeRole[];
  education: FormattedEducation[];
  plainText: string;
  formatNotes: string[];
}

export interface AnalyzeResult {
  resumeText: string;
  jdText: string;
  score: ScoreBreakdown;
  gaps: GapAnalysis;
  rewrite: RewriteResult;
  formattedResume: FormattedResume;
  parsedMeta: {
    resumeChars: number;
    jdChars: number;
    resumeFilename?: string;
  };
}
