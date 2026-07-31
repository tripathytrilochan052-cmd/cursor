import type { DocumentSignals } from "@/lib/ats/extract";
import {
  parseStructuredResume,
  type ExperienceRole,
  type StructuredResume,
} from "@/lib/ats/parse-structure";
import { normalizeToken } from "@/lib/skills/taxonomy";
import type { FormattedResume, GapAnalysis } from "@/lib/types";

function scoreBullet(bullet: string, jd: DocumentSignals): number {
  const norm = normalizeToken(bullet);
  let score = 0;
  for (const skill of jd.hardSkills) {
    const names = [skill.name, ...(skill.aliases ?? [])];
    for (const name of names) {
      if (norm.includes(normalizeToken(name))) score += 3;
    }
  }
  for (const skill of jd.softSkills) {
    if (norm.includes(normalizeToken(skill.name))) score += 1.5;
  }
  for (const kw of jd.keywords.slice(0, 20)) {
    const token = normalizeToken(kw);
    if (token && norm.includes(token)) score += 1;
  }
  // Prefer quantified bullets
  if (/\d+%|\d+k|\d+\+|\$\d+/i.test(bullet)) score += 0.5;
  return score;
}

function alignBulletWording(
  bullet: string,
  jdTerms: string[],
  resumeNorm: string
): string {
  let text = bullet.replace(/^[-•*●]\s*/, "").trim();
  if (!text) return text;
  if (!/^[A-Z]/.test(text)) text = text.charAt(0).toUpperCase() + text.slice(1);

  if (text.toLowerCase().startsWith("responsible for ")) {
    text = `Owned ${text.slice("responsible for ".length)}`;
  }

  for (const term of jdTerms) {
    const normTerm = normalizeToken(term);
    if (!normTerm || normalizeToken(text).includes(normTerm)) continue;
    const parts = normTerm.split(" ").filter((t) => t.length > 3);
    const topical = parts.some((t) => normalizeToken(text).includes(t));
    if (!topical) continue;
    if (!resumeNorm.includes(normTerm)) continue;
    if (text.length < 220) {
      text = `${text.replace(/\.$/, "")}; applied ${term}.`;
      break;
    }
  }
  return text;
}

function orderSkills(
  structured: StructuredResume,
  resume: DocumentSignals,
  jd: DocumentSignals
): string[] {
  const fromResume = structured.skills.length
    ? structured.skills
    : resume.hardSkills.map((s) => s.name);

  const matched: string[] = [];
  const rest: string[] = [];
  const jdHard = new Set(jd.hardSkills.map((s) => normalizeToken(s.name)));

  for (const skill of fromResume) {
    if (jdHard.has(normalizeToken(skill))) matched.push(skill);
    else rest.push(skill);
  }

  // Add taxonomy matches present on resume but missing from skills list
  for (const skill of jd.hardSkills) {
    if (
      resume.skills.some((r) => r.name === skill.name) &&
      !matched.some((m) => normalizeToken(m) === normalizeToken(skill.name)) &&
      !rest.some((m) => normalizeToken(m) === normalizeToken(skill.name))
    ) {
      matched.push(skill.name);
    }
  }

  return [...matched, ...rest].slice(0, 20);
}

function buildTargetedSummary(
  structured: StructuredResume,
  resume: DocumentSignals,
  jd: DocumentSignals,
  gaps: GapAnalysis
): string {
  const matched = gaps.matchedHard.slice(0, 5).map((s) => s.skill);
  const role =
    jd.titles[0] ??
    structured.experience[0]?.title ??
    "Professional";
  const years =
    resume.yearsExperience != null
      ? `${resume.yearsExperience}+ years of experience`
      : structured.experience.length
        ? "hands-on experience"
        : "proven experience";

  if (structured.summary) {
    let summary = structured.summary;
    const missingMentioned = matched.filter(
      (skill) => !normalizeToken(summary).includes(normalizeToken(skill))
    );
    if (missingMentioned.length) {
      summary = `${summary.replace(/\.$/, "")}. Additional strengths include ${missingMentioned
        .slice(0, 4)
        .join(", ")}.`;
    }
    return summary.replace(/\s+/g, " ").trim();
  }

  const skillsClause = matched.length
    ? `with demonstrated strength in ${matched.join(", ")}`
    : "focused on delivering measurable outcomes";

  return `${role} with ${years} ${skillsClause}. Proven collaborator who ships reliable work aligned to product and stakeholder goals.`;
}

function formatContactBlock(structured: StructuredResume): string[] {
  const { contact } = structured;
  const lines = [contact.name.toUpperCase()];
  const meta = [
    contact.email,
    contact.phone,
    contact.location,
    ...contact.links,
  ].filter(Boolean) as string[];
  if (meta.length) lines.push(meta.join(" | "));
  else if (contact.rawHeader.length > 1) {
    lines.push(contact.rawHeader.slice(1).join(" | "));
  }
  return lines;
}

function formatRole(role: ExperienceRole): string[] {
  const headerParts = [role.title, role.company, role.dates].filter(Boolean);
  const header =
    role.title && role.company
      ? `${role.title} — ${role.company}${role.dates ? ` | ${role.dates}` : ""}`
      : headerParts.join(" | ") || role.rawHeader;

  return [header, ...role.bullets.map((b) => `• ${b}`)];
}

/**
 * Generate a full ATS-formatted resume tailored to the JD,
 * using only facts present in the original resume.
 */
export function generateFormattedResume(options: {
  resumeText: string;
  resume: DocumentSignals;
  jd: DocumentSignals;
  gaps: GapAnalysis;
}): FormattedResume {
  const { resumeText, resume, jd, gaps } = options;
  const structured = parseStructuredResume(resumeText);
  const jdTerms = [
    ...jd.hardSkills.map((s) => s.name),
    ...jd.softSkills.map((s) => s.name),
    ...jd.keywords.slice(0, 10),
  ];

  const summary = buildTargetedSummary(structured, resume, jd, gaps);
  const skills = orderSkills(structured, resume, jd);

  const experience = structured.experience.map((role) => {
    const ranked = [...role.bullets]
      .map((b) => ({
        original: b,
        text: alignBulletWording(b, jdTerms, resume.rawNormalized),
        score: scoreBullet(b, jd),
      }))
      .sort((a, b) => b.score - a.score);

    return {
      title: role.title,
      company: role.company,
      dates: role.dates,
      bullets: ranked.map((r) => r.text),
    };
  });

  // Prefer roles with more JD-relevant bullets first (stable if tied)
  const experienceOrdered = [...experience].sort((a, b) => {
    const sa = a.bullets.reduce((n, bullet) => n + scoreBullet(bullet, jd), 0);
    const sb = b.bullets.reduce((n, bullet) => n + scoreBullet(bullet, jd), 0);
    return sb - sa;
  });

  const education = structured.education.map((e) => ({
    degree: e.degree,
    school: e.school,
    dates: e.dates,
    details: e.details,
  }));

  const contactLines = formatContactBlock(structured);
  const sections: string[] = [];

  sections.push(...contactLines, "");
  sections.push("PROFESSIONAL SUMMARY", summary, "");
  sections.push(
    "CORE SKILLS",
    skills.length ? skills.join(" · ") : "See experience for demonstrated skills.",
    ""
  );

  sections.push("PROFESSIONAL EXPERIENCE");
  if (!experienceOrdered.length) {
    sections.push(
      "• Experience details could not be structured automatically — see original resume and paste clearer role headers."
    );
  } else {
    for (const role of experienceOrdered) {
      sections.push("");
      sections.push(
        ...formatRole({
          title: role.title,
          company: role.company,
          dates: role.dates,
          bullets: role.bullets,
          rawHeader: role.title,
        })
      );
    }
  }
  sections.push("");

  if (education.length) {
    sections.push("EDUCATION");
    for (const edu of education) {
      const line = [edu.degree, edu.school, edu.dates].filter(Boolean).join(" — ");
      sections.push(line);
      for (const d of edu.details) sections.push(`• ${d}`);
    }
    sections.push("");
  }

  for (const extra of structured.extras) {
    if (extra.title === "Additional" && extra.lines.length < 2) continue;
    sections.push(extra.title.toUpperCase());
    for (const line of extra.lines.slice(0, 8)) {
      sections.push(line.startsWith("•") ? line : `• ${line}`);
    }
    sections.push("");
  }

  const plainText = sections.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n";

  const targetRole = jd.titles[0] ?? null;
  const formatNotes = [
    "Single-column ATS layout: Contact → Summary → Skills → Experience → Education.",
    "Skills ordered with JD-matched hard skills first.",
    "Experience bullets ranked by relevance to the job description.",
    "No employers, titles, dates, or skills were invented.",
  ];

  return {
    contactName: structured.contact.name,
    contactLine: contactLines[1] ?? "",
    targetRole,
    summary,
    skills,
    experience: experienceOrdered,
    education,
    plainText,
    formatNotes,
  };
}
