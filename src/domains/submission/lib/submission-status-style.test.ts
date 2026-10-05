import { describe, expect, it } from "vitest";
import {
  getSubmissionStatusClassName,
  getSubmissionStatusVariant,
} from "./submission-status-style";

describe("getSubmissionStatusVariant", () => {
  it("returns destructive for wrong-answer style statuses", () => {
    expect(getSubmissionStatusVariant("WrongAnswer")).toBe("destructive");
    expect(getSubmissionStatusVariant("TimeLimitExceeded")).toBe("destructive");
    expect(getSubmissionStatusVariant("MemoryLimitExceeded")).toBe(
      "destructive"
    );
    expect(getSubmissionStatusVariant("RuntimeError")).toBe("destructive");
    expect(getSubmissionStatusVariant("CompileError")).toBe("destructive");
  });

  it("returns secondary for accepted and pending statuses", () => {
    expect(getSubmissionStatusVariant("Accepted")).toBe("secondary");
    expect(getSubmissionStatusVariant("Pending")).toBe("secondary");
    expect(getSubmissionStatusVariant("Processing")).toBe("secondary");
    expect(getSubmissionStatusVariant("Queued")).toBe("secondary");
    expect(getSubmissionStatusVariant("Running")).toBe("secondary");
  });
});

describe("getSubmissionStatusClassName", () => {
  it("returns a green class for Accepted", () => {
    expect(getSubmissionStatusClassName("Accepted")).toBe(
      "bg-green-600 text-white hover:bg-green-600/90"
    );
  });

  it("returns undefined for any non-Accepted status", () => {
    expect(getSubmissionStatusClassName("WrongAnswer")).toBeUndefined();
    expect(getSubmissionStatusClassName("Pending")).toBeUndefined();
    expect(getSubmissionStatusClassName("Running")).toBeUndefined();
  });
});
