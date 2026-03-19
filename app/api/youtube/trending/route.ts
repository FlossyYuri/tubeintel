import { NextRequest, NextResponse } from "next/server";
import { youtubeFetch } from "@/lib/youtube";
import { cache, cacheKey, getCacheTTL } from "@/lib/cache";
import type { YouTubeVideosResponse } from "@/types/youtube";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const regionCode = searchParams.get("regionCode") || "US";
    const videoCategoryId = searchParams.get("videoCategoryId") || "0";
    const pageToken = searchParams.get("pageToken") || "";

    const cacheParams = { regionCode, videoCategoryId, pageToken };
    const key = cacheKey("trending", "videos", cacheParams);
    const cached = cache.get<YouTubeVideosResponse & { nextPageToken?: string }>(key);
    if (cached) {
      return NextResponse.json(cached);
    }

    const params: Record<string, string> = {
      part: "snippet,statistics,contentDetails",
      chart: "mostPopular",
      regionCode,
      videoCategoryId,
      maxResults: "24",
    };
    if (pageToken) params.pageToken = pageToken;

    const data = await youtubeFetch<YouTubeVideosResponse & { nextPageToken?: string }>("videos", params);

    const result = { items: data.items || [], nextPageToken: data.nextPageToken };
    cache.set(key, result, getCacheTTL("trending"));

    return NextResponse.json(result);
  } catch (error) {
    console.error("YouTube trending error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Trending failed" },
      { status: 500 }
    );
  }
}
