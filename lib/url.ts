/**
 * URL normalization and SSRF protection utilities.
 */

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "[::1]",
  "metadata.google.internal",
  "169.254.169.254",
]);

/** Check if hostname is a private/internal IP range */
function isPrivateIP(hostname: string): boolean {
  // Remove brackets for IPv6
  const clean = hostname.replace(/^\[|\]$/g, "");

  // IPv4 private ranges
  const ipv4Parts = clean.split(".").map(Number);
  if (ipv4Parts.length === 4 && ipv4Parts.every((p) => !isNaN(p))) {
    // 10.0.0.0/8
    if (ipv4Parts[0] === 10) return true;
    // 172.16.0.0/12
    if (ipv4Parts[0] === 172 && ipv4Parts[1] >= 16 && ipv4Parts[1] <= 31)
      return true;
    // 192.168.0.0/16
    if (ipv4Parts[0] === 192 && ipv4Parts[1] === 168) return true;
    // 127.0.0.0/8
    if (ipv4Parts[0] === 127) return true;
    // 169.254.0.0/16 (link-local)
    if (ipv4Parts[0] === 169 && ipv4Parts[1] === 254) return true;
    // 0.0.0.0
    if (ipv4Parts.every((p) => p === 0)) return true;
  }

  return false;
}

/**
 * Normalize a user-provided URL string into a valid, safe HTTPS URL.
 * Accepts bare domains like "stripe.com" as well as full URLs.
 * @throws Error if the URL is invalid or blocked (SSRF).
 */
export function normalizeUrl(input: string): string {
  let raw = input.trim();

  // Strip trailing slashes for normalization
  raw = raw.replace(/\/+$/, "");

  // Add protocol if missing
  if (!raw.includes("://")) {
    raw = `https://${raw}`;
  }

  // Force HTTPS
  raw = raw.replace(/^http:\/\//i, "https://");

  const parsed = new URL(raw);

  // Only allow http(s)
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error(`Blocked protocol: ${parsed.protocol}`);
  }

  const hostname = parsed.hostname.toLowerCase();

  // Block known dangerous hostnames
  if (BLOCKED_HOSTNAMES.has(hostname)) {
    throw new Error(`Blocked hostname: ${hostname}`);
  }

  // Block .local domains
  if (hostname.endsWith(".local")) {
    throw new Error(`Blocked .local domain: ${hostname}`);
  }

  // Block private IP ranges
  if (isPrivateIP(hostname)) {
    throw new Error(`Blocked private IP: ${hostname}`);
  }

  return parsed.toString();
}

/** Extract the bare domain from a URL string (e.g. "stripe.com") */
export function extractDomain(url: string): string {
  try {
    const normalized = url.includes("://") ? url : `https://${url}`;
    return new URL(normalized).hostname.replace(/^www\./, "");
  } catch {
    return url.replace(/^(https?:\/\/)?(www\.)?/, "").split("/")[0];
  }
}
