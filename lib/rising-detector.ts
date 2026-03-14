export function calcRisingScore(channel: {
  subscriberCount: number;
  viewCount: number;
  videoCount: number;
  publishedAt: string;
}): number {
  const ageMonths =
    (Date.now() - new Date(channel.publishedAt).getTime()) /
    (1000 * 60 * 60 * 24 * 30);

  const subsPerMonth = channel.subscriberCount / Math.max(ageMonths, 1);
  const subsScore = Math.min(Math.log10(subsPerMonth + 1) * 20, 40);

  const viewsPerVideo = channel.viewCount / Math.max(channel.videoCount, 1);
  const effScore = Math.min(Math.log10(viewsPerVideo + 1) * 12, 35);

  const youthBonus = ageMonths < 12 ? Math.min((12 - ageMonths) * 2, 25) : 0;

  return Math.min(Math.round(subsScore + effScore + youthBonus), 100);
}
