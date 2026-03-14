import { calcViralScore } from "./viral-score";
import type { YouTubeSearchItem, YouTubeVideoItem } from "@/types/youtube";
import type { VideoWithStats } from "@/types/youtube";

export function transformToVideoWithStats(
  searchItem: YouTubeSearchItem,
  videoItem?: YouTubeVideoItem
): VideoWithStats {
  const videoId = searchItem.id?.videoId || "";
  const stats = videoItem?.statistics;
  const viewCount = parseInt(stats?.viewCount || "0", 10);
  const likeCount = parseInt(stats?.likeCount || "0", 10);
  const commentCount = parseInt(stats?.commentCount || "0", 10);
  const publishedAt = searchItem.snippet?.publishedAt || "";
  const viralScore = calcViralScore(viewCount, likeCount, commentCount, publishedAt);

  return {
    id: videoId,
    videoId,
    title: searchItem.snippet?.title || videoItem?.snippet?.title || "",
    channelTitle: searchItem.snippet?.channelTitle || videoItem?.snippet?.channelTitle || "",
    channelId: searchItem.snippet?.channelId || videoItem?.snippet?.channelId || "",
    publishedAt,
    thumbnail:
      searchItem.snippet?.thumbnails?.medium?.url ||
      searchItem.snippet?.thumbnails?.high?.url ||
      searchItem.snippet?.thumbnails?.default?.url ||
      videoItem?.snippet?.thumbnails?.medium?.url ||
      videoItem?.snippet?.thumbnails?.high?.url ||
      videoItem?.snippet?.thumbnails?.default?.url ||
      "",
    viewCount,
    likeCount,
    commentCount,
    duration: videoItem?.contentDetails?.duration,
    viralScore,
    tags: videoItem?.snippet?.tags,
    categoryId: videoItem?.snippet?.categoryId,
    definition: videoItem?.contentDetails?.definition,
    caption: videoItem?.contentDetails?.caption,
    liveBroadcastContent: videoItem?.snippet?.liveBroadcastContent,
  };
}

export function mergeSearchWithVideos(
  searchItems: YouTubeSearchItem[],
  videoItems: YouTubeVideoItem[]
): VideoWithStats[] {
  const videoMap = new Map(videoItems.map((v) => [v.id, v]));
  return searchItems
    .filter((s) => s.id?.videoId)
    .map((s) =>
      transformToVideoWithStats(s, videoMap.get(s.id!.videoId!))
    );
}
