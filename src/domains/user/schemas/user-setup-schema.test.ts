import { describe, expect, it } from "vitest";
import { userSetupSchema } from "./user-setup-schema";

describe("userSetupSchema", () => {
  it("accepts a valid username", () => {
    const result = userSetupSchema.safeParse({ username: "algowars_dev" });

    expect(result.success).toBe(true);
  });

  it("rejects an invalid username", () => {
    const result = userSetupSchema.safeParse({ username: "" });

    expect(result.success).toBe(false);
  });
});
