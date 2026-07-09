import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "../..");

export interface Media {
  id: number;
  alt?: string | null;
  url?: string | null;
  thumbnailURL?: string | null;
  filename?: string | null;
  mimeType?: string | null;
  filesize?: number | null;
  width?: number | null;
  height?: number | null;
}

export interface PromptCategory {
  id: number;
  title: string;
  slug: string;
  parent?: PromptCategory | null;
  featured?: boolean;
  sort?: number;
}

export interface Prompt {
  id: number;
  model?: string;
  title: string;
  description: string;
  content: string;
  translatedContent?: string;
  promptVariants?: Array<{
    title?: string;
    content: string;
    sourceLink?: string;
    author?: {
      name: string;
      link?: string;
    };
    curatedBy?: string | null;
  }>;
  sourceLink?: string;
  sourcePublishedAt: string;
  sourceMedia: string[];
  video?: {
    url: string;
    thumbnail?: string;
  };
  media?: Media[];
  author: {
    name: string;
    link?: string;
  };
  language: string;
  featured?: boolean;
  sort?: number;
  needReferenceImages?: boolean;
  sourceMeta?: Record<string, unknown>;
  imageCategories?: {
    useCases?: Array<PromptCategory>;
    styles?: Array<PromptCategory>;
    subjects?: Array<PromptCategory>;
  };
}

export interface FilterCategory {
  id: number;
  title: string;
  slug: string;
  parentId?: number | null;
  parentSlug?: string | null;
  featured?: boolean;
  sort?: number | null;
}

export interface OfficialCaseCategory {
  id: string;
  emoji: string;
  title: string;
  desc: string;
  case_numbers: number[];
}

export interface OfficialCase {
  number: number;
  category: string;
  title: string;
  media: string[];
  prompt?: string | null;
  mediaLabels?: string[] | null;
}

export interface OfficialGallery {
  sourceRepo: string;
  sourceLicense: string;
  categories: OfficialCaseCategory[];
  cases: OfficialCase[];
}

type LocalizedText = string | Record<string, string>;

interface StoredCategory extends Omit<FilterCategory, "title"> {
  title: LocalizedText;
}

interface StoredPrompt extends Omit<Prompt, "title" | "description" | "content"> {
  title: LocalizedText;
  description: LocalizedText;
  content: LocalizedText;
}

function readJson<T>(relativePath: string): T {
  const fullPath = path.join(ROOT_DIR, relativePath);
  return JSON.parse(fs.readFileSync(fullPath, "utf-8")) as T;
}

function localize(value: LocalizedText, locale: string): string {
  if (typeof value === "string") {
    return value;
  }
  return value[locale] || value.en || Object.values(value)[0] || "";
}

function localizeCategory(category: StoredCategory, locale: string): FilterCategory {
  return {
    ...category,
    title: localize(category.title, locale),
  };
}

function localizePrompt(prompt: StoredPrompt, locale: string): Prompt {
  const localized: Prompt = {
    ...prompt,
    title: localize(prompt.title, locale),
    description: localize(prompt.description, locale),
    content: localize(prompt.content, prompt.language),
  };

  const translated = localize(prompt.content, locale);
  if (translated && translated !== localized.content) {
    localized.translatedContent = translated;
  }

  return processPromptImages(localized);
}

function processPromptImages(item: Prompt): Prompt {
  let images: string[] = [];
  if (item.media) {
    images = item.media.map((m) => m.url || "").filter(Boolean) as string[];
  } else {
    images = item.sourceMedia || [];
    if (item.video?.thumbnail) {
      images.push(item.video.thumbnail);
    }
  }
  return { ...item, sourceMedia: images };
}

export async function fetchPromptCategories(locale = "en"): Promise<{
  allCategories: FilterCategory[];
  featuredCategories: FilterCategory[];
}> {
  const categories = readJson<StoredCategory[]>("data/categories.json")
    .map((category) => localizeCategory(category, locale))
    .sort((a, b) => (a.sort || 0) - (b.sort || 0));

  const featuredCategories = categories.filter((category) => {
    const isParent = categories.some((item) => item.parentId === category.id);
    return category.featured && !isParent;
  });

  return {
    allCategories: categories,
    featuredCategories,
  };
}

export async function fetchOfficialGallery(): Promise<OfficialGallery> {
  return readJson<OfficialGallery>("data/official-cases.json");
}

export async function fetchAllPrompts(
  locale = "en",
  allCategories: FilterCategory[] = []
): Promise<{ docs: Prompt[]; total: number }> {
  const storedPrompts = readJson<StoredPrompt[]>("data/prompts.json");
  const prompts = storedPrompts
    .map((prompt) => localizePrompt(prompt, locale))
    .filter((prompt) => prompt.model === "seedream-5-pro")
    .filter((prompt) => prompt.sourceMedia?.length > 0);

  const featuredPrompts = prompts
    .filter((prompt) => prompt.featured)
    .sort(comparePrompts);
  const seenIds = new Set(featuredPrompts.map((prompt) => prompt.id));

  const useCaseCategories = allCategories.filter(
    (category) => category.parentSlug === "use-cases"
  );
  const categoryPrompts: Prompt[] = [];

  for (const category of useCaseCategories) {
    const matches = prompts
      .filter((prompt) =>
        prompt.imageCategories?.useCases?.some((item) => item.slug === category.slug)
      )
      .sort(comparePrompts);

    for (const prompt of matches) {
      if (!seenIds.has(prompt.id)) {
        seenIds.add(prompt.id);
        categoryPrompts.push({
          ...prompt,
          title: `${category.title} - ${prompt.title}`,
        });
      }
    }
  }

  const docs = [...featuredPrompts, ...categoryPrompts];
  return { docs, total: prompts.length };
}

export function sortPrompts(prompts: Prompt[], total?: number) {
  const featured = prompts.filter((prompt) => prompt.featured).sort(comparePrompts);
  const regular = prompts.filter((prompt) => !prompt.featured).sort(comparePrompts);

  return {
    all: prompts,
    featured,
    regular,
    stats: {
      total: total ?? prompts.length,
      featured: featured.length,
    },
  };
}

function comparePrompts(a: Prompt, b: Prompt): number {
  const sortDiff = (a.sort ?? Number.MAX_SAFE_INTEGER) - (b.sort ?? Number.MAX_SAFE_INTEGER);
  if (sortDiff !== 0) {
    return sortDiff;
  }
  return new Date(b.sourcePublishedAt).getTime() - new Date(a.sourcePublishedAt).getTime();
}
