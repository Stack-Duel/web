import { describe, expect, it } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("joins truthy class names and drops falsy ones", () => {
    expect(cn("a", "b", undefined, false, null, "c")).toBe("a b c");
  });

  it("resolves conflicting tailwind classes by keeping the last one", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("merges conditional class objects", () => {
    expect(cn("base", { active: true, hidden: false })).toBe("base active");
  });
});
