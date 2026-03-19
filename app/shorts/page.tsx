"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { VideoGrid } from "@/components/video/VideoGrid";
import { VideoModal } from "@/components/video/VideoModal";
import { PageHeader, Spinner, EmptyState, ErrorMessage, FilterSelect } from "@/components/ui";
import { input, buttonPrimary } from "@/lib/design-tokens";
import { SELECT_REGIONS } from "@/lib/regions";
import { mergeSearchWithVideos } from "@/lib/transform";
import { isShort } from "@/lib/format";
import { useUrlState } from "@/hooks/useUrlState";
import { SHORTS_SCHEMA, SHORTS_DEFAULTS } from "@/lib/url-params";
import type { VideoWithStats } from "@/types/youtube";

function ShortsPageContent() {
  const [urlState, updateParams] = useUrlState(SHORTS_SCHEMA, SHORTS_DEFAULTS);
  const { q: query, region } = urlState;
  const [draftQuery, setDraftQuery] = useState(query);
  const [videos, setVideos] = useState<VideoWithStats[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>();
  const [loadingMore, setLoadingMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedVideo, setSelectedVideo] = useState<VideoWithStats | null>(null);

  useEffect(() => {
    setDraftQuery(query);
  }, [query]);

  const searchQuery = query.trim() ? `${query.trim()} #shorts` : "#shorts";
  const publishedAfter = new Date(Date.now() - 14 * 86400000).toISOString();

  const doSearch = useCallback(async (pageToken?: string, append = false) => {
    if (!append) {
      setError("");
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    try {
      const params = new URLSearchParams({
        q: searchQuery,
        videoDuration: "short",
        order: "viewCount",
        regionCode: region,
        maxResults: "24",
        publishedAfter,
      });
      if (pageToken) params.set("pageToken", pageToken);
      const res = await fetch(`/api/youtube/search?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Search failed");
      const merged = mergeSearchWithVideos(data.search?.items || [], data.videos?.items || []);
      const filtered = merged.filter((v) => isShort(v.duration || "", v.title));
      if (append) {
        setVideos((prev) => [...prev, ...filtered]);
      } else {
        setVideos(filtered);
      }
      setNextPageToken(data.search?.nextPageToken);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro");
      if (!append) setVideos([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [searchQuery, region]);

  useEffect(() => {
    if (query || region !== "US") {
      doSearch();
    }
  }, [query, region, doSearch]);

  const handleSearch = () => {
    const trimmed = draftQuery.trim();
    if (!trimmed && region === "US") {
      doSearch();
    } else {
      updateParams({ q: trimmed });
    }
  };
  const loadMore = () => nextPageToken && doSearch(nextPageToken, true);

  return (
    <div>
      <PageHeader
        title="⚡ Shorts Virais"
        description="Os shorts com maior taxa de viralidade"
      />

      <div className="bg-gradient-to-br from-[var(--card)] to-[var(--card2)] border border-[var(--border)] rounded-2xl p-6 sm:p-8 mb-7">
        <div className="flex flex-col sm:flex-row gap-2.5 flex-wrap items-end">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="shorts-query" className="text-[9px] uppercase tracking-[0.18em] text-[var(--text3)] font-mono">
              Tema
            </label>
            <input
              id="shorts-query"
              type="text"
              value={draftQuery}
              onChange={(e) => setDraftQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Tema dos shorts que queres encontrar..."
              className={input}
            />
          </div>
          <FilterSelect
            label="Região"
            value={region}
            onChange={(v) => updateParams({ region: v })}
            options={SELECT_REGIONS}
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className={buttonPrimary}
          >
            ⚡ Buscar Shorts
          </button>
        </div>
      </div>

      {error && <ErrorMessage message={error} className="mb-5" />}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-[var(--text3)]">
          <Spinner className="mb-4" />
          <p className="font-mono text-sm">A procurar Shorts virais...</p>
        </div>
      ) : videos.length === 0 && !loading ? (
        <EmptyState icon="⚡" title="Sem shorts encontrados" />
      ) : (
        <>
          <VideoGrid videos={videos} onVideoOpen={setSelectedVideo} />
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
        </>
      )}

      {selectedVideo && (
        <VideoModal video={selectedVideo} onClose={() => setSelectedVideo(null)} />
      )}
    </div>
  );
}

export default function ShortsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center py-16 text-[var(--text3)]">
          <Spinner className="mb-4" />
          <p className="font-mono text-sm">A carregar...</p>
        </div>
      }
    >
      <ShortsPageContent />
    </Suspense>
  );
}
