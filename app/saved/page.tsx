"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Folder, Plus, Trash2 } from "lucide-react";

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
      <h2 className="text-[22px] font-extrabold mb-1" style={{ fontFamily: "Syne, sans-serif" }}>
        Colecções Guardadas
      </h2>
      <p className="text-[13px] text-[var(--text2)] mb-6">
        Organiza os teus vídeos e canais em pastas
      </p>

      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          placeholder="Nova colecção..."
          className="bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] px-4 py-2 rounded-lg flex-1 max-w-xs"
        />
        <button
          onClick={handleCreate}
          disabled={creating || !newName.trim()}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-white font-bold rounded-lg hover:bg-[#ff5555] disabled:opacity-50"
        >
          <Plus className="size-4" /> Criar
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-[var(--text3)]">
          <div className="w-9 h-9 border-2 border-[var(--border)] border-t-[var(--accent)] rounded-full animate-spin mx-auto mb-4" />
        </div>
      ) : collections.length === 0 ? (
        <div className="text-center py-20 text-[var(--text3)]">
          <div className="text-5xl mb-4 opacity-30">📁</div>
          <p className="font-semibold text-base text-[var(--text2)]">Sem colecções</p>
          <p className="text-sm">Cria uma colecção para guardar vídeos</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between p-4 bg-[var(--card)] border border-[var(--border)] rounded-xl hover:border-[var(--border2)]"
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
