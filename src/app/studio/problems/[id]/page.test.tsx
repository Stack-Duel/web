import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import StudioProblem from "./page";

vi.mock("@/domains/studio/problems/problem/studio-problem-layout", () => ({
  default: ({ id }: { id: string }) => (
    <div>Studio Problem Layout: {id}</div>
  ),
}));

describe("StudioProblem", () => {
  it("renders the studio problem layout with the resolved id", async () => {
    render(
      await StudioProblem({ params: Promise.resolve({ id: "problem-1" }) })
    );

    expect(
      screen.getByText("Studio Problem Layout: problem-1")
    ).toBeVisible();
  });
});
