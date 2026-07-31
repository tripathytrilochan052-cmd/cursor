import { NextRequest, NextResponse } from "next/server";
import {
  resumeToDocxBuffer,
  safeResumeFilename,
} from "@/lib/download/build-docx";
import type { FormattedResume } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const resume = (await request.json()) as FormattedResume;
    if (!resume?.contactName || !resume?.plainText) {
      return NextResponse.json(
        { error: "Formatted resume payload is required." },
        { status: 400 }
      );
    }

    const buffer = await resumeToDocxBuffer(resume);
    const filename = `${safeResumeFilename(resume.contactName)}-ats-resume.docx`;

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to build DOCX.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
