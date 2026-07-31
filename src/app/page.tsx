import { AnalyzerApp } from "@/components/AnalyzerApp";
import { HydrationGuard } from "@/components/HydrationGuard";

export default function HomePage() {
  return (
    <main className="min-h-screen hero-field relative overflow-x-hidden">
      <HydrationGuard />
      <div
        id="aligncv-boot"
        className="fixed inset-x-0 top-0 z-[100] border-b border-coral/40 bg-coral px-4 py-3 text-center text-sm font-medium text-white"
        role="status"
      >
        Interactive UI is still loading. If this message stays, stop the server and run{" "}
        <code className="rounded bg-black/20 px-1.5 py-0.5">npm run dev:clean</code>, then
        hard-refresh the browser.
      </div>
      <div className="hero-grain pointer-events-none absolute inset-0" aria-hidden />

      {/* Full-bleed hero plane — brand-first first viewport */}
      <header className="relative isolate min-h-[100svh] overflow-hidden">
        <div className="hero-plane absolute inset-0 animate-drift" aria-hidden />
        <div className="absolute inset-0 bg-gradient-to-t from-mist via-mist/20 to-transparent" />

        <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-end px-5 pb-16 pt-10 lg:px-8 lg:pb-20">
          <p className="font-display text-5xl font-semibold tracking-tight text-white drop-shadow-sm sm:text-6xl md:text-7xl lg:text-8xl">
            AlignCV
          </p>
          <h1 className="mt-5 max-w-2xl text-xl font-medium leading-snug text-white/95 sm:text-2xl md:text-3xl">
            Match your resume to any job description — score, gaps, and an honest rewrite.
          </h1>
          <p className="mt-4 max-w-xl text-base text-white/75 sm:text-lg">
            Parse PDF/DOCX, measure ATS fit, and tailor wording without inventing experience.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#workspace"
              className="inline-flex items-center bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:bg-mist"
            >
              Start aligning
            </a>
            <a
              href="#how"
              className="inline-flex items-center border border-white/40 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              How it works
            </a>
          </div>
        </div>
      </header>

      <section
        id="how"
        className="relative mx-auto max-w-6xl px-5 py-16 lg:px-8 lg:py-20"
      >
        <h2 className="font-display text-3xl text-ink md:text-4xl">How it works</h2>
        <p className="mt-3 max-w-2xl text-ink/65">
          One pipeline from documents to decision-ready output — built for accuracy over fluff.
        </p>
        <ol className="mt-10 grid gap-8 md:grid-cols-3">
          {[
            {
              step: "01",
              title: "Parse cleanly",
              body: "Extract text from PDF or DOCX resumes and normalize pasted job descriptions.",
            },
            {
              step: "02",
              title: "Score & diagnose",
              body: "Compute an ATS match score (0–100%) and surface missing hard skills, soft skills, and keywords.",
            },
            {
              step: "03",
              title: "Generate formatted resume",
              body: "Produce a full ATS-formatted resume (summary, skills, experience, education) tailored to the JD — downloadable as DOCX — without inventing experience.",
            },
          ].map((item) => (
            <li key={item.step} className="border-t border-ink/15 pt-5">
              <p className="text-xs font-semibold tracking-[0.18em] text-teal">
                {item.step}
              </p>
              <h3 className="mt-2 font-display text-xl text-ink">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/65">{item.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="workspace" className="relative border-t border-ink/10 bg-white/35">
        <div className="mx-auto max-w-6xl px-5 pt-12 lg:px-8">
          <h2 className="font-display text-3xl text-ink md:text-4xl">Workspace</h2>
          <p className="mt-2 max-w-2xl text-ink/65">
            Upload a resume, paste a JD, and generate your alignment report.
          </p>
        </div>
        <AnalyzerApp />
      </section>

      <footer className="border-t border-ink/10 px-5 py-8 text-center text-sm text-ink/45 lg:px-8">
        AlignCV · ATS match scoring with no-hallucination rewrite guardrails
      </footer>
    </main>
  );
}
