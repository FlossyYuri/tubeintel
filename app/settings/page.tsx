"use client";

import { useEffect, useState } from "react";
import { Key, CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState("");
  const [status, setStatus] = useState<"idle" | "connected" | "error" | "loading">("idle");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((r) => {
        if (r.apiKey) {
          setApiKey(r.apiKey);
          setStatus("connected");
        }
      })
      .catch(() => setStatus("error"));
  }, []);

  const handleSave = async () => {
    if (!apiKey.trim()) {
      setMessage("Insere uma API Key válida");
      setStatus("error");
      return;
    }

    setSaving(true);
    setMessage("");
    setStatus("loading");

    try {
      const validateRes = await fetch("/api/settings/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: apiKey.trim() }),
      });
      const { valid } = await validateRes.json();

      if (!valid) {
        setStatus("error");
        setMessage("API Key inválida. Verifica se está correcta e activa.");
        setSaving(false);
        return;
      }

      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: apiKey.trim() }),
      });

      if (!res.ok) throw new Error("Failed to save");

      setStatus("connected");
      setMessage("API Key guardada com sucesso!");
      setTimeout(() => setMessage(""), 4000);
    } catch {
      setStatus("error");
      setMessage("Erro ao guardar. Tenta novamente.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h2 className="text-[22px] font-extrabold mb-1" style={{ fontFamily: "Syne, sans-serif" }}>
        Configurações
      </h2>
      <p className="text-[13px] text-[var(--text2)] mb-6">
        Configura a tua YouTube Data API v3 Key para usar a plataforma
      </p>

      <div className="max-w-xl">
        <div
          className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6"
        >
          <label
            className="block text-[9px] uppercase tracking-[0.2em] text-[var(--text3)] mb-2"
            style={{ fontFamily: "Space Mono, monospace" }}
          >
            YouTube API Key
          </label>
          <div className="relative">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setStatus("idle");
              }}
              placeholder="AIza..."
              className="w-full bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] px-3 py-2 text-sm rounded-md font-mono outline-none focus:border-[var(--accent)] transition-colors"
              style={{ fontFamily: "Space Mono, monospace" }}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
              {status === "loading" && <Loader2 className="size-4 animate-spin text-[var(--text3)]" />}
              {status === "connected" && <CheckCircle className="size-4 text-[var(--green)]" />}
              {status === "error" && <XCircle className="size-4 text-[var(--accent)]" />}
              {status === "idle" && (
                <div className="size-2 rounded-full bg-[var(--text3)]" />
              )}
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="mt-3 w-full py-2 bg-[var(--accent)] text-white text-sm font-bold rounded-md hover:bg-[#ff5555] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontFamily: "Syne, sans-serif" }}
          >
            {saving ? "A validar..." : "Guardar Key"}
          </button>

          {message && (
            <p
              className={`mt-3 text-sm ${
                status === "connected" ? "text-[var(--green)]" : "text-[var(--accent)]"
              }`}
            >
              {message}
            </p>
          )}
        </div>

        <div className="mt-6 p-4 rounded-lg bg-[var(--card)] border border-[var(--border)]">
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <Key className="size-4" />
            Como obter a API Key
          </h3>
          <ol className="text-[13px] text-[var(--text2)] space-y-2 list-decimal list-inside">
            <li>Acede ao <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-[var(--blue2)] hover:underline">Google Cloud Console</a></li>
            <li>Cria um novo projecto ou selecciona um existente</li>
            <li>Activa a API &quot;YouTube Data API v3&quot;</li>
            <li>Vai a Credenciais → Criar credenciais → Chave de API</li>
            <li>Copia a chave e cola aqui</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
