"use client";

import { cn } from "@/lib/utils";

interface SpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "size-6",
  md: "size-9",
  lg: "size-12",
};

export function Spinner({ className, size = "md" }: SpinnerProps) {
  return (
    <div
      className={cn(
        "rounded-full border-2 border-white/[0.06] border-t-[#E8441C] animate-spin",
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label="A carregar"
    />
  );
}
