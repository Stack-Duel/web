# E2E tests (Playwright)

Most of these tests exercise the real, integrated app: a running Next.js server talking
to a real `StackDuel.Api` instance (Postgres + RabbitMQ + Judge0), authenticating through
the real Auth0 Universal Login flow.

`integration/` is the exception: those tests still reuse the cached Auth0 session from
the `setup` project (so logging in once still requires the real stack to be reachable),
but every `StackDuel.Api` call made from the browser after that is intercepted and
mocked via `page.route()`. They verify frontend behavior — filtering, permission
gating, rendering — against controlled data instead of real seeded database state, and
don't need the backend running for the actual test run.

Each feature under `integration/` owns its own `mocks.ts` (e.g.
`integration/studio/mocks.ts`) rather than everything sharing one file — add a new
sibling folder for a new feature instead of appending to an existing mocks file.
Fixture data itself is built with the same factories the Vitest unit tests use
(`src/test/factories/*`), so a model's default shape only needs to be right in one
place. The only shared piece is `support/route-mock.ts`, a thin `page.route()` →
JSON-fulfill wrapper with no feature-specific knowledge.

## Prerequisites

1. The API stack is running locally (from `../server`):
   ```bash
   docker compose up -d          # Postgres + RabbitMQ
   dotnet ef database update --project StackDuel.Infrastructure --startup-project StackDuel.Api
   dotnet run --project StackDuel.Seeder -- --static
   dotnet run --project StackDuel.Api
   ```
2. `web/.env` is filled in (`cp .env.example .env` if you haven't already), including:
   - The usual `AUTH0_*` / `NEXT_PUBLIC_API_SERVER_URL` values, pointed at a **test**
     Auth0 tenant/application (not production).
   - `TEST_USER_EMAIL` / `TEST_USER_PASSWORD` — a real database-connection (not SSO)
     user in that test tenant. Playwright logs in as this user once and reuses the
     session for every test via a cached `storageState`.
   - `TEST_USER_2_EMAIL` / `TEST_USER_2_PASSWORD` — optional, a second test-tenant
     account. Without it, the two-player duel test and the admin-area tests are
     skipped; everything else still runs. The setup project logs in as this user
     and sets its username to `test-admin` automatically; grant it admin access
     (once) with:
     ```bash
     dotnet run --project StackDuel.Seeder -- --grant-admin test-admin
     ```
3. Browsers are installed: `pnpm exec playwright install chromium`.

## Running

```bash
pnpm e2e             # full suite
pnpm e2e:smoke       # fast happy-path checks
pnpm e2e:integration # mocked-backend frontend behavior checks
pnpm e2e:regression  # fuller coverage
pnpm e2e:critical    # must-never-break flows (auth, submission)
pnpm e2e:report      # open the last HTML report
```

By default this starts the app for you via `pnpm dev` (or `pnpm build && pnpm start`
when `CI` is set) and points at `http://localhost:3000`. Point at an already-running
instance instead with `PLAYWRIGHT_BASE_URL=http://localhost:3000 pnpm e2e`.

## Tags

Tag tests via Playwright's built-in `tag` option rather than inventing a custom
mechanism:

```ts
test("thing happens", { tag: ["@smoke"] }, async ({ page }) => { ... });
```

- `@smoke` — fast happy-path checks (login, core pages render).
- `@integration` — mocked-backend checks of frontend behavior, organized around user
  stories (see `integration/`). There are deliberately more of these than `@regression`
  tests — they're cheap to write and run since they don't depend on seeded data.
- `@regression` — fuller coverage of individual features against the real backend.
- `@critical` — must-never-break flows (auth, submitting a solution). Orthogonal to
  the other tags — a test can be both `@smoke` and `@critical`.

Filter any run with `--grep`/`--grep-invert`, e.g. `playwright test --grep @smoke`.

## Layout

```
playwright/
  auth.setup.ts     # "setup" project: logs in once, caches storageState
  pages/            # small page objects for the flows covered by the sample tests
  support/          # generic, feature-agnostic test helpers (route-mock.ts, etc.)
  smoke/
  integration/      # mocked-backend specs, one subfolder + mocks.ts per feature
  regression/
  .auth/            # gitignored — the cached storageState.json
```

## CI

`.github/workflows/e2e.yml` runs this suite daily against a full stack it boots itself
(checks out `StackDuel/server`, starts Postgres/RabbitMQ/the API, then the Next.js app).
See that file for the exact steps, and the top of it for the list of GitHub secrets it
needs — they need to be added by someone with access to the test Auth0 tenant, a
Judge0 (RapidAPI) key, and (if `StackDuel/server` is private) a PAT that can check it
out.
