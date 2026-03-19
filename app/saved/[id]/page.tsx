"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { VideoGrid } from "@/components/video/VideoGrid";
import { VideoModal } from "@/components/video/VideoModal";
import { SortControls } from "@/components/video/SortControls";
import { Spinner, EmptyState } from "@/components/ui";
import { sortVideos, type VideoSortKey } from "@/lib/sort-videos";
import type { VideoWithStats } from "@/types/youtube";

interface SavedVideo {
  id: string;
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnail: string;
  views: number;
  viralScore: number;
}

export default function CollectionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [collection, setCollection] = useState<{ name: string; items: SavedVideo[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<VideoSortKey>("views");

  useEffect(() => {
    fetch(`/api/collections/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setCollection({ name: data.name, items: data.items || [] });
      })
      .catch(() => setCollection(null))
      .finally(() => setLoading(false));
  }, [id]);

  const rawVideos: (VideoWithStats & { savedVideoId?: string })[] = (
    collection?.items || []
  ).map((v) => ({
    id: v.videoId,
    videoId: v.videoId,
    title: v.title,
    channelTitle: v.channelTitle,
    channelId: "",
    publishedAt: "",
    thumbnail: v.thumbnail,
    viewCount: v.views,
    likeCount: 0,
    commentCount: 0,
    viralScore: v.viralScore,
    savedVideoId: v.id,
  }));

  const videos = useMemo(
    () => sortVideos(rawVideos, sortBy),
    [rawVideos, sortBy]
  );

  const [selectedVideo, setSelectedVideo] = useState<
    (VideoWithStats & { savedVideoId?: string }) | null
  >(null);

  const fetchCollection = () => {
    fetch(`/api/collections/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setCollection({ name: data.name, items: data.items || [] });
      })
      .catch(() => setCollection(null));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Spinner className="mb-4" />
      </div>
    );
  }

  if (!collection) {
    return (
      <div>
        <button onClick={() => router.push("/saved")} className="flex items-center gap-2 text-[var(--blue2)] mb-4">
          <ArrowLeft className="size-4" /> Voltar
        </button>
        <p className="text-[var(--accent)]">Colecção não encontrada</p>
      </div>
    );
  }

  return (
    <div>
      <button onClick={() => router.push("/saved")} className="flex items-center gap-2 text-[var(--blue2)] hover:underline mb-4">
        <ArrowLeft className="size-4" /> Voltar
      </button>
      <h2 className="text-xl font-extrabold mb-2 font-display">
        {collection.name}
      </h2>
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <p className="text-sm text-[var(--text3)]">{collection.items.length} vídeos</p>
        {videos.length > 0 && (
          <SortControls
            value={sortBy}
            onChange={setSortBy}
            options={["views", "viral"]}
          />
        )}
      </div>
      {videos.length === 0 ? (
        <EmptyState
          icon="📹"
          title="Sem vídeos nesta colecção"
        />
      ) : (
        <VideoGrid videos={videos} onVideoOpen={setSelectedVideo} />
      )}
      {selectedVideo && (
        <VideoModal
          video={selectedVideo}
          onClose={() => setSelectedVideo(null)}
          showSaveButton={false}
          removeFromCollection={
            selectedVideo.savedVideoId
              ? {
                  collectionId: id,
                  itemId: selectedVideo.savedVideoId,
                  onRemoved: () => {
                    fetchCollection();
                    setSelectedVideo(null);
                  },
                }
              : undefined
          }
        />
      )}
    </div>
  );
}
