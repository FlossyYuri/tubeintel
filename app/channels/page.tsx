"use client";

import { useState } from "react";
import { SearchBar } from "@/components/search/SearchBar";
import { ChannelCard } from "@/components/channel/ChannelCard";
import { PageHeader, Spinner, EmptyState, ErrorMessage } from "@/components/ui";
import { sectionTitle } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

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
      <PageHeader
        title="📺 Analisar Canal"
        description="Métricas detalhadas, vídeos recentes e análise de crescimento"
      />

      <div className="bg-gradient-to-br from-[var(--card)] to-[var(--card2)] border border-[var(--border)] rounded-2xl p-8 mb-7">
        <div className="flex gap-2.5 flex-wrap">
          <SearchBar
            onSearch={handleSearch}
            loading={loading}
            placeholder="Nome do canal, @handle ou URL..."
          />
        </div>
      </div>

      {error && <ErrorMessage message={error} className="mb-5" />}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-[var(--text3)]">
          <Spinner className="mb-4" />
          <p className="font-mono text-sm">A procurar canal...</p>
        </div>
      ) : channels.length === 0 && !loading ? (
        <EmptyState icon="📭" title="Canal não encontrado" />
      ) : (
        <div className="space-y-3">
          <div className={cn(sectionTitle, "mb-4")}>
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
