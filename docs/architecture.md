# Architecture Overview

## MVP pipeline

1. Student selects a problem and edits template files in Monaco.
2. `POST /submissions` creates a submission record and enqueues an evaluation job.
3. The local queue runner updates status from `queued` -> `running` -> `completed`.
4. The evaluation pipeline runs four stages:
   - `static-analysis`
   - `render-analysis`
   - `llm-analysis`
   - `score-aggregator`
5. The final structured report is available via `GET /submissions/:id/report`.

## Runtime notes

- Current implementation uses in-memory repositories and local runtime folders for demo speed.
- PostgreSQL, Redis/BullMQ, Playwright and external LLM providers are intentionally abstracted behind services so they can be swapped in without changing controllers or pages.

