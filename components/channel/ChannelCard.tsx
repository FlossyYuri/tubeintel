'use client';

import Image from 'next/image';
import Link from 'next/link';
import { formatNumber } from '@/lib/format';
import { ArrowUpRight } from 'lucide-react';
import type { ChannelWithStats } from '@/types/youtube';

interface ChannelCardProps {
  channelId: string;
  name: string;
  thumbnail: string;
  subscriberCount: number;
  videoCount: number;
  viewCount: number;
  description?: string;
  /** Canal completo para modal; quando fornecido com onChannelOpen, o card abre o modal ao clicar */
  channel?: ChannelWithStats;
  onChannelOpen?: (channel: ChannelWithStats) => void;
}

export function ChannelCard({
  channelId,
  name,
  thumbnail,
  subscriberCount,
  videoCount,
  viewCount,
  description,
  channel,
  onChannelOpen,
}: ChannelCardProps) {
  const initial = name.charAt(0).toUpperCase();
  const isClickable = channel && onChannelOpen;

  const content = (
    <>
      {/* Avatar */}
      <div className='relative size-14 shrink-0'>
        <div className='size-14 overflow-hidden rounded-full border border-white/[0.08] bg-[#111118]'>
          {thumbnail ? (
            <Image
              src={thumbnail}
              alt=''
              width={56}
              height={56}
              className='h-full w-full object-cover'
            />
          ) : (
            <div
              className='flex h-full w-full items-center justify-center text-xl font-bold text-[#8A8880]'
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              {initial}
            </div>
          )}
        </div>
        {/* Online dot (decorativo) */}
        <span className='absolute bottom-0.5 right-0.5 size-2.5 rounded-full border-2 border-[#0a0a0f] bg-[#3E3C38]' />
      </div>

      {/* Info */}
      <div className='flex-1 min-w-0'>
        <div
          className='mb-0.5 truncate text-[15px] font-semibold tracking-tight text-[#F0EEE8]'
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          {name}
        </div>
        {description && (
          <div
            className='mb-3 truncate text-[11px] text-[#4A4845]'
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            {description}
          </div>
        )}

        {/* Stats */}
        <div className='flex flex-wrap gap-4 sm:gap-5'>
          {[
            { value: subscriberCount, label: 'Subs' },
            { value: videoCount, label: 'Vídeos' },
            { value: viewCount, label: 'Views' },
          ].map(({ value, label }) => (
            <div key={label} className='flex flex-col gap-0.5'>
              <span className='text-[13px] font-semibold leading-none text-[#F0EEE8]'>
                {formatNumber(value)}
              </span>
              <span
                className='text-[9px] uppercase tracking-[0.15em] text-[#3E3C38]'
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      {isClickable ? (
        <Link
          href={`/channels/${channelId}`}
          onClick={(e) => e.stopPropagation()}
          className='flex shrink-0 items-center gap-1 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 transition-all duration-200 group-hover:border-[rgba(232,68,28,0.3)] group-hover:bg-[rgba(232,68,28,0.08)]'
        >
          <span
            className='text-[10px] font-medium text-[#4A4845] transition-colors duration-200 group-hover:text-[#FF6B3D]'
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            Ver detalhes
          </span>
          <ArrowUpRight className='size-3 text-[#4A4845] transition-colors duration-200 group-hover:text-[#FF6B3D]' />
        </Link>
      ) : (
        <div className='flex shrink-0 items-center gap-1 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 transition-all duration-200 group-hover:border-[rgba(232,68,28,0.3)] group-hover:bg-[rgba(232,68,28,0.08)]'>
          <span
            className='text-[10px] font-medium text-[#4A4845] transition-colors duration-200 group-hover:text-[#FF6B3D]'
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            Ver detalhes
          </span>
          <ArrowUpRight className='size-3 text-[#4A4845] transition-colors duration-200 group-hover:text-[#FF6B3D]' />
        </div>
      )}
    </>
  );

  const className =
    'group flex flex-col gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 sm:flex-row sm:items-center sm:p-5 transition-all duration-200 hover:border-white/[0.1] hover:bg-white/[0.04]';

  if (isClickable) {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={() => onChannelOpen(channel)}
        onKeyDown={(e) => e.key === 'Enter' && onChannelOpen(channel)}
        className={className + ' cursor-pointer'}
      >
        {content}
      </div>
    );
  }

  return <Link href={`/channels/${channelId}`} className={className}>{content}</Link>;
}
