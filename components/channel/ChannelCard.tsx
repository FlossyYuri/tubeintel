"use client";

import Image from "next/image";
import Link from "next/link";
import { formatNumber } from "@/lib/format";

interface ChannelCardProps {
  channelId: string;
  name: string;
  thumbnail: string;
  subscriberCount: number;
  videoCount: number;
  viewCount: number;
  description?: string;
}

export function ChannelCard({
  channelId,
  name,
  thumbnail,
  subscriberCount,
  videoCount,
  viewCount,
  description,
}: ChannelCardProps) {
  const initial = name.charAt(0).toUpperCase();

  return (
    <Link
      href={`/channels/${channelId}`}
      className="flex items-center gap-4 p-5 bg-[var(--card)] border border-[var(--border)] rounded-xl transition-all hover:border-[var(--border2)] hover:-translate-y-0.5 hover:shadow-[0_6px_24px_rgba(0,0,0,0.25)]"
    >
      <div className="size-14 rounded-full bg-[var(--bg3)] overflow-hidden shrink-0 border-2 border-[var(--border2)]">
        {thumbnail ? (
          <Image src={thumbnail} alt="" width={56} height={56} className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[var(--text2)] font-bold text-xl">
            {initial}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-bold text-[15px] mb-0.5" style={{ fontFamily: "Syne, sans-serif" }}>
          {name}
        </div>
        {description && (
          <div className="text-[11px] text-[var(--text3)] font-mono mb-2 truncate">
            {description}
          </div>
        )}
        <div className="flex gap-4">
          <div className="text-center">
            <div className="font-bold text-sm text-[var(--text)]">{formatNumber(subscriberCount)}</div>
            <div className="text-[9px] text-[var(--text3)] font-mono uppercase">Subs</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-sm text-[var(--text)]">{formatNumber(videoCount)}</div>
            <div className="text-[9px] text-[var(--text3)] font-mono uppercase">Vídeos</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-sm text-[var(--text)]">{formatNumber(viewCount)}</div>
            <div className="text-[9px] text-[var(--text3)] font-mono uppercase">Views</div>
          </div>
        </div>
      </div>
      <span className="text-[10px] font-mono text-[var(--green)]">Ver detalhes →</span>
    </Link>
  );
}
