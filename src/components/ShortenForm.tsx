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
    <div className="w-full">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col sm:flex-row sm:items-center gap-2 rounded-2xl sm:rounded-full bg-white dark:bg-stone-900 shadow-lg p-3 sm:p-2"
      >
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste a long URL"
          className="flex-1 bg-transparent border-none outline-none text-base sm:text-lg px-3 sm:pl-5 py-2 sm:py-0 text-stone-900 dark:text-stone-50 placeholder:text-stone-400 dark:placeholder:text-stone-500"
        />
        <button
          type="submit"
          disabled={loading || !url.trim()}
          className="flex-shrink-0 rounded-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white min-h-touch sm:min-h-0 sm:p-3 flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="animate-spin">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-25" />
              <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
          ) : (
            <>
              <span className="sm:hidden font-medium text-sm">Shorten</span>
              <svg className="hidden sm:block" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </>
          )}
        </button>
      </form>

      {error && (
        <p className="mt-3 text-sm text-red-600 dark:text-red-400 text-center">{error}</p>
      )}

      {result && (
        <div className="mt-6 rounded-2xl bg-white dark:bg-stone-900 shadow-md p-4 sm:p-5">
          <div className="flex gap-3 sm:gap-4">
            <div className="hidden sm:block">
              <QRCode shortCode={result.shortCode} size="sm" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 sm:gap-3">
                <a
                  href={result.shortUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-mono text-sm sm:text-lg truncate transition-colors"
                >
                  {result.shortUrl}
                </a>
                <CopyButton text={result.shortUrl} />
              </div>
              <p className="mt-1 text-xs sm:text-sm text-stone-500 dark:text-stone-400 truncate">
                {result.originalUrl}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
