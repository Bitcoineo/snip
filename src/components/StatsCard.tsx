"use client";

interface StatsItem {
  label: string;
  count: number;
}

export default function StatsCard({
  title,
  items,
}: {
  title: string;
  items: StatsItem[];
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl bg-white dark:bg-stone-900 shadow-md p-5">
        <h3 className="text-sm font-semibold text-stone-600 dark:text-stone-400 mb-3">{title}</h3>
        <p className="text-xs text-stone-400 dark:text-stone-600">No data yet</p>
      </div>
    );
  }

  const maxCount = items[0].count;

  return (
    <div className="rounded-2xl bg-white dark:bg-stone-900 shadow-md p-5">
      <h3 className="text-sm font-semibold text-stone-600 dark:text-stone-400 mb-3">{title}</h3>
      <div className="space-y-2.5">
        {items.map((item) => (
          <div key={item.label}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-stone-700 dark:text-stone-300 truncate mr-2">{item.label}</span>
              <span className="text-stone-500 whitespace-nowrap">{item.count}</span>
            </div>
            <div className="h-1.5 rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-blue-500"
                style={{
                  width: `${Math.max(2, (item.count / maxCount) * 100)}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
