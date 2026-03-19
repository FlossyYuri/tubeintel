"use client";

import { input } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

export interface FilterSelectOption {
  value: string;
  label: string;
}

export interface FilterSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: FilterSelectOption[];
  id?: string;
  className?: string;
}

export function FilterSelect({
  label,
  value,
  onChange,
  options,
  id,
  className,
}: FilterSelectProps) {
  const selectId = id ?? `filter-${label.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label
        htmlFor={selectId}
        className="text-[9px] uppercase tracking-[0.18em] text-[#3E3C38] font-mono"
        style={{ fontFamily: "'DM Mono', monospace" }}
      >
        {label}
      </label>
      <select
        id={selectId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(input, "cursor-pointer min-w-0 w-full sm:min-w-[130px] sm:w-auto")}
      >
        {options.map((opt) => (
          <option key={opt.value || "all"} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
