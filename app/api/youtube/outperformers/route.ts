import { NextRequest, NextResponse } from "next/server";
import { youtubeFetch } from "@/lib/youtube";
import { cache, cacheKey, getCacheTTL } from "@/lib/cache";
import { mergeSearchWithVideos } from "@/lib/transform";
import { calcEngagementRate } from "@/lib/viral-score";
import type {
  YouTubeSearchResponse,
  YouTubeVideosResponse,
  YouTubeChannelsResponse,
} from "@/types/youtube";
import type { VideoWithStats } from "@/types/youtube";

export interface VideoWithOutperformance extends VideoWithStats {
  outperformanceRatio: number;
  channelAvgViews: number;
}

function getPublishedAfter(period: string): string {
  if (!period) return "";
  const now = new Date();
  const map: Record<string, number> = {
    day: 1,
    week: 7,
    month: 30,
    year: 365,
  };
  const days = map[period] || 7;
  const d = new Date(now.getTime() - days * 86400000);
  return d.toISOString();
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get("keyword") || "viral";
    const regionCode = searchParams.get("regionCode") || "US";
    const videoCategoryId = searchParams.get("videoCategoryId") || "";
    const publishedAfter = searchParams.get("publishedAfter") || "week";
    const minMultiplier = parseFloat(searchParams.get("minMultiplier") || "2");
    const maxResults = Math.min(
      parseInt(searchParams.get("maxResults") || "24", 10),
      50
    );
    const pageToken = searchParams.get("pageToken") || "";
    const orderParam = searchParams.get("order") || "ratio";
    const validOrders = [
      "ratio",
      "viewCount",
      "date",
      "viralScore",
      "likeCount",
      "engagement",
    ] as const;
    const order = validOrders.includes(orderParam as (typeof validOrders)[number])
      ? (orderParam as (typeof validOrders)[number])
      : "ratio";

    const publishedAfterIso = getPublishedAfter(publishedAfter);

    const cacheParams = {
      keyword,
      regionCode,
      videoCategoryId,
      publishedAfter,
      minMultiplier: String(minMultiplier),
      maxResults: String(maxResults),
      pageToken,
      order,
    };
    const key = cacheKey("search", "outperformers", cacheParams);
    const cached = cache.get<{ videos: VideoWithOutperformance[]; nextPageToken?: string }>(key);
    if (cached) return NextResponse.json(cached);

    const searchParamsObj: Record<string, string> = {
      part: "snippet",
      q: keyword,
      type: "video",
      order: "viewCount",
      regionCode,
      maxResults: String(maxResults),
    };
    if (publishedAfterIso) searchParamsObj.publishedAfter = publishedAfterIso;
    if (videoCategoryId) searchParamsObj.videoCategoryId = videoCategoryId;
    if (pageToken) searchParamsObj.pageToken = pageToken;

    if (["PT", "BR", "AO", "MZ"].includes(regionCode)) {
      searchParamsObj.relevanceLanguage = "pt";
    }

    const searchData = await youtubeFetch<YouTubeSearchResponse>(
      "search",
      searchParamsObj
    );

    if (!searchData.items?.length) {
      return NextResponse.json({ videos: [] });
    }

    const videoIds = searchData.items
      .map((i) => i.id?.videoId)
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

    const merged = mergeSearchWithVideos(
      searchData.items || [],
      videosData.items || []
    );

    const channelIds = [
      ...new Set(merged.map((v) => v.channelId).filter(Boolean)),
    ].slice(0, 25);

    if (channelIds.length === 0) {
      return NextResponse.json({ videos: [] });
    }

    const channelsData = await youtubeFetch<YouTubeChannelsResponse>(
      "channels",
      {
        part: "statistics",
        id: channelIds.join(","),
      }
    );

    const channelAvgMap = new Map<string, number>();
    (channelsData.items || []).forEach((ch) => {
      const views = parseInt(ch.statistics?.viewCount || "0", 10);
      const videos = parseInt(ch.statistics?.videoCount || "1", 10);
      channelAvgMap.set(ch.id, views / videos);
    });

    let withRatio: VideoWithOutperformance[] = merged
      .map((v) => {
        const avgViews = channelAvgMap.get(v.channelId) ?? v.viewCount;
        const ratio = avgViews > 0 ? v.viewCount / avgViews : 0;
        return {
          ...v,
          outperformanceRatio: Math.round(ratio * 100) / 100,
          channelAvgViews: Math.round(avgViews),
        };
      })
      .filter((v) => v.outperformanceRatio >= minMultiplier);

    switch (order) {
      case "ratio":
        withRatio.sort((a, b) => b.outperformanceRatio - a.outperformanceRatio);
        break;
      case "viewCount":
        withRatio.sort((a, b) => b.viewCount - a.viewCount);
        break;
      case "date":
        withRatio.sort(
          (a, b) =>
            new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        );
        break;
      case "viralScore":
        withRatio.sort((a, b) => b.viralScore - a.viralScore);
        break;
      case "likeCount":
        withRatio.sort((a, b) => b.likeCount - a.likeCount);
        break;
      case "engagement":
        withRatio.sort(
          (a, b) =>
            calcEngagementRate(b.viewCount, b.likeCount, b.commentCount) -
            calcEngagementRate(a.viewCount, a.likeCount, a.commentCount)
        );
        break;
    }

    const result = { videos: withRatio, nextPageToken: searchData.nextPageToken };
    cache.set(key, result, getCacheTTL("search"));
    return NextResponse.json(result);
  } catch (error) {
    console.error("Outperformers error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed" },
      { status: 500 }
    );
  }
}
