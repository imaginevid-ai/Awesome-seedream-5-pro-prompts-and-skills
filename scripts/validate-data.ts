import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import {
  MIN_TWITTER_PROMPT_SCORE,
  scoreStoredTwitterPrompt,
} from "./utils/prompt-quality.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");
const PROMPTS_PATH = path.join(ROOT_DIR, "data/prompts.json");
const CATEGORIES_PATH = path.join(ROOT_DIR, "data/categories.json");
const OFFICIAL_CASES_PATH = path.join(ROOT_DIR, "data/official-cases.json");

type LocalizedText = string | Record<string, string>;

interface StoredPrompt {
  id: number;
  title: LocalizedText;
  content: LocalizedText;
  promptVariants?: Array<{
    content: string;
    sourceLink?: string;
  }>;
  sourceLink?: string;
  sourceMedia?: string[];
  animationPreview?: string;
  video?: {
    url?: string;
    thumbnail?: string;
  };
  sourceMeta?: {
    tweet_id?: string;
    source?: string;
    prompt_source?: string;
    model_evidence?: string;
    likeCount?: number;
    bookmarkCount?: number;
    viewCount?: number;
  };
  author?: {
    name?: string;
    link?: string;
  };
  imageCategories?: {
    workflows?: Array<{ id?: number; slug?: string }>;
    useCases?: Array<{ slug?: string }>;
  };
}

interface StoredCategory {
  id: number;
  slug: string;
  parentSlug?: string | null;
}

interface StoredOfficialCaseGroup {
  slug: string;
  title: string;
  cases: Array<{
    id: number;
    title: string;
    media: Array<{
      url: string;
      label?: string;
      height?: number;
    }>;
    prompt?: string;
  }>;
}

interface MediaAsset {
  promptId: number;
  index: number;
  url: string;
  file?: string;
  averageHash?: boolean[];
  differenceHash?: boolean[];
}

function localizedText(value: LocalizedText): string {
  if (typeof value === "string") return value;
  return value.en || Object.values(value)[0] || "";
}

function normalizeText(value: string): string {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, "")
    .replace(/[^\p{Letter}\p{Number}]+/gu, " ")
    .trim();
}

function normalizeUrl(value: string): string {
  return value
    .trim()
    .replace(/^https:\/\/twitter\.com\//i, "https://x.com/")
    .replace(/\?.*$/, "")
    .replace(/\/$/, "");
}

function tweetId(prompt: StoredPrompt): string {
  return String(
    prompt.sourceMeta?.tweet_id || prompt.sourceLink?.match(/\/status\/(\d+)/)?.[1] || ""
  );
}

function findDuplicates(
  prompts: StoredPrompt[],
  label: string,
  keyFor: (prompt: StoredPrompt) => string
): string[] {
  const values = new Map<string, number[]>();

  for (const prompt of prompts) {
    const key = keyFor(prompt);
    if (!key) continue;
    const ids = values.get(key) || [];
    ids.push(prompt.id);
    values.set(key, ids);
  }

  return [...values.entries()]
    .filter(([, ids]) => ids.length > 1)
    .map(([key, ids]) => `${label}: prompts ${ids.join(", ")} share ${JSON.stringify(key)}`);
}

function validateStructuralDuplicates(
  prompts: StoredPrompt[],
  categories: StoredCategory[],
  officialCaseGroups: StoredOfficialCaseGroup[]
): string[] {
  const errors = [
    ...findDuplicates(prompts, "ID", (prompt) => String(prompt.id)),
    ...findDuplicates(prompts, "Tweet", tweetId),
    ...findDuplicates(prompts, "Source", (prompt) =>
      prompt.sourceLink ? normalizeUrl(prompt.sourceLink) : ""
    ),
    ...findDuplicates(prompts, "Title", (prompt) =>
      normalizeText(localizedText(prompt.title))
    ),
    ...findDuplicates(prompts, "Prompt", (prompt) =>
      normalizeText(localizedText(prompt.content))
    ),
  ];
  const workflowById = new Map(
    categories
      .filter((category) => category.parentSlug === "workflow-groups")
      .map((category) => [category.id, category])
  );

  for (const prompt of prompts) {
    const workflows = prompt.imageCategories?.workflows || [];
    if (workflows.length !== 1) {
      errors.push(`Workflow: prompt ${prompt.id} must have exactly one primary workflow category`);
    } else if (!workflowById.has(workflows[0].id || 0)) {
      errors.push(`Workflow: prompt ${prompt.id} uses an unknown workflow category`);
    } else if (workflowById.get(workflows[0].id || 0)?.slug !== workflows[0].slug) {
      errors.push(`Workflow: prompt ${prompt.id} has a mismatched workflow id and slug`);
    }

    if (prompt.animationPreview) {
      const previewPath = path.join(ROOT_DIR, prompt.animationPreview);
      if (!prompt.animationPreview.startsWith("public/animations/")) {
        errors.push(`Animation: prompt ${prompt.id} must use a local public/animations asset`);
      } else if (!fs.existsSync(previewPath) || fs.statSync(previewPath).size === 0) {
        errors.push(`Animation: prompt ${prompt.id} preview is missing or empty`);
      }
    }
    if (prompt.video?.url && !/^https:\/\/video\.twimg\.com\//.test(prompt.video.url)) {
      errors.push(`Video: prompt ${prompt.id} must use a direct X video URL`);
    }
  }

  const mediaOwners = new Map<string, number[]>();
  for (const prompt of prompts) {
    for (const mediaUrl of prompt.sourceMedia || []) {
      const key = normalizeUrl(mediaUrl);
      const ids = mediaOwners.get(key) || [];
      ids.push(prompt.id);
      mediaOwners.set(key, ids);
    }
  }

  for (const [url, ids] of mediaOwners) {
    const uniqueIds = [...new Set(ids)];
    if (uniqueIds.length > 1) {
      errors.push(`Media URL: prompts ${uniqueIds.join(", ")} share ${JSON.stringify(url)}`);
    }
  }

  const officialCaseIds = new Set<number>();
  for (const group of officialCaseGroups) {
    if (!group.slug || !group.title || !group.cases.length) {
      errors.push(`Official cases: group ${group.slug || "(missing slug)"} is incomplete`);
    }

    for (const officialCase of group.cases) {
      if (officialCaseIds.has(officialCase.id)) {
        errors.push(`Official cases: duplicate case id ${officialCase.id}`);
      }
      officialCaseIds.add(officialCase.id);

      if (!officialCase.title || !officialCase.media.length) {
        errors.push(`Official cases: case ${officialCase.id} is missing title or media`);
      }

      for (const media of officialCase.media) {
        const mediaPath = path.join(ROOT_DIR, media.url);
        if (!media.url.startsWith("public/official-cases/")) {
          errors.push(`Official cases: case ${officialCase.id} must use public/official-cases media`);
        } else if (!fs.existsSync(mediaPath) || fs.statSync(mediaPath).size === 0) {
          errors.push(`Official cases: case ${officialCase.id} media is missing or empty`);
        }
      }
    }
  }

  if (officialCaseIds.size !== 25) {
    errors.push(`Official cases: expected 25 cases, found ${officialCaseIds.size}`);
  }

  const promptEntries = prompts.flatMap((prompt) => [
    {
      promptId: prompt.id,
      owner: `prompt ${prompt.id}`,
      content: normalizeText(localizedText(prompt.content)),
      source: prompt.sourceLink ? normalizeUrl(prompt.sourceLink) : "",
    },
    ...(prompt.promptVariants || []).map((variant, index) => ({
      promptId: prompt.id,
      owner: `prompt ${prompt.id} variant ${index + 1}`,
      content: normalizeText(variant.content),
      source: variant.sourceLink ? normalizeUrl(variant.sourceLink) : "",
    })),
  ]);

  for (const [label, key] of [
    ["Prompt entry", "content"],
    ["Prompt source", "source"],
  ] as const) {
    const ownersByValue = new Map<string, Array<{ promptId: number; owner: string }>>();
    for (const entry of promptEntries) {
      const value = entry[key];
      if (!value) continue;
      const owners = ownersByValue.get(value) || [];
      owners.push({ promptId: entry.promptId, owner: entry.owner });
      ownersByValue.set(value, owners);
    }
    for (const [value, owners] of ownersByValue) {
      if (owners.length <= 1) continue;
      if (key === "source" && new Set(owners.map((owner) => owner.promptId)).size === 1) {
        continue;
      }
      errors.push(
        `${label}: ${owners.map((owner) => owner.owner).join(", ")} share ${JSON.stringify(value)}`
      );
    }
  }

  for (const entry of promptEntries) {
    if (entry.source && !/^https:\/\/x\.com\/[^/]+\/status\/\d+$/.test(entry.source)) {
      errors.push(`${entry.owner} must link to a canonical X source, got ${entry.source}`);
    }
  }

  for (const prompt of prompts) {
    const isXSource = /^https:\/\/x\.com\/[^/]+\/status\/\d+/.test(prompt.sourceLink || "");
    if (!isXSource && prompt.sourceMeta?.source !== "twitterapi.io") continue;
    const quality = scoreStoredTwitterPrompt(prompt);
    if (quality.decision !== "accept" || quality.score < MIN_TWITTER_PROMPT_SCORE) {
      errors.push(
        `Quality: prompt ${prompt.id} scored ${quality.score}/${MIN_TWITTER_PROMPT_SCORE} (${quality.reasons.join("; ")})`
      );
    }
  }

  return errors;
}

async function downloadMedia(assets: MediaAsset[], tempDir: string): Promise<void> {
  let nextIndex = 0;

  async function worker(): Promise<void> {
    while (nextIndex < assets.length) {
      const assetIndex = nextIndex++;
      const asset = assets[assetIndex];
      const response = await fetch(asset.url);
      if (!response.ok) {
        throw new Error(`Failed to download ${asset.url}: HTTP ${response.status}`);
      }

      asset.file = path.join(tempDir, `${assetIndex}.media`);
      fs.writeFileSync(asset.file, Buffer.from(await response.arrayBuffer()));
    }
  }

  await Promise.all(Array.from({ length: Math.min(8, assets.length) }, () => worker()));
}

function grayscalePixels(file: string, width: number, height: number): Uint8Array {
  const result = spawnSync(
    "ffmpeg",
    [
      "-v",
      "error",
      "-i",
      file,
      "-vf",
      `scale=${width}:${height},format=gray`,
      "-f",
      "rawvideo",
      "-",
    ],
    { encoding: null, maxBuffer: 1024 * 1024 }
  );

  if (result.status !== 0) {
    throw new Error(`ffmpeg could not decode ${file}`);
  }

  return new Uint8Array(result.stdout);
}

function computeHashes(asset: MediaAsset): void {
  if (!asset.file) throw new Error(`Missing downloaded file for ${asset.url}`);

  const averagePixels = grayscalePixels(asset.file, 16, 16);
  const differencePixels = grayscalePixels(asset.file, 17, 16);
  const average = averagePixels.reduce((sum, value) => sum + value, 0) / averagePixels.length;

  asset.averageHash = Array.from(averagePixels, (value) => value >= average);
  asset.differenceHash = [];

  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      const offset = y * 17 + x;
      asset.differenceHash.push(differencePixels[offset] > differencePixels[offset + 1]);
    }
  }
}

function hammingDistance(left: boolean[], right: boolean[]): number {
  return left.reduce((distance, value, index) => distance + Number(value !== right[index]), 0);
}

async function findVisualDuplicates(prompts: StoredPrompt[]): Promise<string[]> {
  const ffmpeg = spawnSync("ffmpeg", ["-version"], { encoding: "utf8" });
  if (ffmpeg.status !== 0) {
    throw new Error("ffmpeg is required for --media duplicate detection");
  }

  const assets: MediaAsset[] = prompts.flatMap((prompt) =>
    (prompt.sourceMedia || []).map((url, index) => ({ promptId: prompt.id, index, url }))
  );
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "seedream-media-audit-"));

  try {
    await downloadMedia(assets, tempDir);
    assets.forEach(computeHashes);

    const errors: string[] = [];
    for (let leftIndex = 0; leftIndex < assets.length; leftIndex++) {
      for (let rightIndex = leftIndex + 1; rightIndex < assets.length; rightIndex++) {
        const left = assets[leftIndex];
        const right = assets[rightIndex];
        if (left.promptId === right.promptId) continue;

        const averageDistance = hammingDistance(left.averageHash!, right.averageHash!);
        const differenceDistance = hammingDistance(left.differenceHash!, right.differenceHash!);

        if (averageDistance <= 10 && differenceDistance <= 10) {
          errors.push(
            `Visual: prompt ${left.promptId} image ${left.index + 1} and prompt ${right.promptId} image ${right.index + 1} are near-identical (aHash ${averageDistance}, dHash ${differenceDistance})`
          );
        }
      }
    }

    return errors;
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

async function main(): Promise<void> {
  const prompts = JSON.parse(fs.readFileSync(PROMPTS_PATH, "utf8")) as StoredPrompt[];
  const categories = JSON.parse(
    fs.readFileSync(CATEGORIES_PATH, "utf8")
  ) as StoredCategory[];
  const officialCaseGroups = JSON.parse(
    fs.readFileSync(OFFICIAL_CASES_PATH, "utf8")
  ) as StoredOfficialCaseGroup[];
  const errors = validateStructuralDuplicates(prompts, categories, officialCaseGroups);

  if (process.argv.includes("--media")) {
    errors.push(...(await findVisualDuplicates(prompts)));
  }

  if (errors.length > 0) {
    console.error(`Duplicate audit failed with ${errors.length} issue(s):`);
    errors.forEach((error) => console.error(`- ${error}`));
    process.exit(1);
  }

  console.log(
    `Duplicate audit passed for ${prompts.length} prompts${
      process.argv.includes("--media") ? " and their remote media" : ""
    }.`
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
