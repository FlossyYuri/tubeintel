"use client";

import { useEffect, useState } from "react";

const QUOTA_LIMIT = 10000;

function getStoredQuota(): number {
  if (typeof window === "undefined") return 0;
  const stored = localStorage.getItem("tubeintel_quota_used");
  const date = localStorage.getItem("tubeintel_quota_date");
  const today = new Date().toDateString();

  if (date === today && stored) {
    return parseInt(stored, 10);
  }
  localStorage.setItem("tubeintel_quota_used", "0");
  localStorage.setItem("tubeintel_quota_date", today);
  return 0;
}

export function QuotaTracker() {
  const [used, setUsed] = useState(0);

  useEffect(() => {
    setUsed(getStoredQuota());
    const handler = () => setUsed(getStoredQuota());
    window.addEventListener("quota-update", handler);
    return () => window.removeEventListener("quota-update", handler);
  }, []);

  return (
    <div
      className="text-[10px] font-mono text-[var(--text3)] bg-[var(--card)] px-2.5 py-1 rounded-full border border-[var(--border)]"
      style={{ fontFamily: "Space Mono, monospace" }}
    >
      API Quota: <span className="text-[var(--yellow)]">{used.toLocaleString()}</span>/{QUOTA_LIMIT.toLocaleString()}
    </div>
  );
}

export function useQuota() {
  const addQuota = (cost: number) => {
    const stored = localStorage.getItem("tubeintel_quota_used");
    const date = localStorage.getItem("tubeintel_quota_date");
    const today = new Date().toDateString();

    let current = 0;
    if (date === today && stored) {
      current = parseInt(stored, 10);
    }

    const newTotal = Math.min(current + cost, QUOTA_LIMIT);
    localStorage.setItem("tubeintel_quota_used", String(newTotal));
    localStorage.setItem("tubeintel_quota_date", today);
    window.dispatchEvent(new Event("quota-update"));
  };

  return { addQuota };
}
