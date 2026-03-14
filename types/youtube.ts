export interface YouTubeSearchItem {
  id: { videoId?: string; channelId?: string };
  snippet: {
    publishedAt: string;
    channelId: string;
    title: string;
    description: string;
    thumbnails: {
      default?: { url: string };
      medium?: { url: string };
      high?: { url: string };
    };
    channelTitle: string;
    tags?: string[];
    categoryId?: string;
    liveBroadcastContent?: string;
  };
}

export interface YouTubeVideoStatistics {
  viewCount: string;
  likeCount?: string;
  commentCount?: string;
}

export interface YouTubeContentDetails {
  duration: string;
  definition?: string;
  caption?: string;
}

export interface YouTubeVideoItem {
  id: string;
  statistics?: YouTubeVideoStatistics;
  contentDetails?: YouTubeContentDetails;
  snippet?: YouTubeSearchItem["snippet"];
}

export interface YouTubeSearchResponse {
  items: YouTubeSearchItem[];
  nextPageToken?: string;
}

export interface YouTubeVideosResponse {
  items: YouTubeVideoItem[];
}

export interface YouTubeChannelItem {
  id: string;
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      default?: { url: string };
      medium?: { url: string };
      high?: { url: string };
    };
    publishedAt?: string;
  };
  statistics: {
    subscriberCount: string;
    videoCount: string;
    viewCount: string;
  };
}

export interface YouTubeChannelsResponse {
  items: YouTubeChannelItem[];
}

export interface VideoWithStats {
  id: string;
  videoId: string;
  title: string;
  channelTitle: string;
  channelId: string;
  publishedAt: string;
  thumbnail: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  duration?: string;
  viralScore: number;
  tags?: string[];
  categoryId?: string;
  definition?: string;
  caption?: string;
  liveBroadcastContent?: string;
}
