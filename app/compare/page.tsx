"use client";

import { useState } from "react";
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
import { formatNumber } from "@/lib/format";

export default function ComparePage() {
  const [chan1, setChan1] = useState("");
  const [chan2, setChan2] = useState("");
  const [result, setResult] = useState<{
    ch1: { name: string; subs: number; views: number; videos: number; viewsPerVideo: number };
    ch2: { name: string; subs: number; views: number; videos: number; viewsPerVideo: number };
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCompare = async () => {
    if (!chan1.trim() || !chan2.trim()) {
      setError("Preenche os dois canais");
      return;
    }
    setError("");
    setLoading(true);
    setResult(null);

    try {
      const [r1, r2] = await Promise.all([
        fetch(`/api/youtube/channel?q=${encodeURIComponent(chan1)}`),
        fetch(`/api/youtube/channel?q=${encodeURIComponent(chan2)}`),
      ]);

      const d1 = await r1.json();
      const d2 = await r2.json();

      const getFirst = (data: { channels?: { items?: Array<{ id: string; statistics: Record<string, string>; snippet: { title: string } }> } }) => {
        const ch = data.channels?.items?.[0];
        if (!ch) return null;
        const subs = parseInt(ch.statistics?.subscriberCount || "0", 10);
        const views = parseInt(ch.statistics?.viewCount || "0", 10);
        const videos = parseInt(ch.statistics?.videoCount || "1", 10);
        return {
          name: ch.snippet?.title || "",
          subs,
          views,
          videos,
          viewsPerVideo: Math.round(views / videos),
        };
      };

      const c1 = getFirst(d1);
      const c2 = getFirst(d2);

      if (!c1) throw new Error(`Canal 1 não encontrado: ${chan1}`);
      if (!c2) throw new Error(`Canal 2 não encontrado: ${chan2}`);

      setResult({ ch1: c1, ch2: c2 });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao comparar");
    } finally {
      setLoading(false);
    }
  };

  const metrics = result
    ? [
        { label: "Subscribers", v1: result.ch1.subs, v2: result.ch2.subs },
        { label: "Total Views", v1: result.ch1.views, v2: result.ch2.views },
        { label: "Vídeos", v1: result.ch1.videos, v2: result.ch2.videos },
        { label: "Views/Vídeo", v1: result.ch1.viewsPerVideo, v2: result.ch2.viewsPerVideo },
      ]
    : [];

  const maxVals = metrics.reduce(
    (acc, m) => ({
      subs: Math.max(acc.subs, m.v1, m.v2),
      views: Math.max(acc.views, m.v1, m.v2),
      videos: Math.max(acc.videos, m.v1, m.v2),
      viewsPerVideo: Math.max(acc.viewsPerVideo, m.v1, m.v2),
    }),
    { subs: 1, views: 1, videos: 1, viewsPerVideo: 1 }
  );

  const radarData = result
    ? [
        { subject: "Subs", A: (result.ch1.subs / maxVals.subs) * 100, B: (result.ch2.subs / maxVals.subs) * 100, fullMark: 100 },
        { subject: "Views", A: (result.ch1.views / maxVals.views) * 100, B: (result.ch2.views / maxVals.views) * 100, fullMark: 100 },
        { subject: "Vídeos", A: (result.ch1.videos / maxVals.videos) * 100, B: (result.ch2.videos / maxVals.videos) * 100, fullMark: 100 },
        { subject: "Views/Video", A: (result.ch1.viewsPerVideo / Math.max(maxVals.viewsPerVideo, 1)) * 100, B: (result.ch2.viewsPerVideo / Math.max(maxVals.viewsPerVideo, 1)) * 100, fullMark: 100 },
      ]
    : [];

  return (
    <div>
      <h2 className="text-[22px] font-extrabold mb-1" style={{ fontFamily: "Syne, sans-serif" }}>
        ⚖️ Comparar Canais
      </h2>
      <p className="text-[13px] text-[var(--text2)] mb-6">
        Análise competitiva lado a lado
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center mb-6">
        <input
          type="text"
          value={chan1}
          onChange={(e) => setChan1(e.target.value)}
          placeholder="Canal A (@handle ou nome)"
          className="bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] px-4 py-3 rounded-xl"
        />
        <div className="text-center font-extrabold text-[var(--text3)]">VS</div>
        <input
          type="text"
          value={chan2}
          onChange={(e) => setChan2(e.target.value)}
          placeholder="Canal B (@handle ou nome)"
          className="bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] px-4 py-3 rounded-xl"
        />
      </div>
      <div className="text-center mb-6">
        <button
          onClick={handleCompare}
          disabled={loading}
          className="px-6 py-3 bg-[var(--accent)] text-white font-bold rounded-xl hover:bg-[#ff5555] disabled:opacity-50"
        >
          {loading ? "A comparar..." : "⚡ Comparar Agora"}
        </button>
      </div>

      {error && (
        <div className="mb-5 p-4 rounded-xl bg-[rgba(255,61,61,0.08)] border border-[rgba(255,61,61,0.3)] text-sm">
          ❌ {error}
        </div>
      )}

      {result && (
        <>
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 mb-6">
            <div className="grid grid-cols-3 gap-4 items-center mb-4 pb-4 border-b border-[var(--border)]">
              <div className="font-bold text-[var(--blue2)]">{result.ch1.name}</div>
              <div className="text-center text-[var(--text3)] font-mono text-xs uppercase">Métrica</div>
              <div className="font-bold text-[var(--purple)] text-right">{result.ch2.name}</div>
            </div>
            {metrics.map((m) => (
              <div key={m.label} className="grid grid-cols-3 gap-4 items-center py-2.5 border-b border-[var(--border)] last:border-0">
                <div className="text-[var(--blue2)] font-bold">{formatNumber(m.v1)}</div>
                <div className="text-center text-[10px] uppercase text-[var(--text3)] font-mono">{m.label}</div>
                <div className="text-right text-[var(--purple)] font-bold">{formatNumber(m.v2)}</div>
              </div>
            ))}
          </div>

          {radarData.length > 0 && (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="var(--border)" />
                  <PolarAngleAxis dataKey="subject" stroke="var(--text3)" fontSize={11} />
                  <PolarRadiusAxis stroke="var(--text3)" fontSize={10} />
                  <Radar name={result.ch1.name} dataKey="A" stroke="var(--blue2)" fill="var(--blue2)" fillOpacity={0.3} />
                  <Radar name={result.ch2.name} dataKey="B" stroke="var(--purple)" fill="var(--purple)" fillOpacity={0.3} />
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
