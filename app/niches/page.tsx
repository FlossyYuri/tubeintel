"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { NICHES } from "@/lib/niches";
import { PageHeader } from "@/components/ui";
import { card } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

export default function NichesPage() {
  const [selected, setSelected] = useState<number | null>(null);
  const router = useRouter();

  const handleNicheClick = (index: number) => {
    const niche = NICHES[index];
    setSelected(index);
    router.push(`/search?q=${encodeURIComponent(niche.keywords)}`);
  };

  return (
    <div>
      <PageHeader
        title="🎯 Explorador de Nichos"
        description="Analisa os nichos mais quentes e encontra oportunidades"
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {NICHES.map((niche, i) => (
          <button
            key={niche.name}
            onClick={() => handleNicheClick(i)}
            className={cn(
              card,
              "p-4 rounded-xl text-center transition-all duration-200 border",
              selected === i
                ? "bg-[rgba(255,61,61,0.08)] border-[var(--accent)]"
                : "hover:border-[var(--border2)] hover:-translate-y-0.5"
            )}
          >
            <span className="text-2xl block mb-2">{niche.icon}</span>
            <div className="text-sm font-semibold mb-1 font-display">
              {niche.name}
            </div>
            <div className={`text-[10px] font-mono ${niche.up ? "text-[var(--green)]" : "text-[var(--accent)]"}`}>
              {niche.trend}
            </div>
          </button>
        ))}
      </div>

      <p className="mt-6 text-sm text-[var(--text3)]">
        Clica num nicho para pesquisar vídeos virais nessa área.
      </p>
    </div>
  );
}
