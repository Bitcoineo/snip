"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface LinkItem {
  id: string;
  shortCode: string;
  shortUrl: string;
  originalUrl: string;
  totalClicks: number;
  createdAt: string;
}

function Skeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="rounded-2xl bg-white dark:bg-stone-900 shadow-card p-4 animate-pulse"
        >
          <div className="h-4 bg-stone-200 dark:bg-stone-800 rounded w-40 mb-3" />
          <div className="h-3 bg-stone-200 dark:bg-stone-800 rounded w-full mb-2" />
          <div className="h-3 bg-stone-200 dark:bg-stone-800 rounded w-20" />
        </div>
      ))}
    </div>
  );
}

export default function LinkList({ refreshKey }: { refreshKey: number }) {
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    setError("");
    fetch("/api/links?limit=10")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load");
        return r.json();
      })
      .then((data) => setLinks(data.links ?? []))
      .catch(() => setError("Could not load links. Please try again."))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  if (loading) return <Skeleton />;

  if (error) {
    return <p className="text-sm text-red-600 dark:text-red-400">{error}</p>;
  }

  if (links.length === 0) {
    return (
      <p className="text-stone-400 dark:text-stone-500 text-sm text-center py-12">
        No links yet — shorten your first URL above!
      </p>
    );
  }

  return (
    <div className="w-full">
      <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-50 mb-4">
        Recent Links
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {links.map((link) => (
          <button
            key={link.id}
            onClick={() => router.push(`/dashboard/${link.shortCode}`)}
            className="text-left rounded-2xl bg-white dark:bg-stone-900 shadow-card p-4 hover:scale-[1.02] hover:shadow-lg transition-all duration-200 cursor-pointer"
          >
            <div className="flex items-center justify-between gap-3 mb-2">
              <span className="font-mono text-blue-600 dark:text-blue-400 text-sm truncate">
                {link.shortUrl}
              </span>
              <span className="flex-shrink-0 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-full px-2.5 py-0.5 text-xs font-medium">
                {link.totalClicks} click{link.totalClicks !== 1 ? "s" : ""}
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 truncate">
              {link.originalUrl}
            </p>
            <p className="text-xs text-stone-400 dark:text-stone-600 mt-1.5">
              {new Date(link.createdAt).toLocaleDateString()}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
