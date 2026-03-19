import { NextRequest, NextResponse } from "next/server";
import { youtubeFetch } from "@/lib/youtube";
import { cache, cacheKey, getCacheTTL } from "@/lib/cache";
import { mergeSearchWithChannels } from "@/lib/transform";
import type {
  YouTubeChannelsResponse,
  YouTubeSearchResponse,
} from "@/types/youtube";
import type { ChannelWithStats } from "@/types/youtube";

function extractChannelIdFromUrl(url: string): string | null {
  const trimmed = (url || "").trim();
  if (/^UC[\w-]{22}$/.test(trimmed)) return trimmed;
  const match = trimmed.match(/channel\/(UC[\w-]{22})/);
  return match ? match[1] : null;
}

function extractKeywords(name: string, description: string): string {
  const words = [
    ...(name || "").split(/\s+/).filter((w) => w.length > 2),
    ...(description || "").slice(0, 200).split(/\s+/).filter((w) => w.length > 3),
  ]
    .filter((w) => !/^(the|and|for|com|www|https?|youtube|channel|subscribe)/i.test(w))
    .slice(0, 5);
  return [...new Set(words)].join(" ").trim();
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const channelId = searchParams.get("channelId") || "";
    const maxResults = Math.min(
      parseInt(searchParams.get("maxResults") || "12", 10),
      24
    );

    if (!channelId) {
      return NextResponse.json(
        { error: "channelId required" },
        { status: 400 }
      );
    }

    const key = cacheKey("channel", "similar-channels", {
      channelId,
      maxResults: String(maxResults),
    });
    const cached = cache.get<{ channels: ChannelWithStats[] }>(key);
    if (cached) return NextResponse.json(cached);

    const allChannels: ChannelWithStats[] = [];
    let channelItem: {
      id?: string;
      snippet?: { title?: string; description?: string };
      brandingSettings?: { channel?: { featuredChannelsUrls?: string[] } };
    } | undefined;

    try {
      const channelData = await youtubeFetch<YouTubeChannelsResponse>(
        "channels",
        {
          part: "brandingSettings,snippet,statistics",
          id: channelId,
        }
      );

      channelItem = channelData.items?.[0] as typeof channelItem;
      const branding = channelItem?.brandingSettings;
      const featuredUrls = branding?.channel?.featuredChannelsUrls || [];
      const featuredIds = featuredUrls
        .map((u) => extractChannelIdFromUrl(String(u)))
        .filter((id): id is string => !!id && id.startsWith("UC") && id !== (channelItem?.id || channelId))
        .slice(0, 12);

      if (featuredIds.length > 0) {
        const featuredData = await youtubeFetch<YouTubeChannelsResponse>(
          "channels",
          {
            part: "statistics,snippet",
            id: featuredIds.join(","),
          }
        );
        const featuredChannels = (featuredData.items || []).map((ch) => ({
          channelId: ch.id,
          name: ch.snippet?.title || "",
          description: ch.snippet?.description || "",
          thumbnail:
            ch.snippet?.thumbnails?.medium?.url ||
            ch.snippet?.thumbnails?.high?.url ||
            ch.snippet?.thumbnails?.default?.url ||
            "",
          subscriberCount: parseInt(ch.statistics?.subscriberCount || "0", 10),
          videoCount: parseInt(ch.statistics?.videoCount || "0", 10),
          viewCount: parseInt(ch.statistics?.viewCount || "0", 10),
          publishedAt: ch.snippet?.publishedAt,
        }));
        allChannels.push(...featuredChannels);
      }
    } catch {
      // brandingSettings may fail for some channels
    }

    if (allChannels.length < maxResults) {
      let ch = channelItem;
      if (!ch?.snippet) {
        const fallbackData = await youtubeFetch<YouTubeChannelsResponse>(
          "channels",
          { part: "snippet", id: channelId }
        );
        ch = fallbackData.items?.[0] as { snippet?: { title?: string; description?: string } };
      }
      const name = ch?.snippet?.title || "";
      const description = ch?.snippet?.description || "";
      const keywords = extractKeywords(name, description);

      if (keywords) {
        try {
          const searchData = await youtubeFetch<YouTubeSearchResponse>(
            "search",
            {
              part: "snippet",
              q: keywords,
              type: "channel",
              maxResults: String(Math.min(maxResults * 2, 24)),
            }
          );

          if (searchData.items?.length) {
            const ids = searchData.items
              .map((i) => i.id?.channelId)
              .filter((id): id is string => !!id && id !== channelId)
              .slice(0, 50)
              .join(",");

            if (ids) {
              const channelsData = await youtubeFetch<YouTubeChannelsResponse>(
                "channels",
                {
                  part: "statistics,snippet",
                  id: ids,
                }
              );
              const suggested = mergeSearchWithChannels(
                searchData.items,
                channelsData.items || []
              ).filter((c) => c.channelId !== channelId);

              const existingIds = new Set(allChannels.map((c) => c.channelId));
              for (const c of suggested) {
                if (!existingIds.has(c.channelId) && allChannels.length < maxResults) {
                  allChannels.push(c);
                  existingIds.add(c.channelId);
                }
              }
            }
          }
        } catch {
          // search fallback failed
        }
      }
    }

    const result = { channels: allChannels.slice(0, maxResults) };
    cache.set(key, result, getCacheTTL("channel"));
    return NextResponse.json(result);
  } catch (error) {
    console.error("Similar channels error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed" },
      { status: 500 }
    );
  }
}
