import { NextRequest, NextResponse } from "next/server";
import { youtubeFetch } from "@/lib/youtube";
import { cache, cacheKey, getCacheTTL } from "@/lib/cache";
import type { YouTubeSearchResponse, YouTubeChannelsResponse } from "@/types/youtube";

/**
 * API de pesquisa de canais do YouTube.
 * Espelha a estrutura da pesquisa de vídeos (/api/youtube/search) com filtros
 * específicos para canais: ordem, região e paginação.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const order = searchParams.get("order") || "relevance";
    const regionCode = searchParams.get("regionCode") || "PT";
    const pageToken = searchParams.get("pageToken") || "";
    const maxResults = Math.min(parseInt(searchParams.get("maxResults") || "24", 10), 50);

    if (!q.trim()) {
      return NextResponse.json(
        { error: "Query is required" },
        { status: 400 }
      );
    }

    const cacheParams = {
      q: q.trim(),
      order,
      regionCode,
      pageToken,
      maxResults: String(maxResults),
    };
    const key = cacheKey("channels-search", "search", cacheParams);
    const cached = cache.get<{
      search: YouTubeSearchResponse;
      channels: YouTubeChannelsResponse;
    }>(key);
    if (cached) {
      return NextResponse.json(cached);
    }

    const searchParamsObj: Record<string, string> = {
      part: "snippet",
      q: q.trim(),
      type: "channel",
      order,
      regionCode,
      maxResults: String(maxResults),
    };

    if (pageToken) searchParamsObj.pageToken = pageToken;

    if (["PT", "BR", "AO", "MZ"].includes(regionCode)) {
      searchParamsObj.relevanceLanguage = "pt";
    }

    const searchData = await youtubeFetch<YouTubeSearchResponse>("search", searchParamsObj);

    if (!searchData.items?.length) {
      return NextResponse.json({
        search: { items: [], nextPageToken: undefined },
        channels: { items: [] },
      });
    }

    const channelIds = searchData.items
      .map((i) => i.id?.channelId)
      .filter(Boolean)
      .slice(0, 50)
      .join(",");

    let channelsData: YouTubeChannelsResponse = { items: [] };
    if (channelIds) {
      channelsData = await youtubeFetch<YouTubeChannelsResponse>("channels", {
        part: "statistics,snippet",
        id: channelIds,
      });
    }

    const result = { search: searchData, channels: channelsData };
    cache.set(key, result, getCacheTTL("channels-search"));

    return NextResponse.json(result);
  } catch (error) {
    console.error("YouTube channels search error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Channels search failed" },
      { status: 500 }
    );
  }
}
