"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Flame, Tv, Bookmark } from "lucide-react";
import { PageHeader } from "@/components/ui";
import { card } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const [stats, setStats] = useState({
    collections: 0,
    alerts: 0,
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/collections").then((r) => r.json()).then((d) => Array.isArray(d) ? d.length : 0),
      fetch("/api/alerts").then((r) => r.json()).then((d) => Array.isArray(d) ? d.length : 0),
    ]).then(([collections, alerts]) => setStats({ collections, alerts }));
  }, []);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Bem-vindo ao TubeIntel. Configura a tua API Key em Configurações para começar."
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className={cn(card, "p-5")}>
          <div className="text-[10px] uppercase tracking-widest text-[var(--text3)] mb-2 font-mono">
            Colecções
          </div>
          <div className="text-[28px] font-extrabold text-[var(--accent)] font-display">
            {stats.collections}
          </div>
        </div>
        <div className={cn(card, "p-5")}>
          <div className="text-[10px] uppercase tracking-widest text-[var(--text3)] mb-2 font-mono">
            Alertas
          </div>
          <div className="text-[28px] font-extrabold text-[var(--blue)] font-display">
            {stats.alerts}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/search"
          className={cn(card, "flex items-center gap-4 p-5 hover:border-[var(--border2)] transition-colors duration-200")}
        >
          <Search className="size-8 text-[var(--accent)]" />
          <div>
            <div className="font-bold">Pesquisar Vídeos</div>
            <div className="text-sm text-[var(--text3)]">Encontra vídeos virais por keyword</div>
          </div>
        </Link>
        <Link
          href="/trending"
          className={cn(card, "flex items-center gap-4 p-5 hover:border-[var(--border2)] transition-colors duration-200")}
        >
          <Flame className="size-8 text-[var(--accent)]" />
          <div>
            <div className="font-bold">Trending</div>
            <div className="text-sm text-[var(--text3)]">Vídeos em alta por país</div>
          </div>
        </Link>
        <Link
          href="/channels"
          className={cn(card, "flex items-center gap-4 p-5 hover:border-[var(--border2)] transition-colors duration-200")}
        >
          <Tv className="size-8 text-[var(--blue)]" />
          <div>
            <div className="font-bold">Analisar Canal</div>
            <div className="text-sm text-[var(--text3)]">Métricas detalhadas</div>
          </div>
        </Link>
        <Link
          href="/saved"
          className={cn(card, "flex items-center gap-4 p-5 hover:border-[var(--border2)] transition-colors duration-200")}
        >
          <Bookmark className="size-8 text-[var(--green)]" />
          <div>
            <div className="font-bold">Colecções</div>
            <div className="text-sm text-[var(--text3)]">Vídeos guardados</div>
          </div>
        </Link>
      </div>
    </div>
  );
}
