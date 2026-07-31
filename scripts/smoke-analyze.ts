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
      },
      null,
      2
    )
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
