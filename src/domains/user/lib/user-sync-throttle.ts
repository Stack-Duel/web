const STORAGE_KEY_PREFIX = "algowars:user-sync:";
const SYNC_THROTTLE_MS = 30 * 60 * 1000;

function storageKey(sub: string): string {
  return `${STORAGE_KEY_PREFIX}${sub}`;
}

export function shouldSyncUser(sub: string): boolean {
  if (typeof window === "undefined") return true;

  try {
    const lastSyncedAt = window.localStorage.getItem(storageKey(sub));
    if (!lastSyncedAt) return true;

    return Date.now() - Number(lastSyncedAt) > SYNC_THROTTLE_MS;
  } catch {
    return true;
  }
}

export function markUserSynced(sub: string): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(storageKey(sub), String(Date.now()));
  } catch {
    // Ignore storage failures (private browsing, quota exceeded, etc.)
  }
}
