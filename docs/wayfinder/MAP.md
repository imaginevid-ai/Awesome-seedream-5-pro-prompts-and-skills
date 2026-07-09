# Wayfinder Map: ImagineVid Seedream 5 Pro Prompt Repository

## Destination

Produce a clear implementation route for an ImagineVid-branded `awesome-seedream-5-pro-prompts-and-skills` repository that mirrors the reference repository's structure and data contracts, but uses local collection/normalization scripts and GitHub pushes instead of CMS/gallery integration.

## Notes

- Reference repository: `YouMind-OpenLab/awesome-nano-banana-pro-prompts`.
- Target repository: `Nsmo-ai/-awesome-seedream-5-pro-prompts-and-skills`.
- Standing correction: do not plan external CMS or separate gallery integration.
- Preserve the reference data shape: `Prompt`, `PromptCategory`, `FilterCategory`, supported README locales, issue field IDs, and markdown section rhythm.
- Rewrite all content for ImagineVid and Seedream 5 Pro.
- Use local APIs/tools only for private collection; commit only normalized public data and generated repository files.

## Decisions so far

<!-- Closed tickets will be indexed here. -->

## Not yet specified

- Whether the first implementation should keep the filename `cms-client.ts` for structural parity or rename it to `data-client.ts` and adjust imports.
- Whether `Try it now` links should point to an ImagineVid Seedream page, original source links, or be omitted until a product URL exists.
- Whether approved issue sync should directly commit local data or open a PR for maintainer review.

## Out of scope

- External CMS integration.
- Building or integrating a separate web gallery.
- Committing API keys, cookies, proxies, or raw private scrape caches.
