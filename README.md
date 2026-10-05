# Algowars Web

[![Quality gate status](https://sonarcloud.io/api/project_badges/measure?project=algowars_web&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=algowars_web) [![Coverage](https://sonarcloud.io/api/project_badges/measure?project=algowars_web&metric=coverage)](https://sonarcloud.io/summary/new_code?id=algowars_web) [![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=algowars_web&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=algowars_web) [![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=algowars_web&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=algowars_web) [![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=algowars_web&metric=reliability_rating)](https://sonarcloud.io/summary/new_code?id=algowars_web) [![Duplicated Lines (%)](https://sonarcloud.io/api/project_badges/measure?project=algowars_web&metric=duplicated_lines_density)](https://sonarcloud.io/summary/new_code?id=algowars_web) [![Security issues](https://sonarcloud.io/api/project_badges/measure?project=algowars_web&metric=software_quality_security_issues)](https://sonarcloud.io/summary/new_code?id=algowars_web) [![Maintainability issues](https://sonarcloud.io/api/project_badges/measure?project=algowars_web&metric=software_quality_maintainability_issues)](https://sonarcloud.io/summary/new_code?id=algowars_web) [![Reliability issues](https://sonarcloud.io/api/project_badges/measure?project=algowars_web&metric=software_quality_reliability_issues)](https://sonarcloud.io/summary/new_code?id=algowars_web) [![Lines of Code](https://sonarcloud.io/api/project_badges/measure?project=algowars_web&metric=ncloc)](https://sonarcloud.io/summary/new_code?id=algowars_web)

Web application built for algowars. This project uses Nextjs, tailwindcss, shadcn, vitest, and playwright.

## Getting Started

### Prerequisites

- Node.js 24.5 (matches CI).
- pnpm 11.10.0 — pinned via `packageManager` in `package.json`; `corepack enable` will pick it up automatically.
- A running [`algowars/server`](https://github.com/algowars/server) API, unless you're pointing `NEXT_PUBLIC_API_SERVER_URL` at a shared dev environment instead. See [`playwright/README.md`](./playwright/README.md#prerequisites) for the local Postgres/RabbitMQ/API bootstrap steps.

### Installation

This project uses `pnpm`. To install packages, run this command:

```bash
pnpm i
```

### Environment Variables

To get started you first need create environment variables by running:

```bash
cp .env.example .env
```

And this will make a copy of the empty .env file. Then fill in:

- `AUTH0_*` — go into Auth0 and create a Next.js web application and an API, then fill in the resulting values. `AUTH0_SECRET` can be generated with `openssl rand -hex 32`.
- `NEXT_PUBLIC_API_SERVER_URL` — where the `algowars/server` API is reachable (`http://localhost:5041` for a locally-running instance).
- `NEXT_PUBLIC_CODEPREVIEW_ORIGIN` — the origin serving the React-component-preview iframe runtime (see `codepreview/`). This is **required**: the app throws on startup if it's unset. Unless you're specifically working on that feature, point it at the shared dev deployment — ask a teammate for the current URL, or check the `Preview` GitHub Environment's variables.
- `NEXT_PUBLIC_APPLICATIONINSIGHTS_CONNECTION_STRING` is optional — telemetry is skipped when it's unset.

### Running the app

```bash
pnpm dev
```

Serves the app at `http://localhost:3000`.

### Linting and formatting

```bash
pnpm lint           # ESLint
pnpm format         # Prettier, writes changes
pnpm format:check   # Prettier, check only
```

### Building for production

```bash
pnpm build
pnpm start
```

## Testing

To test this project run these commands:

### Standard run

```bash
pnpm test
```

### Test with watch enabled

```bash
pnpm test --watch
```

### Test with code coverage

```bash
pnpm test:coverage
```

CLI tool for more information: https://vitest.dev/guide/cli

## E2E tests

End-to-end tests run against the real, integrated app (a running API, database, and
Auth0 tenant) using Playwright. See [`playwright/README.md`](./playwright/README.md)
for prerequisites, how to run them locally, and the tagging system (`@smoke`,
`@regression`, `@critical`).
