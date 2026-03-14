"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { input, buttonPrimary } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  onSearch: (query: string) => void;
  loading?: boolean;
  placeholder?: string;
}

export function SearchBar({
  onSearch,
  loading = false,
  placeholder = "Ex: receitas rápidas, tutorial python, motivação...",
}: SearchBarProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) onSearch(query.trim());
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col sm:flex-row gap-2.5 flex-1 w-full min-w-0"
    >
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className={cn(input, "w-full min-w-0")}
        disabled={loading}
      />
      <button
        type="submit"
        disabled={loading || !query.trim()}
        className={cn(
          buttonPrimary,
          "flex items-center justify-center gap-2 w-full sm:w-auto shrink-0"
        )}
      >
        {loading ? (
          "A pesquisar..."
        ) : (
          <>
            <Search className="size-4" />
            Pesquisar
          </>
        )}
      </button>
    </form>
  );
}
