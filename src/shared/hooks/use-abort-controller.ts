"use client";

import { useEffect, useMemo } from "react";

export function useAbortController(deps: string[] = []): AbortController {
  // eslint-disable-next-line react-hooks/use-memo, react-hooks/exhaustive-deps
  const controller = useMemo(() => new AbortController(), deps);
  useEffect(() => () => controller.abort(), [controller]);
  return controller;
}
