# GEMINI.md

This file provides foundational mandates and contextual guidance for interacting with the **yema** project.

## Project Overview

**yema** is an LLM-powered frontend online judge platform. It allows users to submit frontend code (HTML/JS/CSS), which is then evaluated through a multi-stage pipeline involving static analysis, rendering checks, and LLM-based qualitative feedback.

### Architecture

The project is a monorepo managed by `pnpm` workspaces:

- `apps/server`: NestJS (Fastify) backend.
- `apps/web`: Next.js frontend.
- `packages/shared`: Shared TypeScript types and schemas.
- `runtime/`: Local storage for submission files and evaluation reports.

### Key Technologies

- **Backend:** NestJS, Prisma (PostgreSQL), BullMQ (Redis) for async evaluation, Playwright for render analysis, Ollama for local LLM integration.
- **Frontend:** Next.js (App Router), React, Monaco Editor, Tailwind CSS v4, shadcn/ui.
- **Shared:** TypeScript.
- **Package Manager:** `pnpm`.

## Building and Running

### Prerequisites

- Node.js (v22+ recommended)
- pnpm (v10+)
- PostgreSQL (or set `DATABASE_URL` in `.env`)
- Redis (for BullMQ)
- Ollama (running locally with `qwen3.5:4b` or configured via `OLLAMA_MODEL`)

### Core Commands

- `pnpm install`: Install all dependencies.
- `pnpm dev`: Start both frontend and backend development servers concurrently.
- `pnpm build`: Build all workspace packages.
- `pnpm lint`: Run type-checking across the repository.
- `pnpm --filter @yema/server prisma:generate`: Generate the Prisma client.
- `pnpm --filter @yema/server prisma:push`: Push the schema to the database (use for dev).

## Evaluation Pipeline

The core logic resides in `apps/server/src/evaluation`. The pipeline consists of:

1.  **Static Analysis:** Parses HTML/JS/CSS to check for requirements and structure (using `parse5`).
2.  **Render Analysis:** Uses Playwright to load the submission, check for required selectors, text presence, and console errors.
3.  **LLM Analysis:** Sends the code and previous analysis results to an LLM (Ollama) to generate structured qualitative feedback.
4.  **Score Aggregator:** Combines all results into a final `EvaluationReport`.

## Development Conventions

- **Monorepo:** Use `pnpm --filter <package-name> <command>` for package-specific actions.
- **TypeScript:** Strict typing is preferred. Shared types should be defined in `packages/shared`.
- **ESM:** The backend uses ES Modules (`"type": "module"`).
- **Environment Variables:**
    - Root `.env` or `apps/server/.env` for `DATABASE_URL`, `REDIS_HOST`, `REDIS_PORT`, `OLLAMA_BASE_URL`, etc.
- **Prisma:** Always run `prisma:generate` after schema changes.
- **Styling:** The frontend uses Tailwind CSS v4 with shadcn/ui components. Use shadcn/ui component primitives and Tailwind utility classes for all new UI work. Avoid raw inline styles or legacy custom CSS unless absolutely necessary.
- **UI Design Patterns:**
    - **Problem List:** Prefer table layouts with Status, Title, and Difficulty columns.
    - **Workspace:** Prefer a split-pane layout with a 450px sidebar on the left and a code editor on the right.
    - **Status Colors:** Use semantic Tailwind tokens or shadcn/ui `Badge` variants rather than hard-coded color classes:
        - Easy: Green (e.g. `variant="success"` or `text-green-600`)
        - Medium: Orange (e.g. `variant="warning"` or `text-orange-500`)
        - Hard: Red (e.g. `variant="destructive"` or `text-red-600`)
    - **Report:** Use visual statistics (big score badges, progress bars) to represent evaluation dimensions.
