"use client";

import { useState, useEffect } from "react";
import { Bell, Plus } from "lucide-react";
import { PageHeader, Spinner, EmptyState } from "@/components/ui";
import { input, buttonPrimary, card } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";
import { ChannelSearchInput, type ChannelOption } from "@/components/search/ChannelSearchInput";

interface Alert {
  id: string;
  type: string;
  value: string;
  threshold: number;
  active: boolean;
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState("keyword");
  const [value, setValue] = useState("");
  const [selectedChannel, setSelectedChannel] = useState<ChannelOption | null>(null);

  const fetchAlerts = () => {
    fetch("/api/alerts")
      .then((r) => r.json())
      .then(setAlerts)
      .catch(() => setAlerts([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  useEffect(() => {
    if (type !== "channel") setSelectedChannel(null);
  }, [type]);

  const handleCreate = async () => {
    const val = type === "channel" ? selectedChannel?.channelId : value.trim();
    if (!val) return;
    try {
      await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, value: val }),
      });
      setValue("");
      setSelectedChannel(null);
      fetchAlerts();
    } catch {
      // ignore
    }
  };

  const canCreate = type === "channel" ? !!selectedChannel : !!value.trim();

  return (
    <div>
      <PageHeader
        title="Alertas e Monitoring"
        description="Configura alertas para keywords e canais"
      />

      <div className="flex flex-col sm:flex-row gap-2 mb-6 flex-wrap items-stretch">
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className={cn(input, "cursor-pointer")}
        >
          <option value="keyword">Keyword</option>
          <option value="channel">Canal</option>
        </select>
        {type === "channel" ? (
          <div className="flex-1 min-w-[200px]">
            {selectedChannel ? (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-[var(--card)] border border-[var(--border)] h-full">
                <div className="size-8 rounded-full bg-[var(--bg3)] overflow-hidden shrink-0">
                  {selectedChannel.thumbnail && <img src={selectedChannel.thumbnail} alt="" className="w-full h-full object-cover" />}
                </div>
                <span className="font-semibold truncate flex-1">{selectedChannel.name}</span>
                <button
                  type="button"
                  onClick={() => setSelectedChannel(null)}
                  className="text-[var(--text3)] hover:text-[var(--accent)] text-xs"
                >
                  Trocar
                </button>
              </div>
            ) : (
              <ChannelSearchInput
                onSelect={(ch) => setSelectedChannel(ch)}
                placeholder="Pesquisa canal..."
              />
            )}
          </div>
        ) : (
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            placeholder="Palavra-chave..."
            className={cn(input, "flex-1 min-w-0")}
          />
        )}
        <button
          onClick={handleCreate}
          disabled={!canCreate}
          className={cn(buttonPrimary, "flex items-center gap-2 px-4 py-2")}
        >
          <Plus className="size-4" /> Adicionar
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Spinner className="mb-4" />
        </div>
      ) : alerts.length === 0 ? (
        <EmptyState
          icon="🔔"
          title="Sem alertas"
          description="Adiciona um alerta para começar"
        />
      ) : (
        <div className="space-y-2">
          {alerts.map((a) => (
            <div
              key={a.id}
              className={cn(card, "flex items-center justify-between p-4 gap-3")}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Bell className="size-5 text-[var(--accent)] shrink-0" />
                <div className="min-w-0">
                  <div className="font-semibold capitalize">{a.type}</div>
                  <div className="text-sm text-[var(--text3)] truncate">{a.value}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={cn(
                    "text-[10px] font-mono px-2 py-1 rounded",
                    a.active ? "bg-[var(--green)]/20 text-[var(--green)]" : "bg-[var(--text3)]/20 text-[var(--text3)]"
                  )}
                >
                  {a.active ? "Activo" : "Inactivo"}
                </span>
                {a.active ? (
                  <button
                    onClick={async () => {
                      try {
                        await fetch(`/api/alerts/${a.id}`, {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ active: false }),
                        });
                        fetchAlerts();
                      } catch {
                        // ignore
                      }
                    }}
                    className="text-[10px] font-mono px-2 py-1 rounded border border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
                  >
                    Desativar
                  </button>
                ) : (
                  <button
                    onClick={async () => {
                      try {
                        await fetch(`/api/alerts/${a.id}`, {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ active: true }),
                        });
                        fetchAlerts();
                      } catch {
                        // ignore
                      }
                    }}
                    className="text-[10px] font-mono px-2 py-1 rounded border border-[var(--border)] hover:border-[var(--green)] hover:text-[var(--green)] transition-colors"
                  >
                    Ativar
                  </button>
                )}
                <button
                  onClick={async () => {
                    if (!confirm("Remover este alerta?")) return;
                    try {
                      await fetch(`/api/alerts/${a.id}`, { method: "DELETE" });
                      fetchAlerts();
                    } catch {
                      // ignore
                    }
                  }}
                  className="text-[10px] font-mono px-2 py-1 rounded border border-[var(--accent)]/50 text-[var(--accent)] hover:bg-[var(--accent)]/10 transition-colors"
                >
                  Remover
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
