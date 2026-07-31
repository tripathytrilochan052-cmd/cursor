import mammoth from "mammoth";

export async function parsePdf(buffer: Buffer): Promise<string> {
  const { PDFParse } = await import("pdf-parse");
  const parser = new PDFParse({ data: new Uint8Array(buffer) });
  try {
    const result = await parser.getText();
    const text =
      typeof result === "string"
        ? result
        : (result as { text?: string }).text ?? "";
    return cleanDocumentText(text);
  } finally {
    await parser.destroy().catch(() => undefined);
  }
}

export async function parseDocx(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return cleanDocumentText(result.value ?? "");
}

export async function parseResumeFile(
  buffer: Buffer,
  filename: string,
  mimeType?: string
): Promise<string> {
  const lower = filename.toLowerCase();
  const isPdf =
    lower.endsWith(".pdf") || mimeType === "application/pdf";
  const isDocx =
    lower.endsWith(".docx") ||
    mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

  if (isPdf) return parsePdf(buffer);
  if (isDocx) return parseDocx(buffer);

  throw new Error("Unsupported file type. Upload a PDF or DOCX resume.");
}

export function cleanDocumentText(raw: string): string {
  return raw
    .replace(/\r\n/g, "\n")
    .replace(/\u0000/g, "")
    .replace(/^--\s*\d+\s+of\s+\d+\s*--$/gim, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}
