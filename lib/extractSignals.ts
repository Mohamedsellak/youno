/**
 * Extract signals (pages, social links, metadata) from HTML content.
 */
import * as cheerio from "cheerio";
import type { ExtractionResult, GtmSignal } from "./types";

export function extractSignals(
  html: string,
  baseUrl: string,
  headers: Record<string, string>
): { extraction: ExtractionResult; gtmSignals: GtmSignal[] } {
  const $ = cheerio.load(html);

  // --- Metadata ---
  const title = $("title").first().text().trim() || null;
  const metaDescription =
    $('meta[name="description"]').attr("content")?.trim() || null;
  const ogSiteName =
    $('meta[property="og:site_name"]').attr("content")?.trim() || null;
  const ogDescription =
    $('meta[property="og:description"]').attr("content")?.trim() || null;

  // --- Collect all links ---
  const links: string[] = [];
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href");
    if (href) {
      try {
        // convert relative urls to absolute urls
        // example : /pricing => https://example.com/pricing
        const absolute = new URL(href, baseUrl).toString();
        links.push(absolute);
      } catch {
        links.push(href);
      }
    }
  });

  // --- Detect page types via link patterns ---
  const gtmSignals: GtmSignal[] = [];
  const linkLower = links.map((l) => l.toLowerCase());
  const htmlLower = html.toLowerCase();

  // Pricing page
  const hasPricing = linkLower.some(
    (l) => l.includes("/pricing") || l.includes("/plans")
  );
  gtmSignals.push({
    name: "Pricing Page",
    value: hasPricing,
    evidence: hasPricing ? "Found /pricing or /plans link" : undefined,
  });

  // Demo / Contact CTA
  const hasDemo = linkLower.some(
    (l) =>
      l.includes("/demo") ||
      l.includes("/request-demo") ||
      l.includes("/book-demo") ||
      l.includes("/get-started") ||
      l.includes("/contact") ||
      l.includes("/contact-sales")
  );
  gtmSignals.push({
    name: "Demo/Contact CTA",
    value: hasDemo,
    evidence: hasDemo ? "Found /demo or /contact link" : undefined,
  });

  // Careers page
  const hasCareers = linkLower.some(
    (l) => l.includes("/careers") || l.includes("/jobs")
  );
  gtmSignals.push({
    name: "Careers Page",
    value: hasCareers,
    evidence: hasCareers ? "Found /careers or /jobs link" : undefined,
  });

  // Blog
  const hasBlog = linkLower.some(
    (l) => l.includes("/blog") || l.includes("/articles")
  );
  gtmSignals.push({
    name: "Blog",
    value: hasBlog,
    evidence: hasBlog ? "Found /blog or /articles link" : undefined,
  });

  // Contact forms
  const hasContactForm =
    $('form[action*="contact"]').length > 0 ||
    $('form[id*="contact"]').length > 0 ||
    $('form[class*="contact"]').length > 0;
  gtmSignals.push({
    name: "Contact Form",
    value: hasContactForm,
    evidence: hasContactForm ? "Found contact form in HTML" : undefined,
  });

  // --- Social links ---
  const hasLinkedIn = linkLower.some((l) => l.includes("linkedin.com"));
  gtmSignals.push({
    name: "LinkedIn",
    value: hasLinkedIn,
    evidence: hasLinkedIn ? "Found linkedin.com link" : undefined,
  });

  const hasTwitter = linkLower.some(
    (l) => l.includes("twitter.com") || l.includes("x.com")
  );
  gtmSignals.push({
    name: "Twitter/X",
    value: hasTwitter,
    evidence: hasTwitter ? "Found twitter.com or x.com link" : undefined,
  });

  const hasGitHub = linkLower.some((l) => l.includes("github.com"));
  gtmSignals.push({
    name: "GitHub",
    value: hasGitHub,
    evidence: hasGitHub ? "Found github.com link" : undefined,
  });

  // --- Tracking tools detection from HTML ---
  const hasGA =
    htmlLower.includes("google-analytics.com") ||
    htmlLower.includes("googletagmanager.com") ||
    htmlLower.includes("gtag(") ||
    htmlLower.includes("ga(");
  gtmSignals.push({
    name: "Google Analytics / GTM",
    value: hasGA,
    evidence: hasGA ? "Found GA/GTM scripts or tags" : undefined,
  });

  const hasSegment =
    htmlLower.includes("segment.com") ||
    htmlLower.includes("segment.io") ||
    htmlLower.includes("analytics.js");
  gtmSignals.push({
    name: "Segment",
    value: hasSegment,
    evidence: hasSegment ? "Found Segment script references" : undefined,
  });

  const hasIntercom =
    htmlLower.includes("intercom") && htmlLower.includes("widget");
  gtmSignals.push({
    name: "Intercom",
    value: hasIntercom,
    evidence: hasIntercom ? "Found Intercom widget code" : undefined,
  });

  const hasHubSpot =
    htmlLower.includes("hubspot") || htmlLower.includes("hs-script");
  gtmSignals.push({
    name: "HubSpot",
    value: hasHubSpot,
    evidence: hasHubSpot ? "Found HubSpot scripts" : undefined,
  });

  const hasHotjar =
    htmlLower.includes("hotjar") || htmlLower.includes("hj(");
  gtmSignals.push({
    name: "Hotjar",
    value: hasHotjar,
    evidence: hasHotjar ? "Found Hotjar tracking code" : undefined,
  });

  const hasStripe =
    htmlLower.includes("stripe.com") || htmlLower.includes("stripe.js");
  gtmSignals.push({
    name: "Stripe",
    value: hasStripe,
    evidence: hasStripe ? "Found Stripe payment scripts" : undefined,
  });

  // --- Extract text snippet (first 1500 chars of visible text) ---
  // 
  $("script, style, noscript, svg, iframe").remove();
  const bodyText = $("body").text().replace(/\s+/g, " ").trim();
  const textSnippet = bodyText.slice(0, 1500);

  const extraction: ExtractionResult = {
    title,
    metaDescription,
    ogSiteName,
    ogDescription,
    links: links.slice(0, 200), // cap links array
    textSnippet,
    headers,
  };

  return { extraction, gtmSignals };
}
