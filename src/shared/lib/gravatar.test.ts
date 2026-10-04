import { describe, expect, it } from "vitest";
import { getGravatarUrl } from "./gravatar";

describe("getGravatarUrl", () => {
  it("builds a gravatar url from the md5 hash of a trimmed, lowercased email", () => {
    expect(getGravatarUrl("ada@example.com")).toBe(
      "https://www.gravatar.com/avatar/3e3417d7ef77d5932a6734b916515ed5?d=identicon&s=200"
    );
    expect(getGravatarUrl("  Ada@Example.com  ")).toBe(
      "https://www.gravatar.com/avatar/3e3417d7ef77d5932a6734b916515ed5?d=identicon&s=200"
    );
  });

  it("supports a custom size", () => {
    expect(getGravatarUrl("ada@example.com", 64)).toBe(
      "https://www.gravatar.com/avatar/3e3417d7ef77d5932a6734b916515ed5?d=identicon&s=64"
    );
  });
});
