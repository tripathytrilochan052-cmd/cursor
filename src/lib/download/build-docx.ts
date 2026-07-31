import { deflateRawSync } from "zlib";
import type { FormattedResume } from "@/lib/types";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function paragraph(
  text: string,
  opts?: { bold?: boolean; center?: boolean; size?: number; before?: number }
): string {
  const size = opts?.size ?? 20;
  const align = opts?.center
    ? `<w:jc w:val="center"/>`
    : "";
  const spacing = opts?.before
    ? `<w:spacing w:before="${opts.before}" w:after="60"/>`
    : `<w:spacing w:after="60"/>`;
  const bold = opts?.bold ? `<w:b/>` : "";
  return `<w:p><w:pPr>${align}${spacing}</w:pPr><w:r><w:rPr>${bold}<w:sz w:val="${size}"/><w:szCs w:val="${size}"/></w:rPr><w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r></w:p>`;
}

function bullet(text: string): string {
  return `<w:p><w:pPr><w:ind w:left="360"/><w:spacing w:after="40"/></w:pPr><w:r><w:rPr><w:sz w:val="20"/><w:szCs w:val="20"/></w:rPr><w:t xml:space="preserve">• ${escapeXml(text)}</w:t></w:r></w:p>`;
}

function heading(text: string): string {
  return paragraph(text, { bold: true, size: 22, before: 240 });
}

function buildDocumentXml(resume: FormattedResume): string {
  const parts: string[] = [];
  parts.push(paragraph(resume.contactName.toUpperCase(), { bold: true, center: true, size: 32 }));
  if (resume.contactLine) {
    parts.push(paragraph(resume.contactLine, { center: true, size: 18 }));
  }
  if (resume.targetRole) {
    parts.push(paragraph(`Target: ${resume.targetRole}`, { center: true, size: 18 }));
  }

  parts.push(heading("PROFESSIONAL SUMMARY"));
  parts.push(paragraph(resume.summary));

  parts.push(heading("CORE SKILLS"));
  parts.push(paragraph(resume.skills.join(" · ")));

  parts.push(heading("PROFESSIONAL EXPERIENCE"));
  for (const role of resume.experience) {
    const header =
      role.title && role.company
        ? `${role.title} — ${role.company}${role.dates ? ` | ${role.dates}` : ""}`
        : [role.title, role.company, role.dates].filter(Boolean).join(" | ");
    parts.push(paragraph(header, { bold: true, before: 140 }));
    for (const b of role.bullets) parts.push(bullet(b));
  }

  if (resume.education.length) {
    parts.push(heading("EDUCATION"));
    for (const edu of resume.education) {
      parts.push(
        paragraph([edu.degree, edu.school, edu.dates].filter(Boolean).join(" — "))
      );
      for (const d of edu.details) parts.push(bullet(d));
    }
  }

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${parts.join("\n")}
    <w:sectPr>
      <w:pgMar w:top="720" w:right="720" w:bottom="720" w:left="720"/>
    </w:sectPr>
  </w:body>
</w:document>`;
}

const CONTENT_TYPES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`;

const ROOT_RELS = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

const DOC_RELS = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
</Relationships>`;

function crc32(buf: Buffer): number {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      const mask = -(crc & 1);
      crc = (crc >>> 1) ^ (0xedb88320 & mask);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function zipStore(files: { name: string; data: Buffer }[]): Buffer {
  const locals: Buffer[] = [];
  const centrals: Buffer[] = [];
  let offset = 0;

  for (const file of files) {
    const nameBuf = Buffer.from(file.name, "utf8");
    const compressed = deflateRawSync(file.data);
    const useDeflate = compressed.length < file.data.length;
    const payload = useDeflate ? compressed : file.data;
    const method = useDeflate ? 8 : 0;
    const crc = crc32(file.data);

    const local = Buffer.alloc(30 + nameBuf.length);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0, 6);
    local.writeUInt16LE(method, 8);
    local.writeUInt16LE(0, 10);
    local.writeUInt16LE(0, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(payload.length, 18);
    local.writeUInt32LE(file.data.length, 22);
    local.writeUInt16LE(nameBuf.length, 26);
    local.writeUInt16LE(0, 28);
    nameBuf.copy(local, 30);

    const central = Buffer.alloc(46 + nameBuf.length);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0, 8);
    central.writeUInt16LE(method, 10);
    central.writeUInt16LE(0, 12);
    central.writeUInt16LE(0, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(payload.length, 20);
    central.writeUInt32LE(file.data.length, 24);
    central.writeUInt16LE(nameBuf.length, 28);
    central.writeUInt16LE(0, 30);
    central.writeUInt16LE(0, 32);
    central.writeUInt16LE(0, 34);
    central.writeUInt16LE(0, 36);
    central.writeUInt32LE(0, 38);
    central.writeUInt32LE(offset, 42);
    nameBuf.copy(central, 46);

    locals.push(local, payload);
    centrals.push(central);
    offset += local.length + payload.length;
  }

  const centralDir = Buffer.concat(centrals);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(files.length, 8);
  end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(centralDir.length, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20);

  return Buffer.concat([...locals, centralDir, end]);
}

/** Build an ATS-friendly DOCX without the heavy `docx` dependency. */
export async function resumeToDocxBuffer(
  resume: FormattedResume
): Promise<Buffer> {
  const documentXml = buildDocumentXml(resume);
  return zipStore([
    { name: "[Content_Types].xml", data: Buffer.from(CONTENT_TYPES, "utf8") },
    { name: "_rels/.rels", data: Buffer.from(ROOT_RELS, "utf8") },
    { name: "word/document.xml", data: Buffer.from(documentXml, "utf8") },
    { name: "word/_rels/document.xml.rels", data: Buffer.from(DOC_RELS, "utf8") },
  ]);
}

export function safeResumeFilename(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "resume"
  );
}
