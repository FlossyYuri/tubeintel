"use client";

import { QuotaTracker } from "./QuotaTracker";

interface TopbarProps {
  title: string;
}

export function Topbar({ title }: TopbarProps) {
  return (
    <div
      className="bg-[var(--bg2)] border-b border-[var(--border)] px-7 h-[60px] flex items-center justify-between sticky top-0 z-50"
    >
      <h1
        className="text-[17px] font-bold"
        style={{ fontFamily: "Syne, sans-serif" }}
      >
        {title}
      </h1>
      <div className="flex items-center gap-3">
        <QuotaTracker />
      </div>
    </div>
  );
}
