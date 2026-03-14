"use client";

import { useState } from "react";
import { SearchBar } from "@/components/search/SearchBar";
import { ChannelCard } from "@/components/channel/ChannelCard";

interface ChannelResult {
  channelId: string;
  name: string;
  thumbnail: string;
  subscriberCount: number;
  videoCount: number;
  viewCount: number;
  description: string;
}

export default function ChannelsPage() {
  const [channels, setChannels] = useState<ChannelResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (query: string) => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/youtube/channel?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Search failed");

      interface ChData {
        subscriberCount: number;
        videoCount: number;
        viewCount: number;
        thumbnail: string;
        name: string;
        description: string;
      }

      const chMap = new Map<string, ChData>();
      (data.channels?.items || []).forEach((c: { id: string; statistics: Record<string, string>; snippet: { title: string; thumbnails: { medium?: { url: string } }; description: string } }) => {
        chMap.set(c.id, {
          subscriberCount: parseInt(c.statistics?.subscriberCount || "0", 10),
          videoCount: parseInt(c.statistics?.videoCount || "0", 10),
          viewCount: parseInt(c.statistics?.viewCount || "0", 10),
          thumbnail: c.snippet?.thumbnails?.medium?.url || "",
          name: c.snippet?.title || "",
          description: (c.snippet?.description?.substring(0, 80) || "") + "...",
        });
      });

      const results: ChannelResult[] = (data.search?.items || [])
        .filter((i: { id?: { channelId?: string } }) => i.id?.channelId)
        .map((i: { id: { channelId: string }; snippet: { title: string } }) => {
          const ch = chMap.get(i.id.channelId);
          return {
            channelId: i.id.channelId,
            name: ch?.name || i.snippet?.title || "",
            thumbnail: ch?.thumbnail || "",
            subscriberCount: ch?.subscriberCount || 0,
            videoCount: ch?.videoCount || 0,
            viewCount: ch?.viewCount || 0,
            description: ch?.description || "",
          };
        });

      setChannels(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro");
      setChannels([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-[22px] font-extrabold mb-1" style={{ fontFamily: "Syne, sans-serif" }}>
        📺 Analisar Canal
      </h2>
      <p className="text-[13px] text-[var(--text2)] mb-6">
        Métricas detalhadas, vídeos recentes e análise de crescimento
      </p>

      <div className="bg-gradient-to-br from-[var(--card)] to-[var(--card2)] border border-[var(--border)] rounded-2xl p-8 mb-7">
        <div className="flex gap-2.5 flex-wrap">
          <SearchBar
            onSearch={handleSearch}
            loading={loading}
            placeholder="Nome do canal, @handle ou URL..."
          />
        </div>
      </div>

      {error && (
        <div className="mb-5 p-4 rounded-xl bg-[rgba(255,61,61,0.08)] border border-[rgba(255,61,61,0.3)] text-sm text-[var(--text2)]">
          ❌ {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-[var(--text3)]">
          <div className="w-9 h-9 border-2 border-[var(--border)] border-t-[var(--accent)] rounded-full animate-spin mx-auto mb-4" />
          <p className="font-mono text-sm">A procurar canal...</p>
        </div>
      ) : channels.length === 0 && !loading ? (
        <div className="text-center py-20 text-[var(--text3)]">
          <div className="text-5xl mb-4 opacity-30">📭</div>
          <p className="font-semibold text-base text-[var(--text2)]">Canal não encontrado</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="text-[15px] font-bold mb-4" style={{ fontFamily: "Syne, sans-serif" }}>
            Canais encontrados
          </div>
          {channels.map((ch) => (
            <ChannelCard key={ch.channelId} {...ch} />
          ))}
        </div>
      )}
    </div>
  );
}
