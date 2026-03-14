"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { VideoGrid } from "@/components/video/VideoGrid";
import { VideoModal } from "@/components/video/VideoModal";
import { Spinner, EmptyState } from "@/components/ui";
import { sectionTitle } from "@/lib/design-tokens";
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

  const videos: VideoWithStats[] = (collection?.items || []).map((v) => ({
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
  }));

  const [selectedVideo, setSelectedVideo] = useState<VideoWithStats | null>(null);

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
      <p className="text-sm text-[var(--text3)] mb-6">{collection.items.length} vídeos</p>
      {videos.length === 0 ? (
        <EmptyState
          icon="📹"
          title="Sem vídeos nesta colecção"
        />
      ) : (
        <VideoGrid videos={videos} onVideoOpen={setSelectedVideo} />
      )}
      {selectedVideo && (
        <VideoModal video={selectedVideo} onClose={() => setSelectedVideo(null)} />
      )}
    </div>
  );
}
