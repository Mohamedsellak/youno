"use client";

import { useState, useCallback } from "react";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { AnalysisResult } from "@/lib/types";

import { SearchForm } from "./analyzer/search-form";
import { LoadingSkeleton } from "./analyzer/loading-skeleton";
import { ResultsDisplay } from "./analyzer/results-display";

export function AnalyzerClient() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(
    async (targetUrl?: string) => {
      const urlToAnalyze = targetUrl || url;
      if (!urlToAnalyze.trim()) return;

      setLoading(true);
      setError(null);
      setResult(null);

      try {
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: urlToAnalyze }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || `Analysis failed (${response.status})`
          );
        }

        setResult(data as AnalysisResult);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    },
    [url]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    analyze();
  };

  const handleChipClick = (site: string) => {
    setUrl(site);
    analyze(site);
  };

  return (
    <div className="space-y-8">
      <SearchForm 
        url={url} 
        setUrl={setUrl} 
        loading={loading} 
        onSubmit={handleSubmit} 
        onChipClick={handleChipClick} 
      />

      {error && (
        <Alert
          variant="destructive"
          className="border-red-500/30 bg-red-500/10"
        >
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading && <LoadingSkeleton />}

      {result && !loading && <ResultsDisplay result={result} />}
    </div>
  );
}
