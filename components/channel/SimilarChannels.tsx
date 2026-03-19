"use client";

import { useEffect, useState } from "react";
import { ChannelCard } from "./ChannelCard";
import { ChannelModal } from "./ChannelModal";
import { sectionTitle } from "@/lib/design-tokens";
import type { ChannelWithStats } from "@/types/youtube";

interface SimilarChannelsProps {
  channelId: string;
  channelName?: string;
}

export function SimilarChannels({ channelId, channelName }: SimilarChannelsProps) {
  const [channels, setChannels] = useState<ChannelWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChannel, setSelectedChannel] = useState<ChannelWithStats | null>(null);

  useEffect(() => {
    if (!channelId) return;
    setLoading(true);
    fetch(`/api/youtube/similar-channels?channelId=${encodeURIComponent(channelId)}&maxResults=12`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setChannels(data.channels || []);
      })
      .catch(() => setChannels([]))
      .finally(() => setLoading(false));
  }, [channelId]);

  if (loading) {
    return (
      <div className="mb-6">
        <h3 className={`${sectionTitle} mb-4 text-[var(--text2)]`}>
          Canais similares
        </h3>
        <p className="text-sm text-[var(--text3)]">A carregar...</p>
      </div>
    );
  }

  if (channels.length === 0) return null;

  return (
    <div className="mb-6">
      <h3 className={`${sectionTitle} mb-4 text-[var(--text2)]`}>
        Canais similares
      </h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {channels.map((ch) => (
          <ChannelCard
            key={ch.channelId}
            channelId={ch.channelId}
            name={ch.name}
            thumbnail={ch.thumbnail}
            subscriberCount={ch.subscriberCount}
            videoCount={ch.videoCount}
            viewCount={ch.viewCount}
            description={
              ch.description
                ? ch.description.slice(0, 100) + (ch.description.length > 100 ? "…" : "")
                : undefined
            }
            channel={ch}
            onChannelOpen={setSelectedChannel}
          />
        ))}
      </div>
      {selectedChannel && (
        <ChannelModal
          channel={selectedChannel}
          onClose={() => setSelectedChannel(null)}
        />
      )}
    </div>
  );
}
