import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ProblemSubmissionsCard from "./problem-submissions-card";
import { buildProblemSubmission } from "@/test/factories/problem";
import { TooltipProvider } from "@/shared/components/ui/tooltip";

vi.mock(
  "@/shared/code-block/code-block",
  () => import("@/test/mocks/code-block")
);

function renderCard(props: ComponentProps<typeof ProblemSubmissionsCard>) {
  return render(
    <TooltipProvider>
      <ProblemSubmissionsCard {...props} />
    </TooltipProvider>
  );
}

describe("ProblemSubmissionsCard", () => {
  it("shows the submitter, language, and code", () => {
    renderCard({
      submission: buildProblemSubmission({
        user: { username: "testuser", imageUrl: "" },
        language: { id: "lang_1", name: "JavaScript", version: "ES2022" },
        code: "function twoSum() {}",
      }),
    });

    expect(screen.getByText("testuser")).toBeVisible();
    expect(screen.getByText("JavaScript")).toBeVisible();
    expect(screen.getByText("(ES2022)")).toBeVisible();
    expect(screen.getByText("function twoSum() {}")).toBeVisible();
  });

  it("labels a wrong answer status and highlights it as destructive", () => {
    renderCard({
      submission: buildProblemSubmission({ status: "WrongAnswer" }),
    });

    expect(screen.getByText("Wrong Answer")).toBeVisible();
  });

  it("highlights an accepted status in green", () => {
    renderCard({
      submission: buildProblemSubmission({ status: "Accepted" }),
    });

    expect(screen.getByText("Accepted")).toHaveClass("bg-green-600");
  });

  it("shows runtime and memory usage when present", () => {
    renderCard({
      submission: buildProblemSubmission({
        executionTime: 42,
        memoryUsage: 1024,
      }),
    });

    expect(screen.getByText("42 ms")).toBeVisible();
    expect(screen.getByText("1024 KB")).toBeVisible();
  });
});
