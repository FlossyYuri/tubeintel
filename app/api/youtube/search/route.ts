import { NextRequest, NextResponse } from "next/server";
import { youtubeFetch } from "@/lib/youtube";
import { cache, cacheKey, getCacheTTL } from "@/lib/cache";
import type { YouTubeSearchResponse, YouTubeVideosResponse } from "@/types/youtube";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const order = searchParams.get("order") || "relevance";
    const regionCode = searchParams.get("regionCode") || "PT";
    const publishedAfter = searchParams.get("publishedAfter") || "";
    const videoDuration = searchParams.get("videoDuration") || "";
    const videoCategoryId = searchParams.get("videoCategoryId") || "";
    const videoDefinition = searchParams.get("videoDefinition") || "";
    const videoCaption = searchParams.get("videoCaption") || "";
    const pageToken = searchParams.get("pageToken") || "";
    const maxResults = Math.min(parseInt(searchParams.get("maxResults") || "24", 10), 50);

    if (!q.trim()) {
      return NextResponse.json(
        { error: "Query is required" },
        { status: 400 }
      );
    }

    const cacheParams = {
      q,
      order,
      regionCode,
      publishedAfter,
      videoDuration,
      videoCategoryId,
      videoDefinition,
      videoCaption,
      pageToken,
    };
    const key = cacheKey("search", "search", cacheParams);
    const cached = cache.get<{ search: YouTubeSearchResponse; videos: YouTubeVideosResponse }>(key);
    if (cached) {
      return NextResponse.json(cached);
    }

    const searchParamsObj: Record<string, string> = {
      part: "snippet",
      q: q.trim(),
      type: "video",
      order,
      regionCode,
      maxResults: String(maxResults),
    };

    if (publishedAfter) searchParamsObj.publishedAfter = publishedAfter;
    if (videoDuration) searchParamsObj.videoDuration = videoDuration;
    if (videoCategoryId) searchParamsObj.videoCategoryId = videoCategoryId;
    if (videoDefinition) searchParamsObj.videoDefinition = videoDefinition;
    if (videoCaption) searchParamsObj.videoCaption = videoCaption;
    if (pageToken) searchParamsObj.pageToken = pageToken;

    if (["PT", "BR", "AO", "MZ"].includes(regionCode)) {
      searchParamsObj.relevanceLanguage = "pt";
    }

    const searchData = await youtubeFetch<YouTubeSearchResponse>("search", searchParamsObj);

    if (!searchData.items?.length) {
      return NextResponse.json({
        search: { items: [], nextPageToken: undefined },
        videos: { items: [] },
      });
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

    const result = { search: searchData, videos: videosData };
    cache.set(key, result, getCacheTTL("search"));

    return NextResponse.json(result);
  } catch (error) {
    console.error("YouTube search error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Search failed" },
      { status: 500 }
    );
  }
}
