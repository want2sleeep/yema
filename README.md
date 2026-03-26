# yema

MVP skeleton for an LLM-powered frontend online judge. The project targets frontend assignments with code submission, asynchronous evaluation, structured scoring reports, and clear extension points for Playwright and OpenAI-compatible providers.

## Quick start

This repository uses `pnpm` workspaces. The `packageManager` field in `package.json` pins the exact pnpm version, so the easiest way to get started is via [Corepack](https://nodejs.org/api/corepack.html), which ships with Node.js 16.9+:

```bash
corepack enable        # one-time setup – makes pnpm available
corepack prepare --activate  # activates the pinned version from package.json
```

Alternatively, install pnpm directly:

```bash
npm install -g pnpm
```

Then install dependencies and start the dev server:

```bash
pnpm install
pnpm dev
```

Additional common commands:

```bash
pnpm build
pnpm lint
pnpm --filter @yema/server prisma:generate
pnpm --filter @yema/server prisma:push
```

## Current structure

- `apps/web`: Next.js frontend with problem list, editor page and report page
- `apps/server`: NestJS API with problems, submissions and placeholder evaluation pipeline
- `packages/shared`: shared types and evaluation report schema

## Current runtime mode

- Problems, submissions and reports are stored in memory for MVP speed
- Submission evaluation runs asynchronously inside the server process
- Evaluation stages are already separated into:
  - `static-analysis`
  - `render-analysis`
  - `llm-analysis`
  - `score-aggregator`

## Planned upgrades

- Redis + BullMQ for real background job processing
- PostgreSQL for persistent storage
- Playwright for real render analysis and screenshots
- OpenAI-compatible API integration for structured LLM feedback
- Docker Judge Worker for stronger execution isolation

## Suggested next steps

1. Install dependencies and run the frontend/backend skeleton
2. Replace in-memory storage with PostgreSQL
3. Replace in-process async evaluation with Redis + BullMQ
4. Connect Playwright render checks
5. Connect LLM analysis with structured JSON output
