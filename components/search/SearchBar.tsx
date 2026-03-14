"use client";

import { useState } from "react";
import { Search } from "lucide-react";

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
    <form onSubmit={handleSubmit} className="flex gap-2.5 flex-wrap flex-1">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="flex-1 min-w-[260px] bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] px-4 py-3 text-sm rounded-xl outline-none focus:border-[var(--blue)] transition-colors"
        disabled={loading}
      />
      <button
        type="submit"
        disabled={loading || !query.trim()}
        className="bg-[var(--accent)] text-white px-6 py-3 text-sm font-bold rounded-xl hover:bg-[#ff5555] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:bg-[var(--accent)] hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(255,61,61,0.3)]"
        style={{ fontFamily: "Syne, sans-serif" }}
      >
        {loading ? "A pesquisar..." : (
          <>
            <Search className="size-4 inline mr-2" />
            Pesquisar
          </>
        )}
      </button>
    </form>
  );
}
