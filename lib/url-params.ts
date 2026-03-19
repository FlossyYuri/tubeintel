/**
 * Utilities for syncing page state with URL query params.
 * Enables back/forward navigation to restore filters and search state.
 */

export type ParamSchema<T> = {
  [K in keyof T]: {
    key: string;
    default: T[K];
    parse?: (v: string | null) => T[K];
  };
};

/**
 * Parses URLSearchParams into a typed object using the given schema.
 * Unknown or invalid values fall back to defaults.
 */
export function parseSearchParams<T extends Record<string, unknown>>(
  params: URLSearchParams,
  schema: ParamSchema<T>,
  defaults: T
): T {
  const result = { ...defaults };
  for (const key of Object.keys(schema) as (keyof T)[]) {
    const def = schema[key];
    if (!def) continue;
    const raw = params.get(def.key);
    if (def.parse) {
      result[key] = def.parse(raw) as T[keyof T];
    } else if (raw !== null && raw !== undefined && raw !== "") {
      result[key] = raw as T[keyof T];
    }
  }
  return result;
}

/**
 * Converts a state object to URLSearchParams.
 * Omits keys that match defaults or are empty to keep URLs clean.
 */
export function toSearchParams<T extends Record<string, unknown>>(
  obj: T,
  schema: ParamSchema<T>,
  defaults: T
): URLSearchParams {
  const sp = new URLSearchParams();
  for (const key of Object.keys(schema) as (keyof T)[]) {
    const def = schema[key];
    if (!def) continue;
    const val = obj[key];
    const defaultVal = defaults[key];
    if (val === undefined || val === null || val === "" || val === defaultVal) {
      continue;
    }
    sp.set(def.key, String(val));
  }
  return sp;
}

/**
 * Builds a query string from state, omitting defaults.
 * Returns empty string if no params differ from defaults.
 */
export function toQueryString<T extends Record<string, unknown>>(
  obj: T,
  schema: ParamSchema<T>,
  defaults: T
): string {
  const sp = toSearchParams(obj, schema, defaults);
  const str = sp.toString();
  return str ? `?${str}` : "";
}

/* ─── Page-specific schemas ─────────────────────────────────────────────── */

const VALID_ORDER = new Set([
  'relevance',
  'viewCount',
  'date',
  'rating',
  'videoCount',
  'title',
]);
const VALID_SORT_VIDEO = new Set([
  'views',
  'recent',
  'viral',
  'likes',
  'engagement',
  'ratio',
]);
const VALID_SORT_CHANNEL = new Set([
  'subscribers',
  'views',
  'videos',
  'viewsPerSub',
  'name',
  'recent',
]);
const VALID_FORMAT = new Set(['all', 'shorts', 'longform']);
const VALID_TAB = new Set(['videos', 'channels']);

export type SearchUrlState = {
  q: string;
  order: string;
  region: string;
  duration: string;
  format: string;
  category: string;
  definition: string;
  caption: string;
  publishedAfter: string;
  sortBy: string;
};

export const SEARCH_SCHEMA: ParamSchema<SearchUrlState> = {
  q: { key: 'q', default: '' },
  order: {
    key: 'order',
    default: 'date',
    parse: (v) => (v && VALID_ORDER.has(v) ? v : 'date'),
  },
  region: { key: 'region', default: 'US' },
  duration: { key: 'duration', default: '' },
  format: { key: 'format', default: '' },
  category: { key: 'category', default: '' },
  definition: { key: 'definition', default: '' },
  caption: { key: 'caption', default: '' },
  publishedAfter: { key: 'publishedAfter', default: 'week' },
  sortBy: {
    key: 'sortBy',
    default: 'recent',
    parse: (v) => (v && VALID_SORT_VIDEO.has(v) ? v : 'recent'),
  },
};

export const SEARCH_DEFAULTS: SearchUrlState = {
  q: '',
  order: 'date',
  region: 'US',
  duration: '',
  format: '',
  category: '',
  definition: '',
  caption: '',
  publishedAfter: 'week',
  sortBy: 'recent',
};

export type ChannelsUrlState = {
  q: string;
  order: string;
  region: string;
  sortBy: string;
};

export const CHANNELS_SCHEMA: ParamSchema<ChannelsUrlState> = {
  q: { key: 'q', default: '' },
  order: {
    key: 'order',
    default: 'relevance',
    parse: (v) => (v && VALID_ORDER.has(v) ? v : 'relevance'),
  },
  region: { key: 'region', default: 'US' },
  sortBy: {
    key: 'sortBy',
    default: 'subscribers',
    parse: (v) => (v && VALID_SORT_CHANNEL.has(v) ? v : 'subscribers'),
  },
};

export const CHANNELS_DEFAULTS: ChannelsUrlState = {
  q: '',
  order: 'relevance',
  region: 'US',
  sortBy: 'subscribers',
};

export type TrendingUrlState = {
  region: string;
  category: string;
  format: string;
  sortBy: string;
};

export const TRENDING_SCHEMA: ParamSchema<TrendingUrlState> = {
  region: { key: 'region', default: 'US' },
  category: { key: 'category', default: '0' },
  format: {
    key: 'format',
    default: 'all',
    parse: (v) => (v && VALID_FORMAT.has(v) ? v : 'all'),
  },
  sortBy: {
    key: 'sortBy',
    default: 'views',
    parse: (v) => (v && VALID_SORT_VIDEO.has(v) ? v : 'views'),
  },
};

export const TRENDING_DEFAULTS: TrendingUrlState = {
  region: 'US',
  category: '0',
  format: 'all',
  sortBy: 'views',
};

export type DiscoverUrlState = {
  keyword: string;
  region: string;
  category: string;
  period: string;
  multiplier: string;
  sortBy: string;
};

export const DISCOVER_SCHEMA: ParamSchema<DiscoverUrlState> = {
  keyword: { key: 'keyword', default: 'viral' },
  region: { key: 'region', default: 'US' },
  category: { key: 'category', default: '' },
  period: { key: 'period', default: 'week' },
  multiplier: { key: 'multiplier', default: '2' },
  sortBy: {
    key: 'sortBy',
    default: 'ratio',
    parse: (v) => (v && VALID_SORT_VIDEO.has(v) ? v : 'ratio'),
  },
};

export const DISCOVER_DEFAULTS: DiscoverUrlState = {
  keyword: 'viral',
  region: 'US',
  category: '',
  period: 'week',
  multiplier: '2',
  sortBy: 'ratio',
};

export type RisingUrlState = {
  keyword: string;
  region: string;
};

export const RISING_SCHEMA: ParamSchema<RisingUrlState> = {
  keyword: { key: 'keyword', default: 'viral' },
  region: { key: 'region', default: 'US' },
};

export const RISING_DEFAULTS: RisingUrlState = {
  keyword: 'viral',
  region: 'US',
};

export type RankingsUrlState = {
  tab: string;
  region: string;
  category: string;
  keyword: string;
  format: string;
};

export const RANKINGS_SCHEMA: ParamSchema<RankingsUrlState> = {
  tab: {
    key: 'tab',
    default: 'videos',
    parse: (v) => (v && VALID_TAB.has(v) ? v : 'videos'),
  },
  region: { key: 'region', default: 'US' },
  category: { key: 'category', default: '' },
  keyword: { key: 'keyword', default: 'viral' },
  format: {
    key: 'format',
    default: 'all',
    parse: (v) => (v && VALID_FORMAT.has(v) ? v : 'all'),
  },
};

export const RANKINGS_DEFAULTS: RankingsUrlState = {
  tab: 'videos',
  region: 'US',
  category: '',
  keyword: 'viral',
  format: 'all',
};

export type ShortsUrlState = {
  q: string;
  region: string;
};

export const SHORTS_SCHEMA: ParamSchema<ShortsUrlState> = {
  q: { key: 'q', default: '' },
  region: { key: 'region', default: 'US' },
};

export const SHORTS_DEFAULTS: ShortsUrlState = {
  q: '',
  region: 'US',
};

export type StudyUrlState = {
  region: string;
  category: string;
  mode: string;
};

export const STUDY_SCHEMA: ParamSchema<StudyUrlState> = {
  region: { key: 'region', default: 'US' },
  category: { key: 'category', default: '0' },
  mode: {
    key: 'mode',
    default: '0',
    parse: (v) => {
      const n = parseInt(v || '0', 10);
      return String(Math.max(0, Math.min(2, isNaN(n) ? 0 : n)));
    },
  },
};

export const STUDY_DEFAULTS: StudyUrlState = {
  region: 'US',
  category: '0',
  mode: '0',
};

export type NichesUrlState = {
  category: string;
};

export const NICHES_SCHEMA: ParamSchema<NichesUrlState> = {
  category: { key: 'category', default: 'Todos' },
};

export const NICHES_DEFAULTS: NichesUrlState = {
  category: 'Todos',
};
