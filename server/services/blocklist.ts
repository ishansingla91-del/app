export const blockedSites = [
  "instagram.com",
  "facebook.com",
  "twitter.com",
  "x.com",
  "reddit.com",
  "tiktok.com",
  "netflix.com",
  "twitch.tv",
  "9gag.com",
  "pinterest.com",
];

export function isBlockedDomain(hostname: string) {
  const normalized = hostname.toLowerCase();

  return blockedSites.some((domain) => {
    return normalized === domain || normalized.endsWith(`.${domain}`);
  });
}
