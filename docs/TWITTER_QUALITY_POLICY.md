# Twitter Prompt Quality Policy

This repository treats X/Twitter search as candidate discovery, not automatic publication. A matching keyword alone is never enough to enter `data/prompts.json`.

## Hard Gates

Every accepted Twitter prompt must have:

1. A canonical original X post or prompt reply, not a retweet or scraped repost.
2. A reusable prompt, edit instruction, or clearly documented prompt variant.
3. At least one visual result tied to the source post.
4. Original author attribution and a working source link.
5. A useful category and an honest prompt-provenance label.
6. No duplicate tweet, source URL, prompt text, media URL, or perceptually duplicate image.
7. No pure product announcement, engagement bait, unrelated media, or fabricated prompt reconstructed from an image alone.
8. Explicit Seedream 5 Pro evidence in the post or quoted source. Prompt-only replies without model context stay in manual review.

Engagement is a supporting signal, not a substitute for prompt quality. A new creator with a strong, complete prompt can outrank a popular promotional post.

## Candidate Scoring

Run the scorer on a raw `advanced_search` or `bulk_advanced_search` response:

```bash
pnpm run quality:twitter -- /path/to/twitter-search.json
```

The scorer assigns one of three decisions:

- `accept` (`65+`): strong candidate with explicit prompt evidence, media, attribution, and enough context.
- `review` (`50-64`): potentially useful, but the prompt may be in ALT text, a reply, a quote, or require source verification.
- `reject` (`below 50`): generic model mention, promotion, retweet, missing media, or insufficient reusable content.

The scorer checks existing repository data and the current search batch. Duplicate tweet IDs, normalized prompt text, and exact media URLs are rejected automatically. Before merging accepted candidates, run the remote media audit to catch re-uploaded or recompressed duplicates:

```bash
pnpm run audit:duplicates
```

## Publication Workflow

1. Search focused Seedream 5 Pro queries with twitterapi.io.
2. Rank the raw response with `quality:twitter`.
3. Inspect accepted and review candidates against the original post, replies, quotes, and ALT text.
4. Preserve the original prompt where available; label rewritten material honestly.
5. Add source metadata, author, categories, and visual evidence.
6. Run `pnpm run validate`, `pnpm run audit:duplicates`, `pnpm test`, and `pnpm run typecheck`.
7. Regenerate every README locale with `pnpm run generate`.

## Curated External Sources

Prompt collections imported from another repository must have a compatible license and explicit attribution. Evolink-AI material in this repository is attributed to its CC BY 4.0 source, while each community prompt continues to credit the original X author. The acknowledgement also identifies our modifications: prompt completion from original posts, rewritten descriptions, duplicate merging, prompt variants, and adapted table presentation.
