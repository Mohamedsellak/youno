/**
 * B2B SaaS Fit Score calculator.
 * Transparent, rules-based scoring with explanations.
 */
import type { AnalysisResult, FitScore } from "./types";

export function scoreFit(result: AnalysisResult): FitScore {
  let score = 5; // Start at baseline
  const reasons: string[] = [];

  const signalMap = new Map(
    result.gtmSignals.map((s) => [s.name, s.value])
  );
  const techNames = new Set(
    result.techStack.map((t) => t.name.toLowerCase())
  );

  // +2 pricing page
  if (signalMap.get("Pricing Page")) {
    score += 2;
    reasons.push("+2: Has a pricing page (strong SaaS indicator)");
  }

  // +2 demo CTA
  if (signalMap.get("Demo/Contact CTA")) {
    score += 2;
    reasons.push("+2: Has demo/contact CTA (sales-led GTM)");
  }

  // +1 blog
  if (signalMap.get("Blog")) {
    score += 1;
    reasons.push("+1: Has a blog (content marketing)");
  }

  // +1 careers
  if (signalMap.get("Careers Page")) {
    score += 1;
    reasons.push("+1: Has careers page (growing company)");
  }

  // +1 if Segment/HubSpot/Intercom detected
  const hasMarketingTools =
    signalMap.get("Segment") ||
    signalMap.get("HubSpot") ||
    signalMap.get("Intercom") ||
    techNames.has("segment") ||
    techNames.has("hubspot") ||
    techNames.has("intercom");
  if (hasMarketingTools) {
    score += 1;
    reasons.push("+1: Uses B2B marketing/support tools (Segment/HubSpot/Intercom)");
  }

  // -2 Shopify detected
  if (techNames.has("shopify")) {
    score -= 2;
    reasons.push("-2: Shopify detected (e-commerce, not SaaS)");
  }

  // -1 WordPress detected
  if (techNames.has("wordpress")) {
    score -= 1;
    reasons.push("-1: WordPress detected (likely brochure site)");
  }

  // Clamp 0..10
  score = Math.max(0, Math.min(10, score));

  // Label
  let label: FitScore["label"];
  if (score <= 3) label = "low";
  else if (score <= 7) label = "medium";
  else label = "high";

  return { score, label, reasons };
}
