import { describe, expect, it } from "vitest";
import { Permissions } from "./permissions";

describe("Permissions", () => {
  it("has no duplicate permission strings", () => {
    const values = Object.values(Permissions);

    expect(new Set(values).size).toBe(values.length);
  });

  it("scopes every ADMIN_ permission with an :admin suffix", () => {
    const adminEntries = Object.entries(Permissions).filter(([key]) =>
      key.startsWith("ADMIN_")
    );

    expect(adminEntries.length).toBeGreaterThan(0);
    for (const [, value] of adminEntries) {
      expect(value).toMatch(/:admin$/);
    }
  });
});
