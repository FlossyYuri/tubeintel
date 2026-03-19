"use client";

import { formatNumber, formatDurationSeconds } from "@/lib/format";
import { sectionTitle } from "@/lib/design-tokens";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface AggregatedStats {
  views: number;
  durationSeconds: number;
  likes: number;
  comments: number;
  videoCount: number;
}

interface ChannelPerformanceBreakdownProps {
  shorts: AggregatedStats;
  longForm: AggregatedStats;
  periodDays: number;
}

function StatRow({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-[var(--border)] last:border-0">
      <span className="text-xs text-[var(--text3)] font-mono uppercase tracking-wider">
        {label}
      </span>
      <span className="text-sm font-semibold" style={{ color }}>
        {value}
      </span>
    </div>
  );
}

export function ChannelPerformanceBreakdown({
  shorts,
  longForm,
  periodDays,
}: ChannelPerformanceBreakdownProps) {
  const hasShorts = shorts.videoCount > 0;
  const hasLongForm = longForm.videoCount > 0;

  if (!hasShorts && !hasLongForm) return null;

  const chartData = [
    ...(hasShorts
      ? [
          {
            name: "Shorts",
            views: shorts.views,
            fill: "#9B6EE8",
          },
        ]
      : []),
    ...(hasLongForm
      ? [
          {
            name: "Long Form",
            views: longForm.views,
            fill: "#4A9EE8",
          },
        ]
      : []),
  ];

  return (
    <div className="mb-6">
      <h3 className={`${sectionTitle} mb-4 text-[var(--text2)]`}>
        Desempenho por formato (últimos {periodDays} dias)
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {hasShorts && (
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
            <div className="flex items-center gap-2 mb-3">
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: "#9B6EE8" }}
              />
              <h4 className="text-sm font-bold text-[var(--purple)]">
                Shorts (≤60s)
              </h4>
            </div>
            <StatRow
              label="Views"
              value={formatNumber(shorts.views)}
              color="#9B6EE8"
            />
            <StatRow
              label="Duração total"
              value={formatDurationSeconds(shorts.durationSeconds)}
              color="#9B6EE8"
            />
            <StatRow
              label="Likes"
              value={formatNumber(shorts.likes)}
              color="#9B6EE8"
            />
            <StatRow
              label="Comentários"
              value={formatNumber(shorts.comments)}
              color="#9B6EE8"
            />
            <StatRow
              label="Vídeos"
              value={String(shorts.videoCount)}
              color="#9B6EE8"
            />
          </div>
        )}
        {hasLongForm && (
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
            <div className="flex items-center gap-2 mb-3">
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: "#4A9EE8" }}
              />
              <h4 className="text-sm font-bold text-[var(--blue2)]">
                Long Form (&gt;3 min)
              </h4>
            </div>
            <StatRow
              label="Views"
              value={formatNumber(longForm.views)}
              color="#4A9EE8"
            />
            <StatRow
              label="Duração total"
              value={formatDurationSeconds(longForm.durationSeconds)}
              color="#4A9EE8"
            />
            <StatRow
              label="Likes"
              value={formatNumber(longForm.likes)}
              color="#4A9EE8"
            />
            <StatRow
              label="Comentários"
              value={formatNumber(longForm.comments)}
              color="#4A9EE8"
            />
            <StatRow
              label="Vídeos"
              value={String(longForm.videoCount)}
              color="#4A9EE8"
            />
          </div>
        )}
      </div>
      {chartData.length > 0 && (
        <div className="h-[180px] rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="1 4"
                stroke="rgba(255,255,255,0.04)"
                horizontal={false}
              />
              <XAxis
                type="number"
                stroke="transparent"
                tick={{ fill: "#3E3C38", fontSize: 10, fontFamily: "'DM Mono', monospace" }}
                tickFormatter={(v) => formatNumber(v)}
              />
              <YAxis
                type="category"
                dataKey="name"
                stroke="transparent"
                tick={{ fill: "#3E3C38", fontSize: 10, fontFamily: "'DM Mono', monospace" }}
                width={80}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div className="rounded-xl border border-white/[0.08] bg-[#111118] px-3.5 py-2.5 shadow-lg">
                      <p className="text-[10px] uppercase tracking-wider text-[#4A4845]">
                        {payload[0].payload.name}
                      </p>
                      <p className="text-sm font-medium text-[#F0EEE8]">
                        {formatNumber(Number(payload[0].value ?? 0))} views
                      </p>
                    </div>
                  );
                }}
              />
              <Bar dataKey="views" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
