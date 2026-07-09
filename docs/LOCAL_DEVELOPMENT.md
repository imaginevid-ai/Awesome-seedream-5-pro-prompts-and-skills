# Local Development Guide

## Prerequisites

- Node.js 20+
- pnpm 9+

## Install

```bash
pnpm install
```

## Generate README Files

```bash
pnpm run generate
```

This reads local structured data from `data/`, renders every supported README locale, and writes `README*.md` in the repository root.

## Typecheck

```bash
pnpm run typecheck
```

## Test Issue Sync Locally

The issue sync script only needs GitHub variables when you want to parse a real issue.

```env
GITHUB_TOKEN=ghp_your_personal_access_token
GITHUB_REPOSITORY=Nsmo-ai/-awesome-seedream-5-pro-prompts-and-skills
ISSUE_NUMBER=1
ISSUE_BODY="### Prompt Title
Example prompt

### Prompt
Create a cinematic product poster...
"
```

Then run:

```bash
pnpm run sync
pnpm run generate
```

## Project Structure

```text
.
├── data/
│   ├── categories.json
│   └── prompts.json
├── scripts/
│   ├── generate-readme.ts
│   ├── sync-approved-to-data.ts
│   └── utils/
├── public/images/
└── README*.md
```

## Security

Do not commit API keys, cookies, proxy configuration, private scrape caches, or account credentials. Local collection tools can use private configuration, but the repository should only contain public prompt data and generated README output.
