import { extractSignals } from "@/lib/ats/extract";
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

  return {
    resumeText,
    jdText,
    score,
    gaps,
    rewrite,
    parsedMeta: {
      resumeChars: resumeText.length,
      jdChars: jdText.length,
      resumeFilename: options.resumeFilename,
    },
  };
}
