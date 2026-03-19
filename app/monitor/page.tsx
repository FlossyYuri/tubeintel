"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { PageHeader, Spinner, EmptyState } from "@/components/ui";
import { ChannelMonitorCard } from "@/components/channel/ChannelMonitorCard";

interface Alert {
  id: string;
  type: string;
  value: string;
  active: boolean;
}

function MonitorPageContent() {
  const searchParams = useSearchParams();
  const highlightChannelId = searchParams.get("channelId");
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/alerts")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAlerts(
            data.filter(
              (a: Alert) => a.type === "channel" && a.active
            )
          );
        } else {
          setAlerts([]);
        }
      })
      .catch(() => setAlerts([]))
      .finally(() => setLoading(false));
  }, []);

  const channelIds = [...new Set(alerts.map((a) => a.value))];

  useEffect(() => {
    if (
      highlightChannelId &&
      channelIds.includes(highlightChannelId) &&
      cardRefs.current[highlightChannelId]
    ) {
      cardRefs.current[highlightChannelId]?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [channelIds, highlightChannelId]);

  return (
    <div>
      <PageHeader
        title="Channel Spy"
        description="Monitoriza os canais dos teus alertas: vídeos, estatísticas e receita dos últimos 28 dias"
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Spinner className="mb-4" />
          <p className="text-sm text-[var(--text3)] font-mono">
            A carregar canais monitorizados...
          </p>
        </div>
      ) : channelIds.length === 0 ? (
        <div className="flex flex-col items-center">
          <EmptyState
            icon="👁"
            title="Sem canais para monitorizar"
            description="Adiciona alertas de canal em Alertas para começar a espionar o desempenho deles."
          />
          <Link
            href="/alerts"
            className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[var(--accent)]/50 text-[var(--accent)] hover:bg-[var(--accent)]/10 transition-colors text-sm font-semibold"
          >
            Ir para Alertas
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {channelIds.map((channelId) => (
            <div
              key={channelId}
              ref={(el) => {
                cardRefs.current[channelId] = el;
              }}
              className={
                highlightChannelId === channelId
                  ? "ring-2 ring-[var(--accent)] rounded-2xl"
                  : ""
              }
            >
              <ChannelMonitorCard
                channelId={channelId}
                compact={false}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MonitorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center py-16">
          <Spinner className="mb-4" />
          <p className="text-sm text-[var(--text3)] font-mono">
            A carregar...
          </p>
        </div>
      }
    >
      <MonitorPageContent />
    </Suspense>
  );
}
