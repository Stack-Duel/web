export const routerConfig = {
  about: {
    path: "/about",
  },
  adminUsers: {
    path: "/admin/users",
  },
  adminUserDetail: {
    path: "/admin/users/:id",
    execute: ({ id }: { id: string }) =>
      `/admin/users/${encodeURIComponent(id)}`,
  },
  admin: {
    path: "/admin",
  },
  adminFeedback: {
    path: "/admin/feedback",
  },
  adminFeatureFlags: {
    path: "/admin/feature-flags",
  },
  adminAuditLog: {
    path: "/admin/audit-log",
  },
  adminFeedbackDetail: {
    path: "/admin/feedback/:id",
    execute: ({ id }: { id: string }) =>
      `/admin/feedback/${encodeURIComponent(id)}`,
  },
  adminGames: {
    path: "/admin/games",
  },
  adminGameDetail: {
    path: "/admin/games/:id",
    execute: ({ id }: { id: string }) =>
      `/admin/games/${encodeURIComponent(id)}`,
  },
  adminSubmissions: {
    path: "/admin/submissions",
  },
  adminSubmissionDetail: {
    path: "/admin/submissions/:id",
    execute: ({ id }: { id: string }) =>
      `/admin/submissions/${encodeURIComponent(id)}`,
  },
  adminProblems: {
    path: "/admin/problems",
  },
  adminProblemPools: {
    path: "/admin/problems/pools",
  },
  adminProblemPoolDetail: {
    path: "/admin/problems/pools/:key",
    execute: ({ key }: { key: string }) =>
      `/admin/problems/pools/${encodeURIComponent(key)}`,
  },
  adminProblemDetail: {
    path: "/admin/problems/:id",
    execute: ({ id }: { id: string }) =>
      `/admin/problems/${encodeURIComponent(id)}`,
  },
  adminProblemNew: {
    path: "/admin/problems/new",
  },
  adminRequiredProblemLanguages: {
    path: "/admin/problem-required-languages",
  },
  adminDailyChallenges: {
    path: "/admin/daily-challenges",
  },
  authLogIn: { path: "/auth/login" },
  authSignUp: {
    path: "/auth/login?screen_hint=signup&returnTo=/user/setup",
  },
  authLogOut: { path: "/auth/logout" },
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
  problemSubmissions: {
    path: "/problems/:slug/submissions",
    execute: ({ slug }: { slug: string }) =>
      `/problems/${encodeURIComponent(slug)}/submissions`,
  },
  profile: {
    path: "/profile/:username",
    execute: ({ username }: { username: string }) =>
      `/profile/${encodeURIComponent(username)}`,
  },
  profileSettings: { path: "/settings" },
  settingsAccount: { path: "/settings/account" },
  settingsPreferences: { path: "/settings/preferences" },
  settingsProfile: { path: "/settings/profile" },
  userSetup: { path: "/user/setup" },
} as const;
