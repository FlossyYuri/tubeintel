"use client";

export function RisingBadge({ score }: { score: number }) {
  if (score < 70) return null;

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[rgba(0,217,126,0.15)] border border-[rgba(0,217,126,0.3)] text-[var(--green)] text-[10px] font-mono uppercase tracking-wider animate-pulse">
      🚀 Rising {score}
    </span>
  );
}
