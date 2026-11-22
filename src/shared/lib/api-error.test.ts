import { describe, expect, it } from "vitest";
import { extractErrorMessage } from "./api-error";

describe("extractErrorMessage", () => {
  it("prefers the message field", () => {
    expect(extractErrorMessage({ message: "Nope" }, "fallback")).toBe("Nope");
  });

  it("surfaces a rate limit message sent as error", () => {
    expect(
      extractErrorMessage(
        {
          error:
            "You are sending requests too quickly. Please wait 8 second(s) before trying again.",
          retryAfterSeconds: 8,
        },
        "Failed to run solution"
      )
    ).toBe(
      "You are sending requests too quickly. Please wait 8 second(s) before trying again."
    );
  });

  it("joins validation errors", () => {
    expect(
      extractErrorMessage({ errors: { Title: ["Required", "Too short"] } }, "f")
    ).toBe("Required; Too short");
  });

  it("cleans a detail block", () => {
    expect(
      extractErrorMessage(
        { detail: "Next error(s) occurred:\n* First\n* Second" },
        "f"
      )
    ).toBe("First; Second");
  });

  it("falls back when the body is empty", () => {
    expect(extractErrorMessage(undefined, "Request failed")).toBe(
      "Request failed"
    );
  });
});
