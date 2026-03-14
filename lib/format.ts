export function formatNumber(n: number): string {
  if (!n || n < 0) return "0";
  const num = Math.floor(n);
  if (num >= 1e9) return (num / 1e9).toFixed(1) + "B";
  if (num >= 1e6) return (num / 1e6).toFixed(1) + "M";
  if (num >= 1e3) return (num / 1e3).toFixed(1) + "K";
  return num.toString();
}

export function formatDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const diff = (now.getTime() - d.getTime()) / 1000;
  if (diff < 3600) return Math.floor(diff / 60) + "m atrás";
  if (diff < 86400) return Math.floor(diff / 3600) + "h atrás";
  if (diff < 2592000) return Math.floor(diff / 86400) + "d atrás";
  if (diff < 31536000) return Math.floor(diff / 2592000) + " meses atrás";
  return Math.floor(diff / 31536000) + " anos atrás";
}

export function parseDuration(iso: string): string {
  if (!iso) return "";
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return "";
  const h = parseInt(m[1] || "0", 10);
  const min = parseInt(m[2] || "0", 10);
  const s = parseInt(m[3] || "0", 10);
  if (h > 0) return `${h}:${String(min).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${min}:${String(s).padStart(2, "0")}`;
}

export function getDurationSeconds(iso: string): number {
  if (!iso) return 0;
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  return (
    parseInt(m[1] || "0", 10) * 3600 +
    parseInt(m[2] || "0", 10) * 60 +
    parseInt(m[3] || "0", 10)
  );
}

export function isShort(duration: string, title = ""): boolean {
  if (!duration) return false;
  const total = getDurationSeconds(duration);
  return total <= 60 || title.toLowerCase().includes("#short");
}

export function isLongForm(duration: string): boolean {
  return getDurationSeconds(duration) > 240;
}
