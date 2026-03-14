"use client";

import { pageTitle, pageDescription } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  className?: string;
}

export function PageHeader({ title, description, className }: PageHeaderProps) {
  return (
    <div className={cn("mb-6", className)}>
      <h2 className={pageTitle}>{title}</h2>
      {description && <p className={pageDescription}>{description}</p>}
    </div>
  );
}
