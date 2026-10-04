export const routerConfig = {
  about: {
    path: "/about",
  },
  admin: {
    path: "/admin",
  },
  authLogIn: { path: "/sign-in" },
  authSignUp: { path: "/sign-up" },
  blog: {
    path: "/blog",
  },
  community: {
    path: "/community",
  },
  blogPost: {
    path: "/blog/:slug",
    execute: ({ slug }: { slug: string }) =>
      `/blog/${encodeURIComponent(slug)}`,
  },
  home: {
    path: "/",
  },
  joinGame: {
    path: "/join/:code",
    execute: ({ code }: { code: string }) =>
      `/join/${encodeURIComponent(code)}`,
  },
  dashboard: {
    path: "/dashboard",
  },
  gamePlay: {
    path: "/game/play/:gameId",
    execute: ({ gameId }: { gameId: string }) =>
      `/game/play/${encodeURIComponent(gameId)}`,
  },
  games: {
    path: "/games",
    execute: (params?: { mode?: string }) =>
      params?.mode
        ? `/games?mode=${encodeURIComponent(params.mode)}`
        : "/games",
  },
  leaderboards: {
    path: "/leaderboards",
    execute: (params?: { mode?: string }) =>
      params?.mode
        ? `/leaderboards?mode=${encodeURIComponent(params.mode)}`
        : "/leaderboards",
  },
  problems: {
    path: "/problems",
  },
  problem: {
    path: "/problems/:slug",
    execute: ({ slug }: { slug: string }) =>
      `/problems/${encodeURIComponent(slug)}`,
  },
  profile: {
    path: "/profile/:username",
    execute: ({ username }: { username: string }) =>
      `/profile/${encodeURIComponent(username)}`,
  },
  profileSettings: { path: "/settings" },
} as const;
