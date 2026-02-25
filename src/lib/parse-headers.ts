import { UAParser } from "ua-parser-js";

export interface ClickMetadata {
  referrer: string | null;
  country: string | null;
  device: string | null;
  browser: string | null;
}

function normalizeReferrer(raw: string | null): string | null {
  if (!raw) return null;
  try {
    return new URL(raw).hostname || null;
  } catch {
    return null;
  }
}

function classifyDevice(type: string | undefined): string | null {
  if (!type) return "desktop";
  if (type === "mobile") return "mobile";
  if (type === "tablet") return "tablet";
  return "desktop";
}

export function parseHeaders(headers: Headers): ClickMetadata {
  const referrer = normalizeReferrer(headers.get("referer"));
  const country = headers.get("x-vercel-ip-country") ?? null;

  const ua = headers.get("user-agent") ?? "";
  const parsed = new UAParser(ua);
  const browser = parsed.getBrowser().name ?? null;
  const device = classifyDevice(parsed.getDevice().type);

  return { referrer, country, device, browser };
}
