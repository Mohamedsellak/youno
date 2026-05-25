import { Globe, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EXAMPLE_SITES } from "./constants";

interface SearchFormProps {
  url: string;
  setUrl: (url: string) => void;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onChipClick: (site: string) => void;
}

export function SearchForm({ url, setUrl, loading, onSubmit, onChipClick }: SearchFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="flex gap-3">
        <div className="relative flex-1 group">
          <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-blue-400 transition-colors" />
          <Input
            id="url-input"
            type="text"
            placeholder="Enter a website URL (e.g. stripe.com)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="pl-12 h-14 text-base md:text-lg bg-card/40 backdrop-blur-xl border-border/50 focus:border-blue-500/50 focus:ring-blue-500/30 ring-1 ring-white/5 transition-all shadow-[0_8px_30px_rgba(0,0,0,0.12)] rounded-2xl"
            disabled={loading}
          />
        </div>
        <Button
          type="submit"
          size="lg"
          disabled={loading || !url.trim()}
          id="analyze-button"
          className="h-14 px-8 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 hover:from-blue-500 hover:via-indigo-400 hover:to-purple-500 text-white font-semibold transition-all duration-300 shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] hover:-translate-y-0.5 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing…
            </>
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" />
              Analyze
            </>
          )}
        </Button>
      </div>

      {/* Example chips */}
      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-muted-foreground self-center mr-1">
          Try:
        </span>
        {EXAMPLE_SITES.map((site) => (
          <button
            key={site}
            type="button"
            onClick={() => onChipClick(site)}
            disabled={loading}
            className="inline-flex items-center rounded-full border border-border/60 bg-muted/30 px-3 py-1 text-xs font-medium text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors disabled:opacity-50 cursor-pointer"
          >
            {site}
          </button>
        ))}
      </div>
    </form>
  );
}
