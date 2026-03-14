"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatNumber } from "@/lib/format";

interface DataPoint {
  index: number;
  views: number;
  label: string;
}

interface ChannelGrowthChartProps {
  data: DataPoint[];
}

export function ChannelGrowthChart({ data }: ChannelGrowthChartProps) {
  if (!data.length) return null;

  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey="label"
            stroke="var(--text3)"
            fontSize={10}
            tickLine={false}
          />
          <YAxis
            stroke="var(--text3)"
            fontSize={10}
            tickLine={false}
            tickFormatter={(v) => formatNumber(v)}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--card2)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
            }}
            labelStyle={{ color: "var(--text)" }}
            formatter={(value) => [formatNumber(Number(value ?? 0)), "Views"]}
          />
          <Line
            type="monotone"
            dataKey="views"
            stroke="var(--accent)"
            strokeWidth={2}
            dot={{ fill: "var(--accent)", r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
