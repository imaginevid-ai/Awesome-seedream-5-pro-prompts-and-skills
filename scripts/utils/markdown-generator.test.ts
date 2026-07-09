import assert from "node:assert/strict";
import test from "node:test";
import type { Prompt, FilterCategory } from "./cms-client.js";
import {
  generateMediaTable,
  generateModelIntroduction,
  groupPromptsByWorkflow,
  SUPPORTED_LANGUAGES,
} from "./markdown-generator.js";

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

test("model introduction is source-backed and distinguishes generation from editing", () => {
  const markdown = generateModelIntroduction("en");

  assert.match(markdown, /Dreamina's multimodal image workflow/);
  assert.match(markdown, /reference image/i);
  assert.match(markdown, /layer/i);
  assert.match(markdown, /Reasoning-Assisted Creation/);
  assert.match(markdown, /dreamina\.capcut\.com\/seedream\/seedream-5-0-pro/);
  assert.match(markdown, /how-to-use-seedream-5-0-pro/);
});

test("every README locale uses the verified model introduction", () => {
  for (const { code } of SUPPORTED_LANGUAGES) {
    const markdown = generateModelIntroduction(code);
    assert.doesNotMatch(markdown, /Multi-Image Fusion/i, code);
    assert.doesNotMatch(markdown, /high-end image generation model family/i, code);
    assert.match(markdown, /seedream-5-0-pro/, code);
    assert.match(markdown, /how-to-use-seedream-5-0-pro/, code);
  }
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
