"use client";

import { cn } from "@/lib/utils";
import {
  type ChannelSortKey,
  CHANNEL_SORT_OPTIONS,
} from "@/lib/sort-channels";

const LABELS: Record<ChannelSortKey, string> = {
  subscribers: "Subs",
  views: "Views",
  videos: "Vídeos",
  viewsPerSub: "Views/Sub",
  name: "Nome",
  recent: "Recente",
};

interface ChannelSortControlsProps {
  value: ChannelSortKey;
  onChange: (value: ChannelSortKey) => void;
  options?: ChannelSortKey[];
  label?: string;
}

export function ChannelSortControls({
  value,
  onChange,
  options = CHANNEL_SORT_OPTIONS.map((o) => o.value),
  label = "Ordenar:",
}: ChannelSortControlsProps) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="text-[11px] text-[#3E3C38]"
        style={{ fontFamily: "'DM Mono', monospace" }}
      >
        {label}
      </span>
      <div className="flex gap-1 p-1 rounded-lg border border-white/[0.06] bg-white/[0.02]">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={cn(
              "px-3 py-1 text-xs rounded transition-colors",
              value === opt
                ? "bg-white/[0.08] text-[#F0EEE8]"
                : "text-[#4A4845] hover:text-[#8A8880]"
            )}
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            {LABELS[opt]}
          </button>
        ))}
      </div>
    </div>
  );
}
