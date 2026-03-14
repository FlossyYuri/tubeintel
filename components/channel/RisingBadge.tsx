'use client';

import { TrendingUp } from 'lucide-react';

export function RisingBadge({ score }: { score: number }) {
  if (score < 70) return null;

  const intensity = score >= 90 ? 'high' : score >= 80 ? 'mid' : 'low';

  const styles = {
    high: {
      bg: 'rgba(232,68,28,0.1)',
      border: 'rgba(232,68,28,0.25)',
      text: '#FF6B3D',
      icon: '#E8441C',
    },
    mid: {
      bg: 'rgba(232,148,28,0.1)',
      border: 'rgba(232,148,28,0.25)',
      text: '#E8941C',
      icon: '#E8941C',
    },
    low: {
      bg: 'rgba(61,191,127,0.08)',
      border: 'rgba(61,191,127,0.2)',
      text: '#3DBF7F',
      icon: '#3DBF7F',
    },
  }[intensity];

  return (
    <span
      className='inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1'
      style={{ background: styles.bg, borderColor: styles.border }}
    >
      <TrendingUp
        className='size-3 shrink-0'
        style={{ color: styles.icon }}
        strokeWidth={2.5}
      />
      <span
        className='text-[9px] font-medium uppercase tracking-[0.15em]'
        style={{
          fontFamily: "'DM Mono', monospace",
          color: styles.text,
        }}
      >
        Rising {score}
      </span>
    </span>
  );
}
