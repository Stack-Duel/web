import { describe, expect, it } from "vitest";
import { usernameSchema } from "./username-schema";

describe("usernameSchema", () => {
  it("accepts letters, numbers, hyphens, and underscores", () => {
    const result = usernameSchema.safeParse("Algo_Wars-123");

    expect(result.success).toBe(true);
  });

  it("rejects an empty username", () => {
    const result = usernameSchema.safeParse("");

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe(
      "Username must be at least one character"
    );
  });

  it("rejects a username longer than 20 characters", () => {
    const result = usernameSchema.safeParse("a".repeat(21));

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe(
      "Username must be at most 20 characters"
    );
  });

  it("rejects characters outside the allowed set", () => {
    const result = usernameSchema.safeParse("bad username!");

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe(
      "Username only allows letters, numbers, hyphens, and underscores"
    );
  });
});
