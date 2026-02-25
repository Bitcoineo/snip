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
        <p className="text-red-400 mb-4">{error}</p>
        <Link href="/" className="text-blue-400 hover:text-blue-300 text-sm">
          Back to home
        </Link>
      </main>
    );
  }

  if (loading || !stats) {
    return (
      <main className="min-h-screen px-4 py-8 max-w-4xl mx-auto">
        <div className="h-4 w-16 bg-zinc-800 rounded animate-pulse" />
        <div className="mt-6 mb-8">
          <div className="h-8 w-64 bg-zinc-800 rounded animate-pulse mb-2" />
          <div className="h-4 w-96 bg-zinc-800 rounded animate-pulse mb-3" />
          <div className="h-4 w-48 bg-zinc-800 rounded animate-pulse" />
        </div>
        <div className="flex gap-2 mb-6">
          {RANGES.map((r) => (
            <div key={r} className="h-8 w-12 bg-zinc-800 rounded-md animate-pulse" />
          ))}
        </div>
        <div className="h-48 rounded-lg bg-zinc-900 border border-zinc-800 animate-pulse mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-40 rounded-lg bg-zinc-900 border border-zinc-800 animate-pulse" />
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
        className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
      >
        &larr; Back
      </Link>

      {/* Header */}
      <div className="mt-6 mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold font-mono text-blue-400">
            {link.shortUrl}
          </h1>
          <CopyButton text={link.shortUrl} />
        </div>
        <a
          href={link.originalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-zinc-500 hover:text-zinc-300 break-all"
        >
          {link.originalUrl}
        </a>
        <div className="flex gap-6 mt-3 text-sm text-zinc-400">
          <span>
            <strong className="text-white">{link.totalClicks}</strong> total
            clicks
          </span>
          <span>
            Created {new Date(link.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* QR Code */}
      <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800 mb-6 flex items-center gap-6">
        <QRCode shortCode={link.shortCode} size="lg" />
        <div className="text-sm text-zinc-400">
          <p>Scan to open this link, or download the QR code for print.</p>
        </div>
      </div>

      {/* Time range selector */}
      <div className="flex gap-2 mb-6">
        {RANGES.map((r) => (
          <button
            key={r}
            onClick={() => setDays(r)}
            className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
              days === r
                ? "bg-white text-black border-white"
                : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-600"
            }`}
          >
            {r}d
          </button>
        ))}
      </div>

      {link.totalClicks === 0 ? (
        <p className="text-zinc-500 text-sm text-center py-12">
          No clicks yet — share your link to start tracking!
        </p>
      ) : (
        <>
          {/* Clicks per day chart */}
          <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800 mb-6">
            <h2 className="text-sm font-medium text-zinc-400 mb-4">
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
