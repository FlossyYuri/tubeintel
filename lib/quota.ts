export const QUOTA_LIMIT = 10000;

export function getQuotaCost(operation: string): number {
  switch (operation) {
    case "search.list":
      return 100;
    case "videos.list":
    case "channels.list":
      return 1;
    default:
      return 100;
  }
}
