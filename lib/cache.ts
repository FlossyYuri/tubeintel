import NodeCache from "node-cache";

const CACHE_TTL_SEARCH = parseInt(process.env.CACHE_TTL_SEARCH ?? "300", 10);
const CACHE_TTL_TRENDING = parseInt(process.env.CACHE_TTL_TRENDING ?? "3600", 10);
const CACHE_TTL_CHANNEL = parseInt(process.env.CACHE_TTL_CHANNEL ?? "1800", 10);
const CACHE_TTL_CHANNELS_SEARCH = parseInt(process.env.CACHE_TTL_CHANNELS_SEARCH ?? "3600", 10);
const CACHE_TTL_RISING = parseInt(process.env.CACHE_TTL_RISING ?? "1800", 10);

export const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

export type CacheType = "search" | "trending" | "channel" | "channels-search" | "rising";

export function getCacheTTL(type: CacheType): number {
  switch (type) {
    case "search":
      return CACHE_TTL_SEARCH;
    case "trending":
      return CACHE_TTL_TRENDING;
    case "channel":
      return CACHE_TTL_CHANNEL;
    case "channels-search":
      return CACHE_TTL_CHANNELS_SEARCH;
    case "rising":
      return CACHE_TTL_RISING;
    default:
      return 300;
  }
}

export function cacheKey(type: CacheType, prefix: string, params: Record<string, string>): string {
  const sorted = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  return `tubeintel:${type}:${prefix}:${sorted}`;
}
