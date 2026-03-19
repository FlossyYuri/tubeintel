import type { RevenueParams, RevenueEstimate } from "@/types/youtube";

const SHORTS_RPM_MIN = 0.01;
const SHORTS_RPM_MAX = 1;
const LONGFORM_RPM_MIN = 1;
const LONGFORM_RPM_MAX = 50;

const DEFAULT_SHORTS_RPM = 0.1;
const DEFAULT_LONGFORM_RPM = 5;

export const DEFAULT_REVENUE_PARAMS: RevenueParams = {
  shortsRpm: DEFAULT_SHORTS_RPM,
  longFormRpm: DEFAULT_LONGFORM_RPM,
};

export function clampRevenueParams(params: Partial<RevenueParams>): RevenueParams {
  const shortsRpm = Math.max(
    SHORTS_RPM_MIN,
    Math.min(SHORTS_RPM_MAX, params.shortsRpm ?? DEFAULT_SHORTS_RPM)
  );
  const longFormRpm = Math.max(
    LONGFORM_RPM_MIN,
    Math.min(LONGFORM_RPM_MAX, params.longFormRpm ?? DEFAULT_LONGFORM_RPM)
  );
  return { shortsRpm, longFormRpm };
}

export function estimateRevenue(
  shortsViews: number,
  longFormViews: number,
  params: Partial<RevenueParams> = {}
): RevenueEstimate {
  const { shortsRpm, longFormRpm } = clampRevenueParams(params);

  const shortsRevenue = (shortsViews / 1000) * shortsRpm;
  const longFormRevenue = (longFormViews / 1000) * longFormRpm;

  return {
    shortsRevenue,
    longFormRevenue,
    totalRevenue: shortsRevenue + longFormRevenue,
    shortsViews,
    longFormViews,
  };
}
