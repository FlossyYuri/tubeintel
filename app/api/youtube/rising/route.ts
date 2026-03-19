import { NextRequest, NextResponse } from "next/server";
import { youtubeFetch } from "@/lib/youtube";
import { cache, cacheKey, getCacheTTL } from "@/lib/cache";
import { calcRisingScore } from "@/lib/rising-detector";
import type { YouTubeSearchResponse, YouTubeChannelsResponse, YouTubeVideosResponse } from "@/types/youtube";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get("keyword") || "viral";
    const regionCode = searchParams.get("regionCode") || "US";
    const maxAgeMonths = parseInt(searchParams.get("maxAgeMonths") || "18", 10);
    const maxVideos = parseInt(searchParams.get("maxVideos") || "30", 10);
    const pageToken = searchParams.get("pageToken") || "";

    const key = cacheKey("rising", "rising", { keyword, regionCode, maxAgeMonths: String(maxAgeMonths), maxVideos: String(maxVideos), pageToken });
    const cached = cache.get<{ channels: Array<Record<string, unknown>> }>(key);
    if (cached) return NextResponse.json(cached);

    const publishedAfter = new Date(Date.now() - 90 * 86400000).toISOString();

    const searchParamsObj: Record<string, string> = {
      part: "snippet",
      q: keyword,
      type: "video",
      order: "viewCount",
      regionCode,
      maxResults: "50",
      publishedAfter,
    };
    if (pageToken) searchParamsObj.pageToken = pageToken;
    const searchData = await youtubeFetch<YouTubeSearchResponse>("search", searchParamsObj);

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

    const channelIds = [...new Set(searchData.items?.map((i) => i.snippet?.channelId).filter(Boolean) || [])].slice(0, 20).join(",");

    if (!channelIds) {
      return NextResponse.json({ channels: [] });
    }

    const channelsData = await youtubeFetch<YouTubeChannelsResponse>("channels", {
      part: "statistics,snippet",
      id: channelIds,
    });

    const now = Date.now();
    const monthMs = 30 * 24 * 60 * 60 * 1000;

    const risingChannels = (channelsData.items || [])
      .map((ch) => {
        const subs = parseInt(ch.statistics?.subscriberCount || "0", 10);
        const views = parseInt(ch.statistics?.viewCount || "0", 10);
        const videos = parseInt(ch.statistics?.videoCount || "0", 10);
        const publishedAt = ch.snippet?.publishedAt || new Date(now - 24 * monthMs).toISOString();
        const ageMonths = (now - new Date(publishedAt).getTime()) / monthMs;
        const viewsPerVideo = videos > 0 ? views / videos : 0;

        const isRising =
          (ageMonths < maxAgeMonths || videos < maxVideos) &&
          (ageMonths < 18 || viewsPerVideo > 100000);

        if (!isRising) return null;

        const score = calcRisingScore({
          subscriberCount: subs,
          viewCount: views,
          videoCount: videos,
          publishedAt,
        });

        return {
          channelId: ch.id,
          name: ch.snippet?.title || "",
          thumbnail: ch.snippet?.thumbnails?.medium?.url || "",
          subscriberCount: subs,
          viewCount: views,
          videoCount: videos,
          publishedAt,
          ageMonths: Math.round(ageMonths),
          viewsPerVideo: Math.round(viewsPerVideo),
          risingScore: score,
        };
      })
      .filter(Boolean)
      .sort((a, b) => (b?.risingScore ?? 0) - (a?.risingScore ?? 0))
      .slice(0, 15);

    const result = { channels: risingChannels, nextPageToken: searchData.nextPageToken };
    cache.set(key, result, getCacheTTL("rising"));
    return NextResponse.json(result);
  } catch (error) {
    console.error("Rising channels error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed" },
      { status: 500 }
    );
  }
}
