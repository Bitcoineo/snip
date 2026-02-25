"use client";

import { useState } from "react";
import CopyButton from "./CopyButton";
import QRCode from "./QRCode";

interface CreatedLink {
  shortCode: string;
  shortUrl: string;
  originalUrl: string;
}

export default function ShortenForm({
  onCreated,
}: {
  onCreated?: () => void;
}) {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<CreatedLink | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);

    try {
      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Something went wrong.");
        return;
      }

      setResult(data);
      setUrl("");
      onCreated?.();
    } catch {
      setError("Failed to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-xl">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste a long URL"
          className="flex-1 px-4 py-3 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
        />
        <button
          type="submit"
          disabled={loading || !url.trim()}
          className="px-6 py-3 rounded-lg bg-zinc-900 text-white dark:bg-white dark:text-black font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "..." : "Shorten"}
        </button>
      </form>

      {error && (
        <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {result && (
        <div className="mt-4 p-4 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          <div className="flex gap-4">
            <QRCode shortCode={result.shortCode} size="sm" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-3">
                <a
                  href={result.shortUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-mono text-lg truncate"
                >
                  {result.shortUrl}
                </a>
                <CopyButton text={result.shortUrl} />
              </div>
              <p className="mt-1 text-sm text-zinc-500 truncate">
                {result.originalUrl}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
