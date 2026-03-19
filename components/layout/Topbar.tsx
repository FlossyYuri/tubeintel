'use client';

import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { QuotaTracker } from './QuotaTracker';

interface TopbarProps {
  title: string;
  onToggleSidebar?: () => void;
  sidebarOpen?: boolean;
}

export function Topbar({ title, onToggleSidebar, sidebarOpen = false }: TopbarProps) {
  return (
    <div
      className={cn(
        'sticky top-0 flex h-[60px] items-center justify-between gap-3 border-b border-white/[0.06] bg-[#0a0a0f]/80 px-4 sm:px-5 lg:px-7',
        sidebarOpen ? 'z-[210]' : 'z-50',
      )}
      style={{
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      {/* Left: hamburger/X + title */}
      <div className='flex min-w-0 items-center gap-3'>
        {onToggleSidebar && (
          <button
            type='button'
            onClick={onToggleSidebar}
            className={cn(
              'md:hidden -ml-1.5 flex size-10 shrink-0 items-center justify-center rounded-lg border transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#E8441C]',
              sidebarOpen
                ? 'border-[rgba(232,68,28,0.3)] bg-[rgba(232,68,28,0.12)] text-[#FF6B3D] hover:bg-[rgba(232,68,28,0.2)]'
                : 'border-white/[0.06] bg-white/[0.04] text-[#4A4845] hover:bg-white/[0.08] hover:text-[#F0EEE8]',
            )}
            aria-label={sidebarOpen ? 'Fechar menu' : 'Abrir menu'}
          >
            {sidebarOpen ? <X className='size-5' /> : <Menu className='size-4' />}
          </button>
        )}

        <h1
          className='truncate text-[15px] font-semibold tracking-[-0.02em] text-[#F0EEE8]'
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          {title}
        </h1>
      </div>

      {/* Right: quota + actions */}
      <div className='flex shrink-0 items-center gap-2'>
        <QuotaTracker />
      </div>
    </div>
  );
}
