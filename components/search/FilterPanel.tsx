"use client";

import { input } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

export interface SearchFilters {
  order: string;
  regionCode: string;
  videoDuration: string;
  publishedAfter: string;
}

const ORDERS = [
  { value: "relevance", label: "Relevância" },
  { value: "viewCount", label: "Mais Vistas" },
  { value: "date", label: "Mais Recentes" },
  { value: "rating", label: "Melhor Avaliação" },
];

const REGIONS = [
  { value: "PT", label: "🇵🇹 Portugal" },
  { value: "BR", label: "🇧🇷 Brasil" },
  { value: "US", label: "🇺🇸 USA" },
  { value: "GB", label: "🇬🇧 UK" },
  { value: "AO", label: "🇦🇴 Angola" },
  { value: "MZ", label: "🇲🇿 Moçambique" },
];

const FORMATS = [
  { value: "", label: "Todos" },
  { value: "short", label: "Shorts" },
];

const selectClasses = cn(
  input,
  "cursor-pointer w-full sm:min-w-[130px] sm:w-auto"
);

interface FilterPanelProps {
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
}

export function FilterPanel({ filters, onChange }: FilterPanelProps) {
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
      <select
        value={filters.videoDuration}
        onChange={(e) =>
          onChange({ ...filters, videoDuration: e.target.value })
        }
        className={selectClasses}
      >
        {FORMATS.map((f) => (
          <option key={f.value || "all"} value={f.value}>
            {f.label}
          </option>
        ))}
      </select>
    </div>
  );
}
