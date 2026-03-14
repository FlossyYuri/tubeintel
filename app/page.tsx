"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Flame, Tv, Bookmark, Bell } from "lucide-react";

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
      <h2 className="text-[22px] font-extrabold mb-1" style={{ fontFamily: "Syne, sans-serif" }}>
        Dashboard
      </h2>
      <p className="text-[13px] text-[var(--text2)] mb-6">
        Bem-vindo ao TubeIntel. Configura a tua API Key em Configurações para começar.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
          <div className="text-[10px] uppercase tracking-widest text-[var(--text3)] mb-2 font-mono">
            Colecções
          </div>
          <div className="text-[28px] font-extrabold text-[var(--accent)]" style={{ fontFamily: "Syne, sans-serif" }}>
            {stats.collections}
          </div>
        </div>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
          <div className="text-[10px] uppercase tracking-widest text-[var(--text3)] mb-2 font-mono">
            Alertas
          </div>
          <div className="text-[28px] font-extrabold text-[var(--blue)]" style={{ fontFamily: "Syne, sans-serif" }}>
            {stats.alerts}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/search"
          className="flex items-center gap-4 p-5 bg-[var(--card)] border border-[var(--border)] rounded-xl hover:border-[var(--border2)] transition-colors"
        >
          <Search className="size-8 text-[var(--accent)]" />
          <div>
            <div className="font-bold">Pesquisar Vídeos</div>
            <div className="text-sm text-[var(--text3)]">Encontra vídeos virais por keyword</div>
          </div>
        </Link>
        <Link
          href="/trending"
          className="flex items-center gap-4 p-5 bg-[var(--card)] border border-[var(--border)] rounded-xl hover:border-[var(--border2)] transition-colors"
        >
          <Flame className="size-8 text-[var(--accent)]" />
          <div>
            <div className="font-bold">Trending</div>
            <div className="text-sm text-[var(--text3)]">Vídeos em alta por país</div>
          </div>
        </Link>
        <Link
          href="/channels"
          className="flex items-center gap-4 p-5 bg-[var(--card)] border border-[var(--border)] rounded-xl hover:border-[var(--border2)] transition-colors"
        >
          <Tv className="size-8 text-[var(--blue)]" />
          <div>
            <div className="font-bold">Analisar Canal</div>
            <div className="text-sm text-[var(--text3)]">Métricas detalhadas</div>
          </div>
        </Link>
        <Link
          href="/saved"
          className="flex items-center gap-4 p-5 bg-[var(--card)] border border-[var(--border)] rounded-xl hover:border-[var(--border2)] transition-colors"
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
