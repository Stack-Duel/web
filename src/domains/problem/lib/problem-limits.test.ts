import { describe, expect, it } from "vitest";
import { getOpenProblemCount } from "./problem-limits";

describe("getOpenProblemCount", () => {
  it("sums counts for statuses that are not Published or Archived", () => {
    const count = getOpenProblemCount([
      { status: "Draft", count: 3 },
      { status: "Pending", count: 2 },
      { status: "Failed", count: 1 },
      { status: "Published", count: 10 },
      { status: "Archived", count: 5 },
    ]);

    expect(count).toBe(6);
  });

  it("returns 0 for an empty breakdown", () => {
    expect(getOpenProblemCount([])).toBe(0);
  });

  it("returns 0 when every problem is resolved", () => {
    const count = getOpenProblemCount([
      { status: "Published", count: 4 },
      { status: "Archived", count: 2 },
    ]);

    expect(count).toBe(0);
  });
});
