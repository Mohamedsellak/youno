/**
 * POST /api/analyze
 *
 * Main pipeline:
 * 1. Validate & normalize URL
 * 2. Check cache and rate limit
 * 3. Fetch HTML
 * 4. Extract signals & detect tech
 * 5. Enrich via Hunter API & LLM (parallel)
 * 6. Compute fit score
 * 7. Return results
 */
import type { NextRequest } from "next/server";
import { analyzeInputSchema } from "@/lib/validate";
import { normalizeUrl, extractDomain } from "@/lib/url";
import { fetchHtml } from "@/lib/fetchHtml";
import { extractSignals } from "@/lib/extractSignals";
import { detectTech } from "@/lib/detectTech";
import { hunterEnrich } from "@/lib/hunter";
import { enrichWithLLM } from "@/lib/enrich";
import { scoreFit } from "@/lib/score";
import { checkRateLimit } from "@/lib/rateLimit";
import { getCached, setCache } from "@/lib/cache";
import type { AnalysisResult, CompanyInfo } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const timings: Record<string, number> = {};
  const startTotal = Date.now();

  // --- Rate limiting ---
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rateCheck = checkRateLimit(ip);
  if (!rateCheck.allowed) {
    return Response.json({ error: "Rate limit exceeded. Try again later." }, { status: 429 });
  }

  // --- Parse input ---
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const validation = analyzeInputSchema.safeParse(body);
  if (!validation.success) {
    return Response.json(
      { error: "Invalid input", details: validation.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  // --- Normalize URL ---
  let normalizedUrl: string;
  try {
    normalizedUrl = normalizeUrl(validation.data.url);
  } catch (error) {
    return Response.json(
      { error: "Forbidden target", details: error instanceof Error ? error.message : "URL blocked" },
      { status: 422 }
    );
  }

  // --- Check cache ---
  const cached = getCached(normalizedUrl);
  if (cached) return Response.json(cached);

  // --- Fetch HTML ---
  let html: string;
  let httpStatus: number;
  let responseHeaders: Record<string, string>;

  const fetchStart = Date.now();
  try {
    const result = await fetchHtml(normalizedUrl);
    html = result.html;
    httpStatus = result.status;
    responseHeaders = result.headers;
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Fetch failed";
    if (msg.includes("timeout") || msg.includes("abort")) {
      return Response.json({ error: "Timeout fetching URL", details: msg }, { status: 504 });
    }
    return Response.json({ error: "Failed to fetch URL", details: msg }, { status: 502 });
  }
  timings.fetch = Date.now() - fetchStart;

  // --- Extract signals & detect tech ---
  const extractStart = Date.now();
  const { extraction, gtmSignals } = extractSignals(html, normalizedUrl, responseHeaders);
  const techStack = detectTech(html, responseHeaders);
  timings.extract = Date.now() - extractStart;

  // --- External enrichments (run in parallel, both are optional) ---
  const domain = extractDomain(normalizedUrl);
  const enrichStart = Date.now();
  const [hunterResult, llmResult] = await Promise.all([
    hunterEnrich(domain).catch(() => null),
    enrichWithLLM(normalizedUrl, extraction, techStack, gtmSignals).catch(() => null),
  ]);
  timings.enrich = Date.now() - enrichStart;

  // --- Build company info (merge LLM data if available) ---
  let company: CompanyInfo = {
    name: extraction.ogSiteName || extraction.title || null,
    description: extraction.metaDescription || extraction.ogDescription || null,
    industry: null,
    sizeBucket: null,
    confidence: "low",
  };

  // Merge LLM results (override nulls with LLM values)
  if (llmResult) {
    company = {
      name: llmResult.company.name || company.name,
      description: llmResult.company.description || company.description,
      industry: llmResult.company.industry || null,
      sizeBucket: llmResult.company.sizeBucket || null,
      confidence: llmResult.company.confidence || "medium",
    };
  }

  // Merge any LLM tech/signal additions (avoid duplicates)
  const finalTechStack = [...techStack];
  const techNames = new Set(techStack.map((t) => t.name.toLowerCase()));
  for (const t of llmResult?.techStackAdditions || []) {
    if (t.name && !techNames.has(t.name.toLowerCase())) {
      finalTechStack.push(t);
    }
  }

  const finalGtmSignals = [...gtmSignals];
  const signalNames = new Set(gtmSignals.map((s) => s.name.toLowerCase()));
  for (const s of llmResult?.gtmSignalsAdditions || []) {
    if (s.name && !signalNames.has(s.name.toLowerCase())) {
      finalGtmSignals.push(s);
    }
  }

  // --- Build final result ---
  const result: AnalysisResult = {
    input: { url: validation.data.url, normalizedUrl },
    company,
    techStack: finalTechStack,
    gtmSignals: finalGtmSignals,
    contacts: hunterResult || undefined,
    meta: {
      fetchedAt: new Date().toISOString(),
      httpStatus,
      timingsMs: timings,
    },
    debug: {
      title: extraction.title || undefined,
      metaDescription: extraction.metaDescription || undefined,
      linksSample: extraction.links.slice(0, 10),
    },
  };

  // --- Compute fit score ---
  result.fitScore = scoreFit(result);
  timings.total = Date.now() - startTotal;

  // --- Cache and return ---
  setCache(normalizedUrl, result);
  return Response.json(result);
}
