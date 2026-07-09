export const MIN_TWITTER_PROMPT_SCORE = 55;
export const TWITTER_CANDIDATE_ACCEPT_SCORE = 65;
export const TWITTER_CANDIDATE_REVIEW_SCORE = 50;

export type QualityDecision = "accept" | "review" | "reject";

export interface QualityResult {
  score: number;
  decision: QualityDecision;
  reasons: string[];
}

interface SourceMeta {
  prompt_source?: string;
  model_evidence?: string;
  likeCount?: number;
  bookmarkCount?: number;
  viewCount?: number;
}

export interface StoredTwitterPrompt {
  content: string | Record<string, string>;
  sourceLink?: string;
  sourceMedia?: string[];
  author?: {
    name?: string;
    link?: string;
  };
  sourceMeta?: SourceMeta;
  imageCategories?: {
    useCases?: Array<{ slug?: string }>;
  };
}

export interface TwitterCandidate {
  id?: string;
  text?: string;
  retweeted_tweet?: unknown;
  quoted_tweet?: {
    text?: string;
  };
  author?: {
    userName?: string;
  };
  extendedEntities?: {
    media?: Array<{
      media_url_https?: string;
      url?: string;
    }>;
  };
  likeCount?: number;
  bookmarkCount?: number;
  viewCount?: number;
}

export interface CandidateDuplicateState {
  tweetIds: Set<string>;
  mediaUrls: Set<string>;
  textFingerprints: Set<string>;
}

function textValue(value: string | Record<string, string>): string {
  if (typeof value === "string") return value;
  return value.en || Object.values(value)[0] || "";
}

function engagementScore(
  likeCount = 0,
  bookmarkCount = 0,
  viewCount = 0
): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  if (likeCount >= 100) score += 10;
  else if (likeCount >= 25) score += 8;
  else if (likeCount >= 5) score += 5;
  else if (likeCount >= 1) score += 2;

  if (bookmarkCount >= 10) score += 5;
  else if (bookmarkCount >= 3) score += 3;
  else if (bookmarkCount >= 1) score += 1;

  if (viewCount >= 1000) score += 3;
  else if (viewCount >= 100) score += 1;

  if (score > 0) reasons.push(`engagement evidence +${score}`);
  return { score, reasons };
}

function decisionFor(score: number, acceptScore: number, reviewScore: number): QualityDecision {
  if (score >= acceptScore) return "accept";
  if (score >= reviewScore) return "review";
  return "reject";
}

export function normalizePromptFingerprint(value: string): string {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, "")
    .replace(/[^\p{Letter}\p{Number}]+/gu, " ")
    .trim();
}

export function candidateMediaUrls(candidate: TwitterCandidate): string[] {
  return (candidate.extendedEntities?.media || [])
    .map((media) => media.media_url_https || media.url || "")
    .filter(Boolean)
    .map((url) => url.replace(/\?.*$/, "").replace(/\/$/, ""));
}

export function findCandidateDuplicates(
  candidate: TwitterCandidate,
  state: CandidateDuplicateState
): string[] {
  const reasons: string[] = [];
  const id = String(candidate.id || "");
  const fingerprint = normalizePromptFingerprint(candidate.text || "");

  if (id && state.tweetIds.has(id)) reasons.push("tweet already exists");
  if (fingerprint && state.textFingerprints.has(fingerprint)) {
    reasons.push("normalized prompt text already exists");
  }
  if (candidateMediaUrls(candidate).some((url) => state.mediaUrls.has(url))) {
    reasons.push("media URL already exists");
  }

  return reasons;
}

export function rememberCandidate(
  candidate: TwitterCandidate,
  state: CandidateDuplicateState
): void {
  const id = String(candidate.id || "");
  const fingerprint = normalizePromptFingerprint(candidate.text || "");
  if (id) state.tweetIds.add(id);
  if (fingerprint) state.textFingerprints.add(fingerprint);
  candidateMediaUrls(candidate).forEach((url) => state.mediaUrls.add(url));
}

export function scoreStoredTwitterPrompt(prompt: StoredTwitterPrompt): QualityResult {
  const content = textValue(prompt.content).trim();
  const promptSource = prompt.sourceMeta?.prompt_source || "";
  const reasons: string[] = [];
  let score = 0;
  const hardFailures: string[] = [];
  const hasPromptProvenance =
    /(?:tweet_text|reply_text|thread_reply|quoted_tweet|alt_text)_prompt|rewritten|normalized/.test(
      promptSource
    );

  if (!hasPromptProvenance) {
    hardFailures.push("missing honest prompt provenance");
  }
  if (prompt.sourceMeta?.model_evidence !== "seedream-5-pro") {
    hardFailures.push("missing verified Seedream 5 Pro model evidence");
  }
  if (!/^https:\/\/x\.com\/[^/]+\/status\/\d+/.test(prompt.sourceLink || "")) {
    hardFailures.push("missing canonical X source");
  }
  if (!prompt.sourceMedia?.length) hardFailures.push("missing visual evidence");
  if (!prompt.author?.name || !prompt.author?.link) {
    hardFailures.push("missing original author attribution");
  }
  if (!prompt.imageCategories?.useCases?.length) hardFailures.push("missing useful category");
  if (content.length < 10) hardFailures.push("prompt is too short to be reusable");

  if (
    /(?:tweet_text|reply_text|thread_reply|quoted_tweet|alt_text)_prompt/.test(
      promptSource
    )
  ) {
    score += 25;
    reasons.push("direct public prompt provenance +25");
  } else if (/(rewritten|normalized)/.test(promptSource)) {
    score += 15;
    reasons.push("source-backed normalized prompt +15");
  } else {
    reasons.push("unclear prompt provenance +0");
  }

  if (content.length >= 600) score += 25;
  else if (content.length >= 200) score += 22;
  else if (content.length >= 80) score += 18;
  else if (content.length >= 30) score += 12;
  else score += 3;

  const mediaCount = prompt.sourceMedia?.length || 0;
  if (mediaCount > 0) {
    const mediaScore = 15 + Math.min(5, (mediaCount - 1) * 2);
    score += mediaScore;
    reasons.push(`visual evidence +${mediaScore}`);
  } else {
    score -= 35;
    reasons.push("missing visual evidence -35");
  }

  if (/^https:\/\/x\.com\/[^/]+\/status\/\d+/.test(prompt.sourceLink || "")) {
    score += 8;
  } else {
    score -= 20;
    reasons.push("missing canonical X source -20");
  }

  if (prompt.author?.name && prompt.author?.link) score += 5;
  if (prompt.imageCategories?.useCases?.length) score += 5;

  const engagement = engagementScore(
    prompt.sourceMeta?.likeCount,
    prompt.sourceMeta?.bookmarkCount,
    prompt.sourceMeta?.viewCount
  );
  score += engagement.score;
  reasons.push(...engagement.reasons);

  if (content.length < 10) {
    score -= 20;
    reasons.push("prompt is too short to be reusable -20");
  }

  reasons.push(...hardFailures.map((failure) => `hard gate: ${failure}`));

  return {
    score,
    decision:
      hardFailures.length > 0
        ? "reject"
        : decisionFor(score, MIN_TWITTER_PROMPT_SCORE, MIN_TWITTER_PROMPT_SCORE - 10),
    reasons,
  };
}

export function scoreTwitterCandidate(candidate: TwitterCandidate): QualityResult {
  const text = (candidate.text || "").trim();
  const reasons: string[] = [];
  let score = 0;

  const hasPromptSignal =
    /(?:^|\n)\s*(?:prompt|提示词|提示詞|プロンプト)\s*(?:[:：👇]|below|in replies)/im.test(
      text
    ) || /(?:^|\n)\s*(?:生成一张|生成一張|作成して)/m.test(text);
  const relevanceText = `${text}\n${candidate.quoted_tweet?.text || ""}`;
  const hasSeedreamEvidence = /\bseedream\s*5(?:\.0)?(?:\s*pro)?\b/i.test(relevanceText);
  if (hasPromptSignal) {
    score += 30;
    reasons.push("reusable prompt signal +30");
  }

  if (text.length >= 120) score += 20;
  else if (text.length >= 50) score += 12;
  else if (text.length >= 20) score += 5;

  const mediaCount = candidateMediaUrls(candidate).length;
  if (mediaCount > 0) {
    score += 20;
    reasons.push("visual result attached +20");
  } else {
    score -= 30;
    reasons.push("no visual result -30");
  }

  if (candidate.author?.userName) score += 5;

  const engagement = engagementScore(
    candidate.likeCount,
    candidate.bookmarkCount,
    candidate.viewCount
  );
  score += engagement.score;
  reasons.push(...engagement.reasons);

  if (candidate.retweeted_tweet) {
    score -= 30;
    reasons.push("retweet instead of original source -30");
  }

  const promotional = /now available|try it today|launch(?:ed)?|available on|sign up|get started/i.test(
    text
  );
  if (promotional && !hasPromptSignal) {
    score -= 25;
    reasons.push("promotional announcement without a prompt -25");
  }

  if (!hasPromptSignal && text.length < 50) {
    score -= 20;
    reasons.push("generic short model mention -20");
  }

  let decision = decisionFor(
    score,
    TWITTER_CANDIDATE_ACCEPT_SCORE,
    TWITTER_CANDIDATE_REVIEW_SCORE
  );

  if (!hasSeedreamEvidence) {
    reasons.push("missing explicit Seedream 5 Pro evidence; manual review required");
    if (decision === "accept") decision = "review";
  }
  if (!hasPromptSignal) {
    reasons.push("missing explicit reusable prompt; manual source review required");
    if (decision === "accept") decision = "review";
  }
  if (!candidate.author?.userName && decision === "accept") decision = "review";
  if (candidate.retweeted_tweet || mediaCount === 0) decision = "reject";

  return {
    score,
    decision,
    reasons,
  };
}
