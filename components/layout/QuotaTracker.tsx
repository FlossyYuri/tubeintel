'use client';

import { useEffect, useState } from 'react';

const QUOTA_LIMIT = 10000;

function getStoredQuota(): number {
  if (typeof window === 'undefined') return 0;
  const stored = localStorage.getItem('tubeintel_quota_used');
  const date = localStorage.getItem('tubeintel_quota_date');
  const today = new Date().toDateString();

  if (date === today && stored) {
    return parseInt(stored, 10);
  }
  localStorage.setItem('tubeintel_quota_used', '0');
  localStorage.setItem('tubeintel_quota_date', today);
  return 0;
}

export function QuotaTracker() {
  const [used, setUsed] = useState(0);

  useEffect(() => {
    setUsed(getStoredQuota());
    const handler = () => setUsed(getStoredQuota());
    window.addEventListener('quota-update', handler);
    return () => window.removeEventListener('quota-update', handler);
  }, []);

  const pct = Math.min((used / QUOTA_LIMIT) * 100, 100);

  // Cor do fill muda conforme uso
  const fillColor = pct >= 90 ? '#E8441C' : pct >= 65 ? '#E8941C' : '#3E3C38';

  return (
    <div
      className='group flex items-center gap-2.5 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 transition-all duration-200 hover:border-white/[0.1] hover:bg-white/[0.05]'
      title={`API Quota: ${used.toLocaleString()} / ${QUOTA_LIMIT.toLocaleString()} unidades usadas hoje`}
    >
      {/* Barra de progresso vertical */}
      <div className='relative h-[18px] w-[3px] overflow-hidden rounded-full bg-white/[0.06]'>
        <div
          className='absolute bottom-0 left-0 w-full rounded-full transition-all duration-500'
          style={{ height: `${pct}%`, background: fillColor }}
        />
      </div>

      {/* Texto */}
      <div
        className='flex items-baseline gap-1'
        style={{ fontFamily: "'DM Mono', monospace" }}
      >
        <span
          className='text-[11px] font-medium transition-colors duration-200'
          style={{ color: fillColor === '#3E3C38' ? '#8A8880' : fillColor }}
        >
          {used.toLocaleString()}
        </span>
        <span className='text-[10px] text-[#3E3C38]'>
          /{QUOTA_LIMIT.toLocaleString()}
        </span>
        <span className='hidden text-[10px] text-[#3E3C38] sm:inline'>
          &nbsp;quota
        </span>
      </div>
    </div>
  );
}

export function useQuota() {
  const addQuota = (cost: number) => {
    const stored = localStorage.getItem('tubeintel_quota_used');
    const date = localStorage.getItem('tubeintel_quota_date');
    const today = new Date().toDateString();

    let current = 0;
    if (date === today && stored) {
      current = parseInt(stored, 10);
    }

    const newTotal = Math.min(current + cost, QUOTA_LIMIT);
    localStorage.setItem('tubeintel_quota_used', String(newTotal));
    localStorage.setItem('tubeintel_quota_date', today);
    window.dispatchEvent(new Event('quota-update'));
  };

  return { addQuota };
}
