/**
 * Extrai channel ID ou query de pesquisa a partir de input do utilizador.
 * Suporta: URL do canal, @handle, channel ID (UC...), ou nome do canal.
 */
export function parseChannelInput(input: string): {
  type: "channelId" | "query";
  value: string;
} {
  const trimmed = input.trim();
  if (!trimmed) return { type: "query", value: "" };

  // Channel ID directo (UC + 22 chars base64)
  const channelIdMatch = trimmed.match(/^UC[\w-]{22}$/i);
  if (channelIdMatch) return { type: "channelId", value: channelIdMatch[0] };

  // URL: youtube.com/channel/UCxxxx
  const channelUrlMatch = trimmed.match(
    /youtube\.com\/channel\/(UC[\w-]{22})/i
  );
  if (channelUrlMatch) return { type: "channelId", value: channelUrlMatch[1] };

  // URL: youtube.com/@handle
  const handleUrlMatch = trimmed.match(
    /(?:youtube\.com\/|youtu\.be\/)@([\w.-]+)/i
  );
  if (handleUrlMatch) return { type: "query", value: `@${handleUrlMatch[1]}` };

  // URL: youtube.com/c/xxx ou youtube.com/user/xxx - extrair para pesquisa
  const customUrlMatch = trimmed.match(
    /(?:youtube\.com\/(?:c|user)\/)([\w.-]+)/i
  );
  if (customUrlMatch) return { type: "query", value: customUrlMatch[1] };

  // URL genérica - tentar extrair algo
  try {
    const url = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
    if (url.hostname.includes("youtube.com") || url.hostname.includes("youtu.be")) {
      const path = url.pathname;
      const channelMatch = path.match(/\/channel\/(UC[\w-]{22})/i);
      if (channelMatch) return { type: "channelId", value: channelMatch[1] };
      const handleMatch = path.match(/\/@([\w.-]+)/);
      if (handleMatch) return { type: "query", value: `@${handleMatch[1]}` };
      const cMatch = path.match(/\/(?:c|user)\/([\w.-]+)/);
      if (cMatch) return { type: "query", value: cMatch[1] };
    }
  } catch {
    // Não é URL válida
  }

  // @handle solto
  if (trimmed.startsWith("@")) return { type: "query", value: trimmed };

  // Nome do canal ou texto genérico
  return { type: "query", value: trimmed };
}
