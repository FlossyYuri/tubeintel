"use client";

import { useEffect, useState } from "react";
import { X, Bookmark, Plus } from "lucide-react";
import { buttonPrimary, buttonSecondary } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";
import type { VideoWithStats } from "@/types/youtube";

interface Collection {
  id: string;
  name: string;
  icon: string;
  color: string;
  _count?: { items: number };
}

interface SaveToCollectionModalProps {
  video: VideoWithStats;
  onClose: () => void;
  onSaved?: () => void;
}

export function SaveToCollectionModal({
  video,
  onClose,
  onSaved,
}: SaveToCollectionModalProps) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/collections")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setCollections(data);
        else setCollections([]);
      })
      .catch(() => setCollections([]))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (collectionId: string) => {
    setSavingId(collectionId);
    setError("");
    try {
      const res = await fetch(`/api/collections/${collectionId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoId: video.videoId,
          title: video.title,
          channelTitle: video.channelTitle,
          thumbnail: video.thumbnail,
          views: video.viewCount,
          viralScore: video.viralScore,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao guardar");
      onSaved?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao guardar");
    } finally {
      setSavingId(null);
    }
  };

  const handleCreateAndSave = async () => {
    const name = newName.trim();
    if (!name) return;
    setCreating(true);
    setError("");
    try {
      const createRes = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const newCol = await createRes.json();
      if (!createRes.ok) throw new Error(newCol.error || "Erro ao criar");
      await handleSave(newCol.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[1100] flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-[var(--bg2)] border border-[var(--border2)] rounded-2xl w-full max-w-[420px] max-h-[85vh] overflow-y-auto p-4 sm:p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg bg-[var(--card)] border border-[var(--border)] hover:bg-[var(--border)] transition-colors"
          aria-label="Fechar"
        >
          <X className="size-4" />
        </button>

        <h3 className="text-lg font-bold mb-1 pr-10 font-display flex items-center gap-2">
          <Bookmark className="size-5 text-[var(--accent)]" />
          Guardar em colecção
        </h3>
        <p className="text-sm text-[var(--text3)] mb-4 line-clamp-2">
          {video.title}
        </p>

        {error && (
          <p className="text-sm text-[var(--accent)] mb-3">{error}</p>
        )}

        {loading ? (
          <p className="text-sm text-[var(--text3)]">A carregar colecções...</p>
        ) : (
          <div className="space-y-2 mb-6">
            {collections.map((c) => (
              <button
                key={c.id}
                onClick={() => handleSave(c.id)}
                disabled={!!savingId}
                className={cn(
                  "w-full flex items-center justify-between p-3 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--card2)] transition-colors text-left disabled:opacity-50"
                )}
              >
                <span className="font-medium truncate flex-1">
                  {c.icon} {c.name}
                </span>
                {c._count?.items != null && (
                  <span className="text-xs text-[var(--text3)] ml-2">
                    {c._count.items} vídeos
                  </span>
                )}
                {savingId === c.id && (
                  <span className="text-xs text-[var(--accent)] ml-2">
                    A guardar...
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        <div className="border-t border-[var(--border)] pt-4">
          <p className="text-xs text-[var(--text3)] mb-2 font-mono uppercase tracking-wider">
            Criar nova colecção
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateAndSave()}
              placeholder="Nome da colecção..."
              className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] outline-none focus:border-[var(--blue)]"
            />
            <button
              onClick={handleCreateAndSave}
              disabled={!newName.trim() || creating}
              className={cn(
                buttonSecondary,
                "inline-flex items-center gap-1.5 px-4 py-2.5 disabled:opacity-50"
              )}
            >
              <Plus className="size-4" /> Criar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
