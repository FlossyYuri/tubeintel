"use client";

import { useState, useEffect } from "react";
import { Bell, Plus, Trash2 } from "lucide-react";

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

  const handleCreate = async () => {
    if (!value.trim()) return;
    try {
      await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, value: value.trim() }),
      });
      setValue("");
      fetchAlerts();
    } catch {
      // ignore
    }
  };

  return (
    <div>
      <h2 className="text-[22px] font-extrabold mb-1" style={{ fontFamily: "Syne, sans-serif" }}>
        Alertas e Monitoring
      </h2>
      <p className="text-[13px] text-[var(--text2)] mb-6">
        Configura alertas para keywords e canais
      </p>

      <div className="flex gap-2 mb-6 flex-wrap">
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] px-4 py-2 rounded-lg"
        >
          <option value="keyword">Keyword</option>
          <option value="channel">Canal</option>
        </select>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          placeholder={type === "keyword" ? "Palavra-chave..." : "ID do canal..."}
          className="bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] px-4 py-2 rounded-lg flex-1 min-w-[200px]"
        />
        <button
          onClick={handleCreate}
          disabled={!value.trim()}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-white font-bold rounded-lg hover:bg-[#ff5555] disabled:opacity-50"
        >
          <Plus className="size-4" /> Adicionar
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <div className="w-9 h-9 border-2 border-[var(--border)] border-t-[var(--accent)] rounded-full animate-spin mx-auto mb-4" />
        </div>
      ) : alerts.length === 0 ? (
        <div className="text-center py-20 text-[var(--text3)]">
          <div className="text-5xl mb-4 opacity-30">🔔</div>
          <p className="font-semibold text-base text-[var(--text2)]">Sem alertas</p>
          <p className="text-sm">Adiciona um alerta para começar</p>
        </div>
      ) : (
        <div className="space-y-2">
          {alerts.map((a) => (
            <div
              key={a.id}
              className="flex items-center justify-between p-4 bg-[var(--card)] border border-[var(--border)] rounded-xl"
            >
              <div className="flex items-center gap-3">
                <Bell className="size-5 text-[var(--accent)]" />
                <div>
                  <div className="font-semibold capitalize">{a.type}</div>
                  <div className="text-sm text-[var(--text3)]">{a.value}</div>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-1 rounded bg-[var(--green)]/20 text-[var(--green)]">
                Activo
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
