"use client";

import { cn } from "@/lib/utils";

const DATE_OPTIONS = [
  { value: "", label: "Qualquer data" },
  { value: "hour", label: "Última hora" },
  { value: "week", label: "Esta semana" },
  { value: "month", label: "Este mês" },
  { value: "year", label: "Este ano" },
];

interface DateFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export function DateFilter({ value, onChange }: DateFilterProps) {
  return (
    <div className="flex gap-2 flex-wrap mt-3.5">
      {DATE_OPTIONS.map((opt) => (
        <button
          key={opt.value || "any"}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "px-3 py-1.5 rounded-full text-[11.5px] cursor-pointer border transition-all font-mono",
            value === opt.value
              ? "bg-[rgba(61,139,255,0.15)] border-[var(--blue)] text-[var(--blue2)]"
              : "border-[var(--border)] text-[var(--text2)] bg-[var(--bg)] hover:border-[var(--blue)] hover:text-[var(--blue)]"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
