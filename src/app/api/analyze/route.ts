import { NextRequest, NextResponse } from "next/server";
import { analyzeDocuments } from "@/lib/ats/analyze";
import { parseResumeFile } from "@/lib/parse/documents";

export const runtime = "nodejs";

const MAX_FILE_BYTES = 8 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") ?? "";

    let resumeText = "";
    let jdText = "";
    let resumeFilename: string | undefined;
    let useLlm = true;

    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      jdText = String(form.get("jdText") ?? "");
      useLlm = String(form.get("useLlm") ?? "true") !== "false";

      const pastedResume = String(form.get("resumeText") ?? "");
      const file = form.get("resume");

      if (file && typeof file !== "string") {
        const upload = file as File;
        if (upload.size > MAX_FILE_BYTES) {
          return NextResponse.json(
            { error: "Resume file must be under 8MB." },
            { status: 400 }
          );
        }
        resumeFilename = upload.name;
        const buffer = Buffer.from(await upload.arrayBuffer());
        resumeText = await parseResumeFile(buffer, upload.name, upload.type);
      } else if (pastedResume.trim()) {
        resumeText = pastedResume;
      } else {
        return NextResponse.json(
          { error: "Provide a resume file (PDF/DOCX) or paste resume text." },
          { status: 400 }
        );
      }
    } else {
      const body = (await request.json()) as {
        resumeText?: string;
        jdText?: string;
        useLlm?: boolean;
        resumeFilename?: string;
      };
      resumeText = body.resumeText ?? "";
      jdText = body.jdText ?? "";
      useLlm = body.useLlm !== false;
      resumeFilename = body.resumeFilename;
    }

    const result = await analyzeDocuments({
      resumeText,
      jdText,
      resumeFilename,
      useLlm,
    });

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to analyze documents.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
