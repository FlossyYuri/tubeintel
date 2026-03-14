"use client";

import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: string;
  title: string;
  description?: string;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 sm:py-20 text-center",
        className
      )}
    >
      <div className="text-5xl mb-4 opacity-30">{icon}</div>
      <p className="font-semibold text-base text-[var(--text2)] mb-1.5">
        {title}
      </p>
      {description && (
        <p className="text-sm text-[var(--text3)] max-w-sm">{description}</p>
      )}
    </div>
  );
}
