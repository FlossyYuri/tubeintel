"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { ExternalLink, Plus, X } from "lucide-react";
import { formatNumber } from "@/lib/format";
import { PageHeader, Spinner, ErrorMessage } from "@/components/ui";
import { buttonPrimary } from "@/lib/design-tokens";
import { ChannelSearchInput, type ChannelOption } from "@/components/search/ChannelSearchInput";

const CHART_COLORS = [
  "var(--blue2)",
  "var(--purple)",
  "var(--green)",
  "var(--accent)",
];

type ChannelData = {
  channelId: string;
  name: string;
  subs: number;
  views: number;
  videos: number;
  viewsPerVideo: number;
};

const MAX_CHANNELS = 4;

export default function ComparePage() {
  const [channels, setChannels] = useState<(ChannelOption | null)[]>([
    null,
    null,
  ]);
  const [result, setResult] = useState<ChannelData[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedCount = channels.filter(Boolean).length;

  const setChannelAt = (index: number, ch: ChannelOption | null) => {
    setChannels((prev) => {
      const next = [...prev];
      next[index] = ch;
      return next;
    });
  };

  const addChannel = () => {
    if (channels.length < MAX_CHANNELS) {
      setChannels((prev) => [...prev, null]);
    }
  };

  const removeChannel = (index: number) => {
    setChannels((prev) => prev.filter((_, i) => i !== index));
    setResult(null);
  };

  const handleCompare = async () => {
    const selected = channels.filter((c): c is ChannelOption => c != null);
    if (selected.length < 2) {
      setError("Selecciona pelo menos 2 canais");
      return;
    }
    setError("");
    setLoading(true);
    setResult(null);

    try {
      const responses = await Promise.all(
        selected.map((ch) =>
          fetch(`/api/youtube/channel?channelId=${encodeURIComponent(ch.channelId)}`)
        )
      );
      const datas = await Promise.all(responses.map((r) => r.json()));

      const getFirst = (
        data: {
          channels?: {
            items?: Array<{
              id: string;
              statistics: Record<string, string>;
              snippet: { title: string };
            }>;
          };
        },
        channelId: string
      ): ChannelData | null => {
        const ch = data.channels?.items?.[0];
        if (!ch) return null;
        const subs = parseInt(ch.statistics?.subscriberCount || "0", 10);
        const views = parseInt(ch.statistics?.viewCount || "0", 10);
        const videos = parseInt(ch.statistics?.videoCount || "1", 10);
        return {
          channelId,
          name: ch.snippet?.title || "",
          subs,
          views,
          videos,
          viewsPerVideo: Math.round(views / videos),
        };
      };

      const results: ChannelData[] = [];
      for (let i = 0; i < selected.length; i++) {
        const c = getFirst(datas[i], selected[i].channelId);
        if (!c) throw new Error(`Canal ${i + 1} não encontrado`);
        results.push(c);
      }
      setResult(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao comparar");
    } finally {
      setLoading(false);
    }
  };

  const metrics = result
    ? [
        { label: "Subscribers", key: "subs" as const },
        { label: "Total Views", key: "views" as const },
        { label: "Vídeos", key: "videos" as const },
        { label: "Views/Vídeo", key: "viewsPerVideo" as const },
      ]
    : [];

  const maxVals = result
    ? metrics.reduce(
        (acc, m) => {
          const vals = result.map((r) => r[m.key]);
          acc[m.key] = Math.max(...vals, 1);
          return acc;
        },
        {} as Record<string, number>
      )
    : {};

  const radarData = result
    ? [
        {
          subject: "Subs",
          ...Object.fromEntries(
            result.map((r, i) => [`ch${i}`, (r.subs / maxVals.subs) * 100])
          ),
          fullMark: 100,
        },
        {
          subject: "Views",
          ...Object.fromEntries(
            result.map((r, i) => [`ch${i}`, (r.views / maxVals.views) * 100])
          ),
          fullMark: 100,
        },
        {
          subject: "Vídeos",
          ...Object.fromEntries(
            result.map((r, i) => [`ch${i}`, (r.videos / maxVals.videos) * 100])
          ),
          fullMark: 100,
        },
        {
          subject: "Views/Video",
          ...Object.fromEntries(
            result.map((r, i) => [
              `ch${i}`,
              (r.viewsPerVideo / Math.max(maxVals.viewsPerVideo, 1)) * 100,
            ])
          ),
          fullMark: 100,
        },
      ]
    : [];

  return (
    <div>
      <PageHeader
        title="⚖️ Comparar Canais"
        description="Análise competitiva lado a lado (2 a 4 canais)"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-start mb-6">
        {channels.map((ch, i) => (
          <div key={i} className="space-y-2">
            <label className="text-xs font-mono uppercase text-[var(--text3)]">
              Canal {String.fromCharCode(65 + i)}
            </label>
            {ch ? (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-[var(--card)] border border-[var(--border)]">
                <div className="size-8 rounded-full bg-[var(--bg3)] overflow-hidden shrink-0">
                  {ch.thumbnail && (
                    <img
                      src={ch.thumbnail}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <span className="font-semibold truncate flex-1">{ch.name}</span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setChannelAt(i, null)}
                    className="text-[var(--text3)] hover:text-[var(--accent)] text-xs"
                  >
                    Trocar
                  </button>
                  {channels.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeChannel(i)}
                      className="text-[var(--text3)] hover:text-[var(--accent)] p-0.5"
                      aria-label="Remover"
                    >
                      <X className="size-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <ChannelSearchInput
                onSelect={(c) => setChannelAt(i, c)}
                placeholder="Pesquisa canal..."
              />
            )}
          </div>
        ))}
        {channels.length < MAX_CHANNELS && (
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase text-[var(--text3)] opacity-0">
              +
            </label>
            <button
              type="button"
              onClick={addChannel}
              className="w-full p-3 rounded-xl border border-dashed border-[var(--border)] text-[var(--text3)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="size-4" /> Adicionar canal
            </button>
          </div>
        )}
      </div>
      <div className="text-center mb-6">
        <button
          onClick={handleCompare}
          disabled={loading || selectedCount < 2}
          className={buttonPrimary}
        >
          {loading ? "A comparar..." : "⚡ Comparar Agora"}
        </button>
      </div>

      {error && <ErrorMessage message={error} className="mb-5" />}

      {result && result.length > 0 && (
        <>
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 mb-6 overflow-x-auto">
            <div
              className="grid gap-4 items-center mb-4 pb-4 border-b border-[var(--border)]"
              style={{
                gridTemplateColumns: `1fr repeat(${result.length}, minmax(120px, 1fr))`,
              }}
            >
              <div className="text-[var(--text3)] font-mono text-xs uppercase">
                Métrica
              </div>
              {result.map((r, i) => (
                <div key={r.channelId} className="flex items-center gap-2">
                  <span
                    className="font-bold truncate"
                    style={{ color: CHART_COLORS[i % CHART_COLORS.length] }}
                  >
                    {r.name}
                  </span>
                  <Link
                    href={`/channels/${r.channelId}`}
                    className="text-[var(--text3)] hover:opacity-80 shrink-0"
                    title="Ver análise"
                  >
                    <ExternalLink className="size-4" />
                  </Link>
                </div>
              ))}
            </div>
            {metrics.map((m) => (
              <div
                key={m.label}
                className="grid gap-4 items-center py-2.5 border-b border-[var(--border)] last:border-0"
                style={{
                  gridTemplateColumns: `1fr repeat(${result.length}, minmax(120px, 1fr))`,
                }}
              >
                <div className="text-[10px] uppercase text-[var(--text3)] font-mono">
                  {m.label}
                </div>
                {result.map((r, i) => (
                  <div
                    key={r.channelId}
                    className="font-bold"
                    style={{ color: CHART_COLORS[i % CHART_COLORS.length] }}
                  >
                    {formatNumber(r[m.key])}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {radarData.length > 0 && result.length <= 4 && (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="var(--border)" />
                  <PolarAngleAxis
                    dataKey="subject"
                    stroke="var(--text3)"
                    fontSize={11}
                  />
                  <PolarRadiusAxis stroke="var(--text3)" fontSize={10} />
                  {result.map((r, i) => (
                    <Radar
                      key={r.channelId}
                      name={r.name}
                      dataKey={`ch${i}`}
                      stroke={CHART_COLORS[i % CHART_COLORS.length]}
                      fill={CHART_COLORS[i % CHART_COLORS.length]}
                      fillOpacity={0.2}
                    />
                  ))}
                  <Legend />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </div>
  );
}
