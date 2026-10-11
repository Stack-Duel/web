export type ProblemDetailsBody = {
  message?: string;
  errors?: Record<string, string[]>;
  detail?: string;
  title?: string;
};

export function cleanDetail(detail: string): string {
  return detail
    .replace(/^Next error\(s\) occurred:\s*/i, "")
    .split(/\r?\n/)
    .map((line) => line.replace(/^\*\s*/, "").trim())
    .filter(Boolean)
    .join("; ");
}

export function extractErrorMessage(
  data: ProblemDetailsBody | undefined,
  fallback: string
): string {
  if (data?.message) return data.message;

  if (data?.errors) {
    const messages = Object.values(data.errors).flat();
    if (messages.length) return messages.join("; ");
  }

  if (data?.detail) {
    const cleaned = cleanDetail(data.detail);
    if (cleaned) return cleaned;
  }

  if (data?.title) return data.title;

  return fallback;
}

/**
 * Thrown when the Auth0 session can no longer produce an access token, so the
 * request was never sent (or came back 401 with no way to retry). Distinct from a
 * transient API failure: callers should treat it as "signed out", not "retry me".
 */
export class SessionExpiredError extends Error {
  constructor(message = "Your session expired. Sign in again to continue.") {
    super(message);
    this.name = "SessionExpiredError";
  }
}
