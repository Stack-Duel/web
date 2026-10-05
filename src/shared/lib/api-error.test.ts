import { describe, expect, it } from "vitest";
import { cleanDetail, extractErrorMessage } from "./api-error";

describe("cleanDetail", () => {
  it("strips the Ardalis 'Next error(s) occurred' boilerplate", () => {
    expect(
      cleanDetail("Next error(s) occurred:* Invalid or expired code.\r\n")
    ).toBe("Invalid or expired code.");
  });

  it("joins multiple bulleted lines", () => {
    expect(
      cleanDetail(
        "Next error(s) occurred:\r\n* First problem.\r\n* Second problem.\r\n"
      )
    ).toBe("First problem.; Second problem.");
  });

  it("returns plain detail text unchanged when there's no boilerplate", () => {
    expect(cleanDetail("Something went wrong.")).toBe("Something went wrong.");
  });
});

describe("extractErrorMessage", () => {
  it("prefers a literal message field when present", () => {
    expect(
      extractErrorMessage({ message: "Explicit message" }, "fallback")
    ).toBe("Explicit message");
  });

  it("flattens an ASP.NET validation errors dictionary", () => {
    expect(
      extractErrorMessage(
        { errors: { JoinCode: ["Code is required."], Foo: ["Bar."] } },
        "fallback"
      )
    ).toBe("Code is required.; Bar.");
  });

  it("falls back to a cleaned detail from an Ardalis problem+json body", () => {
    expect(
      extractErrorMessage(
        {
          title: "Resource not found.",
          detail: "Next error(s) occurred:* Invalid or expired code.\r\n",
        },
        "fallback"
      )
    ).toBe("Invalid or expired code.");
  });

  it("falls back to title when there's no message, errors, or detail", () => {
    expect(
      extractErrorMessage({ title: "Resource not found." }, "fallback")
    ).toBe("Resource not found.");
  });

  it("falls back to the provided fallback when the body has nothing usable", () => {
    expect(extractErrorMessage(undefined, "Request failed")).toBe(
      "Request failed"
    );
    expect(extractErrorMessage({}, "Request failed")).toBe("Request failed");
  });
});
