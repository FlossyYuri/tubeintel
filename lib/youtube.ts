import { prisma } from "./db";
import { cache, getCacheTTL, cacheKey, type CacheType } from "./cache";

const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";

export async function getApiKey(): Promise<string> {
  const fromEnv = process.env.YOUTUBE_API_KEY?.trim();
  if (fromEnv) return fromEnv;
  try {
    const settings = await prisma.settings.findUnique({ where: { id: 1 } });
    const fromDb = settings?.apiKey?.trim();
    if (fromDb) return fromDb;
  } catch {
    // Settings table may not exist
  }
  return "";
}

export async function validateApiKey(key: string): Promise<boolean> {
  try {
    const res = await fetch(
      `${YOUTUBE_API_BASE}/search?part=snippet&q=test&type=video&maxResults=1&key=${key}`
    );
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message ?? "Invalid API key");
    }
    return true;
  } catch {
    return false;
  }
}

function buildUrl(endpoint: string, params: Record<string, string>): string {
  const url = new URL(`${YOUTUBE_API_BASE}/${endpoint}`);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== "") url.searchParams.set(k, v);
  });
  return url.toString();
}

export async function youtubeFetch<T>(
  endpoint: string,
  params: Record<string, string>,
  cacheType?: CacheType,
  cacheParams?: Record<string, string>
): Promise<T> {
  const apiKey = await getApiKey();
  if (!apiKey) {
    throw new Error("YouTube API key not configured. Configure it in Settings.");
  }

  params.key = apiKey;

  const key = cacheType && cacheParams
    ? cacheKey(cacheType, endpoint, cacheParams)
    : null;

  if (key) {
    const cached = cache.get<T>(key);
    if (cached) return cached;
  }

  const url = buildUrl(endpoint, params);
  const res = await fetch(url);

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message ?? "YouTube API error");
  }

  const data = (await res.json()) as T;

  if (key && cacheType) {
    cache.set(key, data, getCacheTTL(cacheType));
  }

  return data;
}
