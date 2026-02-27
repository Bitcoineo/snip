"use client";

import { useState } from "react";
import ShortenForm from "@/components/ShortenForm";
import LinkList from "@/components/LinkList";
import FloatingCards from "@/components/FloatingCards";

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <main className="min-h-screen flex flex-col items-center px-4">
      {/* Hero Section */}
      <div className="relative w-full max-w-5xl mx-auto pt-16 pb-20 md:pt-24 md:pb-28">
        <FloatingCards />
        <div className="relative z-10 text-center">
          <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight text-stone-900 dark:text-stone-50">
            Sn<span className="text-blue-600 dark:text-blue-400">i</span>p
          </h1>
          <p className="text-xl text-stone-500 dark:text-stone-400 mt-4 mb-12">
            Shorten URLs. Track every click.
          </p>
          <div className="max-w-2xl mx-auto">
            <ShortenForm onCreated={() => setRefreshKey((k) => k + 1)} />
          </div>
        </div>
      </div>

      {/* Recent Links */}
      <div className="w-full max-w-2xl mx-auto mt-4 mb-16">
        <LinkList refreshKey={refreshKey} />
      </div>
    </main>
  );
}
