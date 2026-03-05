import { eq, and, gte, sql, count, desc } from "drizzle-orm";
import type { SQLiteColumn } from "drizzle-orm/sqlite-core";
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

const TOP_LIMIT = 10;

export async function getClicksPerDay(
  linkId: string,
  days: number
): Promise<
  | { data: { date: string; clicks: number }[] }
  | { error: string; message: string }
> {
  try {
    const cutoff = cutoffDate(days);
    const dateExpr = sql<string>`date(${clicks.clickedAt}, 'unixepoch')`;
    const rows = await db
      .select({ date: dateExpr, clicks: count() })
      .from(clicks)
      .where(and(eq(clicks.linkId, linkId), gte(clicks.clickedAt, cutoff)))
      .groupBy(dateExpr)
      .orderBy(dateExpr);

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

async function getTopBreakdown(
  linkId: string,
  days: number,
  column: SQLiteColumn,
  fallback: string
): Promise<
  | { data: { label: string; count: number }[] }
  | { error: string; message: string }
> {
  try {
    const cutoff = cutoffDate(days);
    const rows = await db
      .select({
        label: sql<string>`coalesce(${column}, ${fallback})`,
        count: count(),
      })
      .from(clicks)
      .where(and(eq(clicks.linkId, linkId), gte(clicks.clickedAt, cutoff)))
      .groupBy(column)
      .orderBy(desc(count()))
      .limit(TOP_LIMIT);

    return { data: rows.map((r) => ({ label: r.label, count: Number(r.count) })) };
  } catch {
    return { error: "QUERY_FAILED", message: "Failed to get breakdown." };
  }
}

export async function getLinkStats(
  linkId: string,
  days: number
): Promise<
  | {
      data: {
        clicksPerDay: { date: string; clicks: number }[];
        topReferrers: { label: string; count: number }[];
        topCountries: { label: string; count: number }[];
        topBrowsers: { label: string; count: number }[];
        topDevices: { label: string; count: number }[];
      };
    }
  | { error: string; message: string }
> {
  const [perDay, referrers, countries, browsers, devices] = await Promise.all([
    getClicksPerDay(linkId, days),
    getTopBreakdown(linkId, days, clicks.referrer, "direct"),
    getTopBreakdown(linkId, days, clicks.country, "Unknown"),
    getTopBreakdown(linkId, days, clicks.browser, "Unknown"),
    getTopBreakdown(linkId, days, clicks.device, "Unknown"),
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
