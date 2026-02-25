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
    <div className="space-y-2">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 animate-pulse"
        >
          <div className="h-4 bg-zinc-800 rounded w-48 mb-2" />
          <div className="h-3 bg-zinc-800 rounded w-72 mb-1" />
          <div className="h-3 bg-zinc-800 rounded w-24" />
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
    return <p className="text-sm text-red-400">{error}</p>;
  }

  if (links.length === 0) {
    return (
      <p className="text-zinc-500 text-sm text-center py-8">
        No links yet — shorten your first URL above!
      </p>
    );
  }

  return (
    <div className="w-full max-w-xl">
      <h2 className="text-sm font-medium text-zinc-400 mb-3">Recent Links</h2>
      <div className="space-y-2">
        {links.map((link) => (
          <button
            key={link.id}
            onClick={() => router.push(`/dashboard/${link.shortCode}`)}
            className="w-full text-left p-3 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-600 transition-colors"
          >
            <div className="flex items-center justify-between gap-4">
              <span className="font-mono text-blue-400 text-sm truncate">
                {link.shortUrl}
              </span>
              <span className="text-xs text-zinc-500 whitespace-nowrap">
                {link.totalClicks} click{link.totalClicks !== 1 ? "s" : ""}
              </span>
            </div>
            <p className="text-xs text-zinc-500 truncate mt-1">
              {link.originalUrl}
            </p>
            <p className="text-xs text-zinc-600 mt-1">
              {new Date(link.createdAt).toLocaleDateString()}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
