const EDUCATIONAL_CHANNEL_WHITELIST = new Set([
  "UCsooa4yRKGN_zEE8iknghZA",
  "UCsXVk37bltHxD1rDPwtNM8Q",
  "UC1yNl2E66ZzKApQdEzpqZgw",
  "UC4a-Gbdw7vOaccHmFo40b9g",
]);

const EDUCATIONAL_KEYWORDS = [
  "jee",
  "neet",
  "class 10",
  "class 11",
  "class 12",
  "math",
  "physics",
  "chemistry",
  "biology",
  "lecture",
  "tutorial",
  "study",
  "revision",
  "explained",
  "education",
  "problem solving",
  "mock test",
  "strategy",
  "notes",
  "cbse",
  "ncert",
  "iit",
];

const BLOCKED_KEYWORDS = [
  "prank",
  "roast",
  "meme",
  "shorts",
  "vlog",
  "reaction",
  "movie",
  "song",
  "music video",
  "trailer",
  "gaming montage",
  "funny",
  "comedy",
  "match highlights",
  "celebrity",
  "gossip",
];

export interface YouTubeVerificationResult {
  ok: boolean;
  isEducational: boolean;
  confidence: number;
  videoId?: string;
  title?: string;
  channelTitle?: string;
  reason: string;
}

function extractVideoId(input: string): string | null {
  try {
    if (!input) return null;

    if (/^[a-zA-Z0-9_-]{11}$/.test(input)) {
      return input;
    }

    const normalized = input.startsWith("http") ? input : `https://${input}`;
    const url = new URL(normalized);

    if (url.hostname === "youtu.be") {
      return url.pathname.slice(1) || null;
    }

    if (
      url.hostname.includes("youtube.com") ||
      url.hostname.includes("youtube-nocookie.com")
    ) {
      return url.searchParams.get("v");
    }

    return null;
  } catch {
    return null;
  }
}

function scoreText(text: string) {
  const lower = text.toLowerCase();
  let educationalHits = 0;
  let blockedHits = 0;

  for (const kw of EDUCATIONAL_KEYWORDS) {
    if (lower.includes(kw)) educationalHits++;
  }

  for (const kw of BLOCKED_KEYWORDS) {
    if (lower.includes(kw)) blockedHits++;
  }

  return { educationalHits, blockedHits };
}

export async function verifyYouTubeVideo(
  urlOrId: string,
): Promise<YouTubeVerificationResult> {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    return {
      ok: false,
      isEducational: false,
      confidence: 0,
      reason: "Missing YOUTUBE_API_KEY on server",
    };
  }

  const videoId = extractVideoId(urlOrId);
  if (!videoId) {
    return {
      ok: false,
      isEducational: false,
      confidence: 0,
      reason: "Invalid YouTube URL or video ID",
    };
  }

  const endpoint = new URL("https://www.googleapis.com/youtube/v3/videos");
  endpoint.searchParams.set("part", "snippet");
  endpoint.searchParams.set("id", videoId);
  endpoint.searchParams.set("key", apiKey);

  const response = await fetch(endpoint.toString());
  if (!response.ok) {
    return {
      ok: false,
      isEducational: false,
      confidence: 0,
      reason: "Failed to verify YouTube video",
      videoId,
    };
  }

  const data = await response.json();
  const item = data?.items?.[0];

  if (!item?.snippet) {
    return {
      ok: false,
      isEducational: false,
      confidence: 0,
      reason: "Video not found",
      videoId,
    };
  }

  const snippet = item.snippet;
  const title = snippet.title ?? "";
  const description = snippet.description ?? "";
  const channelId = snippet.channelId ?? "";
  const channelTitle = snippet.channelTitle ?? "";
  const tags = Array.isArray(snippet.tags) ? snippet.tags.join(" ") : "";

  const combinedText = `${title} ${description} ${tags}`;
  const { educationalHits, blockedHits } = scoreText(combinedText);

  let confidence = 0;

  if (EDUCATIONAL_CHANNEL_WHITELIST.has(channelId)) {
    confidence += 60;
  }

  confidence += educationalHits * 12;
  confidence -= blockedHits * 18;

  const isEducational = confidence >= 25;

  return {
    ok: true,
    isEducational,
    confidence,
    videoId,
    title,
    channelTitle,
    reason: isEducational
      ? "Educational content allowed"
      : "This video does not appear educational enough for focus mode",
  };
}
