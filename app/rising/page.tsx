"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChannelCard } from "@/components/channel/ChannelCard";
import { RisingBadge } from "@/components/channel/RisingBadge";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    fetch(`/api/youtube/rising?keyword=${encodeURIComponent(searchKeyword)}&regionCode=${region}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setChannels(data.channels || []);
      })
      .catch((err) => {
        setError(err.message);
        setChannels([]);
      })
      .finally(() => setLoading(false));
  }, [searchKeyword, region]);

  return (
    <div>
      <h2 className="text-[22px] font-extrabold mb-1" style={{ fontFamily: "Syne, sans-serif" }}>
        🚀 Canais em Ascensão
      </h2>
      <p className="text-[13px] text-[var(--text2)] mb-6">
        Canais novos ou pequenos com crescimento explosivo
      </p>

      <div className="bg-gradient-to-br from-[var(--card)] to-[var(--card2)] border border-[var(--border)] rounded-2xl p-8 mb-7">
        <div className="flex gap-2.5 flex-wrap">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && setSearchKeyword(keyword)}
            placeholder="Nicho ou keyword..."
            className="flex-1 min-w-[200px] bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] px-4 py-3 rounded-xl"
          />
          <button
            onClick={() => setSearchKeyword(keyword)}
            className="px-6 py-3 bg-[var(--accent)] text-white font-bold rounded-xl hover:bg-[#ff5555]"
          >
            Buscar
          </button>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] px-4 py-3 rounded-xl"
          >
            {REGIONS.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-5 p-4 rounded-xl bg-[rgba(255,61,61,0.08)] border border-[rgba(255,61,61,0.3)] text-sm">
          ❌ {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-[var(--text3)]">
          <div className="w-9 h-9 border-2 border-[var(--border)] border-t-[var(--accent)] rounded-full animate-spin mx-auto mb-4" />
          <p className="font-mono text-sm">A procurar canais em ascensão...</p>
        </div>
      ) : channels.length === 0 ? (
        <div className="text-center py-20 text-[var(--text3)]">
          <div className="text-5xl mb-4 opacity-30">🚀</div>
          <p className="font-semibold text-base text-[var(--text2)]">Sem canais encontrados</p>
        </div>
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
        </div>
      )}
    </div>
  );
}
