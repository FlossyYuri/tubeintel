'use client';

import { useMemo, useCallback } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import {
  parseSearchParams,
  toQueryString,
  type ParamSchema,
} from '@/lib/url-params';

/**
 * Syncs page state with URL query params.
 * - State is derived from URL (source of truth)
 * - updateParams() merges updates and calls router.push (adds to history for back/forward)
 */
export function useUrlState<T extends Record<string, unknown>>(
  schema: ParamSchema<T>,
  defaults: T
): [T, (updates: Partial<T>) => void] {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const state = useMemo(
    () => parseSearchParams(searchParams, schema, defaults),
    [searchParams, schema, defaults]
  );

  const updateParams = useCallback(
    (updates: Partial<T>) => {
      const merged = { ...state, ...updates } as T;
      const query = toQueryString(merged, schema, defaults);
      const href = query ? `${pathname}${query}` : pathname;
      router.push(href);
    },
    [state, pathname, router, schema, defaults]
  );

  return [state, updateParams];
}
