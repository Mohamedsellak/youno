/**
 * Simple in-memory cache with expiration.
 * Stores analysis results for 5 minutes to avoid re-scraping the same URL.
 */
import type { AnalysisResult } from "./types";

const TTL_MS = (Number(process.env.TTL_CACHE_MINUTES) || 5) * 60 * 1000; // 5 minutes

// pour stocker les url analyser avec leur resultat
// pour eviter de reanalyser la meme url 
// et pour eviter de perdre du temps 
const cache = new Map<string, { data: AnalysisResult; expiresAt: number }>();

export function getCached(key: string): AnalysisResult | null {
  const entry = cache.get(key);
  if (!entry) return null;

  // Check if expired
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }

  return entry.data;
}

export function setCache(key: string, data: AnalysisResult): void {
  cache.set(key, { data, expiresAt: Date.now() + TTL_MS });
}
