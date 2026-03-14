"use client";

import { formatNumber } from "@/lib/format";

interface StatCardProps {
  label: string;
  value: string;
  color: "accent" | "blue" | "green" | "purple";
}

const colors = {
  accent: "var(--accent)",
  blue: "var(--blue)",
  green: "var(--green)",
  purple: "var(--purple)",
};

export function StatCard({ label, value, color }: StatCardProps) {
  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 relative overflow-hidden hover:border-[var(--border2)] transition-colors">
      <div
        className="text-[10px] uppercase tracking-widest text-[var(--text3)] mb-2 font-mono"
      >
        {label}
      </div>
      <div
        className="text-[28px] font-extrabold leading-none"
        style={{ fontFamily: "Syne, sans-serif", color: colors[color] }}
      >
        {value}
      </div>
      <div
        className="absolute bottom-0 left-0 right-0 h-0.5"
        style={{ backgroundColor: colors[color] }}
      />
    </div>
  );
}

interface ChannelStatsProps {
  subscriberCount: number;
  viewCount: number;
  videoCount: number;
  avgViews: number;
}

export function ChannelStats({
  subscriberCount,
  viewCount,
  videoCount,
  avgViews,
}: ChannelStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
      <StatCard label="Subscribers" value={formatNumber(subscriberCount)} color="accent" />
      <StatCard label="Total Views" value={formatNumber(viewCount)} color="blue" />
      <StatCard label="Vídeos" value={formatNumber(videoCount)} color="green" />
      <StatCard label="Média Views" value={formatNumber(avgViews)} color="purple" />
    </div>
  );
}
