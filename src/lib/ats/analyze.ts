import { extractSignals } from "@/lib/ats/extract";
import { generateFormattedResume } from "@/lib/ats/generate-resume";
import { rewriteResume, polishRewriteWithLlm } from "@/lib/ats/rewrite";
import { buildGapAnalysis, computeScore } from "@/lib/ats/score";
import { cleanDocumentText } from "@/lib/parse/documents";
import type { AnalyzeResult } from "@/lib/types";

export async function analyzeDocuments(options: {
  resumeText: string;
  jdText: string;
  resumeFilename?: string;
  useLlm?: boolean;
}): Promise<AnalyzeResult> {
  const resumeText = cleanDocumentText(options.resumeText);
  const jdText = cleanDocumentText(options.jdText);

  if (resumeText.length < 40) {
    throw new Error("Resume text is too short to analyze. Upload a fuller resume.");
  }
  if (jdText.length < 40) {
    throw new Error("Job description is too short. Paste a more complete JD.");
  }

  const resume = extractSignals(resumeText);
  const jd = extractSignals(jdText);
  const score = computeScore(jd, resume);
  const gaps = buildGapAnalysis(jd, resume, resumeText);

  let rewrite = rewriteResume({
    resumeText,
    jdText,
    resume,
    jd,
    gaps,
  });

  if (options.useLlm !== false) {
    rewrite = await polishRewriteWithLlm(rewrite, resumeText, jdText);
  }

  const formattedResume = generateFormattedResume({
    resumeText,
    resume,
    jd,
    gaps,
  });

  // Merge polished rewrite skills ordering when available; keep structured summary if richer
  if (rewrite.skillsLine) {
    formattedResume.skills = rewrite.skillsLine
      .split("·")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  if (
    rewrite.summary &&
    rewrite.summary.length > formattedResume.summary.length * 0.6
  ) {
    formattedResume.summary = rewrite.summary;
  }

  formattedResume.plainText = renderPlainText(formattedResume);

  return {
    resumeText,
    jdText,
    score,
    gaps,
    rewrite,
    formattedResume,
    parsedMeta: {
      resumeChars: resumeText.length,
      jdChars: jdText.length,
      resumeFilename: options.resumeFilename,
    },
  };
}

function renderPlainText(resume: AnalyzeResult["formattedResume"]): string {
  const lines: string[] = [resume.contactName.toUpperCase()];
  if (resume.contactLine) lines.push(resume.contactLine);
  if (resume.targetRole) lines.push(`Target role: ${resume.targetRole}`);
  lines.push("", "PROFESSIONAL SUMMARY", resume.summary, "");
  lines.push("CORE SKILLS", resume.skills.join(" · "), "");
  lines.push("PROFESSIONAL EXPERIENCE");
  for (const role of resume.experience) {
    lines.push("");
    const header =
      role.title && role.company
        ? `${role.title} — ${role.company}${role.dates ? ` | ${role.dates}` : ""}`
        : [role.title, role.company, role.dates].filter(Boolean).join(" | ");
    lines.push(header);
    for (const b of role.bullets) lines.push(`• ${b}`);
  }
  if (resume.education.length) {
    lines.push("", "EDUCATION");
    for (const edu of resume.education) {
      lines.push([edu.degree, edu.school, edu.dates].filter(Boolean).join(" — "));
      for (const d of edu.details) lines.push(`• ${d}`);
    }
  }
  return `${lines.join("\n").trim()}\n`;
}
