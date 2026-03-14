"use client";

import { useEffect } from "react";
import Link from "next/link";
import { X, Bookmark, ExternalLink } from "lucide-react";
import { formatNumber, formatDate, parseDuration } from "@/lib/format";
import { calcEngagementRate, calcViewsPerHour } from "@/lib/viral-score";
import { getCategoryName } from "@/lib/categories";
import { buttonPrimary, buttonSecondary } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";
import type { VideoWithStats } from "@/types/youtube";

interface VideoModalProps {
  video: VideoWithStats | null;
  onClose: () => void;
  onSaveToCollection?: (video: VideoWithStats) => void;
}

export function VideoModal({
  video,
  onClose,
  onSaveToCollection,
}: VideoModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  if (!video) return null;

  const engagementRate = calcEngagementRate(
    video.viewCount,
    video.likeCount,
    video.commentCount
  );
  const viewsPerHour = calcViewsPerHour(video.viewCount, video.publishedAt);
  const categoryName = getCategoryName(video.categoryId);

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[1000] flex items-center justify-center p-4 sm:p-5"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-[var(--bg2)] border border-[var(--border2)] rounded-2xl w-full max-w-[700px] max-h-[85vh] sm:max-h-[90vh] overflow-y-auto p-4 sm:p-7 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2.5 sm:p-2 bg-[var(--card)] border border-[var(--border)] text-[var(--text)] rounded-lg flex items-center justify-center hover:bg-[var(--accent)] hover:border-[var(--accent)] transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]"
          aria-label="Fechar"
        >
          <X className="size-4" />
        </button>

        <h3 className="text-base sm:text-lg font-bold mb-1 pr-12 font-display">
          {video.title}
        </h3>
        <p className="text-[var(--blue2)] text-sm mb-4">
          {video.channelId ? (
            <Link
              href={`/channels/${video.channelId}`}
              className="hover:underline inline-flex items-center gap-1"
            >
              📺 {video.channelTitle}
              <ExternalLink className="size-3" />
            </Link>
          ) : (
            <>📺 {video.channelTitle}</>
          )}
        </p>

        <div className="aspect-video rounded-xl overflow-hidden mb-4 bg-black">
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${video.videoId}`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        <div className="flex flex-wrap gap-3 sm:gap-4 text-sm mb-4">
          <span className="text-[var(--accent)]">
            👁 {formatNumber(video.viewCount)} views
          </span>
          <span className="text-[var(--green)]">
            👍 {formatNumber(video.likeCount)} likes
          </span>
          <span className="text-[var(--text3)]">
            💬 {formatNumber(video.commentCount)} comentários
          </span>
          <span className="text-[var(--text3)]">
            🕐 {formatDate(video.publishedAt)}
          </span>
          {video.duration && (
            <span className="text-[var(--text3)]">
              ⏱ {parseDuration(video.duration)}
            </span>
          )}
          <span className="font-bold text-[var(--accent)]">
            Viral Score: {video.viralScore}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 p-3 bg-[var(--card)] rounded-xl border border-[var(--border)]">
          <div>
            <div className="text-[10px] text-[var(--text3)] font-mono uppercase tracking-wider">
              Engagement
            </div>
            <div className="text-sm font-semibold text-[var(--green)]">
              {engagementRate.toFixed(2)}%
            </div>
          </div>
          <div>
            <div className="text-[10px] text-[var(--text3)] font-mono uppercase tracking-wider">
              Views/hora
            </div>
            <div className="text-sm font-semibold text-[var(--blue2)]">
              {formatNumber(viewsPerHour)}
            </div>
          </div>
          {categoryName && (
            <div>
              <div className="text-[10px] text-[var(--text3)] font-mono uppercase tracking-wider">
                Categoria
              </div>
              <div className="text-sm font-semibold">{categoryName}</div>
            </div>
          )}
          {video.definition && (
            <div>
              <div className="text-[10px] text-[var(--text3)] font-mono uppercase tracking-wider">
                Definição
              </div>
              <div className="text-sm font-semibold uppercase">
                {video.definition}
              </div>
            </div>
          )}
        </div>

        {video.tags && video.tags.length > 0 && (
          <div className="mb-4">
            <div className="text-[10px] text-[var(--text3)] font-mono uppercase tracking-wider mb-2">
              Tags
            </div>
            <div className="flex flex-wrap gap-1.5">
              {video.tags.slice(0, 12).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-full bg-[var(--card)] border border-[var(--border)] text-[11px] text-[var(--text2)]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2.5">
          <a
            href={`https://www.youtube.com/watch?v=${video.videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonPrimary, "inline-flex items-center justify-center")}
          >
            ▶ Abrir no YouTube
          </a>
          {onSaveToCollection && (
            <button
              onClick={() => onSaveToCollection(video)}
              className={cn(
                buttonSecondary,
                "inline-flex items-center justify-center gap-2"
              )}
            >
              <Bookmark className="size-4" /> Guardar em colecção
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
