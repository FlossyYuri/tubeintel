import { NextRequest, NextResponse } from "next/server";
import { youtubeFetch } from "@/lib/youtube";
import { cache, cacheKey, getCacheTTL } from "@/lib/cache";
import type { YouTubeSearchResponse, YouTubeVideosResponse } from "@/types/youtube";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const channelId = searchParams.get("channelId") || "";
    const maxResults = searchParams.get("maxResults") || "12";

    if (!channelId) {
      return NextResponse.json(
        { error: "channelId required" },
        { status: 400 }
      );
    }

    const key = cacheKey("channel", "channel-videos", { channelId, maxResults });
    const cached = cache.get<{ search: YouTubeSearchResponse; videos: YouTubeVideosResponse }>(key);
    if (cached) return NextResponse.json(cached);

    const searchData = await youtubeFetch<YouTubeSearchResponse>("search", {
      part: "snippet",
      channelId,
      order: "date",
      type: "video",
      maxResults,
    });

    const videoIds = searchData.items
      ?.map((i) => i.id?.videoId)
      .filter(Boolean)
      .slice(0, 50)
      .join(",");

    let videosData: YouTubeVideosResponse = { items: [] };
    if (videoIds) {
      videosData = await youtubeFetch<YouTubeVideosResponse>("videos", {
        part: "statistics,contentDetails",
        id: videoIds,
      });
    }

    const result = { search: searchData, videos: videosData };
    cache.set(key, result, getCacheTTL("channel"));
    return NextResponse.json(result);
  } catch (error) {
    console.error("Channel videos error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed" },
      { status: 500 }
    );
  }
}
