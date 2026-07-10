import assert from "node:assert/strict";
import test from "node:test";
import type { Prompt, FilterCategory } from "./cms-client.js";
import {
  generateMarkdown,
  generateMediaTable,
  generateAnimationPreview,
  generateModelIntroduction,
  getPromptCtaLabel,
  getSeedreamProductUrl,
  groupPromptsByWorkflow,
  SUPPORTED_LANGUAGES,
} from "./markdown-generator.js";

test("renders official cases separately from community prompt cases", () => {
  const markdown = generateMarkdown(
    {
      all: [],
      featured: [],
      regular: [
        {
          id: 101,
          title: "Community test prompt",
          description: "A community sourced prompt.",
          content: "Create a clean product image.",
          sourcePublishedAt: "2026-07-08T00:00:00Z",
          sourceMedia: ["https://pbs.twimg.com/media/example.jpg"],
          author: { name: "@creator", link: "https://x.com/creator" },
          language: "en",
          imageCategories: {
            workflows: [
              {
                id: 61,
                title: "Directed Editing & Input Control",
                slug: "directed-editing-input-control",
              },
            ],
          },
        } as Prompt,
      ],
      stats: { total: 1, featured: 0 },
      categories: [
        {
          id: 61,
          title: "Directed Editing & Input Control",
          slug: "directed-editing-input-control",
          parentSlug: "workflow-groups",
          sort: 61,
        },
      ],
      officialCases: [
        {
          slug: "interaction-control",
          title: "Interaction Control",
          description: "Precise control cases.",
          cases: [
            {
              id: 1,
              title: "Box selection",
              media: [{ url: "public/official-cases/case-01.gif", height: 420 }],
              prompt: "Use the red box as the edit target.",
            },
          ],
        },
      ],
    },
    0,
    "en"
  );

  assert.match(markdown, /## Official Capability Cases/);
  assert.match(markdown, /#### Case 1: Box selection/);
  assert.match(markdown, /## Community Prompt Cases/);
  assert.ok(markdown.indexOf("Official Capability Cases") < markdown.indexOf("Community Prompt Cases"));
});

test("renders multiple prompt images in a single parallel table row", () => {
  const markdown = generateMediaTable(
    ["https://example.com/one.jpg", "https://example.com/two.jpg"],
    "Example prompt"
  );

  assert.match(markdown, /<table>/);
  assert.match(markdown, /<td width="50%"/);
  assert.equal((markdown.match(/<td /g) || []).length, 2);
  assert.ok(markdown.indexOf("one.jpg") < markdown.indexOf("two.jpg"));
});

test("wraps five images into two table rows without dropping media", () => {
  const images = Array.from({ length: 5 }, (_, index) =>
    `https://example.com/${index + 1}.jpg`
  );
  const markdown = generateMediaTable(images, "Five images");

  assert.equal((markdown.match(/<tr>/g) || []).length, 2);
  for (const image of images) assert.match(markdown, new RegExp(image));
});

test("renders a GitHub-compatible animated preview linked to its X source", () => {
  const markdown = generateAnimationPreview(
    "public/animations/example-motion.gif",
    "Example prompt",
    "https://video.twimg.com/example.mp4"
  );

  assert.doesNotMatch(markdown, /<video/);
  assert.match(markdown, /height="420"/);
  assert.match(markdown, /https:\/\/video\.twimg\.com\/example\.mp4/);
  assert.match(markdown, /public\/animations\/example-motion\.gif/);
});

test("model introduction is source-backed and distinguishes generation from editing", () => {
  const markdown = generateModelIntroduction("en");

  assert.match(markdown, /Dreamina's multimodal image workflow/);
  assert.match(markdown, /reference image/i);
  assert.match(markdown, /layer/i);
  assert.match(markdown, /Reasoning-Assisted Creation/);
  assert.match(markdown, /imaginevid\.io\/seedream-5-pro/);
  assert.match(markdown, /imaginevid\.io\/blog\/best-dreamina-alternatives/);
});

test("every README locale uses the verified model introduction", () => {
  for (const { code } of SUPPORTED_LANGUAGES) {
    const markdown = generateModelIntroduction(code);
    assert.doesNotMatch(markdown, /Multi-Image Fusion/i, code);
    assert.doesNotMatch(markdown, /high-end image generation model family/i, code);
    assert.ok(markdown.includes(getSeedreamProductUrl(code)), code);
    assert.match(markdown, /imaginevid\.io\/blog\/best-dreamina-alternatives/, code);
  }
});

test("maps README locales only to verified ImagineVid product locales", () => {
  assert.equal(getSeedreamProductUrl("en"), "https://imaginevid.io/seedream-5-pro");
  assert.equal(getSeedreamProductUrl("es-419"), "https://imaginevid.io/es/seedream-5-pro");
  assert.equal(getSeedreamProductUrl("pt-BR"), "https://imaginevid.io/pt/seedream-5-pro");
  assert.equal(getSeedreamProductUrl("zh-TW"), "https://imaginevid.io/zh/seedream-5-pro");
  assert.equal(getSeedreamProductUrl("hi-IN"), "https://imaginevid.io/seedream-5-pro");

  const supportedPrefixes = new Set([
    "ar", "de", "es", "fr", "it", "ja", "ko", "nl", "pl", "pt", "ru", "tr", "zh",
  ]);
  for (const { code } of SUPPORTED_LANGUAGES) {
    const pathname = new URL(getSeedreamProductUrl(code)).pathname;
    const prefix = pathname.split("/").filter(Boolean)[0];
    if (prefix !== "seedream-5-pro") assert.ok(supportedPrefixes.has(prefix), code);
  }
});

test("prompt CTA names ImagineVid explicitly", () => {
  assert.equal(getPromptCtaLabel("en"), "Use this prompt on ImagineVid");
  assert.match(getPromptCtaLabel("zh"), /ImagineVid/);
});

test("groups prompts by one primary workflow category in taxonomy order", () => {
  const categories = [
    { id: 61, title: "Editing & Input Control", slug: "editing-input-control", parentId: 4, parentSlug: "workflow-groups", sort: 61 },
    { id: 64, title: "Cinematic, Character & Style", slug: "cinematic-character-style", parentId: 4, parentSlug: "workflow-groups", sort: 64 },
  ] as FilterCategory[];
  const prompts = [
    { id: 2, imageCategories: { workflows: [categories[1]] } },
    { id: 1, imageCategories: { workflows: [categories[0]] } },
  ] as Prompt[];

  const groups = groupPromptsByWorkflow(prompts, categories);

  assert.deepEqual(groups.map((group) => group.category.slug), [
    "editing-input-control",
    "cinematic-character-style",
  ]);
  assert.deepEqual(groups.map((group) => group.prompts.map((prompt) => prompt.id)), [[1], [2]]);
});
