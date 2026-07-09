# Tickets: ImagineVid Seedream 5 Pro Prompt Repository

Build an ImagineVid-branded public prompt repository that mirrors the reference repository's structure, README generation flow, and prompt/category data contracts while using local normalized data instead of external CMS/gallery services. Source spec: `docs/REPLICATION_PLAN.md`.

Work the frontier: any ticket whose blockers are all done.

## Mirror Reference Skeleton And Contracts

**What to build:** Establish the same repository shape as the reference: package metadata, TypeScript config, GitHub issue/workflow files, docs, script entrypoints, image folders, multilingual README targets, and the same public prompt/category interfaces.

**Blocked by:** None — can start immediately.

- [ ] The repository has the reference-style root files, `.github`, `docs`, `public/images`, and `scripts/utils` layout.
- [ ] The prompt/category TypeScript interfaces match the reference shape closely enough that the markdown generator can consume the same fields.
- [ ] The repo documentation states that CMS/gallery integration is out of scope.

## Implement Local Data README Generation

**What to build:** Make `pnpm run generate` load local normalized data, sort it like the reference, and generate every multilingual README file with ImagineVid/Seedream 5 Pro copy.

**Blocked by:** Mirror Reference Skeleton And Contracts.

- [ ] The generator loops through the same supported language list as the reference.
- [ ] Local prompt and category data feed the same `fetchPromptCategories`, `fetchAllPrompts`, and `sortPrompts` contract.
- [ ] Generated README sections follow the reference order while containing no YouMind/Nano Banana branding.

## Implement GitHub Issue To Local Data Flow

**What to build:** Preserve the reference issue-submission workflow shape, but convert approved issues into local prompt data instead of CMS records.

**Blocked by:** Implement Local Data README Generation.

- [ ] The prompt submission template keeps reference-compatible field IDs.
- [ ] The sync script parses GitHub issue bodies into the reference `Prompt` shape.
- [ ] The workflow names and labels are adapted to local data updates without CMS secrets.

## Produce ImagineVid-Owned README Assets

**What to build:** Add first-pass ImagineVid-owned cover/hero assets that replace reference images and render in README files.

**Blocked by:** Implement Local Data README Generation.

- [ ] `public/images` contains English and Chinese Seedream 5 Pro cover assets.
- [ ] README files point to local or ImagineVid-owned assets only.
- [ ] A repo scan finds no YouMind asset URLs.

## Verify, Review, Commit, And Prepare Push

**What to build:** Validate the implementation end to end, review the diff, and commit a coherent initial repository implementation.

**Blocked by:** Implement GitHub Issue To Local Data Flow, Produce ImagineVid-Owned README Assets.

- [ ] Generation and typechecking commands pass or documented blockers are explicit.
- [ ] Brand hygiene checks pass for banned reference branding.
- [ ] The work is committed locally; remote push is left for explicit approval if not already requested.
