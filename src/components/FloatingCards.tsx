"use client";

export default function FloatingCards() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none hidden lg:block">
      {/* Top-left: link icon card */}
      <div
        className="absolute top-8 left-4 xl:left-12 bg-white dark:bg-stone-900 rounded-2xl shadow-md px-4 py-3 rotate-[-6deg] opacity-50 dark:opacity-40 animate-float"
        style={{ animationDelay: "0s" }}
      >
        <div className="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
          <span className="text-xs font-mono text-stone-600 dark:text-stone-400">snip.to/Xk9mP2</span>
        </div>
      </div>

      {/* Top-right: clicks badge */}
      <div
        className="absolute top-16 right-8 xl:right-16 bg-white dark:bg-stone-900 rounded-2xl shadow-md px-4 py-3 rotate-[4deg] opacity-50 dark:opacity-40 animate-float"
        style={{ animationDelay: "1.5s" }}
      >
        <div className="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
          <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">1,247 clicks</span>
        </div>
      </div>

      {/* Bottom-left: QR grid */}
      <div
        className="absolute bottom-24 left-8 xl:left-20 bg-white dark:bg-stone-900 rounded-2xl shadow-md p-3 rotate-[5deg] opacity-50 dark:opacity-40 animate-float"
        style={{ animationDelay: "3s" }}
      >
        <div className="grid grid-cols-4 gap-0.5 w-10 h-10">
          {Array.from({ length: 16 }).map((_, i) => (
            <div
              key={i}
              className={`rounded-[1px] ${
                [0,1,2,4,6,8,9,10,12,14,15].includes(i)
                  ? "bg-stone-800 dark:bg-stone-200"
                  : "bg-stone-200 dark:bg-stone-700"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Bottom-right: countries */}
      <div
        className="absolute bottom-32 right-4 xl:right-24 bg-white dark:bg-stone-900 rounded-2xl shadow-md px-4 py-3 rotate-[-3deg] opacity-50 dark:opacity-40 animate-float"
        style={{ animationDelay: "4.5s" }}
      >
        <div className="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">12 countries</span>
        </div>
      </div>
    </div>
  );
}
