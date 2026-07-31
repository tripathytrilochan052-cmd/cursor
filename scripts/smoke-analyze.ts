import { analyzeDocuments } from "../src/lib/ats/analyze";
import { SAMPLE_JD, SAMPLE_RESUME } from "../src/lib/demo/sample";

async function main() {
  const r = await analyzeDocuments({
    resumeText: SAMPLE_RESUME,
    jdText: SAMPLE_JD,
    useLlm: false,
  });
  console.log(
    JSON.stringify(
      {
        score: r.score,
        missingHard: r.gaps.missingHard.map((s) => s.skill),
        matchedHard: r.gaps.matchedHard.map((s) => s.skill),
        missingSoft: r.gaps.missingSoft.map((s) => s.skill),
        bulletCount: r.rewrite.experienceBullets.length,
        warningCount: r.rewrite.warnings.length,
        formatted: {
          name: r.formattedResume.contactName,
          targetRole: r.formattedResume.targetRole,
          skills: r.formattedResume.skills.slice(0, 8),
          roles: r.formattedResume.experience.map((e) => ({
            title: e.title,
            company: e.company,
            bullets: e.bullets.length,
          })),
          education: r.formattedResume.education.length,
          plainTextChars: r.formattedResume.plainText.length,
        },
      },
      null,
      2
    )
  );
  console.log("\n--- FORMATTED PREVIEW (first 800 chars) ---\n");
  console.log(r.formattedResume.plainText.slice(0, 800));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
