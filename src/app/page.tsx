"use client";

import { useState } from "react";
import ShortenForm from "@/components/ShortenForm";
import LinkList from "@/components/LinkList";

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-16">
      <div className="mb-12 text-center">
        <h1 className="text-5xl font-bold tracking-tight mb-2">Snip</h1>
        <p className="text-zinc-500">Shorten URLs. Track every click.</p>
      </div>

      <ShortenForm onCreated={() => setRefreshKey((k) => k + 1)} />

      <div className="mt-12 w-full max-w-xl">
        <LinkList refreshKey={refreshKey} />
      </div>
    </main>
  );
}
