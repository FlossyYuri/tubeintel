"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { NICHES, NICHE_CATEGORIES } from "@/lib/niches";
import type { Niche } from "@/lib/niches";
import { PageHeader } from "@/components/ui";
import { card } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

export default function NichesPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("Todos");
  const router = useRouter();

  const filteredNiches = useMemo(() => {
    if (categoryFilter === "Todos") return NICHES;
    return NICHES.filter((n) => n.category === categoryFilter);
  }, [categoryFilter]);

  const nichesByCategory = useMemo(() => {
    const grouped = new Map<string, Niche[]>();
    const order = NICHE_CATEGORIES.filter((c) => c !== "Todos");
    for (const cat of order) grouped.set(cat, []);
    for (const niche of filteredNiches) {
      const cat = niche.category ?? "Outros";
      grouped.get(cat)?.push(niche);
    }
    return Array.from(grouped.entries()).filter(([, niches]) => niches.length > 0);
  }, [filteredNiches]);

  const showSections = categoryFilter === "Todos";

  const handleNicheClick = (niche: Niche) => {
    setSelected(niche.name);
    router.push(`/search?q=${encodeURIComponent(niche.keywords)}`);
  };

  return (
    <div>
      <PageHeader
        title="🎯 Explorador de Nichos"
        description="Analisa os nichos mais quentes e encontra oportunidades"
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-[var(--text2)]">Filtrar:</span>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className={cn(
            "rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-sm font-medium",
            "text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          )}
        >
          {NICHE_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {showSections ? (
        <div className="space-y-10">
          {nichesByCategory.map(([category, niches]) => (
            <section key={category}>
              <h2 className="mb-3 text-lg font-semibold text-[var(--text)] font-display">
                {category}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {niches.map((niche) => (
                  <NicheCard
                    key={niche.name}
                    niche={niche}
                    isSelected={selected === niche.name}
                    onClick={() => handleNicheClick(niche)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {filteredNiches.map((niche) => (
            <NicheCard
              key={niche.name}
              niche={niche}
              isSelected={selected === niche.name}
              onClick={() => handleNicheClick(niche)}
            />
          ))}
        </div>
      )}

      <p className="mt-6 text-sm text-[var(--text3)]">
        Clica num nicho para pesquisar vídeos virais nessa área.
      </p>
    </div>
  );
}

function NicheCard({
  niche,
  isSelected,
  onClick,
}: {
  niche: Niche;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        card,
        "p-4 rounded-xl text-center transition-all duration-200 border",
        isSelected
          ? "bg-[rgba(255,61,61,0.08)] border-[var(--accent)]"
          : "hover:border-[var(--border2)] hover:-translate-y-0.5"
      )}
    >
      <span className="text-2xl block mb-2">{niche.icon}</span>
      <div className="text-sm font-semibold mb-1 font-display">{niche.name}</div>
      <div
        className={cn(
          "text-[10px] font-mono",
          niche.up ? "text-[var(--green)]" : "text-[var(--accent)]"
        )}
      >
        {niche.trend}
      </div>
    </button>
  );
}
