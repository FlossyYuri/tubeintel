"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

function getPageTitle(pathname: string): string {
  if (pathname === "/") return "Dashboard";
  if (pathname.startsWith("/channels/")) return "Detalhe do Canal";
  if (pathname.startsWith("/saved/")) return "Colecção";
  const titles: Record<string, string> = {
    "/search": "Pesquisar Vídeos",
    "/trending": "Trending",
    "/niches": "Explorador de Nichos",
    "/channels": "Analisar Canal",
    "/compare": "Comparar Canais",
    "/rising": "Canais em Ascensão",
    "/shorts": "Shorts Virais",
    "/saved": "Colecções Guardadas",
    "/alerts": "Alertas e Monitoring",
    "/settings": "Configurações",
  };
  return titles[pathname] ?? "TubeIntel";
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const title = getPageTitle(pathname);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-60 min-h-screen">
        <Topbar title={title} />
        <div className="p-7">{children}</div>
      </main>
    </div>
  );
}
