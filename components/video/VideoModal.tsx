"use client";

import { useEffect } from "react";
import { X, Bookmark } from "lucide-react";
import { formatNumber, formatDate } from "@/lib/format";
import type { VideoWithStats } from "@/types/youtube";

interface VideoModalProps {
  video: VideoWithStats | null;
  onClose: () => void;
  onSaveToCollection?: (video: VideoWithStats) => void;
}

export function VideoModal({ video, onClose, onSaveToCollection }: VideoModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  if (!video) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[1000] flex items-center justify-center p-5"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-[var(--bg2)] border border-[var(--border2)] rounded-2xl w-full max-w-[700px] max-h-[90vh] overflow-y-auto p-7 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-[var(--card)] border border-[var(--border)] text-[var(--text)] size-8 rounded-lg flex items-center justify-center hover:bg-[var(--accent)] hover:border-[var(--accent)] transition-colors"
          aria-label="Fechar"
        >
          <X className="size-4" />
        </button>

        <h3
          className="text-lg font-bold mb-1 pr-10"
          style={{ fontFamily: "Syne, sans-serif" }}
        >
          {video.title}
        </h3>
        <p className="text-[var(--blue2)] text-sm mb-4">📺 {video.channelTitle}</p>

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

        <div className="flex flex-wrap gap-4 text-sm mb-4">
          <span className="text-[var(--accent)]">👁 {formatNumber(video.viewCount)} views</span>
          <span className="text-[var(--green)]">👍 {formatNumber(video.likeCount)} likes</span>
          <span className="text-[var(--text3)]">💬 {formatNumber(video.commentCount)} comentários</span>
          <span className="text-[var(--text3)]">🕐 {formatDate(video.publishedAt)}</span>
          <span className="font-bold" style={{ color: "var(--accent)" }}>
            Viral Score: {video.viralScore}
          </span>
        </div>

        <div className="flex gap-2.5 flex-wrap">
          <a
            href={`https://www.youtube.com/watch?v=${video.videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block py-3 px-6 bg-[var(--accent)] text-white font-bold rounded-lg hover:bg-[#ff5555] transition-colors"
            style={{ fontFamily: "Syne, sans-serif" }}
          >
            ▶ Abrir no YouTube
          </a>
          {onSaveToCollection && (
            <button
              onClick={() => onSaveToCollection(video)}
              className="inline-flex items-center gap-2 py-3 px-6 bg-[var(--card2)] border border-[var(--border)] text-[var(--text)] font-bold rounded-lg hover:bg-[var(--border)] transition-colors"
              style={{ fontFamily: "Syne, sans-serif" }}
            >
              <Bookmark className="size-4" /> Guardar em colecção
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
