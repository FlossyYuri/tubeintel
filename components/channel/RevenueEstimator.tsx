"use client";

import { useState, useMemo } from "react";
import { formatNumber } from "@/lib/format";
import {
  estimateRevenue,
  DEFAULT_REVENUE_PARAMS,
} from "@/lib/revenue";
import { sectionTitle } from "@/lib/design-tokens";

interface RevenueEstimatorProps {
  shortsViews: number;
  longFormViews: number;
  periodDays: number;
}

const SHORTS_RPM_MIN = 0.01;
const SHORTS_RPM_MAX = 1;
const LONGFORM_RPM_MIN = 1;
const LONGFORM_RPM_MAX = 50;

export function RevenueEstimator({
  shortsViews,
  longFormViews,
  periodDays,
}: RevenueEstimatorProps) {
  const [shortsRpm, setShortsRpm] = useState(DEFAULT_REVENUE_PARAMS.shortsRpm);
  const [longFormRpm, setLongFormRpm] = useState(
    DEFAULT_REVENUE_PARAMS.longFormRpm
  );

  const estimate = useMemo(
    () =>
      estimateRevenue(shortsViews, longFormViews, {
        shortsRpm,
        longFormRpm,
      }),
    [shortsViews, longFormViews, shortsRpm, longFormRpm]
  );

  const totalViews = shortsViews + longFormViews;
  if (totalViews === 0) return null;

  return (
    <div className="mb-6">
      <h3 className={`${sectionTitle} mb-4 text-[var(--text2)]`}>
        Estimativa de receita (últimos {periodDays} dias)
      </h3>
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-6">
        <p className="text-xs text-[var(--text3)] mb-4 font-mono">
          RPM = receita por 1.000 views. Ajusta os parâmetros conforme o teu
          nicho.
        </p>

        <div className="space-y-4 mb-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-mono text-[var(--purple)] uppercase tracking-wider">
                Shorts RPM ($/1k views)
              </label>
              <span className="text-sm font-semibold text-[var(--purple)]">
                ${shortsRpm.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min={SHORTS_RPM_MIN}
              max={SHORTS_RPM_MAX}
              step={0.01}
              value={shortsRpm}
              onChange={(e) => setShortsRpm(parseFloat(e.target.value))}
              className="w-full h-2 rounded-full appearance-none bg-[var(--bg3)] accent-[var(--purple)]"
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-mono text-[var(--blue2)] uppercase tracking-wider">
                Long Form RPM ($/1k views)
              </label>
              <span className="text-sm font-semibold text-[var(--blue2)]">
                ${longFormRpm.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min={LONGFORM_RPM_MIN}
              max={LONGFORM_RPM_MAX}
              step={0.5}
              value={longFormRpm}
              onChange={(e) => setLongFormRpm(parseFloat(e.target.value))}
              className="w-full h-2 rounded-full appearance-none bg-[var(--bg3)] accent-[var(--blue2)]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-[var(--bg)] border border-[var(--border)]">
          {shortsViews > 0 && (
            <div>
              <div className="text-[10px] text-[var(--text3)] font-mono uppercase tracking-wider mb-1">
                Shorts
              </div>
              <div className="text-lg font-bold text-[var(--purple)]">
                ${estimate.shortsRevenue.toFixed(2)}
              </div>
              <div className="text-[11px] text-[var(--text3)]">
                {formatNumber(shortsViews)} views
              </div>
            </div>
          )}
          {longFormViews > 0 && (
            <div>
              <div className="text-[10px] text-[var(--text3)] font-mono uppercase tracking-wider mb-1">
                Long Form
              </div>
              <div className="text-lg font-bold text-[var(--blue2)]">
                ${estimate.longFormRevenue.toFixed(2)}
              </div>
              <div className="text-[11px] text-[var(--text3)]">
                {formatNumber(longFormViews)} views
              </div>
            </div>
          )}
          <div>
            <div className="text-[10px] text-[var(--text3)] font-mono uppercase tracking-wider mb-1">
              Total estimado
            </div>
            <div className="text-xl font-extrabold text-[var(--accent)]">
              ${estimate.totalRevenue.toFixed(2)}
            </div>
            <div className="text-[11px] text-[var(--text3)]">
              {formatNumber(totalViews)} views
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
