"use client";

import { cn } from "@/lib/utils";

interface ErrorMessageProps {
  message: string;
  className?: string;
}

export function ErrorMessage({ message, className }: ErrorMessageProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2.5 p-4 rounded-xl bg-[rgba(255,61,61,0.08)] border border-[rgba(255,61,61,0.3)] text-sm text-[var(--text2)]",
        className
      )}
      role="alert"
    >
      <span aria-hidden>❌</span>
      <span>{message}</span>
    </div>
  );
}
