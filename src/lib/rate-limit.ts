const WINDOW_MS = 60_000;
const MAX_REQUESTS = 10;

interface WindowEntry {
  count: number;
  windowStart: number;
}

const windows = new Map<string, WindowEntry>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export function checkRateLimit(ip: string): RateLimitResult {
  const now = Date.now();
  const entry = windows.get(ip);

  if (!entry || now - entry.windowStart > WINDOW_MS) {
    windows.set(ip, { count: 1, windowStart: now });
    return {
      allowed: true,
      remaining: MAX_REQUESTS - 1,
      resetAt: Math.ceil((now + WINDOW_MS) / 1000),
    };
  }

  entry.count++;
  const resetAt = Math.ceil((entry.windowStart + WINDOW_MS) / 1000);

  if (entry.count > MAX_REQUESTS) {
    return {
      allowed: false,
      remaining: 0,
      resetAt,
    };
  }

  return {
    allowed: true,
    remaining: MAX_REQUESTS - entry.count,
    resetAt,
  };
}

