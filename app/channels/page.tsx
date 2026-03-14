"use client";

import { useRouter } from "next/navigation";
import { ChannelSearchInput, type ChannelOption } from "@/components/search/ChannelSearchInput";
import { PageHeader, EmptyState } from "@/components/ui";

export default function ChannelsPage() {
  const router = useRouter();

  const handleSelect = (channel: ChannelOption) => {
    router.push(`/channels/${channel.channelId}`);
  };

  return (
    <div>
      <PageHeader
        title="📺 Analisar Canal"
        description="Métricas detalhadas, vídeos recentes e análise de crescimento"
      />

      <div className="bg-gradient-to-br from-[var(--card)] to-[var(--card2)] border border-[var(--border)] rounded-2xl p-8 mb-7">
        <div className="flex gap-2.5 flex-wrap">
          <ChannelSearchInput
            onSelect={handleSelect}
            placeholder="Nome do canal, @handle ou URL..."
          />
        </div>
      </div>

      <EmptyState
        icon="🔍"
        title="Pesquisa um canal"
        description="Escreve o nome, @handle (ex: @MrBeast) ou URL do canal. Escolhe da lista para ver a análise."
      />
    </div>
  );
}
