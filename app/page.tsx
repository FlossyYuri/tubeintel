'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Flame, Tv, Bookmark, ArrowUpRight } from 'lucide-react';

const quickLinks = [
  {
    href: '/search',
    icon: Search,
    label: 'Pesquisar Vídeos',
    description: 'Encontra vídeos virais por keyword',
    color: {
      text: '#E8441C',
      bg: 'rgba(232,68,28,0.08)',
      border: 'rgba(232,68,28,0.2)',
    },
  },
  {
    href: '/trending',
    icon: Flame,
    label: 'Trending',
    description: 'Vídeos em alta por país',
    color: {
      text: '#E8941C',
      bg: 'rgba(232,148,28,0.08)',
      border: 'rgba(232,148,28,0.2)',
    },
  },
  {
    href: '/channels',
    icon: Tv,
    label: 'Analisar Canal',
    description: 'Métricas detalhadas de qualquer canal',
    color: {
      text: '#4A9EE8',
      bg: 'rgba(74,158,232,0.08)',
      border: 'rgba(74,158,232,0.2)',
    },
  },
  {
    href: '/saved',
    icon: Bookmark,
    label: 'Colecções',
    description: 'Vídeos e canais guardados',
    color: {
      text: '#3DBF7F',
      bg: 'rgba(61,191,127,0.08)',
      border: 'rgba(61,191,127,0.2)',
    },
  },
];

export default function HomePage() {
  const [stats, setStats] = useState({ collections: 0, alerts: 0 });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/collections')
        .then((r) => r.json())
        .then((d) => (Array.isArray(d) ? d.length : 0)),
      fetch('/api/alerts')
        .then((r) => r.json())
        .then((d) => (Array.isArray(d) ? d.length : 0)),
    ]).then(([collections, alerts]) => {
      setStats({ collections, alerts });
      setLoaded(true);
    });
  }, []);

  return (
    <div className='flex flex-col gap-8'>
      {/* Header */}
      <div className='flex flex-col gap-1 pt-1'>
        <h1
          className='text-[28px] font-extrabold leading-none tracking-tight text-[#F0EEE8]'
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          Dashboard
        </h1>
        <p
          className='text-[12px] text-[#4A4845]'
          style={{ fontFamily: "'DM Mono', monospace" }}
        >
          Configura a tua API Key em Configurações para começar.
        </p>
      </div>

      {/* Stats row */}
      <div className='grid grid-cols-2 gap-3 sm:gap-4'>
        {[
          {
            label: 'Colecções',
            value: stats.collections,
            color: '#E8441C',
            glow: 'rgba(232,68,28,0.08)',
          },
          {
            label: 'Alertas',
            value: stats.alerts,
            color: '#4A9EE8',
            glow: 'rgba(74,158,232,0.08)',
          },
        ].map(({ label, value, color, glow }) => (
          <div
            key={label}
            className='group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 transition-all duration-200 hover:border-white/[0.1] hover:bg-white/[0.04]'
          >
            {/* Corner glow */}
            <div
              className='pointer-events-none absolute -right-6 -top-6 size-20 rounded-full opacity-60 blur-2xl transition-opacity duration-300 group-hover:opacity-100'
              style={{ background: glow }}
            />
            <p
              className='mb-3 text-[9px] uppercase tracking-[0.2em] text-[#3E3C38]'
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              {label}
            </p>
            <p
              className='text-[32px] font-extrabold leading-none tracking-tight transition-all duration-500'
              style={{
                fontFamily: "'Syne', sans-serif",
                color,
                opacity: loaded ? 1 : 0,
                transform: loaded ? 'translateY(0)' : 'translateY(6px)',
              }}
            >
              {value}
            </p>
            {/* Bottom bar */}
            <div
              className='absolute bottom-0 left-0 h-[2px] w-0 rounded-full transition-all duration-300 group-hover:w-full'
              style={{ background: color }}
            />
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div>
        <p
          className='mb-3 text-[9px] uppercase tracking-[0.2em] text-[#3E3C38]'
          style={{ fontFamily: "'DM Mono', monospace" }}
        >
          Acesso Rápido
        </p>
        <div className='grid gap-2 sm:grid-cols-2'>
          {quickLinks.map(({ href, icon: Icon, label, description, color }) => (
            <Link
              key={href}
              href={href}
              className='group flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 transition-all duration-200 hover:border-white/[0.1] hover:bg-white/[0.04]'
            >
              {/* Icon box */}
              <div
                className='flex size-10 shrink-0 items-center justify-center rounded-xl border transition-all duration-200 group-hover:scale-105'
                style={{
                  background: color.bg,
                  borderColor: color.border,
                }}
              >
                <Icon
                  className='size-4 shrink-0'
                  style={{ color: color.text }}
                  strokeWidth={2}
                />
              </div>

              {/* Text */}
              <div className='flex-1 min-w-0'>
                <p
                  className='text-[14px] font-semibold leading-tight tracking-tight text-[#F0EEE8]'
                  style={{ fontFamily: "'Syne', sans-serif" }}
                >
                  {label}
                </p>
                <p
                  className='mt-0.5 truncate text-[11px] text-[#4A4845]'
                  style={{ fontFamily: "'DM Mono', monospace" }}
                >
                  {description}
                </p>
              </div>

              {/* Arrow */}
              <ArrowUpRight
                className='size-4 shrink-0 text-[#3E3C38] transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5'
                style={{ color: '#3E3C38' }}
              />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
