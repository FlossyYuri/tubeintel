import { NextRequest, NextResponse } from "next/server";
import { youtubeFetch } from "@/lib/youtube";
import { cache, cacheKey, getCacheTTL } from "@/lib/cache";
import { mergeSearchWithVideos } from "@/lib/transform";
import { isShort, isLongForm, getDurationSeconds } from "@/lib/format";
import type {
  YouTubeSearchResponse,
  YouTubeVideosResponse,
} from "@/types/youtube";
import type { VideoWithStats } from "@/types/youtube";

const MAX_VIDEOS = 200;
const PAGE_SIZE = 50;
const DEFAULT_DAYS = 28;

interface AggregatedStats {
  views: number;
  durationSeconds: number;
  likes: number;
  comments: number;
  videoCount: number;
}

export interface ChannelAnalyticsResponse {
  shorts: AggregatedStats;
  longForm: AggregatedStats;
  other: AggregatedStats;
  videos: VideoWithStats[];
  periodDays: number;
}

function aggregateVideos(videos: VideoWithStats[]): {
  shorts: AggregatedStats;
  longForm: AggregatedStats;
  other: AggregatedStats;
} {
  const shorts: AggregatedStats = {
    views: 0,
    durationSeconds: 0,
    likes: 0,
    comments: 0,
    videoCount: 0,
  };
  const longForm: AggregatedStats = {
    views: 0,
    durationSeconds: 0,
    likes: 0,
    comments: 0,
    videoCount: 0,
  };
  const other: AggregatedStats = {
    views: 0,
    durationSeconds: 0,
    likes: 0,
    comments: 0,
    videoCount: 0,
  };

  for (const v of videos) {
    const duration = v.duration || "";
    const secs = getDurationSeconds(duration);
    const stats = {
      views: v.viewCount,
      durationSeconds: secs,
      likes: v.likeCount,
      comments: v.commentCount,
      videoCount: 1,
    };

    if (isShort(duration, v.title)) {
      shorts.views += stats.views;
      shorts.durationSeconds += stats.durationSeconds;
      shorts.likes += stats.likes;
      shorts.comments += stats.comments;
      shorts.videoCount += 1;
    } else if (isLongForm(duration)) {
      longForm.views += stats.views;
      longForm.durationSeconds += stats.durationSeconds;
      longForm.likes += stats.likes;
      longForm.comments += stats.comments;
      longForm.videoCount += 1;
    } else {
      other.views += stats.views;
      other.durationSeconds += stats.durationSeconds;
      other.likes += stats.likes;
      other.comments += stats.comments;
      other.videoCount += 1;
    }
  }

  return { shorts, longForm, other };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const channelId = searchParams.get("channelId") || "";
    const daysParam = searchParams.get("days") || String(DEFAULT_DAYS);
    const days = Math.min(365, Math.max(1, parseInt(daysParam, 10) || DEFAULT_DAYS));
    const publishedAfter = new Date(
      Date.now() - days * 86400000
    ).toISOString();

    if (!channelId) {
      return NextResponse.json(
        { error: "channelId required" },
        { status: 400 }
      );
    }

    const key = cacheKey("channel", "channel-analytics", {
      channelId,
      days: String(days),
    });
    const cached = cache.get<ChannelAnalyticsResponse>(key);
    if (cached) return NextResponse.json(cached);

    const allSearchItems: YouTubeSearchResponse["items"] = [];
    let pageToken = "";

    do {
      const searchParamsObj: Record<string, string> = {
        part: "snippet",
        channelId,
        order: "date",
        type: "video",
        maxResults: String(PAGE_SIZE),
        publishedAfter,
      };
      if (pageToken) searchParamsObj.pageToken = pageToken;

      const searchData = await youtubeFetch<YouTubeSearchResponse>(
        "search",
        searchParamsObj
      );

      const items = searchData.items || [];
      allSearchItems.push(...items);
      pageToken = searchData.nextPageToken || "";

      if (items.length < PAGE_SIZE || allSearchItems.length >= MAX_VIDEOS) {
        break;
      }
    } while (pageToken);

    const allVideoIds = allSearchItems
      .map((i) => i.id?.videoId)
      .filter(Boolean) as string[];

    const allVideoItems: YouTubeVideosResponse["items"] = [];
    for (let i = 0; i < allVideoIds.length; i += 50) {
      const batch = allVideoIds.slice(i, i + 50);
      const videoIds = batch.join(",");
      const videosData = await youtubeFetch<YouTubeVideosResponse>("videos", {
        part: "snippet,statistics,contentDetails",
        id: videoIds,
      });
      allVideoItems.push(...(videosData.items || []));
    }

    const merged = mergeSearchWithVideos(
      allSearchItems as Parameters<typeof mergeSearchWithVideos>[0],
      allVideoItems
    );

    const { shorts, longForm, other } = aggregateVideos(merged);

    const result: ChannelAnalyticsResponse = {
      shorts,
      longForm,
      other,
      videos: merged,
      periodDays: days,
    };

    cache.set(key, result, getCacheTTL("channel"));
    return NextResponse.json(result);
  } catch (error) {
    console.error("Channel analytics error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed" },
      { status: 500 }
    );
  }
}
