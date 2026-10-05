import { describe, expect, it } from "vitest";
import { profileSettingsSchema } from "./profile-settings-schema";

describe("profileSettingsSchema", () => {
  it("accepts a valid username and bio", () => {
    const result = profileSettingsSchema.safeParse({
      username: "algowars_dev",
      bio: "Competitive coder.",
    });

    expect(result.success).toBe(true);
  });

  it("accepts an empty bio", () => {
    const result = profileSettingsSchema.safeParse({
      username: "algowars_dev",
      bio: "",
    });

    expect(result.success).toBe(true);
  });

  it("rejects a bio longer than 500 characters", () => {
    const result = profileSettingsSchema.safeParse({
      username: "algowars_dev",
      bio: "a".repeat(501),
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe(
      "Bio must be at most 500 characters"
    );
  });

  it("rejects an invalid username", () => {
    const result = profileSettingsSchema.safeParse({
      username: "",
      bio: "Competitive coder.",
    });

    expect(result.success).toBe(false);
  });
});
