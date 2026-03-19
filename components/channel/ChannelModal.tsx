"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, ExternalLink, Users, Video, Eye, Bell } from "lucide-react";
import { formatNumber, formatDate } from "@/lib/format";
import { buttonPrimary } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";
import type { ChannelWithStats } from "@/types/youtube";

interface ChannelModalProps {
  channel: ChannelWithStats | null;
  onClose: () => void;
}

/** Views por subscritor – proxy de engagement do canal */
function getViewsPerSub(ch: ChannelWithStats): number {
  if (ch.subscriberCount <= 0) return 0;
  return ch.viewCount / ch.subscriberCount;
}

export function ChannelModal({ channel, onClose }: ChannelModalProps) {
  const [alertStatus, setAlertStatus] = useState<"idle" | "loading" | "done" | "exists">("idle");

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  useEffect(() => {
    if (!channel) return;
    fetch("/api/alerts")
      .then((r) => r.json())
      .then((alerts: Array<{ type: string; value: string }>) => {
        const exists = Array.isArray(alerts) && alerts.some(
          (a) => a.type === "channel" && a.value === channel.channelId
        );
        setAlertStatus(exists ? "exists" : "idle");
      })
      .catch(() => setAlertStatus("idle"));
  }, [channel?.channelId]);

  const handleCreateAlert = async () => {
    if (!channel || alertStatus !== "idle") return;
    setAlertStatus("loading");
    try {
      await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "channel", value: channel.channelId }),
      });
      setAlertStatus("done");
    } catch {
      setAlertStatus("idle");
    }
  };

  if (!channel) return null;

  const viewsPerSub = getViewsPerSub(channel);
  const avgViews =
    channel.videoCount > 0
      ? Math.round(channel.viewCount / channel.videoCount)
      : 0;

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-5 bg-black/70 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-[min(600px,calc(100vw-2rem))] max-h-[85vh] overflow-y-auto rounded-2xl border border-white/[0.06] bg-[#0a0a0f] p-4 sm:p-7 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2.5 rounded-lg flex items-center justify-center border border-white/[0.06] bg-white/[0.02] text-[#8A8880] hover:bg-[#E8441C] hover:border-[#E8441C] hover:text-white transition-colors duration-200"
          aria-label="Fechar"
        >
          <X className="size-4" />
        </button>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6 pr-12">
          <div className="size-16 shrink-0 overflow-hidden rounded-full border-2 border-white/[0.08] bg-[#111118]">
            {channel.thumbnail ? (
              <img
                src={channel.thumbnail}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xl font-bold text-[#8A8880]">
                {channel.name?.charAt(0)?.toUpperCase() || "?"}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3
              className="text-lg font-extrabold tracking-tight text-[#F0EEE8] mb-1"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              {channel.name}
            </h3>
            <Link
              href={`/channels/${channel.channelId}`}
              className="inline-flex items-center gap-1.5 text-sm text-[#4A9EE8] hover:text-[#6BB3FF] transition-colors"
            >
              Ver detalhes completos
              <ExternalLink className="size-3.5" />
            </Link>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <div className="flex items-center gap-2 mb-1">
              <Users className="size-3.5 text-[#E8441C]" />
              <span
                className="text-[9px] uppercase tracking-[0.15em] text-[#3E3C38]"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                Subs
              </span>
            </div>
            <span
              className="text-[18px] font-bold text-[#E8441C]"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              {formatNumber(channel.subscriberCount)}
            </span>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <div className="flex items-center gap-2 mb-1">
              <Eye className="size-3.5 text-[#4A9EE8]" />
              <span
                className="text-[9px] uppercase tracking-[0.15em] text-[#3E3C38]"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                Views
              </span>
            </div>
            <span
              className="text-[18px] font-bold text-[#4A9EE8]"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              {formatNumber(channel.viewCount)}
            </span>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <div className="flex items-center gap-2 mb-1">
              <Video className="size-3.5 text-[#3DBF7F]" />
              <span
                className="text-[9px] uppercase tracking-[0.15em] text-[#3E3C38]"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                Vídeos
              </span>
            </div>
            <span
              className="text-[18px] font-bold text-[#3DBF7F]"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              {formatNumber(channel.videoCount)}
            </span>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <span
              className="text-[9px] uppercase tracking-[0.15em] text-[#3E3C38]"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              Views/Sub
            </span>
            <span
              className="block text-[18px] font-bold text-[#9B6EE8] mt-1"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              {viewsPerSub >= 1
                ? formatNumber(viewsPerSub) + "x"
                : viewsPerSub.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Extra metrics */}
        <div className="flex flex-wrap gap-3 mb-6 p-3 rounded-xl border border-white/[0.06] bg-white/[0.02]">
          <div>
            <span
              className="text-[9px] uppercase tracking-[0.15em] text-[#3E3C38]"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              Média views/vídeo
            </span>
            <span
              className="block text-sm font-semibold text-[#F0EEE8]"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              {formatNumber(avgViews)}
            </span>
          </div>
          {channel.publishedAt && (
            <div>
              <span
                className="text-[9px] uppercase tracking-[0.15em] text-[#3E3C38]"
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                Criado
              </span>
              <span
                className="block text-sm font-semibold text-[#F0EEE8]"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                {formatDate(channel.publishedAt)}
              </span>
            </div>
          )}
        </div>

        {/* Description */}
        {channel.description && (
          <div className="mb-6">
            <span
              className="text-[9px] uppercase tracking-[0.15em] text-[#3E3C38]"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              Sobre
            </span>
            <p
              className="mt-2 text-sm text-[#8A8880] line-clamp-4 whitespace-pre-wrap"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              {channel.description}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2.5 flex-wrap">
          <a
            href={`https://www.youtube.com/channel/${channel.channelId}`}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonPrimary + " inline-flex items-center justify-center gap-2"}
          >
            <ExternalLink className="size-4" />
            Abrir no YouTube
          </a>
          <Link
            href={`/channels/${channel.channelId}`}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold rounded-xl border border-white/[0.08] bg-white/[0.02] text-[#F0EEE8] hover:bg-white/[0.04] transition-colors"
          >
            Ver detalhes completos
          </Link>
          <button
            onClick={handleCreateAlert}
            disabled={alertStatus === "loading" || alertStatus === "done" || alertStatus === "exists"}
            className={cn(
              "inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold rounded-xl border transition-colors",
              alertStatus === "exists" || alertStatus === "done"
                ? "border-[var(--green)]/50 bg-[var(--green)]/10 text-[var(--green)] cursor-default"
                : "border-white/[0.08] bg-white/[0.02] text-[#F0EEE8] hover:bg-white/[0.04] hover:border-[var(--accent)]/50"
            )}
          >
            <Bell className="size-4" />
            {alertStatus === "loading" && "A adicionar..."}
            {alertStatus === "done" && "Adicionado aos alertas"}
            {alertStatus === "exists" && "Já em alertas"}
            {alertStatus === "idle" && "Criar alerta"}
          </button>
        </div>
      </div>
    </div>
  );
}
