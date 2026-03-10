const educationalKeywords = [
  "lecture",
  "tutorial",
  "physics",
  "chemistry",
  "mathematics",
  "math",
  "biology",
  "jee",
  "neet",
  "class",
  "course",
  "education",
  "study",
  "revision",
  "problem solving",
  "exam strategy",
];

const distractingKeywords = [
  "prank",
  "roast",
  "reaction",
  "vlog",
  "gaming",
  "meme",
  "shorts",
  "troll",
  "funny",
  "challenge",
  "movie clip",
  "edit",
];

export function scoreYoutubeTitle(title: string) {
  const lower = title.toLowerCase();

  let score = 0;

  for (const keyword of educationalKeywords) {
    if (lower.includes(keyword)) score += 2;
  }

  for (const keyword of distractingKeywords) {
    if (lower.includes(keyword)) score -= 3;
  }

  return score;
}

export function isEducationalVideo(title: string) {
  return scoreYoutubeTitle(title) > 0;
}
