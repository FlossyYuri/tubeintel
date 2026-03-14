"use client";

import { input } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

export interface SearchFilters {
  order: string;
  regionCode: string;
  videoDuration: string;
  videoFormat: string;
  videoCategoryId: string;
  videoDefinition: string;
  videoCaption: string;
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

const DURATIONS = [
  { value: "", label: "Todos" },
  { value: "short", label: "Curto (<4min)" },
  { value: "medium", label: "Médio (4–20min)" },
  { value: "long", label: "Longo (>20min)" },
];

const FORMATS = [
  { value: "", label: "Todos" },
  { value: "shorts", label: "Shorts (≤60s)" },
  { value: "longform", label: "Long Form (>4min)" },
];

const CATEGORIES = [
  { value: "", label: "Todas" },
  { value: "1", label: "Film & Animation" },
  { value: "10", label: "Música" },
  { value: "20", label: "Gaming" },
  { value: "22", label: "People & Blogs" },
  { value: "23", label: "Comédia" },
  { value: "24", label: "Entretenimento" },
  { value: "25", label: "Notícias" },
  { value: "26", label: "How-to & Style" },
  { value: "27", label: "Educação" },
  { value: "28", label: "Ciência & Tecnologia" },
];

const DEFINITIONS = [
  { value: "", label: "Qualquer" },
  { value: "high", label: "HD" },
  { value: "standard", label: "SD" },
];

const CAPTIONS = [
  { value: "", label: "Qualquer" },
  { value: "closedCaption", label: "Com legendas" },
  { value: "none", label: "Sem legendas" },
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
        {DURATIONS.map((d) => (
          <option key={d.value || "all"} value={d.value}>
            {d.label}
          </option>
        ))}
      </select>
      <select
        value={filters.videoFormat}
        onChange={(e) => onChange({ ...filters, videoFormat: e.target.value })}
        className={selectClasses}
      >
        {FORMATS.map((f) => (
          <option key={f.value || "all"} value={f.value}>
            {f.label}
          </option>
        ))}
      </select>
      <select
        value={filters.videoCategoryId}
        onChange={(e) =>
          onChange({ ...filters, videoCategoryId: e.target.value })
        }
        className={selectClasses}
      >
        {CATEGORIES.map((c) => (
          <option key={c.value || "all"} value={c.value}>
            {c.label}
          </option>
        ))}
      </select>
      <select
        value={filters.videoDefinition}
        onChange={(e) =>
          onChange({ ...filters, videoDefinition: e.target.value })
        }
        className={selectClasses}
      >
        {DEFINITIONS.map((d) => (
          <option key={d.value || "any"} value={d.value}>
            {d.label}
          </option>
        ))}
      </select>
      <select
        value={filters.videoCaption}
        onChange={(e) =>
          onChange({ ...filters, videoCaption: e.target.value })
        }
        className={selectClasses}
      >
        {CAPTIONS.map((c) => (
          <option key={c.value || "any"} value={c.value}>
            {c.label}
          </option>
        ))}
      </select>
    </div>
  );
}
