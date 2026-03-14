import { NextRequest, NextResponse } from "next/server";
import { youtubeFetch } from "@/lib/youtube";
import { cache, cacheKey, getCacheTTL } from "@/lib/cache";
import type { YouTubeVideosResponse } from "@/types/youtube";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const regionCode = searchParams.get("regionCode") || "PT";
    const videoCategoryId = searchParams.get("videoCategoryId") || "0";

    const key = cacheKey("trending", "videos", { regionCode, videoCategoryId });
    const cached = cache.get<YouTubeVideosResponse>(key);
    if (cached) {
      return NextResponse.json(cached);
    }

    const data = await youtubeFetch<YouTubeVideosResponse>("videos", {
      part: "snippet,statistics,contentDetails",
      chart: "mostPopular",
      regionCode,
      videoCategoryId,
      maxResults: "24",
    });

    cache.set(key, data, getCacheTTL("trending"));

    return NextResponse.json(data);
  } catch (error) {
    console.error("YouTube trending error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Trending failed" },
      { status: 500 }
    );
  }
}
