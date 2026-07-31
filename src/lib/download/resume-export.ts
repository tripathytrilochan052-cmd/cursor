import {
  AlignmentType,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
} from "docx";
import { saveAs } from "file-saver";
import type { FormattedResume } from "@/lib/types";

function sectionHeading(text: string): Paragraph {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 80 },
  });
}

function body(text: string): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text, size: 20 })],
    spacing: { after: 60 },
  });
}

function bullet(text: string): Paragraph {
  return new Paragraph({
    text,
    bullet: { level: 0 },
    spacing: { after: 40 },
  });
}

/** Build and download an ATS-friendly DOCX from the formatted resume. */
export async function downloadResumeDocx(resume: FormattedResume): Promise<void> {
  const children: Paragraph[] = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
      children: [
        new TextRun({
          text: resume.contactName.toUpperCase(),
          bold: true,
          size: 32,
        }),
      ],
    }),
  ];

  if (resume.contactLine) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
        children: [new TextRun({ text: resume.contactLine, size: 18 })],
      })
    );
  }

  if (resume.targetRole) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 160 },
        children: [
          new TextRun({
            text: `Target: ${resume.targetRole}`,
            italics: true,
            size: 18,
          }),
        ],
      })
    );
  }

  children.push(sectionHeading("PROFESSIONAL SUMMARY"), body(resume.summary));
  children.push(
    sectionHeading("CORE SKILLS"),
    body(resume.skills.join(" · "))
  );
  children.push(sectionHeading("PROFESSIONAL EXPERIENCE"));

  for (const role of resume.experience) {
    const header =
      role.title && role.company
        ? `${role.title} — ${role.company}${role.dates ? ` | ${role.dates}` : ""}`
        : [role.title, role.company, role.dates].filter(Boolean).join(" | ");
    children.push(
      new Paragraph({
        spacing: { before: 140, after: 40 },
        children: [new TextRun({ text: header, bold: true, size: 20 })],
      })
    );
    for (const b of role.bullets) children.push(bullet(b));
  }

  if (resume.education.length) {
    children.push(sectionHeading("EDUCATION"));
    for (const edu of resume.education) {
      children.push(
        body([edu.degree, edu.school, edu.dates].filter(Boolean).join(" — "))
      );
      for (const d of edu.details) children.push(bullet(d));
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 720, bottom: 720, left: 720, right: 720 },
          },
        },
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const safeName = resume.contactName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "resume";
  saveAs(blob, `${safeName}-ats-resume.docx`);
}

export function downloadResumeText(resume: FormattedResume): void {
  const blob = new Blob([resume.plainText], {
    type: "text/plain;charset=utf-8",
  });
  const safeName = resume.contactName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "resume";
  saveAs(blob, `${safeName}-ats-resume.txt`);
}
