import { describe, expect, it, vi } from "vitest";
import { buildProblemDescription } from "./build-problem-metadata";

vi.mock("@/shared/lib/site", () => import("@/test/mocks/site"));

describe("buildProblemDescription", () => {
  it("includes the problem title and difficulty", () => {
    const description = buildProblemDescription({
      title: "Two Sum",
      difficultyTier: "Easy",
      tags: [],
    });

    expect(description).toContain("Two Sum");
    expect(description).toContain("Easy");
  });

  it("appends up to three topics when tags are present", () => {
    const description = buildProblemDescription({
      title: "Two Sum",
      difficultyTier: "Easy",
      tags: ["arrays", "hash-map", "two-pointers", "sorting"],
    });

    expect(description).toContain("Topics: arrays, hash-map, two-pointers.");
    expect(description).not.toContain("sorting");
  });

  it("stays within a search-engine-friendly length", () => {
    const description = buildProblemDescription({
      title: "Longest Substring Without Repeating Characters",
      difficultyTier: "Medium",
      tags: ["sliding-window", "hash-map", "strings", "two-pointers"],
    });

    expect(description.length).toBeLessThanOrEqual(160);
  });
});
