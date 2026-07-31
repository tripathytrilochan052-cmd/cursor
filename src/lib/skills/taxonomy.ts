import type { ExtractedSkill, SkillCategory } from "@/lib/types";

/** Canonical skill taxonomy with aliases for ATS matching. */
export const SKILL_TAXONOMY: ExtractedSkill[] = [
  // Hard / technical
  { name: "JavaScript", category: "hard", aliases: ["js", "es6", "ecmascript"] },
  { name: "TypeScript", category: "hard", aliases: ["ts"] },
  { name: "Python", category: "hard", aliases: ["python3", "py"] },
  { name: "Java", category: "hard", aliases: ["jdk", "jvm"] },
  { name: "C++", category: "hard", aliases: ["cpp", "c plus plus"] },
  { name: "C#", category: "hard", aliases: ["csharp", "c sharp", ".net"] },
  { name: "Go", category: "hard", aliases: ["golang"] },
  { name: "Rust", category: "hard" },
  { name: "Ruby", category: "hard", aliases: ["rails", "ruby on rails"] },
  { name: "PHP", category: "hard" },
  { name: "Swift", category: "hard" },
  { name: "Kotlin", category: "hard" },
  { name: "SQL", category: "hard", aliases: ["structured query language"] },
  { name: "NoSQL", category: "hard" },
  { name: "React", category: "hard", aliases: ["reactjs", "react.js"] },
  { name: "Next.js", category: "hard", aliases: ["nextjs", "next"] },
  { name: "Vue.js", category: "hard", aliases: ["vue", "vuejs"] },
  { name: "Angular", category: "hard", aliases: ["angularjs"] },
  { name: "Node.js", category: "hard", aliases: ["nodejs", "node"] },
  { name: "Express", category: "hard", aliases: ["expressjs", "express.js"] },
  { name: "Django", category: "hard" },
  { name: "Flask", category: "hard" },
  { name: "FastAPI", category: "hard" },
  { name: "Spring Boot", category: "hard", aliases: ["spring", "springboot"] },
  { name: "GraphQL", category: "hard" },
  { name: "REST API", category: "hard", aliases: ["rest", "restful", "rest apis", "api design"] },
  { name: "Microservices", category: "hard", aliases: ["microservice architecture"] },
  { name: "System Design", category: "hard", aliases: ["distributed systems"] },
  { name: "Data Structures", category: "hard", aliases: ["algorithms", "dsa"] },
  { name: "Machine Learning", category: "hard", aliases: ["ml", "deep learning"] },
  { name: "Natural Language Processing", category: "hard", aliases: ["nlp"] },
  { name: "Computer Vision", category: "hard" },
  { name: "Data Analysis", category: "hard", aliases: ["data analytics"] },
  { name: "Data Engineering", category: "hard" },
  { name: "ETL", category: "hard", aliases: ["elt", "data pipelines"] },
  { name: "Statistics", category: "hard", aliases: ["statistical analysis"] },
  { name: "A/B Testing", category: "hard", aliases: ["ab testing", "experimentation"] },
  { name: "CI/CD", category: "hard", aliases: ["continuous integration", "continuous delivery", "continuous deployment"] },
  { name: "DevOps", category: "hard" },
  { name: "Kubernetes", category: "hard", aliases: ["k8s"] },
  { name: "Docker", category: "hard", aliases: ["containers", "containerization"] },
  { name: "AWS", category: "hard", aliases: ["amazon web services"] },
  { name: "Azure", category: "hard", aliases: ["microsoft azure"] },
  { name: "Google Cloud", category: "hard", aliases: ["gcp", "google cloud platform"] },
  { name: "Terraform", category: "hard", aliases: ["infrastructure as code", "iac"] },
  { name: "Linux", category: "hard", aliases: ["unix"] },
  { name: "Git", category: "hard", aliases: ["github", "gitlab", "version control"] },
  { name: "PostgreSQL", category: "hard", aliases: ["postgres"] },
  { name: "MySQL", category: "hard" },
  { name: "MongoDB", category: "hard", aliases: ["mongo"] },
  { name: "Redis", category: "hard" },
  { name: "Elasticsearch", category: "hard" },
  { name: "Kafka", category: "hard", aliases: ["apache kafka"] },
  { name: "Spark", category: "hard", aliases: ["apache spark"] },
  { name: "Hadoop", category: "hard" },
  { name: "Tableau", category: "hard" },
  { name: "Power BI", category: "hard", aliases: ["powerbi"] },
  { name: "Excel", category: "hard", aliases: ["microsoft excel", "spreadsheets"] },
  { name: "Salesforce", category: "hard", aliases: ["sfdc"] },
  { name: "Agile", category: "hard", aliases: ["scrum", "kanban", "sprint planning"] },
  { name: "Product Management", category: "hard", aliases: ["product strategy", "roadmap"] },
  { name: "Project Management", category: "hard", aliases: ["program management"] },
  { name: "UI/UX Design", category: "hard", aliases: ["ux", "ui", "user experience", "user interface", "figma"] },
  { name: "HTML", category: "hard", aliases: ["html5"] },
  { name: "CSS", category: "hard", aliases: ["css3", "sass", "scss", "tailwind"] },
  { name: "Testing", category: "hard", aliases: ["unit testing", "integration testing", "qa", "jest", "cypress", "playwright"] },
  { name: "Security", category: "hard", aliases: ["cybersecurity", "application security", "owasp"] },
  { name: "LLM", category: "hard", aliases: ["large language models", "generative ai", "gpt", "openai"] },
  { name: "Prompt Engineering", category: "hard" },
  { name: "RAG", category: "hard", aliases: ["retrieval augmented generation"] },
  { name: "PyTorch", category: "hard" },
  { name: "TensorFlow", category: "hard" },
  { name: "Pandas", category: "hard" },
  { name: "NumPy", category: "hard" },
  { name: "Scikit-learn", category: "hard", aliases: ["sklearn", "scikit learn"] },
  { name: "Recruiting", category: "hard", aliases: ["talent acquisition", "sourcing"] },
  { name: "HRIS", category: "hard", aliases: ["workday", "bamboohr", "human resources information systems"] },
  { name: "Compensation", category: "hard", aliases: ["total rewards"] },
  { name: "Employee Relations", category: "hard" },
  { name: "Performance Management", category: "hard" },
  { name: "Onboarding", category: "hard" },
  { name: "ATS", category: "hard", aliases: ["applicant tracking system", "greenhouse", "lever"] },
  { name: "Financial Modeling", category: "hard", aliases: ["financial analysis", "dcf"] },
  { name: "Accounting", category: "hard", aliases: ["gaap", "ifrs"] },
  { name: "Marketing Strategy", category: "hard", aliases: ["go-to-market", "gtm"] },
  { name: "SEO", category: "hard", aliases: ["search engine optimization"] },
  { name: "Content Marketing", category: "hard" },
  { name: "Customer Success", category: "hard", aliases: ["account management"] },
  { name: "Sales", category: "hard", aliases: ["b2b sales", "enterprise sales"] },
  { name: "CRM", category: "hard", aliases: ["hubspot", "customer relationship management"] },

  // Soft skills
  { name: "Leadership", category: "soft", aliases: ["team leadership", "people leadership"] },
  { name: "Communication", category: "soft", aliases: ["written communication", "verbal communication", "stakeholder communication"] },
  { name: "Collaboration", category: "soft", aliases: ["teamwork", "cross-functional collaboration", "collaborated", "collaborate", "cross-functional"] },
  { name: "Problem Solving", category: "soft", aliases: ["critical thinking", "analytical thinking", "problem-solving"] },
  { name: "Adaptability", category: "soft", aliases: ["flexibility", "resilience"] },
  { name: "Time Management", category: "soft", aliases: ["prioritization", "organization"] },
  { name: "Mentoring", category: "soft", aliases: ["coaching", "teaching"] },
  { name: "Stakeholder Management", category: "soft", aliases: ["executive communication"] },
  { name: "Conflict Resolution", category: "soft" },
  { name: "Creativity", category: "soft", aliases: ["innovation", "innovative"] },
  { name: "Attention to Detail", category: "soft", aliases: ["detail-oriented", "detail oriented"] },
  { name: "Ownership", category: "soft", aliases: ["accountability", "initiative"] },
  { name: "Empathy", category: "soft", aliases: ["emotional intelligence", "eq"] },
  { name: "Negotiation", category: "soft" },
  { name: "Presentation", category: "soft", aliases: ["public speaking", "storytelling"] },
  { name: "Decision Making", category: "soft" },
  { name: "Customer Focus", category: "soft", aliases: ["customer oriented", "user focused"] },
];

const STOP_KEYWORDS = new Set([
  "experience",
  "years",
  "year",
  "role",
  "position",
  "job",
  "work",
  "team",
  "company",
  "ability",
  "skills",
  "required",
  "requirements",
  "preferred",
  "responsibilities",
  "including",
  "using",
  "strong",
  "excellent",
  "good",
  "must",
  "will",
  "able",
  "knowledge",
  "understanding",
  "familiarity",
  "bachelor",
  "master",
  "degree",
  "etc",
]);

export function normalizeToken(value: string): string {
  return value
    .toLowerCase()
    .replace(/[\u2019']/g, "")
    .replace(/[^a-z0-9+#./\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function buildAliasIndex(): Map<string, ExtractedSkill> {
  const index = new Map<string, ExtractedSkill>();
  for (const skill of SKILL_TAXONOMY) {
    index.set(normalizeToken(skill.name), skill);
    for (const alias of skill.aliases ?? []) {
      index.set(normalizeToken(alias), skill);
    }
  }
  return index;
}

export const ALIAS_INDEX = buildAliasIndex();

/** Extra JD phrases that are useful ATS keywords beyond the taxonomy. */
export function extractPhraseKeywords(text: string): string[] {
  const normalized = normalizeToken(text);
  const phrases: string[] = [];

  const multiWord = normalized.match(
    /\b([a-z][a-z0-9+#.]*(?:[\s/-][a-z0-9+#.]+){1,3})\b/g
  );
  if (multiWord) {
    for (const phrase of multiWord) {
      const cleaned = phrase.trim();
      if (cleaned.length < 6 || cleaned.length > 40) continue;
      const words = cleaned.split(/\s+/);
      if (words.every((w) => STOP_KEYWORDS.has(w))) continue;
      if (words.filter((w) => !STOP_KEYWORDS.has(w)).length === 0) continue;
      phrases.push(cleaned);
    }
  }

  return Array.from(new Set(phrases)).slice(0, 40);
}

export function categoryLabel(category: SkillCategory): string {
  switch (category) {
    case "hard":
      return "Hard skill";
    case "soft":
      return "Soft skill";
    case "tool":
      return "Tool";
    default:
      return "Keyword";
  }
}
