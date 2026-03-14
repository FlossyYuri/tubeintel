"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChannelCard } from "@/components/channel/ChannelCard";
import { RisingBadge } from "@/components/channel/RisingBadge";
import { PageHeader, Spinner, EmptyState, ErrorMessage } from "@/components/ui";
import { input, buttonPrimary } from "@/lib/design-tokens";

const REGIONS = [
  { value: "PT", label: "🇵🇹 PT" },
  { value: "BR", label: "🇧🇷 BR" },
  { value: "US", label: "🇺🇸 US" },
  { value: "GB", label: "🇬🇧 UK" },
];

export default function RisingPage() {
  const [keyword, setKeyword] = useState("viral");
  const [searchKeyword, setSearchKeyword] = useState("viral");
  const [region, setRegion] = useState("PT");
  const [channels, setChannels] = useState<Array<{
    channelId: string;
    name: string;
    thumbnail: string;
    subscriberCount: number;
    viewCount: number;
    videoCount: number;
    ageMonths: number;
    viewsPerVideo: number;
    risingScore: number;
  }>>([]);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>();
  const [loadingMore, setLoadingMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    setNextPageToken(undefined);
    fetch(`/api/youtube/rising?keyword=${encodeURIComponent(searchKeyword)}&regionCode=${region}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setChannels(data.channels || []);
        setNextPageToken(data.nextPageToken);
      })
      .catch((err) => {
        setError(err.message);
        setChannels([]);
      })
      .finally(() => setLoading(false));
  }, [searchKeyword, region]);

  const loadMore = async () => {
    if (!nextPageToken || loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await fetch(
        `/api/youtube/rising?keyword=${encodeURIComponent(searchKeyword)}&regionCode=${region}&pageToken=${encodeURIComponent(nextPageToken)}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setChannels((prev) => [...prev, ...(data.channels || [])]);
      setNextPageToken(data.nextPageToken);
    } catch {
      // Silently fail
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="🚀 Canais em Ascensão"
        description="Canais novos ou pequenos com crescimento explosivo"
      />

      <div className="bg-gradient-to-br from-[var(--card)] to-[var(--card2)] border border-[var(--border)] rounded-2xl p-6 sm:p-8 mb-7">
        <div className="flex flex-col sm:flex-row gap-2.5 flex-wrap">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && setSearchKeyword(keyword)}
            placeholder="Nicho ou keyword..."
            className={input}
          />
          <button
            onClick={() => setSearchKeyword(keyword)}
            className={buttonPrimary}
          >
            Buscar
          </button>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className={input}
          >
            {REGIONS.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>
      </div>

      {error && <ErrorMessage message={error} className="mb-5" />}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-[var(--text3)]">
          <Spinner className="mb-4" />
          <p className="font-mono text-sm">A procurar canais em ascensão...</p>
        </div>
      ) : channels.length === 0 ? (
        <EmptyState icon="🚀" title="Sem canais encontrados" />
      ) : (
        <div className="space-y-3">
          {channels.map((ch) => (
            <Link
              key={ch.channelId}
              href={`/channels/${ch.channelId}`}
              className="block"
            >
              <div className="flex items-center gap-4 p-5 bg-[var(--card)] border border-[var(--border)] rounded-xl hover:border-[var(--border2)] transition-all">
                <div className="size-14 rounded-full bg-[var(--bg3)] overflow-hidden shrink-0">
                  {ch.thumbnail && <img src={ch.thumbnail} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1">
                  <div className="font-bold flex items-center gap-2">
                    {ch.name}
                    <RisingBadge score={ch.risingScore} />
                  </div>
                  <div className="text-[11px] text-[var(--text3)] font-mono mt-1">
                    {ch.ageMonths} meses · {ch.viewsPerVideo.toLocaleString()} views/vídeo
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-sm">{ch.subscriberCount.toLocaleString()} subs</div>
                  <div className="text-[10px] text-[var(--text3)]">Rising {ch.risingScore}</div>
                </div>
              </div>
            </Link>
          ))}
          {nextPageToken && (
            <div className="mt-6 text-center">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="px-6 py-3 bg-[var(--card2)] border border-[var(--border2)] text-[var(--text)] text-sm font-semibold rounded-xl hover:bg-[var(--border)] transition-colors duration-200 disabled:opacity-50 font-display"
              >
                {loadingMore ? "A carregar..." : "Carregar mais"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
