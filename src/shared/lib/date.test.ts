import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { formatRelativeTime } from "./date";

describe("formatRelativeTime", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("formats a moment in the past", () => {
    expect(formatRelativeTime(new Date("2026-01-01T11:55:00.000Z"))).toBe(
      "5 minutes ago"
    );
  });

  it("formats a moment in the future", () => {
    expect(formatRelativeTime(new Date("2026-01-01T14:00:00.000Z"))).toBe(
      "in 2 hours"
    );
  });

  it("accepts an ISO date string", () => {
    expect(formatRelativeTime("2026-01-01T11:00:00.000Z")).toBe("an hour ago");
  });
});
