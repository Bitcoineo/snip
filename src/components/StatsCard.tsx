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
      <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800">
        <h3 className="text-sm font-medium text-zinc-400 mb-3">{title}</h3>
        <p className="text-xs text-zinc-600">No data yet</p>
      </div>
    );
  }

  const maxCount = items[0].count;

  return (
    <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800">
      <h3 className="text-sm font-medium text-zinc-400 mb-3">{title}</h3>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.label}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-zinc-300 truncate mr-2">{item.label}</span>
              <span className="text-zinc-500 whitespace-nowrap">{item.count}</span>
            </div>
            <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
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
