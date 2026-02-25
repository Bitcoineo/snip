import { eq, and, gte, sql, count, desc } from "drizzle-orm";
import { db } from "@/db";
import { clicks } from "@/db/schema";

function cutoffDate(days: number): Date {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - days + 1);
  return d;
}

function allDatesInRange(days: number): string[] {
  const dates: string[] = [];
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  for (let i = days - 1; i >= 0; i--) {
    const dt = new Date(d);
    dt.setUTCDate(dt.getUTCDate() - i);
    dates.push(dt.toISOString().slice(0, 10));
  }
  return dates;
}

export async function getClicksPerDay(
  linkId: string,
  days: number
): Promise<
  | { data: { date: string; clicks: number }[] }
  | { error: string; message: string }
> {
  try {
    const cutoff = cutoffDate(days);
    const rows = await db
      .select({
        date: sql<string>`date(${clicks.clickedAt}, 'unixepoch')`,
        clicks: count(),
      })
      .from(clicks)
      .where(and(eq(clicks.linkId, linkId), gte(clicks.clickedAt, cutoff)))
      .groupBy(sql`date(${clicks.clickedAt}, 'unixepoch')`)
      .orderBy(sql`date(${clicks.clickedAt}, 'unixepoch')`);

    const dbMap = new Map(rows.map((r) => [r.date, Number(r.clicks)]));
    const filled = allDatesInRange(days).map((date) => ({
      date,
      clicks: dbMap.get(date) ?? 0,
    }));

    return { data: filled };
  } catch {
    return { error: "QUERY_FAILED", message: "Failed to get clicks per day." };
  }
}

export async function getTopReferrers(
  linkId: string,
  days: number
): Promise<
  | { data: { referrer: string; clicks: number }[] }
  | { error: string; message: string }
> {
  try {
    const cutoff = cutoffDate(days);
    const rows = await db
      .select({
        referrer: sql<string>`coalesce(${clicks.referrer}, 'direct')`,
        clicks: count(),
      })
      .from(clicks)
      .where(and(eq(clicks.linkId, linkId), gte(clicks.clickedAt, cutoff)))
      .groupBy(clicks.referrer)
      .orderBy(desc(count()))
      .limit(10);

    return { data: rows.map((r) => ({ ...r, clicks: Number(r.clicks) })) };
  } catch {
    return { error: "QUERY_FAILED", message: "Failed to get top referrers." };
  }
}

export async function getTopCountries(
  linkId: string,
  days: number
): Promise<
  | { data: { country: string; clicks: number }[] }
  | { error: string; message: string }
> {
  try {
    const cutoff = cutoffDate(days);
    const rows = await db
      .select({
        country: sql<string>`coalesce(${clicks.country}, 'Unknown')`,
        clicks: count(),
      })
      .from(clicks)
      .where(and(eq(clicks.linkId, linkId), gte(clicks.clickedAt, cutoff)))
      .groupBy(clicks.country)
      .orderBy(desc(count()))
      .limit(10);

    return { data: rows.map((r) => ({ ...r, clicks: Number(r.clicks) })) };
  } catch {
    return { error: "QUERY_FAILED", message: "Failed to get top countries." };
  }
}

export async function getTopBrowsers(
  linkId: string,
  days: number
): Promise<
  | { data: { browser: string; clicks: number }[] }
  | { error: string; message: string }
> {
  try {
    const cutoff = cutoffDate(days);
    const rows = await db
      .select({
        browser: sql<string>`coalesce(${clicks.browser}, 'Unknown')`,
        clicks: count(),
      })
      .from(clicks)
      .where(and(eq(clicks.linkId, linkId), gte(clicks.clickedAt, cutoff)))
      .groupBy(clicks.browser)
      .orderBy(desc(count()))
      .limit(10);

    return { data: rows.map((r) => ({ ...r, clicks: Number(r.clicks) })) };
  } catch {
    return { error: "QUERY_FAILED", message: "Failed to get top browsers." };
  }
}

export async function getTopDevices(
  linkId: string,
  days: number
): Promise<
  | { data: { device: string; clicks: number }[] }
  | { error: string; message: string }
> {
  try {
    const cutoff = cutoffDate(days);
    const rows = await db
      .select({
        device: sql<string>`coalesce(${clicks.device}, 'Unknown')`,
        clicks: count(),
      })
      .from(clicks)
      .where(and(eq(clicks.linkId, linkId), gte(clicks.clickedAt, cutoff)))
      .groupBy(clicks.device)
      .orderBy(desc(count()))
      .limit(10);

    return { data: rows.map((r) => ({ ...r, clicks: Number(r.clicks) })) };
  } catch {
    return { error: "QUERY_FAILED", message: "Failed to get top devices." };
  }
}

export async function getLinkStats(
  linkId: string,
  days: number
): Promise<
  | {
      data: {
        clicksPerDay: { date: string; clicks: number }[];
        topReferrers: { referrer: string; clicks: number }[];
        topCountries: { country: string; clicks: number }[];
        topBrowsers: { browser: string; clicks: number }[];
        topDevices: { device: string; clicks: number }[];
      };
    }
  | { error: string; message: string }
> {
  const [perDay, referrers, countries, browsers, devices] = await Promise.all([
    getClicksPerDay(linkId, days),
    getTopReferrers(linkId, days),
    getTopCountries(linkId, days),
    getTopBrowsers(linkId, days),
    getTopDevices(linkId, days),
  ]);

  if ("error" in perDay) return perDay;
  if ("error" in referrers) return referrers;
  if ("error" in countries) return countries;
  if ("error" in browsers) return browsers;
  if ("error" in devices) return devices;

  return {
    data: {
      clicksPerDay: perDay.data,
      topReferrers: referrers.data,
      topCountries: countries.data,
      topBrowsers: browsers.data,
      topDevices: devices.data,
    },
  };
}
