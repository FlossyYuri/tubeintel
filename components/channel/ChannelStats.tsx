'use client';

import { formatNumber } from '@/lib/format';

interface StatCardProps {
  label: string;
  value: string;
  color: 'accent' | 'blue' | 'green' | 'purple';
}

const colorMap = {
  accent: { text: '#E8441C', glow: 'rgba(232,68,28,0.08)', bar: '#E8441C' },
  blue: { text: '#4A9EE8', glow: 'rgba(74,158,232,0.08)', bar: '#4A9EE8' },
  green: { text: '#3DBF7F', glow: 'rgba(61,191,127,0.08)', bar: '#3DBF7F' },
  purple: { text: '#9B6EE8', glow: 'rgba(155,110,232,0.08)', bar: '#9B6EE8' },
};

export function StatCard({ label, value, color }: StatCardProps) {
  const c = colorMap[color];

  return (
    <div className='group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 transition-all duration-200 hover:border-white/[0.1] hover:bg-white/[0.04]'>
      {/* Corner glow */}
      <div
        className='pointer-events-none absolute -right-6 -top-6 size-20 rounded-full opacity-60 blur-2xl transition-opacity duration-300 group-hover:opacity-100'
        style={{ background: c.glow }}
      />

      {/* Label */}
      <p
        className='mb-3 text-[9px] uppercase tracking-[0.2em] text-[#3E3C38]'
        style={{ fontFamily: "'DM Mono', monospace" }}
      >
        {label}
      </p>

      {/* Value */}
      <p
        className='text-[28px] font-extrabold leading-none tracking-tight'
        style={{ fontFamily: "'Syne', sans-serif", color: c.text }}
      >
        {value}
      </p>

      {/* Bottom accent bar */}
      <div
        className='absolute bottom-0 left-0 h-[2px] w-0 rounded-full transition-all duration-300 group-hover:w-full'
        style={{ background: c.bar }}
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
    <div className='mb-5 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4'>
      <StatCard
        label='Subscribers'
        value={formatNumber(subscriberCount)}
        color='accent'
      />
      <StatCard
        label='Total Views'
        value={formatNumber(viewCount)}
        color='blue'
      />
      <StatCard label='Vídeos' value={formatNumber(videoCount)} color='green' />
      <StatCard
        label='Média Views'
        value={formatNumber(avgViews)}
        color='purple'
      />
    </div>
  );
}
