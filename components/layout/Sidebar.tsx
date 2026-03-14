"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  Flame,
  Target,
  Tv,
  Scale,
  Zap,
  TrendingUp,
  Bookmark,
  Bell,
  Settings,
} from "lucide-react";

const navSections = [
  {
    title: "Pesquisa",
    items: [
      { href: "/search", label: "Pesquisar Vídeos", icon: Search },
      { href: "/trending", label: "Trending", icon: Flame },
      { href: "/niches", label: "Nichos", icon: Target },
    ],
  },
  {
    title: "Canais",
    items: [
      { href: "/channels", label: "Analisar Canal", icon: Tv },
      { href: "/compare", label: "Comparar Canais", icon: Scale },
      { href: "/rising", label: "Canais em Ascensão", icon: TrendingUp },
    ],
  },
  {
    title: "Formatos",
    items: [
      { href: "/shorts", label: "Shorts Virais", icon: Zap },
    ],
  },
  {
    title: "Organização",
    items: [
      { href: "/saved", label: "Colecções", icon: Bookmark },
      { href: "/alerts", label: "Alertas", icon: Bell },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="w-60 min-h-screen bg-[var(--bg2)] border-r border-[var(--border)] flex flex-col fixed top-0 left-0 z-[100]"
    >
      <div className="p-6 pb-5 border-b border-[var(--border)]">
        <Link href="/" className="block">
          <div
            className="text-xl font-extrabold tracking-tight"
            style={{ fontFamily: "Syne, sans-serif" }}
          >
            Tube<span className="text-[var(--accent)]">Intel</span>
          </div>
          <div
            className="text-[10px] text-[var(--text3)] uppercase tracking-[0.2em] mt-0.5"
            style={{ fontFamily: "Space Mono, monospace" }}
          >
            Research Platform
          </div>
        </Link>
      </div>

      <nav className="py-4 flex-1 overflow-y-auto">
        {navSections.map((section) => (
          <div key={section.title} className="mb-4">
            <div
              className="px-5 py-2 text-[9px] uppercase tracking-[0.2em] text-[var(--text3)]"
              style={{ fontFamily: "Space Mono, monospace" }}
            >
              {section.title}
            </div>
            {section.items.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-5 py-2.5 text-[13.5px] text-[var(--text2)] border-l-2 border-transparent transition-all hover:bg-[var(--card)] hover:text-[var(--text)] ${
                    isActive
                      ? "bg-[rgba(255,61,61,0.08)] text-[var(--accent)] border-l-[var(--accent)]"
                      : ""
                  }`}
                >
                  <Icon className="size-5 shrink-0" />
                  <span>{item.label}</span>
                  {item.href === "/trending" && (
                    <span className="ml-auto bg-[var(--accent)] text-white text-[9px] px-1.5 py-0.5 rounded-full font-mono">
                      LIVE
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-[var(--border)] bg-[var(--bg)]">
        <Link
          href="/settings"
          className={`flex items-center gap-2.5 px-5 py-2.5 text-[13.5px] text-[var(--text2)] border-l-2 border-transparent transition-all hover:bg-[var(--card)] hover:text-[var(--text)] ${
            pathname === "/settings"
              ? "bg-[rgba(255,61,61,0.08)] text-[var(--accent)] border-l-[var(--accent)]"
              : ""
          }`}
        >
          <Settings className="size-5 shrink-0" />
          <span>Configurações</span>
        </Link>
      </div>
    </aside>
  );
}
