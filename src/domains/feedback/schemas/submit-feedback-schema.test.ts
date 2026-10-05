import { describe, expect, it } from "vitest";
import { submitFeedbackSchema } from "./submit-feedback-schema";

describe("submitFeedbackSchema", () => {
  it("accepts a valid submission with a rating", () => {
    const result = submitFeedbackSchema.safeParse({
      type: "Bug",
      message: "The submit button is unresponsive.",
      rating: 3,
    });

    expect(result.success).toBe(true);
  });

  it("accepts a null rating", () => {
    const result = submitFeedbackSchema.safeParse({
      type: "General",
      message: "Loving the product so far.",
      rating: null,
    });

    expect(result.success).toBe(true);
  });

  it("rejects an empty message", () => {
    const result = submitFeedbackSchema.safeParse({
      type: "Question",
      message: "",
      rating: null,
    });

    expect(result.success).toBe(false);
  });

  it("rejects a message longer than 2000 characters", () => {
    const result = submitFeedbackSchema.safeParse({
      type: "FeatureRequest",
      message: "a".repeat(2001),
      rating: null,
    });

    expect(result.success).toBe(false);
  });

  it("rejects a rating outside 1-5", () => {
    const result = submitFeedbackSchema.safeParse({
      type: "Bug",
      message: "Something broke.",
      rating: 6,
    });

    expect(result.success).toBe(false);
  });

  it("rejects an unknown type", () => {
    const result = submitFeedbackSchema.safeParse({
      type: "Unknown",
      message: "Something broke.",
      rating: null,
    });

    expect(result.success).toBe(false);
  });
});
