'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

function getPageTitle(pathname: string): string {
  if (pathname === '/') return 'Dashboard';
  if (pathname.startsWith('/channels/')) return 'Detalhe do Canal';
  if (pathname.startsWith('/saved/')) return 'Colecção';
  const titles: Record<string, string> = {
    '/search': 'Pesquisar Vídeos',
    '/trending': 'Trending',
    '/niches': 'Explorador de Nichos',
    '/channels': 'Analisar Canal',
    '/compare': 'Comparar Canais',
    '/rising': 'Canais em Ascensão',
    '/shorts': 'Shorts Virais',
    '/saved': 'Colecções Guardadas',
    '/alerts': 'Alertas e Monitoring',
    '/monitor': 'Channel Spy',
    '/settings': 'Configurações',
  };
  return titles[pathname] ?? 'TubeIntel';
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const title = getPageTitle(pathname);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className='flex min-h-screen bg-[#07070c]'>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className='flex min-w-0 flex-1 flex-col md:ml-64 min-h-screen'>
        <Topbar
          title={title}
          onToggleSidebar={() => setSidebarOpen((o) => !o)}
          sidebarOpen={sidebarOpen}
        />
        <div className='flex-1 w-full p-4 sm:p-5 lg:p-7 max-w-[var(--content-max)] mx-auto'>
          {children}
        </div>
      </main>
    </div>
  );
}
