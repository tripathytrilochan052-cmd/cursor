import type { FormattedResume } from "@/lib/types";

function triggerBrowserDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function safeName(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "resume"
  );
}

/** Download DOCX via server route — keeps `docx` out of the client bundle. */
export async function downloadResumeDocx(resume: FormattedResume): Promise<void> {
  const response = await fetch("/api/export-docx", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(resume),
  });

  if (!response.ok) {
    let message = "Failed to download DOCX.";
    try {
      const data = (await response.json()) as { error?: string };
      if (data.error) message = data.error;
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  const blob = await response.blob();
  triggerBrowserDownload(
    blob,
    `${safeName(resume.contactName)}-ats-resume.docx`
  );
}

export function downloadResumeText(resume: FormattedResume): void {
  const blob = new Blob([resume.plainText], {
    type: "text/plain;charset=utf-8",
  });
  triggerBrowserDownload(blob, `${safeName(resume.contactName)}-ats-resume.txt`);
}
