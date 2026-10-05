import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * Returns `false` during SSR and on the client's first hydration pass,
 * then `true` for every render after that. This is the primitive React
 * intends for values that legitimately differ between the server snapshot
 * and the client snapshot (e.g. Redux state populated only in the browser),
 * so it avoids hydration mismatches without triggering a "setState in an
 * effect" cascading render.
 */
export function useHasMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true, // client snapshot
    () => false // server snapshot
  );
}
