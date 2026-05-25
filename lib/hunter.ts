/**
 * Hunter.io API integration for email/domain enrichment.
 * Gracefully degrades if API key is missing or call fails.
 */
import type { ContactsInfo } from "./types";

const HUNTER_API_BASE = "https://api.hunter.io/v2";

export async function hunterEnrich(
  domain: string
): Promise<ContactsInfo | null> {
  const apiKey = process.env.HUNTER_API_KEY;

  if (!apiKey) {
    console.warn("[Hunter] No API key configured, skipping enrichment");
    return null;
  }

  try {
    const url = new URL(`${HUNTER_API_BASE}/domain-search`);
    url.searchParams.set("domain", domain);
    url.searchParams.set("api_key", apiKey);
    url.searchParams.set("limit", "5");

    const response = await fetch(url.toString(), {
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      console.warn(
        `[Hunter] API returned ${response.status}: ${response.statusText}`
      );
      return null;
    }

    const data = await response.json();
    const emails =
      data?.data?.emails?.slice(0, 5).map(
        (e: {
          value?: string;
          type?: string;
          confidence?: number;
          first_name?: string;
          last_name?: string;
          position?: string;
        }) => ({
          value: e.value,
          type: e.type || undefined,
          confidence: e.confidence?.toString() || undefined,
          firstName: e.first_name || undefined,
          lastName: e.last_name || undefined,
          position: e.position || undefined,
        })
      ) || [];

    return {
      domain,
      source: "hunter" as const,
      emails: emails.length > 0 ? emails : undefined,
    };
  } catch (error) {
    console.error("[Hunter] Enrichment failed:", error);
    return null;
  }
}
