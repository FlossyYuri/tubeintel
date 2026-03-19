"use client";

import { cn } from "@/lib/utils";
import {
  type VideoSortKey,
  SORT_OPTIONS,
} from "@/lib/sort-videos";

const LABELS: Record<VideoSortKey, string> = {
  views: "Views",
  recent: "Recente",
  viral: "Viral",
  likes: "Likes",
  engagement: "Engagement",
  ratio: "Ratio",
};

interface SortControlsProps {
  value: VideoSortKey;
  onChange: (value: VideoSortKey) => void;
  options?: VideoSortKey[];
  label?: string;
}

export function SortControls({
  value,
  onChange,
  options = SORT_OPTIONS.map((o) => o.value),
  label = "Ordenar:",
}: SortControlsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[11px] text-[var(--text3)] font-mono">
        {label}
      </span>
      <div className="flex flex-wrap gap-1 p-1 bg-[var(--card)] rounded-lg border border-[var(--border)]">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={cn(
              "px-3 py-1 text-xs font-mono rounded transition-colors",
              value === opt
                ? "bg-[var(--card2)] text-[var(--text)]"
                : "text-[var(--text3)] hover:text-[var(--text)]"
            )}
          >
            {LABELS[opt]}
          </button>
        ))}
      </div>
    </div>
  );
}
