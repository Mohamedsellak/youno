/**
 * LLM enrichment via OpenRouter API.
 * Sends website context to an LLM and gets structured company info back.
 */
import type {
  ExtractionResult,
  TechItem,
  GtmSignal,
  LLMEnrichmentResult,
} from "./types";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

/**
 * Build the prompt that we send to the LLM.
 * We give it context about the website and ask for structured JSON back.
 */
function buildPrompt(
  url: string,
  extraction: ExtractionResult,
  detectedTech: TechItem[],
  detectedSignals: GtmSignal[]
) {
  const system = `You are an expert in company and website analysis for B2B SaaS go-to-market. Return ONLY valid JSON. No markdown, no backticks, no extra text. If unknown, use null. Keep outputs concise.`;

  const user = `Analyze this website and return structured JSON.

Input:
- url: ${url}
- title: ${extraction.title || "N/A"}
- metaDescription: ${extraction.metaDescription || "N/A"}
- detectedTech: ${JSON.stringify(detectedTech.map((t) => t.name))}
- detectedSignals: ${JSON.stringify(detectedSignals.filter((s) => s.value).map((s) => s.name))}
- extractedTextSnippet: ${extraction.textSnippet.slice(0, 1500)}

Return JSON exactly in this format:
{
  "company": {
    "name": "... or null",
    "description": "1-2 sentence description or null",
    "industry": "... or null",
    "sizeBucket": "solo|small|mid|enterprise|null",
    "confidence": "low|medium|high"
  },
  "techStackAdditions": [
    { "name": "...", "category": "frontend|backend|analytics|crm_marketing|support_chat|payments|infra_security|other", "evidence": "..." }
  ],
  "gtmSignalsAdditions": [
    { "name": "...", "value": true, "evidence": "..." }
  ]
}`;

  return { system, user };
}

/**
 * Call the OpenRouter API with the given model.
 * Returns parsed result or null if anything goes wrong.
 */
async function callLLM(
  apiKey: string,
  model: string,
  system: string,
  user: string
): Promise<LLMEnrichmentResult | null> {
  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://youno.vercel.app",
      "X-Title": "Youno Website Analyzer",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.3,
      max_tokens: 1024,
    }),
    signal: AbortSignal.timeout(15000), // 15s timeout
  });

  if (!response.ok) {
    console.warn(`[LLM] ${model} returned ${response.status}`);
    return null;
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) return null;

  // Clean up the response — some models wrap JSON in markdown code fences
  let jsonStr = content.trim();
  const fenceMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    jsonStr = fenceMatch[1].trim();
  }

  const parsed = JSON.parse(jsonStr) as LLMEnrichmentResult;
  if (!parsed.company) return null;

  // Validate enum values
  if (!["low", "medium", "high"].includes(parsed.company.confidence)) {
    parsed.company.confidence = "low";
  }
  if (parsed.company.sizeBucket && !["solo", "small", "mid", "enterprise"].includes(parsed.company.sizeBucket)) {
    parsed.company.sizeBucket = null;
  }

  return parsed;
}

/**
 * Main enrichment function.
 * Tries the configured model first, falls back to alternatives if rate-limited.
 */
export async function enrichWithLLM(
  url: string,
  extraction: ExtractionResult,
  detectedTech: TechItem[],
  detectedSignals: GtmSignal[]
): Promise<LLMEnrichmentResult | null> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.warn("[LLM] No OPENROUTER_API_KEY, skipping enrichment");
    return null;
  }

  const { system, user } = buildPrompt(url, extraction, detectedTech, detectedSignals);

  // Try primary model, then fallbacks if rate-limited
  const models = [
    process.env.OPENROUTER_MODEL || "google/gemma-4-31b-it:free",
    "meta-llama/llama-3.3-70b-instruct:free",
    "deepseek/deepseek-v4-flash:free",
  ];

  for (const model of models) {
    try {
      const result = await callLLM(apiKey, model, system, user);
      if (result) {
        console.log(`[LLM] Success with ${model}`);
        return result;
      }
    } catch (err) {
      console.warn(`[LLM] ${model} failed:`, err);
    }
  }

  console.warn("[LLM] All models failed, continuing without LLM enrichment");
  return null;
}
