export function calcViralScore(
  views: number,
  likes: number,
  comments: number,
  publishedAt: string
): number {
  const v = views;
  const l = likes;
  const c = comments;
  const ageHours = (Date.now() - new Date(publishedAt).getTime()) / 3_600_000;

  // Engagement rate — peso: 40 pontos
  const engRate = ((l + c * 2) / Math.max(v, 1)) * 100;
  const engScore = Math.min(engRate * 2, 40);

  // Velocidade: views por hora — peso: 40 pontos
  const vph = v / Math.max(ageHours, 1);
  const speedScore = Math.min(Math.log10(vph + 1) * 15, 40);

  // Volume absoluto — peso: 20 pontos
  const volScore = Math.min(Math.log10(v + 1) * 5, 20);

  return Math.min(Math.round(engScore + speedScore + volScore), 100);
}

export function getViralScoreColor(score: number): string {
  if (score >= 80) return "var(--accent)";
  if (score >= 60) return "var(--yellow)";
  if (score >= 40) return "var(--green)";
  return "var(--blue)";
}

export function calcEngagementRate(views: number, likes: number, comments: number): number {
  if (!views || views <= 0) return 0;
  return ((likes + comments * 2) / views) * 100;
}

export function calcViewsPerHour(views: number, publishedAt: string): number {
  const ageHours = (Date.now() - new Date(publishedAt).getTime()) / 3_600_000;
  return views / Math.max(ageHours, 0.01);
}
