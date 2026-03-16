"use client";

import { input } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

export interface ChannelSearchFilters {
  order: string;
  regionCode: string;
}

const ORDERS = [
  { value: "relevance", label: "Relevância" },
  { value: "viewCount", label: "Mais Views" },
  { value: "videoCount", label: "Mais Vídeos" },
  { value: "date", label: "Mais Recentes" },
  { value: "title", label: "Nome (A–Z)" },
];

const REGIONS = [
  { value: "PT", label: "🇵🇹 Portugal" },
  { value: "BR", label: "🇧🇷 Brasil" },
  { value: "US", label: "🇺🇸 USA" },
  { value: "GB", label: "🇬🇧 UK" },
  { value: "AO", label: "🇦🇴 Angola" },
  { value: "MZ", label: "🇲🇿 Moçambique" },
  { value: "ES", label: "🇪🇸 Espanha" },
  { value: "FR", label: "🇫🇷 França" },
];

const selectClasses = cn(
  input,
  "cursor-pointer w-full sm:min-w-[130px] sm:w-auto"
);

interface ChannelFilterPanelProps {
  filters: ChannelSearchFilters;
  onChange: (filters: ChannelSearchFilters) => void;
}

export function ChannelFilterPanel({ filters, onChange }: ChannelFilterPanelProps) {
  return (
    <div className="flex gap-2.5 flex-wrap w-full sm:w-auto">
      <select
        value={filters.order}
        onChange={(e) => onChange({ ...filters, order: e.target.value })}
        className={selectClasses}
      >
        {ORDERS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <select
        value={filters.regionCode}
        onChange={(e) => onChange({ ...filters, regionCode: e.target.value })}
        className={selectClasses}
      >
        {REGIONS.map((r) => (
          <option key={r.value} value={r.value}>
            {r.label}
          </option>
        ))}
      </select>
    </div>
  );
}
