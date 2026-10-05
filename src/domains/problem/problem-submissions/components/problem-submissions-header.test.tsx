import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ProblemSubmissionsHeader from "./problem-submissions-header";
import { buildProblem } from "@/test/factories/problem";
import { resetUserStore } from "@/test/mocks/user-store";
import type { Problem } from "@/domains/problem/models/problem";

vi.mock("@/env", () => import("@/test/mocks/env"));

function renderHeader(problem: Problem) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <ProblemSubmissionsHeader problem={problem} />
    </QueryClientProvider>
  );
}

describe("ProblemSubmissionsHeader", () => {
  beforeEach(() => {
    resetUserStore();
  });

  it("shows the problem title, difficulty, and question", () => {
    renderHeader(
      buildProblem({
        title: "Two Sum",
        difficultyTier: "easy",
        question: "Given an array of integers...",
      })
    );

    expect(screen.getByText("Two Sum")).toBeVisible();
    expect(screen.getByText("Easy")).toBeVisible();
    expect(screen.getByText(/Given an array of integers/)).toBeVisible();
  });

  it("disables the reaction buttons for a signed-out visitor", () => {
    renderHeader(buildProblem());

    expect(screen.getByRole("button", { name: "Like" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Dislike" })).toBeDisabled();
  });
});
