/**
 * Fetch HTML from a URL with timeout and size limits.
 */

const TIMEOUT_MS = 10_000; // 10 seconds
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

export async function fetchHtml(url: string): Promise<{
  html: string;
  status: number;
  headers: Record<string, string>;
}> {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; YounoBot/1.0)",
      Accept: "text/html,application/xhtml+xml",
    },
    redirect: "follow",
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  // Check size from header (if available)
  const contentLength = response.headers.get("content-length");
  if (contentLength && parseInt(contentLength) > MAX_SIZE) {
    throw new Error(`Response too large: ${contentLength} bytes`);
  }

  const html = await response.text();

  // Check actual size
  if (html.length > MAX_SIZE) {
    throw new Error(`Response too large: ${html.length} bytes`);
  }

  // Collect headers into a plain object
  const headers: Record<string, string> = {};
  response.headers.forEach((value, key) => {
    headers[key.toLowerCase()] = value;
  });

  return { html, status: response.status, headers };
}
