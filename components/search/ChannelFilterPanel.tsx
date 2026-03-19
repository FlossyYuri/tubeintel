"use client";

import { FilterSelect } from "@/components/ui/FilterSelect";
import { SELECT_REGIONS } from "@/lib/regions";

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

interface ChannelFilterPanelProps {
  filters: ChannelSearchFilters;
  onChange: (filters: ChannelSearchFilters) => void;
}

export function ChannelFilterPanel({ filters, onChange }: ChannelFilterPanelProps) {
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
    </div>
  );
}
