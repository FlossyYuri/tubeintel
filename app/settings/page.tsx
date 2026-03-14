"use client";

import { useEffect, useState } from "react";
import { Key, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/ui";
import { input, buttonPrimary, card } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

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
      <PageHeader
        title="Configurações"
        description="Configura a tua YouTube Data API v3 Key para usar a plataforma"
      />

      <div className="max-w-xl">
        <div className={cn(card, "p-6")}>
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
              className={cn(input, "w-full font-mono")}
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
            className={cn(buttonPrimary, "mt-3 w-full py-2")}
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

        <div className={cn(card, "mt-6 p-4")}>
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
