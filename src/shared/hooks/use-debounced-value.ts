import { useEffect, useState } from "react";

/**
 * Returns `value`, but delayed so it only updates once `value` has stopped
 * changing for `delayMs`. Intended for gating a network request (e.g. a
 * search query) behind a pause in typing rather than firing on every
 * keystroke.
 */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeoutId = setTimeout(() => setDebouncedValue(value), delayMs);

    return () => clearTimeout(timeoutId);
  }, [value, delayMs]);

  return debouncedValue;
}
