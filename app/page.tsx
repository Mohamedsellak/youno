import { AnalyzerClient } from "@/components/analyzer-client";

export default function HomePage() {
  return (
    <main className="min-h-screen relative overflow-hidden bg-background">
      {/* Background patterns */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[25%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] rounded-full bg-purple-600/10 blur-[120px]" />
        <div className="absolute bottom-[10%] left-[20%] w-[60%] h-[40%] rounded-full bg-pink-600/5 blur-[100px]" />
      </div>

      <div className="relative z-10">
        {/* Hero Header */}
        <header className="relative py-20 sm:py-28 text-center px-4">
          <div className="mx-auto max-w-4xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-medium text-blue-300 backdrop-blur-md shadow-[0_0_15px_rgba(59,130,246,0.15)] hover:bg-blue-500/20 transition-colors">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-blue-500" />
              </span>
              AI-Powered Website Intelligence
            </div>
            
            <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl mb-6 drop-shadow-sm">
              Intelligence for{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                B2B SaaS
              </span>
            </h1>
            
            <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-light">
              Analyze any website instantly to extract company insights, tech stack, GTM signals,
              and B2B fit scores — all powered by advanced AI enrichment.
            </p>
          </div>
        </header>

        {/* Main Content */}
        <div className="mx-auto max-w-5xl px-4 pb-20">
          <AnalyzerClient />
        </div>

        {/* Footer */}
        <footer className="border-t border-border/20 py-8 text-center text-sm text-muted-foreground/60 backdrop-blur-sm">
          <p className="mb-2">
            Built with Next.js & Tailwind CSS
            <span className="mx-2">·</span>
            Powered by Hunter.io & OpenRouter AI
          </p>
          <p className="font-medium text-foreground/70">
            Powered by <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 font-bold tracking-wide">Youno</span>
          </p>
        </footer>
      </div>
    </main>
  );
}
