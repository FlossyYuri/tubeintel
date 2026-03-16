'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Search,
  Flame,
  Target,
  Tv,
  ArrowLeftRight,
  TrendingUp,
  Zap,
  Bookmark,
  Bell,
  Settings,
  X,
  BarChart2,
  Sparkles,
  Trophy,
  BookOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navSections = [
  {
    title: 'Pesquisa',
    items: [
      { href: '/search', label: 'Pesquisar Vídeos', icon: Search },
      { href: '/trending', label: 'Trending', icon: Flame, isLive: true },
      { href: '/discover', label: 'Discover Outperformers', icon: Sparkles },
      { href: '/rankings', label: 'Rankings', icon: Trophy },
      { href: '/niches', label: 'Nichos', icon: Target },
    ],
  },
  {
    title: 'Canais',
    items: [
      { href: '/channels', label: 'Pesquisar Canais', icon: Tv },
      { href: '/compare', label: 'Comparar Canais', icon: ArrowLeftRight },
      { href: '/rising', label: 'Canais em Ascensão', icon: TrendingUp },
    ],
  },
  {
    title: 'Formatos',
    items: [
      { href: '/shorts', label: 'Shorts Virais', icon: Zap },
      { href: '/study', label: 'Estudo Viral', icon: BookOpen },
    ],
  },
  {
    title: 'Organização',
    items: [
      { href: '/saved', label: 'Colecções', icon: Bookmark },
      { href: '/alerts', label: 'Alertas', icon: Bell },
    ],
  },
];

function SidebarContent({
  onNavigate,
  onClose,
}: {
  onNavigate?: () => void;
  onClose?: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      {/* Ambient glow top */}
      <div className='pointer-events-none absolute inset-x-0 top-0 h-48 bg-[radial-gradient(ellipse_at_30%_0%,rgba(232,68,28,0.08)_0%,transparent_65%)]' />

      {/* Header / Brand */}
      <div className='relative border-b border-white/[0.06] px-5 py-[22px]'>
        <Link href='/' onClick={onNavigate} className='flex items-center gap-3'>
          {/* Icon */}
          <div className='flex size-[38px] shrink-0 items-center justify-center rounded-[10px] bg-[#E8441C] shadow-[0_4px_16px_rgba(232,68,28,0.3),inset_0_1px_0_rgba(255,255,255,0.15)]'>
            <BarChart2 className='size-[18px] text-white' strokeWidth={2.5} />
          </div>

          {/* Wordmark */}
          <div className='flex flex-col gap-px'>
            <span
              className='text-[17px] font-extrabold leading-none tracking-tight text-[#F0EEE8]'
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Tube<span className='text-[#E8441C]'>Intel</span>
            </span>
            <span
              className='mt-[3px] text-[9px] uppercase tracking-[0.14em] text-[#4A4845]'
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              Research Platform
            </span>
          </div>
        </Link>

        {onClose && (
          <button
            onClick={onClose}
            className='absolute right-4 top-5 rounded-lg p-2 text-[#4A4845] transition-all duration-200 hover:bg-white/5 hover:text-[#F0EEE8] focus-visible:ring-2 focus-visible:ring-[#E8441C]'
            aria-label='Fechar menu'
          >
            <X className='size-5' />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className='flex flex-1 flex-col gap-5 overflow-y-auto px-3 py-4 scrollbar-none'>
        {navSections.map((section) => (
          <div key={section.title}>
            {/* Section label */}
            <p
              className='mb-1.5 px-2.5 text-[9px] uppercase tracking-[0.18em] text-[#3E3C38]'
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              {section.title}
            </p>

            {/* Items */}
            <div className='flex flex-col gap-px'>
              {section.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(item.href + '/');
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      'group relative flex items-center gap-2.5 rounded-[10px] border px-2.5 py-[9px] transition-all duration-[180ms]',
                      isActive
                        ? 'border-[rgba(232,68,28,0.3)] bg-[rgba(232,68,28,0.12)]'
                        : 'border-transparent hover:border-white/[0.06] hover:bg-white/[0.04]',
                    )}
                  >
                    {/* Active left bar */}
                    {isActive && (
                      <span className='absolute left-0 top-1/2 h-[18px] w-[3px] -translate-y-1/2 rounded-r-[3px] bg-[#E8441C]' />
                    )}

                    {/* Icon container */}
                    <div
                      className={cn(
                        'flex size-8 shrink-0 items-center justify-center rounded-lg transition-all duration-[180ms]',
                        isActive
                          ? 'bg-[rgba(232,68,28,0.15)]'
                          : 'bg-white/[0.04] group-hover:bg-white/[0.06]',
                      )}
                    >
                      <Icon
                        className={cn(
                          'size-3.5 shrink-0 transition-colors duration-[180ms]',
                          isActive
                            ? 'text-[#FF6B3D]'
                            : 'text-[#4A4845] group-hover:text-[#8A8880]',
                        )}
                        strokeWidth={2}
                      />
                    </div>

                    {/* Label */}
                    <span
                      className={cn(
                        'flex-1 truncate text-[13px] font-medium tracking-[-0.01em] transition-colors duration-[180ms]',
                        isActive
                          ? 'text-[#F0EEE8]'
                          : 'text-[#8A8880] group-hover:text-[#F0EEE8]',
                      )}
                    >
                      {item.label}
                    </span>

                    {/* Live badge */}
                    {item.isLive && (
                      <span
                        className='shrink-0 animate-pulse rounded px-1.5 py-0.5 text-[8px] font-medium uppercase tracking-[0.1em] text-white'
                        style={{
                          fontFamily: "'DM Mono', monospace",
                          background: '#E8441C',
                          animationDuration: '2s',
                        }}
                      >
                        Live
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Settings footer */}
      <div className='border-t border-white/[0.06] p-3'>
        <Link
          href='/settings'
          onClick={onNavigate}
          className={cn(
            'group relative flex items-center gap-2.5 rounded-[10px] border px-2.5 py-[9px] transition-all duration-[180ms]',
            pathname === '/settings'
              ? 'border-[rgba(232,68,28,0.3)] bg-[rgba(232,68,28,0.12)]'
              : 'border-transparent hover:border-white/[0.06] hover:bg-white/[0.04]',
          )}
        >
          {pathname === '/settings' && (
            <span className='absolute left-0 top-1/2 h-[18px] w-[3px] -translate-y-1/2 rounded-r-[3px] bg-[#E8441C]' />
          )}

          <div
            className={cn(
              'flex size-8 shrink-0 items-center justify-center rounded-lg transition-all duration-[180ms]',
              pathname === '/settings'
                ? 'bg-[rgba(232,68,28,0.15)]'
                : 'bg-white/[0.04] group-hover:bg-white/[0.06]',
            )}
          >
            <Settings
              className={cn(
                'size-3.5 shrink-0 transition-colors duration-[180ms]',
                pathname === '/settings'
                  ? 'text-[#FF6B3D]'
                  : 'text-[#4A4845] group-hover:text-[#8A8880]',
              )}
              strokeWidth={2}
            />
          </div>

          <span
            className={cn(
              'flex-1 truncate text-[13px] font-medium tracking-[-0.01em] transition-colors duration-[180ms]',
              pathname === '/settings'
                ? 'text-[#F0EEE8]'
                : 'text-[#8A8880] group-hover:text-[#F0EEE8]',
            )}
          >
            Configurações
          </span>
        </Link>
      </div>
    </>
  );
}

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export function Sidebar({ open = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [isClosing, setIsClosing] = useState(false);
  const isDrawerVisible = open || isClosing;
  const closingRef = useRef(false);

  const handleClose = useCallback(() => {
    if (!onClose || closingRef.current) return;
    closingRef.current = true;
    setIsClosing(true);
    const timer = setTimeout(() => {
      onClose();
      setIsClosing(false);
      closingRef.current = false;
    }, 200);
    return () => clearTimeout(timer);
  }, [onClose]);

  // Fecha ao navegar (sem animação)
  useEffect(() => {
    if (open && onClose) {
      setIsClosing(false);
      closingRef.current = false;
      onClose();
    }
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  // Bloqueia scroll do body quando sidebar aberta no mobile
  useEffect(() => {
    if (open) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [open]);

  // Fecha com tecla ESC
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, handleClose]);

  const sidebarClasses =
    'relative w-64 min-h-screen flex flex-col overflow-hidden bg-[#0a0a0f] border-r border-white/[0.06] fixed top-0 left-0 z-[100]';

  return (
    <>
      {/* Desktop */}
      <aside className={cn('hidden lg:flex', sidebarClasses)}>
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      {isDrawerVisible && (
        <div
          className='fixed inset-0 z-[200] lg:hidden'
          aria-modal='true'
          role='dialog'
          aria-label='Menu de navegação'
        >
          <button
            onClick={handleClose}
            className={cn(
              'absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-200',
              isClosing && 'opacity-0',
            )}
            aria-label='Fechar menu'
          />
          <aside
            className={cn(
              'absolute left-0 top-0 flex h-full w-72 max-w-[90vw] flex-col',
              'bg-[#0a0a0f] border-r border-white/[0.06]',
              'shadow-[4px_0_32px_rgba(0,0,0,0.6)]',
              isClosing ? 'animate-slide-out-left' : 'animate-slide-in-left',
            )}
          >
            <SidebarContent onNavigate={onClose} onClose={handleClose} />
          </aside>
        </div>
      )}
    </>
  );
}
