"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { input } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";
import { parseChannelInput } from "@/lib/channel-utils";
import { formatNumber } from "@/lib/format";

export interface ChannelOption {
  channelId: string;
  name: string;
  thumbnail: string;
  subscriberCount: number;
  videoCount: number;
  viewCount: number;
}

interface ChannelSearchInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onSelect: (channel: ChannelOption) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

export function ChannelSearchInput({
  value = "",
  onChange,
  onSelect,
  placeholder = "Nome do canal, @handle ou URL...",
  disabled = false,
  className,
}: ChannelSearchInputProps) {
  const [query, setQuery] = useState(value);
  const [options, setOptions] = useState<ChannelOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const debouncedQuery = useDebounce(query.trim(), 350);

  const fetchChannels = useCallback(async (searchQuery: string) => {
    if (!searchQuery || searchQuery.length < 2) {
      setOptions([]);
      return;
    }

    setLoading(true);
    try {
      const { type, value: paramValue } = parseChannelInput(searchQuery);
      const params =
        type === "channelId"
          ? `channelId=${encodeURIComponent(paramValue)}`
          : `q=${encodeURIComponent(paramValue)}`;
      const res = await fetch(`/api/youtube/channel?${params}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Search failed");

      const chMap = new Map<
        string,
        {
          subscriberCount: number;
          videoCount: number;
          viewCount: number;
          thumbnail: string;
          name: string;
        }
      >();
      (data.channels?.items || []).forEach(
        (c: {
          id: string;
          statistics: Record<string, string>;
          snippet: {
            title: string;
            thumbnails: { medium?: { url: string } };
          };
        }) => {
          chMap.set(c.id, {
            subscriberCount: parseInt(c.statistics?.subscriberCount || "0", 10),
            videoCount: parseInt(c.statistics?.videoCount || "0", 10),
            viewCount: parseInt(c.statistics?.viewCount || "0", 10),
            thumbnail: c.snippet?.thumbnails?.medium?.url || "",
            name: c.snippet?.title || "",
          });
        }
      );

      const results: ChannelOption[] = (data.search?.items || data.channels?.items || [])
        .filter((i: { id?: { channelId?: string } | string }) =>
          (typeof i.id === "object" && i.id?.channelId) || typeof i.id === "string"
        )
        .map(
          (i: {
            id?: { channelId?: string } | string;
            snippet?: { title: string };
          }) => {
            const chId =
              typeof i.id === "string"
                ? i.id
                : (i.id && typeof i.id === "object" && "channelId" in i.id
                    ? (i.id as { channelId: string }).channelId
                    : "") || "";
            const ch = chMap.get(chId);
            return {
              channelId: chId,
              name: ch?.name || (i.snippet?.title ?? ""),
              thumbnail: ch?.thumbnail || "",
              subscriberCount: ch?.subscriberCount || 0,
              videoCount: ch?.videoCount || 0,
              viewCount: ch?.viewCount || 0,
            };
          }
        )
        .filter((r: ChannelOption) => !!r.channelId);

      setOptions(results);
      setOpen(true);
      setHighlightIndex(-1);
    } catch {
      setOptions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      fetchChannels(debouncedQuery);
    } else {
      setOptions([]);
      setOpen(false);
    }
  }, [debouncedQuery, fetchChannels]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || options.length === 0) {
      if (e.key === "Escape") setOpen(false);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((i) => Math.min(i + 1, options.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter" && highlightIndex >= 0 && options[highlightIndex]) {
      e.preventDefault();
      onSelect(options[highlightIndex]);
      setOpen(false);
      setQuery("");
      onChange?.("");
    } else if (e.key === "Escape") {
      setOpen(false);
      setHighlightIndex(-1);
    }
  };

  useEffect(() => {
    if (highlightIndex >= 0 && listRef.current) {
      const el = listRef.current.children[highlightIndex] as HTMLElement;
      el?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightIndex]);

  const handleSelect = (ch: ChannelOption) => {
    onSelect(ch);
    setOpen(false);
    setQuery("");
    onChange?.("");
  };

  return (
    <div ref={containerRef} className={cn("relative flex-1 min-w-0", className)}>
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[var(--text3)] pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onChange?.(e.target.value);
          }}
          onFocus={() => options.length > 0 && setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(input, "w-full pl-10 pr-4")}
          autoComplete="off"
        />
      </div>

      {open && (options.length > 0 || loading) && (
        <ul
          ref={listRef}
          className="absolute top-full left-0 right-0 mt-1 max-h-64 overflow-y-auto rounded-xl bg-[var(--card)] border border-[var(--border)] shadow-xl z-50 py-1"
        >
          {loading ? (
            <li className="px-4 py-3 text-sm text-[var(--text3)]">
              A procurar...
            </li>
          ) : (
            options.map((ch, i) => (
              <li key={ch.channelId}>
                <button
                  type="button"
                  onClick={() => handleSelect(ch)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors",
                    i === highlightIndex
                      ? "bg-[var(--border)]"
                      : "hover:bg-[var(--border)]/50"
                  )}
                >
                  <div className="size-10 rounded-full bg-[var(--bg3)] overflow-hidden shrink-0">
                    {ch.thumbnail ? (
                      <img
                        src={ch.thumbnail}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">
                      {ch.name}
                    </div>
                    <div className="text-[11px] text-[var(--text3)] font-mono">
                      {formatNumber(ch.subscriberCount)} subs
                    </div>
                  </div>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
