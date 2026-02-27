"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import CopyButton from "@/components/CopyButton";
import ClickChart from "@/components/ClickChart";
import StatsCard from "@/components/StatsCard";
import QRCode from "@/components/QRCode";

interface LinkInfo {
  id: string;
  shortCode: string;
  shortUrl: string;
  originalUrl: string;
  createdAt: string;
  totalClicks: number;
}

interface StatsData {
  link: LinkInfo;
  clicksPerDay: { date: string; clicks: number }[];
  topReferrers: { referrer: string; clicks: number }[];
  topCountries: { country: string; clicks: number }[];
  topBrowsers: { browser: string; clicks: number }[];
  topDevices: { device: string; clicks: number }[];
}

const RANGES = [7, 14, 30, 90] as const;

export default function DashboardPage() {
  const params = useParams<{ code: string }>();
  const code = params.code;
  const [days, setDays] = useState<number>(7);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/links/${code}/stats?days=${days}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then((data) => {
        setStats(data);
        setError("");
      })
      .catch(() => setError("Link not found."))
      .finally(() => setLoading(false));
  }, [code, days]);

  if (error) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4">
        <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
        <Link href="/" className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 text-sm transition-colors">
          Back to home
        </Link>
      </main>
    );
  }

  if (loading || !stats) {
    return (
      <main className="min-h-screen px-4 py-8 max-w-4xl mx-auto">
        <div className="h-4 w-16 bg-stone-200 dark:bg-stone-800 rounded animate-pulse" />
        <div className="mt-6 rounded-2xl bg-white dark:bg-stone-900 shadow-card p-6 mb-6 animate-pulse">
          <div className="h-7 w-64 bg-stone-200 dark:bg-stone-800 rounded mb-3" />
          <div className="h-4 w-96 bg-stone-200 dark:bg-stone-800 rounded mb-3" />
          <div className="h-4 w-48 bg-stone-200 dark:bg-stone-800 rounded" />
        </div>
        <div className="flex gap-2 mb-6">
          {RANGES.map((r) => (
            <div key={r} className="h-9 w-14 bg-stone-200 dark:bg-stone-800 rounded-full animate-pulse" />
          ))}
        </div>
        <div className="rounded-2xl bg-white dark:bg-stone-900 shadow-card p-6 mb-6 animate-pulse h-56" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-40 rounded-2xl bg-white dark:bg-stone-900 shadow-card animate-pulse" />
          ))}
        </div>
      </main>
    );
  }

  const { link } = stats;

  return (
    <main className="min-h-screen px-4 py-8 max-w-4xl mx-auto">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back
      </Link>

      {/* Header Card */}
      <div className="mt-6 mb-6 rounded-2xl bg-white dark:bg-stone-900 shadow-md p-6">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400">
            {link.shortUrl}
          </h1>
          <CopyButton text={link.shortUrl} />
        </div>
        <a
          href={link.originalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 break-all transition-colors"
        >
          {link.originalUrl}
        </a>
        <div className="flex gap-4 mt-4">
          <span className="inline-flex items-center bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-full px-3 py-1 text-sm font-medium">
            {link.totalClicks} click{link.totalClicks !== 1 ? "s" : ""}
          </span>
          <span className="inline-flex items-center text-sm text-stone-500 dark:text-stone-400">
            Created {new Date(link.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* QR Code Card */}
      <div className="rounded-2xl bg-white dark:bg-stone-900 shadow-md p-6 mb-6 flex items-center gap-6">
        <QRCode shortCode={link.shortCode} size="lg" />
        <div className="text-sm text-stone-500 dark:text-stone-400">
          <p>Scan to open this link, or download the QR code for print.</p>
        </div>
      </div>

      {/* Time range selector */}
      <div className="flex gap-2 mb-6">
        {RANGES.map((r) => (
          <button
            key={r}
            onClick={() => setDays(r)}
            className={`px-4 py-2 text-sm rounded-full font-medium transition-all ${
              days === r
                ? "bg-blue-600 text-white dark:bg-blue-500 shadow-md"
                : "bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 shadow-card hover:shadow-md"
            }`}
          >
            {r}d
          </button>
        ))}
      </div>

      {link.totalClicks === 0 ? (
        <p className="text-stone-400 dark:text-stone-500 text-sm text-center py-12">
          No clicks yet — share your link to start tracking!
        </p>
      ) : (
        <>
          {/* Clicks per day chart */}
          <div className="rounded-2xl bg-white dark:bg-stone-900 shadow-md p-6 mb-6">
            <h2 className="text-sm font-semibold text-stone-600 dark:text-stone-400 mb-4">
              Clicks per day
            </h2>
            <ClickChart data={stats.clicksPerDay} />
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StatsCard
              title="Top Referrers"
              items={stats.topReferrers.map((r) => ({
                label: r.referrer,
                count: r.clicks,
              }))}
            />
            <StatsCard
              title="Top Countries"
              items={stats.topCountries.map((c) => ({
                label: c.country,
                count: c.clicks,
              }))}
            />
            <StatsCard
              title="Top Browsers"
              items={stats.topBrowsers.map((b) => ({
                label: b.browser,
                count: b.clicks,
              }))}
            />
            <StatsCard
              title="Top Devices"
              items={stats.topDevices.map((d) => ({
                label: d.device,
                count: d.clicks,
              }))}
            />
          </div>
        </>
      )}
    </main>
  );
}
