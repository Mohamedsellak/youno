/**
 * Detect tech stack from HTML content and response headers.
 * Uses simple string matching — no complex regex.
 */
import type { TechItem } from "./types";

export function detectTech(
  html: string,
  headers: Record<string, string>
): TechItem[] {
  const detected: TechItem[] = [];
  const lowerHtml = html.toLowerCase();

  // Helper: only add if not already detected
  function add(name: string, category: TechItem["category"], evidence: string) {
    if (!detected.some((t) => t.name === name)) {
      detected.push({ name, category, evidence });
    }
  }

  // --- Frontend ---
  if (lowerHtml.includes("react-dom") || lowerHtml.includes("__next_data__")) {
    add("React", "frontend", "Found react-dom or __NEXT_DATA__ in HTML");
  }
  if (lowerHtml.includes("__next_data__") || lowerHtml.includes("/_next/static")) {
    add("Next.js", "frontend", "Found Next.js markers in HTML");
  }
  if (lowerHtml.includes("vue.js") || lowerHtml.includes("v-cloak")) {
    add("Vue.js", "frontend", "Found Vue.js markers in HTML");
  }
  if (lowerHtml.includes("ng-version") || lowerHtml.includes("angular")) {
    add("Angular", "frontend", "Found Angular markers in HTML");
  }
  if (lowerHtml.includes("tailwindcss") || lowerHtml.includes("tailwind.css")) {
    add("Tailwind CSS", "frontend", "Found Tailwind references");
  }
  if (lowerHtml.includes("bootstrap.min") || lowerHtml.includes("bootstrap.css")) {
    add("Bootstrap", "frontend", "Found Bootstrap references");
  }

  // --- Backend / CMS ---
  if (lowerHtml.includes("wp-content") || lowerHtml.includes("wp-includes")) {
    add("WordPress", "backend", "Found wp-content or wp-includes paths");
  }
  if (lowerHtml.includes("cdn.shopify.com") || lowerHtml.includes("myshopify.com")) {
    add("Shopify", "backend", "Found Shopify CDN references");
  }
  if (lowerHtml.includes("webflow.com")) {
    add("Webflow", "frontend", "Found Webflow references");
  }

  // --- Analytics ---
  if (lowerHtml.includes("google-analytics.com") || lowerHtml.includes("googletagmanager.com") || lowerHtml.includes("gtag(")) {
    add("Google Analytics", "analytics", "Found GA/GTM scripts");
  }
  if (lowerHtml.includes("segment.com") || lowerHtml.includes("segment.io")) {
    add("Segment", "analytics", "Found Segment scripts");
  }
  if (lowerHtml.includes("hotjar")) {
    add("Hotjar", "analytics", "Found Hotjar scripts");
  }
  if (lowerHtml.includes("mixpanel")) {
    add("Mixpanel", "analytics", "Found Mixpanel scripts");
  }
  if (lowerHtml.includes("amplitude")) {
    add("Amplitude", "analytics", "Found Amplitude scripts");
  }

  // --- CRM / Marketing ---
  if (lowerHtml.includes("hubspot") || lowerHtml.includes("hs-script")) {
    add("HubSpot", "crm_marketing", "Found HubSpot scripts");
  }
  if (lowerHtml.includes("salesforce") || lowerHtml.includes("pardot")) {
    add("Salesforce", "crm_marketing", "Found Salesforce references");
  }
  if (lowerHtml.includes("marketo") || lowerHtml.includes("munchkin")) {
    add("Marketo", "crm_marketing", "Found Marketo scripts");
  }

  // --- Support / Chat ---
  if (lowerHtml.includes("intercomcdn") || lowerHtml.includes("widget.intercom.io")) {
    add("Intercom", "support_chat", "Found Intercom widget");
  }
  if (lowerHtml.includes("zendesk") || lowerHtml.includes("zdassets")) {
    add("Zendesk", "support_chat", "Found Zendesk scripts");
  }
  if (lowerHtml.includes("crisp.chat")) {
    add("Crisp", "support_chat", "Found Crisp chat widget");
  }
  if (lowerHtml.includes("drift.com")) {
    add("Drift", "crm_marketing", "Found Drift chat");
  }

  // --- Payments ---
  if (lowerHtml.includes("js.stripe.com") || lowerHtml.includes("stripe.js")) {
    add("Stripe", "payments", "Found Stripe payment scripts");
  }
  if (lowerHtml.includes("paypal.com") || lowerHtml.includes("paypalobjects")) {
    add("PayPal", "payments", "Found PayPal scripts");
  }

  // --- Infra (from headers) ---
  const server = headers["server"]?.toLowerCase() || "";
  if (server.includes("cloudflare") || lowerHtml.includes("cloudflare")) {
    add("Cloudflare", "infra_security", "Detected via server header or HTML");
  }
  if (headers["x-vercel-id"]) {
    add("Vercel", "infra_security", "Detected via x-vercel-id header");
  }
  if (server.includes("netlify")) {
    add("Netlify", "infra_security", "Detected via server header");
  }
  if (headers["x-amz-cf-id"] || server.includes("cloudfront")) {
    add("AWS CloudFront", "infra_security", "Detected via AWS headers");
  }

  return detected;
}
