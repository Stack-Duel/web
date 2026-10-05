import { describe, expect, it } from "vitest";
import { upsertUserSchema } from "./upsert-user-schema";

describe("upsertUserSchema", () => {
  it("accepts a valid sub", () => {
    const result = upsertUserSchema.safeParse({ sub: "auth0|123" });

    expect(result.success).toBe(true);
  });

  it("rejects a missing sub", () => {
    const result = upsertUserSchema.safeParse({});

    expect(result.success).toBe(false);
  });

  it("rejects a non-string sub", () => {
    const result = upsertUserSchema.safeParse({ sub: 123 });

    expect(result.success).toBe(false);
  });
});
