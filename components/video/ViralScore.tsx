"use client";

import { getViralScoreColor } from "@/lib/viral-score";

interface ViralScoreProps {
  score: number;
  showLabel?: boolean;
}

export function ViralScore({ score, showLabel = true }: ViralScoreProps) {
  const color = getViralScoreColor(score);
  const clamped = Math.min(Math.max(score, 0), 100);

  return (
    <div className="flex items-center gap-2 mt-2.5">
      {showLabel && (
        <span
          className="text-[9px] text-[var(--text3)] uppercase tracking-wider"
          style={{ fontFamily: "Space Mono, monospace" }}
        >
          Viral
        </span>
      )}
      <div className="flex-1 h-[3px] bg-[var(--border)] rounded overflow-hidden">
        <div
          className="h-full rounded transition-all duration-500"
          style={{ width: `${clamped}%`, backgroundColor: color }}
        />
      </div>
      <span
        className="text-[10px] font-bold min-w-[28px] text-right tabular-nums"
        style={{ fontFamily: "Space Mono, monospace", color }}
      >
        {score}
      </span>
    </div>
  );
}
