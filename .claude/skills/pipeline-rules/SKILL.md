---
name: pipeline-rules
description: Frontend (Next.js/TypeScript) lint, format, test, and build checks that mirror what CI enforces on this repo — ESLint, Prettier, Vitest, and a Next build. Use whenever files under web/ are added, edited, or reviewed, before considering the work done.
metadata:
  type: workflow
when_to_use: "finishing a frontend change, editing a file under web/, before saying a frontend task is done, reviewing a TS/TSX diff, formatting check, eslint, prettier, vitest, next build"
---

# Frontend pipeline rules

Before treating any task that touches files under `web/` as finished, run the same checks CI would run — in this order, from the `web/` directory:

1. **Format** — `pnpm format`
   Auto-fixes via Prettier. Use `pnpm format:check` instead if you only want to verify without rewriting files.

2. **Lint** — `pnpm lint`
   Runs ESLint. Fix everything it reports rather than leaving it for CI to catch.

3. **Test** — `pnpm test`
   Runs the Vitest suite. Scope it to the affected files when the full run is slow and the change is narrow.

4. **Build** — `pnpm build`
   Run this when the change is nontrivial or touches shared types/config — the Next build's type-checking catches errors that lint and unit tests don't.

Format first, then lint, then test/build — formatting can shift lines lint doesn't care about, but do it before the final checks so the diff you hand back is already clean.

Run this for every frontend change, not only ones that look formatting-related. Code that runs correctly locally but isn't linted, formatted, or type-clean still fails CI.
