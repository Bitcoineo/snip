import { UAParser } from "ua-parser-js";

const parser = new UAParser();

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

const DEVICE_TYPES = new Set(["mobile", "tablet"]);

function classifyDevice(type: string | undefined): string {
  return type && DEVICE_TYPES.has(type) ? type : "desktop";
}

export function parseHeaders(headers: Headers): ClickMetadata {
  const referrer = normalizeReferrer(headers.get("referer"));
  const country = headers.get("x-vercel-ip-country") ?? null;

  const ua = headers.get("user-agent") ?? "";
  parser.setUA(ua);
  const browser = parser.getBrowser().name ?? null;
  const device = classifyDevice(parser.getDevice().type);

  return { referrer, country, device, browser };
}
