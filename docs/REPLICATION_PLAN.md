# ImagineVid Seedream 5 Pro Repository Replication Plan

## Correction

This repository should not connect to an external CMS, external API service, or separate web gallery. The reference repository uses those pieces internally, but for this project they are only evidence of the upstream data shape and README generation flow.

Our implementation should mirror the reference project's repository structure and data contracts, then fill those contracts from local data/API collection scripts and push the generated files to GitHub.

## Destination

Build `Nsmo-ai/-awesome-seedream-5-pro-prompts-and-skills` as an ImagineVid-branded clone of the reference repository architecture:

- Same file layout style.
- Same README section rhythm.
- Same prompt/category data shape.
- Same issue submission shape.
- Own README copy, own images, own links, own data.
- Local scripts fetch/normalize data, generate README files, and push the result.

## Reference Repository Structure

Reference: `YouMind-OpenLab/awesome-nano-banana-pro-prompts`

Observed files:

```text
.
├── .env.example
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug-report.yml
│   │   └── submit-prompt.yml
│   ├── labels.yml
│   └── workflows/
│       ├── auto-close-stale-issues.yml
│       ├── sync-approved-to-cms.yml
│       ├── sync-labels.yml
│       └── update-readme.yml
├── docs/
│   ├── CONTRIBUTING.md
│   ├── FAQ.md
│   └── LOCAL_DEVELOPMENT.md
├── public/
│   └── images/
│       ├── nano-banana-pro-prompts-cover-en.png
│       └── nano-banana-pro-prompts-cover-zh.png
├── scripts/
│   ├── generate-readme.ts
│   ├── sync-approved-to-cms.ts
│   └── utils/
│       ├── cms-client.ts
│       ├── i18n.ts
│       ├── image-uploader.ts
│       └── markdown-generator.ts
├── LICENSE
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── README.md
├── README_zh.md
├── README_zh-TW.md
├── README_ja-JP.md
├── README_ko-KR.md
├── README_th-TH.md
├── README_vi-VN.md
├── README_hi-IN.md
├── README_es-ES.md
├── README_es-419.md
├── README_de-DE.md
├── README_fr-FR.md
├── README_it-IT.md
├── README_pt-BR.md
├── README_pt-PT.md
└── README_tr-TR.md
```

Our repository should keep this same skeleton, renaming only product/brand-specific files:

```text
public/images/
├── seedream-5-pro-prompts-cover-en.png
└── seedream-5-pro-prompts-cover-zh.png
```

## Exact Reference Data Shape To Mirror

The reference renderer consumes this effective shape.

```ts
export interface Prompt {
  id: number;
  model?: string;
  title: string;
  description: string;
  content: string;
  translatedContent?: string;
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
  sourceMeta?: Record<string, any>;
  imageCategories?: {
    useCases?: Array<PromptCategory>;
    styles?: Array<PromptCategory>;
    subjects?: Array<PromptCategory>;
  };
}
```

```ts
export interface PromptCategory {
  id: number;
  title: string;
  slug: string;
  parent?: PromptCategory | null;
  featured?: boolean;
  sort?: number;
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
```

The reference grouping behavior:

- Featured prompts: `featured === true`.
- Regular prompts: `featured !== true`.
- Display cap: first 120 regular prompts in README.
- Category browsing: parent categories are `parentId === null`; children are linked by `parentId`.
- Use-case query ordering in the reference fetcher: featured first, then prompts from each use-case child category, deduplicated by `id`.
- Image extraction behavior: prefer `media[].url`; otherwise use `sourceMedia`; append `video.thumbnail` if present.
- Raycast badge: shown when the prompt content contains `{argument`.

## Our Data Source Contract

We keep the same public TypeScript interfaces, but replace the upstream CMS client with a local data provider.

Required provider interface:

```ts
export async function fetchPromptCategories(locale: string): Promise<{
  allCategories: FilterCategory[];
  featuredCategories: FilterCategory[];
}>;

export async function fetchAllPrompts(
  locale: string,
  allCategories: FilterCategory[]
): Promise<{
  docs: Prompt[];
  total: number;
}>;

export function sortPrompts(prompts: Prompt[], total?: number): {
  all: Prompt[];
  featured: Prompt[];
  regular: Prompt[];
  stats: {
    total: number;
    featured: number;
  };
};
```

Implementation detail:

- The file can still be named `scripts/utils/cms-client.ts` for pixel-level structural parity, but it should not call a CMS.
- Better internal name for our code is `data-client.ts`; if we keep `cms-client.ts`, it should be an adapter over local generated data.
- Local API/twitter collection scripts should emit normalized `Prompt[]` and `FilterCategory[]`.
- README generation should not care whether records came from X/Twitter, a local file, a local API, or manual curation.

## README Structure To Mirror

The reference README flow is:

1. Hero image.
2. Cross-promo image.
3. Promo callout.
4. H1.
5. Badges.
6. Subtitle.
7. Copyright notice.
8. Language badge navigation.
9. Visual CTA section with local cover image.
10. Feature comparison table.
11. Browse by category.
12. Table of contents.
13. What is model section.
14. Raycast integration section.
15. Statistics.
16. Featured prompts.
17. All prompts.
18. More prompts note if hidden count exists.
19. How to contribute.
20. License.
21. Acknowledgements.
22. Star history.
23. Footer links and autogenerated timestamp.

For our repo:

- Replace all YouMind/Nano Banana text with ImagineVid/Seedream 5 Pro text.
- Replace remote YouMind image URLs with generated local assets or ImagineVid-owned URLs.
- Do not promise a web gallery unless there is an actual ImagineVid URL ready.
- If no gallery exists, keep the same section position but frame it as "Browse the GitHub Collection" or "View the Curated Collection".
- Keep `Try it now` links only if they can point to an ImagineVid Seedream page; otherwise omit or replace with source links.

## Issue Submission Shape To Mirror

The reference `submit-prompt.yml` fields are:

- `title`
- `prompt`
- `description`
- `need_reference_images`
- `image_urls`
- `author_name`
- `author_link`
- `source_link`
- `language`
- `terms`

Our issue template should keep the same field IDs to preserve parser parity, changing only labels, descriptions, placeholders, and brand copy.

## Script Plan

### `scripts/generate-readme.ts`

Keep the same orchestration:

1. Loop through `SUPPORTED_LANGUAGES`.
2. Fetch categories for locale.
3. Fetch prompts for locale.
4. Sort prompts.
5. Generate markdown.
6. Write each README file.

### `scripts/utils/markdown-generator.ts`

Mirror the reference renderer with brand rewrites:

- Same `SUPPORTED_LANGUAGES`.
- Same `MAX_REGULAR_PROMPTS_TO_DISPLAY = 120`.
- Same prompt section structure.
- Same local cover image switching: `zh` and `zh-TW` use the Chinese cover; all others use English.
- Same language badge navigation.
- Same stats table shape.

### `scripts/utils/i18n.ts`

Mirror the reference translation key set, but rewrite every value.

### `scripts/utils/data-client.ts`

Replace external CMS calls with local normalized data loading.

Possible local sources:

- `data/prompts.json`
- `data/categories.json`
- generated files from local X/Twitter collection scripts
- a local API endpoint if we decide to run one during collection

### `scripts/sync-approved-to-data.ts`

Mirror `sync-approved-to-cms.ts`, but instead of creating/updating CMS records:

- parse the approved GitHub issue,
- normalize it into a `Prompt`,
- append/update local data,
- commit generated data and README changes if running in Actions.

## GitHub Actions Plan

Keep equivalent workflow names where useful, but remove CMS assumptions:

- `update-readme.yml`: run generation and commit `README*.md`.
- `sync-labels.yml`: sync labels from `.github/labels.yml`.
- `sync-approved-to-data.yml`: convert approved issue into local prompt data.
- `auto-close-stale-issues.yml`: optional, copied only if we want the same issue hygiene.

Do not add `CMS_HOST` or `CMS_API_KEY` secrets.

## Data Acquisition Plan

Local acquisition is separate from README rendering.

Workflow:

1. Use local APIs/tools to collect candidate tweets or manually curated examples.
2. Normalize candidates into the reference `Prompt` shape.
3. Store approved records in local data.
4. Run README generation.
5. Commit and push to the public GitHub repo.

Important boundary:

- Collection scripts may use local private configuration.
- Published repository data must contain only public prompt metadata, public image/source URLs, attribution, and generated README files.
- No API keys, cookies, proxies, or raw private scraping cache should be committed.

## Image Plan

Reference uses:

- remote hero image in README header,
- remote cross-promo image,
- local cover images under `public/images/`.

Our version:

- generate ImagineVid-owned hero/cross-promo/cover assets,
- store local cover images under `public/images/`,
- use owned remote URLs only if we intentionally host them,
- do not reuse reference images.

## Wayfinder Ticket Map

The route is tracked locally under `docs/wayfinder/` because no tracker-specific issue system has been configured for this new empty repo.

Start with these decisions:

1. Nail exact reference parity.
2. Decide local data provider shape.
3. Decide README section replacements where the reference points to a gallery.
4. Decide generated asset requirements.
5. Decide first push workflow.

## Out Of Scope

- External CMS integration.
- Building or integrating a separate web gallery.
- Adding production secrets.
- Auto-publishing raw X/Twitter data without review.
- Copying YouMind images, copy, links, or brand claims.
