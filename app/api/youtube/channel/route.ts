import { NextRequest, NextResponse } from "next/server";
import { youtubeFetch } from "@/lib/youtube";
import { cache, cacheKey, getCacheTTL } from "@/lib/cache";
import type { YouTubeSearchResponse, YouTubeChannelsResponse, YouTubeVideosResponse } from "@/types/youtube";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const channelId = searchParams.get("channelId") || "";

    if (channelId) {
      const key = cacheKey("channel", "channels", { channelId });
      const cached = cache.get<YouTubeChannelsResponse>(key);
      if (cached) return NextResponse.json(cached);

      const data = await youtubeFetch<YouTubeChannelsResponse>("channels", {
        part: "statistics,snippet,contentDetails",
        id: channelId,
      });
      cache.set(key, data, getCacheTTL("channel"));
      return NextResponse.json(data);
    }

    if (!q.trim()) {
      return NextResponse.json(
        { error: "Query or channelId required" },
        { status: 400 }
      );
    }

    const searchData = await youtubeFetch<YouTubeSearchResponse>("search", {
      part: "snippet",
      q: q.trim(),
      type: "channel",
      maxResults: "6",
    });

    if (!searchData.items?.length) {
      return NextResponse.json({ items: [], channels: { items: [] } });
    }

    const ids = searchData.items.map((i) => i.id?.channelId).filter(Boolean).join(",");
    const channelsData = await youtubeFetch<YouTubeChannelsResponse>("channels", {
      part: "statistics,snippet",
      id: ids,
    });

    return NextResponse.json({ search: searchData, channels: channelsData });
  } catch (error) {
    console.error("YouTube channel error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Channel fetch failed" },
      { status: 500 }
    );
  }
}
