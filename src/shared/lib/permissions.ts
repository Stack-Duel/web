/**
 * Permission strings issued to the user via `User.permissions` (see
 * `@/domains/user/models/user`). These are checked client-side to decide
 * what to render. The source of truth for who actually *has* which
 * permission lives with your auth provider / backend.
 */
export const Permissions = {
  SUBMISSION_CREATE: "submission:create",
  SUBMISSION_VIEW: "submission:view",
  ADMIN_PROBLEMS_READ: "problem:read:admin",
  ADMIN_PROBLEMS_UPDATE: "problem:update:admin",
  ADMIN_PROBLEMS_CREATE: "problem:create:admin",
  ADMIN_PROBLEMS_SUBMIT: "problem:submit:admin",
  ADMIN_REQUIRED_LANGUAGES_MANAGE: "problem-required-language:manage:admin",
  ADMIN_USERS_READ: "user:read:admin",
  ADMIN_USER_GROUPS_UPDATE: "user:groups:update:admin",
  ADMIN_SUBMISSIONS_READ: "submission:read:admin",
  FEEDBACK_CREATE: "feedback:create",
  ADMIN_FEEDBACK_READ: "feedback:read:admin",
  ADMIN_FEEDBACK_UPDATE: "feedback:update:admin",
  ADMIN_DASHBOARD_READ: "dashboard:read:admin",
  ADMIN_GAMES_READ: "games:read:admin",
  ADMIN_FEATURE_FLAGS_MANAGE: "feature-flag:manage:admin",
  ADMIN_AUDIT_LOG_READ: "audit-log:read:admin",
} as const;

export type Permission = (typeof Permissions)[keyof typeof Permissions];
