/**
 * Simple in-memory rate limiter.
 * Tracks request timestamps per IP and blocks if too many in the window.
 */

const MAX_REQUESTS = parseInt(process.env.APP_RATE_LIMIT_MAX || "10", 10);
const WINDOW_MS = parseInt(process.env.APP_RATE_LIMIT_WINDOW_MS || "600000", 10); // 10 min

// Store: IP -> array of request timestamps
//example store = {
//  "[IP_ADDRESS]": [1716345600000, 1716345601000, 1716345602000],
//  "[IP_ADDRESS]": [1716345603000, 1716345604000, 1716345605000],
// };
const store = new Map<string, number[]>();

export function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();

  // Get or create the timestamps array for this IP
  const timestamps = store.get(ip) || [];

  // Remove old timestamps outside the window
  const recent = timestamps.filter((t) => now - t < WINDOW_MS);

  if (recent.length >= MAX_REQUESTS) {
    store.set(ip, recent);
    return { allowed: false, remaining: 0 };
  }

  // Add current request 
  recent.push(now);
  store.set(ip, recent);

  return { allowed: true, remaining: MAX_REQUESTS - recent.length };
}
