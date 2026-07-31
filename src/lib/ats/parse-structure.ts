export interface ContactInfo {
  name: string;
  email?: string;
  phone?: string;
  location?: string;
  links: string[];
  rawHeader: string[];
}

export interface ExperienceRole {
  title: string;
  company: string;
  dates: string;
  bullets: string[];
  rawHeader: string;
}

export interface EducationEntry {
  degree: string;
  school: string;
  dates: string;
  details: string[];
  raw: string;
}

export interface StructuredResume {
  contact: ContactInfo;
  summary: string | null;
  skills: string[];
  experience: ExperienceRole[];
  education: EducationEntry[];
  extras: { title: string; lines: string[] }[];
}

const SECTION_HEADERS =
  /^(summary|profile|professional summary|objective|about|skills|technical skills|core competencies|core skills|experience|work experience|professional experience|employment|work history|education|academic|certifications?|projects?|awards?|publications?)\b[:\s]*$/i;

function isSectionHeader(line: string): string | null {
  const cleaned = line.replace(/[:\-–—]+$/, "").trim();
  if (SECTION_HEADERS.test(cleaned)) {
    return cleaned.toLowerCase().replace(/[^a-z\s]/g, "").trim();
  }
  // Inline "SKILLS: foo, bar"
  const inline = cleaned.match(
    /^(summary|profile|skills|technical skills|experience|education)\s*[:\-]\s*(.+)$/i
  );
  if (inline) return inline[1].toLowerCase();
  return null;
}

function normalizeSectionKey(key: string): string {
  if (/summary|profile|objective|about/.test(key)) return "summary";
  if (/skill|competenc/.test(key)) return "skills";
  if (/experience|employment|work history|work experience/.test(key)) {
    return "experience";
  }
  if (/education|academic/.test(key)) return "education";
  if (/certification/.test(key)) return "certifications";
  if (/project/.test(key)) return "projects";
  return key;
}

function extractEmail(text: string): string | undefined {
  return text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0];
}

function extractPhone(text: string): string | undefined {
  return text.match(
    /(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{3}\)?[\s.-]?)\d{3}[\s.-]?\d{4}/
  )?.[0];
}

function extractLinks(text: string): string[] {
  const matches =
    text.match(
      /(?:https?:\/\/|www\.)[^\s|]+|linkedin\.com\/in\/[^\s|]+|github\.com\/[^\s|]+/gi
    ) ?? [];
  return Array.from(new Set(matches)).slice(0, 5);
}

function looksLikeRoleHeader(line: string): boolean {
  if (line.length < 8 || line.length > 120) return false;
  if (/^[•\-*●]/.test(line)) return false;
  // Title — Company (dates) or Company | Title | dates
  if (/[—–\-|]/.test(line) && /\d{4}|present|current/i.test(line)) return true;
  if (/\b(19|20)\d{2}\s*[-–—to]+\s*(\d{4}|present|current)\b/i.test(line)) {
    return true;
  }
  if (
    /\b(engineer|developer|manager|analyst|designer|scientist|director|lead|intern|consultant|specialist|recruiter|coordinator)\b/i.test(
      line
    ) &&
    /[—–\-|@]|\b(at|–|-)\b/.test(line)
  ) {
    return true;
  }
  return false;
}

function parseRoleHeader(line: string): Pick<
  ExperienceRole,
  "title" | "company" | "dates" | "rawHeader"
> {
  const datesMatch = line.match(
    /(\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+)?(19|20)\d{2}\s*[-–—to]+\s*((?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+)?(?:\d{4}|Present|Current))/i
  );
  const dates = datesMatch?.[0]?.trim() ?? "";
  let rest = dates ? line.replace(dates, "").replace(/[|·•]\s*$/, "").trim() : line;
  rest = rest.replace(/[\(\[\{]\s*[\)\]\}]\s*$/, "").trim();
  rest = rest.replace(/[-–—|,]\s*$/, "").trim();

  const parts = rest
    .split(/\s+[—–\-]\s+|\s+\|\s+|\s+@\s+|\s+\bat\b\s+/i)
    .map((p) => p.trim())
    .filter(Boolean);

  let title = parts[0] ?? rest;
  let company = parts[1] ?? "";
  if (parts.length >= 3 && !company) {
    company = parts.slice(1).join(" — ");
  }
  // If pattern is Company — Title
  if (
    company &&
    /\b(engineer|developer|manager|analyst|designer|lead|director)\b/i.test(company) &&
    !/\b(engineer|developer|manager|analyst|designer|lead|director)\b/i.test(title)
  ) {
    [title, company] = [company, title];
  }

  return { title, company, dates, rawHeader: line };
}

function parseEducationLine(line: string): EducationEntry {
  const datesMatch = line.match(
    /(\b(?:19|20)\d{2}\s*[-–—to]+\s*(?:\d{4}|Present|Current)|\b(?:19|20)\d{2}\b)/i
  );
  const dates = datesMatch?.[0] ?? "";
  const rest = dates ? line.replace(dates, "").replace(/[|·,]\s*$/, "").trim() : line;
  const parts = rest.split(/\s+[—–\-]\s+|\s+\|\s+|\s+,\s+/).map((p) => p.trim());
  return {
    degree: parts[0] ?? line,
    school: parts[1] ?? "",
    dates,
    details: [],
    raw: line,
  };
}

export function parseStructuredResume(resumeText: string): StructuredResume {
  const lines = resumeText
    .split(/\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const contactLines: string[] = [];
  let i = 0;
  while (i < Math.min(lines.length, 6) && !isSectionHeader(lines[i])) {
    contactLines.push(lines[i]);
    i++;
  }

  const joinedContact = contactLines.join(" ");
  const name = contactLines[0] ?? "Candidate";
  const contact: ContactInfo = {
    name: name.length < 80 ? name : name.slice(0, 80),
    email: extractEmail(joinedContact),
    phone: extractPhone(joinedContact),
    location: contactLines.find(
      (l) =>
        !extractEmail(l) &&
        !extractPhone(l) &&
        !/linkedin|github|http/i.test(l) &&
        l !== name &&
        /,|\b[A-Z]{2}\b/.test(l)
    ),
    links: extractLinks(joinedContact),
    rawHeader: contactLines,
  };

  const buckets: Record<string, string[]> = {
    summary: [],
    skills: [],
    experience: [],
    education: [],
    certifications: [],
    projects: [],
    other: [],
  };

  let current = "other";
  for (; i < lines.length; i++) {
    const header = isSectionHeader(lines[i]);
    if (header) {
      current = normalizeSectionKey(header);
      // Capture inline content after "Skills: ..."
      const inline = lines[i].match(
        /^(?:summary|profile|skills|technical skills|experience|education)\s*[:\-]\s*(.+)$/i
      );
      if (inline?.[1]) buckets[current].push(inline[1]);
      continue;
    }
    if (!buckets[current]) buckets[current] = [];
    buckets[current].push(lines[i]);
  }

  // If no explicit experience section, try to recover role-like blocks from other/summary leftovers
  if (!buckets.experience.length) {
    const pool = [...buckets.other, ...buckets.summary];
    const recovered: string[] = [];
    for (const line of pool) {
      if (looksLikeRoleHeader(line) || /^[•\-*●]/.test(line)) recovered.push(line);
    }
    if (recovered.length) buckets.experience = recovered;
  }

  const summary =
    buckets.summary.length > 0
      ? buckets.summary.join(" ").replace(/\s+/g, " ").trim()
      : null;

  const skills = buckets.skills
    .join(",")
    .split(/[,•|·;/]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 1 && s.length < 40);

  const experience: ExperienceRole[] = [];
  let currentRole: ExperienceRole | null = null;
  for (const line of buckets.experience) {
    if (looksLikeRoleHeader(line) && !/^[•\-*●]/.test(line)) {
      if (currentRole) experience.push(currentRole);
      const parsed = parseRoleHeader(line);
      currentRole = { ...parsed, bullets: [] };
      continue;
    }
    const bullet = line.replace(/^[-•*●]\s*/, "").replace(/^\d+\.\s*/, "").trim();
    if (!bullet) continue;
    if (!currentRole) {
      currentRole = {
        title: "Experience",
        company: "",
        dates: "",
        bullets: [],
        rawHeader: "Experience",
      };
    }
    currentRole.bullets.push(bullet);
  }
  if (currentRole) experience.push(currentRole);

  const education: EducationEntry[] = [];
  let eduCurrent: EducationEntry | null = null;
  for (const line of buckets.education) {
    if (!/^[•\-*●]/.test(line) && (/\d{4}|bachelor|master|b\.s|m\.s|ph\.?d|university|college/i.test(line))) {
      if (eduCurrent) education.push(eduCurrent);
      eduCurrent = parseEducationLine(line);
    } else if (eduCurrent) {
      eduCurrent.details.push(line.replace(/^[-•*●]\s*/, ""));
    } else {
      education.push(parseEducationLine(line));
    }
  }
  if (eduCurrent) education.push(eduCurrent);

  const extras: StructuredResume["extras"] = [];
  for (const key of ["certifications", "projects", "other"] as const) {
    if (buckets[key]?.length) {
      extras.push({
        title: key === "other" ? "Additional" : key[0].toUpperCase() + key.slice(1),
        lines: buckets[key],
      });
    }
  }

  return { contact, summary, skills, experience, education, extras };
}
