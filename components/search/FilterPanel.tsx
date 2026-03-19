"use client";

import { FilterSelect } from "@/components/ui/FilterSelect";
import { YOUTUBE_CATEGORY_OPTIONS } from "@/lib/categories";
import { SELECT_REGIONS } from "@/lib/regions";

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

interface FilterPanelProps {
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
}

export function FilterPanel({ filters, onChange }: FilterPanelProps) {
  return (
    <div className="flex gap-2.5 flex-wrap w-full sm:w-auto items-end">
      <FilterSelect
        label="Ordenar"
        value={filters.order}
        onChange={(v) => onChange({ ...filters, order: v })}
        options={ORDERS}
      />
      <FilterSelect
        label="Região"
        value={filters.regionCode}
        onChange={(v) => onChange({ ...filters, regionCode: v })}
        options={SELECT_REGIONS}
      />
      <FilterSelect
        label="Duração"
        value={filters.videoDuration}
        onChange={(v) => onChange({ ...filters, videoDuration: v })}
        options={DURATIONS}
      />
      <FilterSelect
        label="Formato"
        value={filters.videoFormat}
        onChange={(v) => onChange({ ...filters, videoFormat: v })}
        options={FORMATS}
      />
      <FilterSelect
        label="Categoria"
        value={filters.videoCategoryId}
        onChange={(v) => onChange({ ...filters, videoCategoryId: v })}
        options={YOUTUBE_CATEGORY_OPTIONS}
      />
      <FilterSelect
        label="Definição"
        value={filters.videoDefinition}
        onChange={(v) => onChange({ ...filters, videoDefinition: v })}
        options={DEFINITIONS}
      />
      <FilterSelect
        label="Legendas"
        value={filters.videoCaption}
        onChange={(v) => onChange({ ...filters, videoCaption: v })}
        options={CAPTIONS}
      />
    </div>
  );
}
