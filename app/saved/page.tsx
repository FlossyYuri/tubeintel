"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import { PageHeader, Spinner, EmptyState } from "@/components/ui";
import { input, buttonPrimary, card } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

interface Collection {
  id: string;
  name: string;
  icon: string;
  color: string;
  _count: { items: number };
  updatedAt: string;
}

export default function SavedPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchCollections = () => {
    fetch("/api/collections")
      .then((r) => r.json())
      .then(setCollections)
      .catch(() => setCollections([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });
      setNewName("");
      fetchCollections();
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apagar esta colecção?")) return;
    await fetch(`/api/collections/${id}`, { method: "DELETE" });
    fetchCollections();
  };

  return (
    <div>
      <PageHeader
        title="Colecções Guardadas"
        description="Organiza os teus vídeos e canais em pastas"
      />

      <div className="flex flex-col sm:flex-row gap-2 mb-6">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          placeholder="Nova colecção..."
          className={cn(input, "flex-1 w-full sm:max-w-xs")}
        />
        <button
          onClick={handleCreate}
          disabled={creating || !newName.trim()}
          className={cn(buttonPrimary, "flex items-center gap-2 px-4 py-2")}
        >
          <Plus className="size-4" /> Criar
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-[var(--text3)]">
          <Spinner className="mb-4" />
        </div>
      ) : collections.length === 0 ? (
        <EmptyState
          icon="📁"
          title="Sem colecções"
          description="Cria uma colecção para guardar vídeos"
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((c) => (
            <div
              key={c.id}
              className={cn(card, "flex items-center justify-between p-4 hover:border-[var(--border2)] transition-colors duration-200")}
            >
              <Link href={`/saved/${c.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                <span className="text-2xl">{c.icon}</span>
                <div className="min-w-0">
                  <div className="font-semibold truncate">{c.name}</div>
                  <div className="text-[11px] text-[var(--text3)] font-mono">
                    {c._count.items} itens
                  </div>
                </div>
              </Link>
              <button
                onClick={() => handleDelete(c.id)}
                className="p-2 text-[var(--text3)] hover:text-[var(--accent)]"
                aria-label="Apagar"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
