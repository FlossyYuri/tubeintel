'use client';

import { Menu } from 'lucide-react';
import { QuotaTracker } from './QuotaTracker';

interface TopbarProps {
  title: string;
  onToggleSidebar?: () => void;
}

export function Topbar({ title, onToggleSidebar }: TopbarProps) {
  return (
    <div
      className='sticky top-0 z-50 flex h-[60px] items-center justify-between gap-3 border-b border-white/[0.06] bg-[#0a0a0f]/80 px-4 sm:px-5 lg:px-7'
      style={{
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      {/* Left: hamburger + title */}
      <div className='flex min-w-0 items-center gap-3'>
        {onToggleSidebar && (
          <button
            type='button'
            onClick={onToggleSidebar}
            className='lg:hidden -ml-1.5 flex size-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.04] text-[#4A4845] transition-all duration-200 hover:bg-white/[0.08] hover:text-[#F0EEE8] focus-visible:ring-2 focus-visible:ring-[#E8441C]'
            aria-label='Abrir menu'
          >
            <Menu className='size-4' />
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
