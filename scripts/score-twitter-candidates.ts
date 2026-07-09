import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  candidateMediaUrls,
  findCandidateDuplicates,
  normalizePromptFingerprint,
  rememberCandidate,
  scoreTwitterCandidate,
  type CandidateDuplicateState,
  type QualityDecision,
  type TwitterCandidate,
} from "./utils/prompt-quality.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");

interface StoredPrompt {
  content?: string | Record<string, string>;
  sourceLink?: string;
  sourceMedia?: string[];
  sourceMeta?: {
    tweet_id?: string;
  };
}

interface BulkSearchResult {
  tweets?: TwitterCandidate[];
}

interface TwitterPayload {
  tweets?: TwitterCandidate[];
  results?: Record<string, BulkSearchResult>;
}

function normalizeUrl(value: string): string {
  return value.replace(/\?.*$/, "").replace(/\/$/, "");
}

function candidateId(candidate: TwitterCandidate): string {
  return String(candidate.id || "");
}

function storedPromptText(prompt: StoredPrompt): string[] {
  if (!prompt.content) return [];
  return typeof prompt.content === "string"
    ? [prompt.content]
    : Object.values(prompt.content);
}

function extractCandidates(payload: TwitterPayload | TwitterCandidate[]): TwitterCandidate[] {
  if (Array.isArray(payload)) return payload;
  if (payload.results) {
    return Object.values(payload.results).flatMap((result) => result.tweets || []);
  }
  return payload.tweets || [];
}

function main(): void {
  const inputPath = process.argv.slice(2).find((argument) => argument !== "--");
  if (!inputPath) {
    throw new Error(
      "Usage: pnpm run quality:twitter -- /path/to/twitterapi-search.json"
    );
  }

  const payload = JSON.parse(fs.readFileSync(inputPath, "utf8")) as
    | TwitterPayload
    | TwitterCandidate[];
  const existing = JSON.parse(
    fs.readFileSync(path.join(ROOT_DIR, "data/prompts.json"), "utf8")
  ) as StoredPrompt[];
  const duplicateState: CandidateDuplicateState = {
    tweetIds: new Set(
      existing.map((prompt) => String(prompt.sourceMeta?.tweet_id || "")).filter(Boolean)
    ),
    mediaUrls: new Set(
      existing.flatMap((prompt) => (prompt.sourceMedia || []).map(normalizeUrl))
    ),
    textFingerprints: new Set(
      existing
        .flatMap(storedPromptText)
        .map(normalizePromptFingerprint)
        .filter(Boolean)
    ),
  };

  const uniqueCandidates = [
    ...new Map(
      extractCandidates(payload)
        .filter((candidate) => candidateId(candidate))
        .map((candidate) => [candidateId(candidate), candidate])
    ).values(),
  ];

  const ranked = uniqueCandidates
    .map((candidate) => ({ candidate, result: scoreTwitterCandidate(candidate) }))
    .sort((left, right) => right.result.score - left.result.score);

  const scored = ranked.map(({ candidate, result }) => {
    let decision: QualityDecision = result.decision;
    const reasons = [...result.reasons];
    const duplicateReasons = findCandidateDuplicates(candidate, duplicateState);

    if (duplicateReasons.length > 0) {
      decision = "reject";
      reasons.push(...duplicateReasons);
    } else if (decision !== "reject") {
      rememberCandidate(candidate, duplicateState);
    }

    return {
      id: candidateId(candidate),
      author: candidate.author?.userName || null,
      score: result.score,
      decision,
      reasons,
      text: candidate.text || "",
      media: candidateMediaUrls(candidate),
    };
  });

  const counts = scored.reduce(
    (result, candidate) => {
      result[candidate.decision] += 1;
      return result;
    },
    { accept: 0, review: 0, reject: 0 }
  );

  console.log(
    JSON.stringify(
      {
        input: path.resolve(inputPath),
        total: scored.length,
        counts,
        candidates: scored,
      },
      null,
      2
    )
  );
}

try {
  main();
} catch (error) {
  console.error(error);
  process.exit(1);
}
