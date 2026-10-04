import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import ProblemSubmissionsLoading from "./loading";

vi.mock(
  "@/shared/layouts/sidebar-layout/sidebar-layout",
  () => import("@/test/mocks/sidebar-layout")
);

describe("ProblemSubmissionsLoading", () => {
  it("renders skeleton placeholders without crashing", () => {
    const { container } = render(<ProblemSubmissionsLoading />);

    expect(
      container.querySelectorAll('[data-slot="skeleton"]').length
    ).toBeGreaterThan(0);
  });
});
