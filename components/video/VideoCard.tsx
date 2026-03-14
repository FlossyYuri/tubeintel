"use client";

import Image from "next/image";
import { ViralScore } from "./ViralScore";
import { formatNumber, formatDate, parseDuration, isShort } from "@/lib/format";
import type { VideoWithStats } from "@/types/youtube";

interface VideoCardProps {
  video: VideoWithStats;
  listView?: boolean;
  onOpen?: (video: VideoWithStats) => void;
}

export function VideoCard({ video, listView = false, onOpen }: VideoCardProps) {
  const score = video.viralScore;
  const short = isShort(video.duration || "", video.title);
  const pub = formatDate(video.publishedAt);
  const isNew = pub.includes("h atrás") || pub.includes("m atrás");

  return (
    <div
      className={`bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden transition-all cursor-pointer hover:border-[var(--border2)] hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)] ${
        listView ? "flex items-center gap-0" : ""
      }`}
      onClick={() => onOpen?.(video)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onOpen?.(video)}
    >
      <div
        className={`relative aspect-video bg-[var(--bg3)] overflow-hidden ${
          listView ? "w-[180px] min-w-[180px] shrink-0" : ""
        }`}
      >
        {video.thumbnail && (
          <Image
            src={video.thumbnail}
            alt=""
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes={listView ? "180px" : "(max-width: 400px) 100vw, 280px"}
          />
        )}
        {score >= 75 && (
          <div
            className="absolute top-2 left-2 bg-[var(--accent)] text-white text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider"
            style={{ fontFamily: "Space Mono, monospace" }}
          >
            viral
          </div>
        )}
        {short ? (
          <div className="absolute top-2 right-2 bg-[var(--purple)] text-white text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider">
            Short
          </div>
        ) : (
          video.duration && (
            <div
              className="absolute bottom-2 right-2 bg-black/85 text-white text-[10px] px-1.5 py-0.5 rounded"
              style={{ fontFamily: "Space Mono, monospace" }}
            >
              {parseDuration(video.duration)}
            </div>
          )
        )}
      </div>
      <div className={`p-3.5 ${listView ? "flex-1" : ""}`}>
        <div className="flex gap-1 flex-wrap mb-2">
          {short ? (
            <span className="inline-block px-2 py-0.5 rounded text-[9.5px] uppercase tracking-wider font-mono bg-[rgba(176,109,255,0.15)] text-[var(--purple)] border border-[rgba(176,109,255,0.3)]">Short</span>
          ) : (
            <span className="inline-block px-2 py-0.5 rounded text-[9.5px] uppercase tracking-wider font-mono bg-[rgba(61,139,255,0.15)] text-[var(--blue2)] border border-[rgba(61,139,255,0.3)]">Long Form</span>
          )}
          {score >= 75 && (
            <span className="inline-block px-2 py-0.5 rounded text-[9.5px] uppercase tracking-wider font-mono bg-[rgba(255,61,61,0.15)] text-[var(--accent)] border border-[rgba(255,61,61,0.3)]">Viral</span>
          )}
          {isNew && (
            <span className="inline-block px-2 py-0.5 rounded text-[9.5px] uppercase tracking-wider font-mono bg-[rgba(0,217,126,0.15)] text-[var(--green)] border border-[rgba(0,217,126,0.3)]">Novo</span>
          )}
        </div>
        <h3 className="text-[13px] font-semibold leading-snug mb-2 line-clamp-2">
          {video.title}
        </h3>
        <p className="text-[11px] text-[var(--blue2)] mb-2.5">📺 {video.channelTitle}</p>
        <div className="flex gap-2.5 flex-wrap text-[10px] font-mono">
          {video.viewCount > 0 && (
            <span className="text-[var(--accent)]">👁 {formatNumber(video.viewCount)}</span>
          )}
          {video.likeCount > 0 && (
            <span className="text-[var(--green)]">👍 {formatNumber(video.likeCount)}</span>
          )}
          {video.commentCount > 0 && (
            <span className="text-[var(--text3)]">💬 {formatNumber(video.commentCount)}</span>
          )}
          {pub && <span className="text-[var(--text3)]">🕐 {pub}</span>}
        </div>
        <ViralScore score={score} />
      </div>
    </div>
  );
}
