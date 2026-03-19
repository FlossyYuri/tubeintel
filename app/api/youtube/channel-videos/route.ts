import { NextRequest, NextResponse } from "next/server";
import { youtubeFetch } from "@/lib/youtube";
import { cache, cacheKey, getCacheTTL } from "@/lib/cache";
import type { YouTubeSearchResponse, YouTubeVideosResponse } from "@/types/youtube";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const channelId = searchParams.get("channelId") || "";
    const maxResults = searchParams.get("maxResults") || "12";
    const pageToken = searchParams.get("pageToken") || "";
    const orderParam = searchParams.get("order") || "date";
    const order = ["date", "viewCount", "relevance", "rating"].includes(orderParam)
      ? orderParam
      : "date";
    const publishedAfterParam = searchParams.get("publishedAfter") || "";
    const daysParam = searchParams.get("days") || "";

    if (!channelId) {
      return NextResponse.json(
        { error: "channelId required" },
        { status: 400 }
      );
    }

    let publishedAfter = publishedAfterParam;
    if (!publishedAfter && daysParam) {
      const days = parseInt(daysParam, 10);
      if (!isNaN(days) && days > 0) {
        publishedAfter = new Date(Date.now() - days * 86400000).toISOString();
      }
    }

    const key = cacheKey("channel", "channel-videos", {
      channelId,
      maxResults,
      pageToken,
      order,
      publishedAfter,
    });
    const cached = cache.get<{ search: YouTubeSearchResponse; videos: YouTubeVideosResponse }>(key);
    if (cached) return NextResponse.json(cached);

    const searchParamsObj: Record<string, string> = {
      part: "snippet",
      channelId,
      order,
      type: "video",
      maxResults,
    };
    if (pageToken) searchParamsObj.pageToken = pageToken;
    if (publishedAfter) searchParamsObj.publishedAfter = publishedAfter;

    const searchData = await youtubeFetch<YouTubeSearchResponse>("search", searchParamsObj);

    const videoIds = searchData.items
      ?.map((i) => i.id?.videoId)
      .filter(Boolean)
      .slice(0, 50)
      .join(",");

    let videosData: YouTubeVideosResponse = { items: [] };
    if (videoIds) {
      videosData = await youtubeFetch<YouTubeVideosResponse>("videos", {
        part: "snippet,statistics,contentDetails",
        id: videoIds,
      });
    }

    const result = {
      search: searchData,
      videos: videosData,
      nextPageToken: searchData.nextPageToken,
    };
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
