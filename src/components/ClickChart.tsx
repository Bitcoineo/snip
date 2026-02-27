"use client";

interface ClickDay {
  date: string;
  clicks: number;
}

export default function ClickChart({ data }: { data: ClickDay[] }) {
  if (data.length === 0) return null;

  const maxClicks = Math.max(...data.map((d) => d.clicks), 1);
  const chartHeight = 200;
  const barGap = 2;
  const barWidth = Math.max(
    4,
    Math.floor((600 - barGap * data.length) / data.length)
  );
  const chartWidth = data.length * (barWidth + barGap);

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight + 40}`}
        className="w-full max-w-full"
        style={{ minWidth: Math.min(chartWidth, 400) }}
      >
        {data.map((day, i) => {
          const barHeight = Math.max(
            1,
            (day.clicks / maxClicks) * chartHeight
          );
          const x = i * (barWidth + barGap);
          const y = chartHeight - barHeight;

          return (
            <g key={day.date}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx={3}
                className="fill-blue-600 dark:fill-blue-500 hover:fill-blue-500 dark:hover:fill-blue-400 transition-colors"
              />
              {day.clicks > 0 && (
                <text
                  x={x + barWidth / 2}
                  y={y - 4}
                  textAnchor="middle"
                  className="fill-stone-500 dark:fill-stone-400 text-[9px]"
                >
                  {day.clicks}
                </text>
              )}
              {(data.length <= 14 || i % Math.ceil(data.length / 10) === 0) && (
                <text
                  x={x + barWidth / 2}
                  y={chartHeight + 16}
                  textAnchor="middle"
                  className="fill-stone-400 dark:fill-stone-500 text-[9px]"
                >
                  {day.date.slice(5)}
                </text>
              )}
            </g>
          );
        })}
        <line
          x1={0}
          y1={chartHeight}
          x2={chartWidth}
          y2={chartHeight}
          className="stroke-stone-200 dark:stroke-stone-800"
          strokeWidth={1}
        />
      </svg>
    </div>
  );
}
