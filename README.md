# Code generation

This project uses [Plop](https://plopjs.com/) to scaffold new files that follow
the existing conventions (domain folders, `defineQuery`/`defineMutation`,
client vs. server components).

Run it from `web/`:

```
pnpm generate
```

This opens an interactive menu. You can also jump straight to a generator:

```
pnpm generate component
pnpm generate api-query
pnpm generate api-mutation
pnpm generate model
pnpm generate hook
pnpm generate view
pnpm generate page
```

### `component`: Angular-CLI-style path

`component` takes a single path argument instead of separate prompts, the
last segment is the file name, everything before it is the literal folder
under `domains/`. There's no implicit `components/` folder, the path is used
exactly as given, matching `ng generate component`:

```sh
pnpm generate component studio/problems/problem/studio-problem-question
pnpm generate component problem/my-search-input
```

The first lands at `domains/studio/problems/problem/studio-problem-question.tsx`,
the second at `domains/problem/my-search-input.tsx`. To put something under a
`components/` folder, type that segment yourself:
`problem/components/my-search-input`.

## Generators

| Generator | Produces | Client/server |
| --- | --- | --- |
| `component` | `domains/<path>.tsx` + test, path given as one argument | Asks if it needs hooks/state; adds `"use client"` only if so |
| `api-query` | `domains/<domain>/api/get-<name>.ts` + test | Client (`defineQuery` / `useQuery`) |
| `api-mutation` | `domains/<domain>/api/<name>.ts` + test | Client (`defineMutation` / `useMutation`) |
| `model` | `domains/<domain>/models/<name>.ts` | Type only |
| `hook` | `domains/<domain>/hooks/use-<name>.ts` + test | Client |
| `view` | `domains/<domain>/<path>/<name>-layout.tsx` + test | Client — the top-level content for one route: fetches its own data, composes components, owns `SidebarLayout` + breadcrumbs |
| `page` | `app/<route>/page.tsx` | Server — the thin route entry that renders a `view`; `async` and awaits `params` only when the route has a dynamic segment |

`view` vs. `component`: a `component` is a reusable building block with no
routing concept (a badge, an input, a table). A `view` is tied to exactly one
route, owns its own data fetching, and is what a `page` renders.

All generated files live under `domains/<domain>/...` — there is no separate
`views/` folder.

Templates live in `web/plop-templates/*.hbs`; generator definitions are in
`web/plopfile.mjs`. Not yet covered: the Next.js route-segment `layout.tsx`
(the `AuthGuard` + `SidebarLayout` wrapper for a whole route subtree) and
`error.tsx`/`not-found.tsx` boundaries — add generators for those if they
become repetitive to write by hand.
