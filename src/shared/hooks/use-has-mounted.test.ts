import { describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";
import { useHasMounted } from "./use-has-mounted";

describe("useHasMounted", () => {
  it("returns true once rendered on the client", () => {
    const { result } = renderHook(() => useHasMounted());

    expect(result.current).toBe(true);
  });
});
