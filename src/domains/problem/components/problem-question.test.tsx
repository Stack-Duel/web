import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProblemQuestion } from "./problem-question";
import { buildProblem } from "@/test/factories/problem";

vi.mock("@/env", () => import("@/test/mocks/env"));
vi.mock("../problem-reactions/components/problem-reaction-buttons", () => ({
  ProblemReactionButtons: () => <div>problem-reaction-buttons</div>,
}));
vi.mock("@/domains/feedback/components/context-feedback-button", () => ({
  ContextFeedbackButton: () => <div>context-feedback-button</div>,
}));

describe("ProblemQuestion", () => {
  it("renders the title, difficulty, and question markdown", () => {
    render(
      <ProblemQuestion
        problem={buildProblem({ title: "Two Sum", difficultyTier: "easy" })}
      />
    );

    expect(screen.getByRole("heading", { name: "Two Sum" })).toBeVisible();
    expect(screen.getByText("Easy")).toBeVisible();
  });

  it("shows the author when present", () => {
    render(
      <ProblemQuestion
        problem={buildProblem({
          author: { username: "algowars", imageUrl: null },
        })}
      />
    );

    expect(screen.getByText("algowars")).toBeVisible();
  });

  it("hides the author section when there is no author", () => {
    render(<ProblemQuestion problem={buildProblem({ author: null })} />);

    expect(
      screen.queryByText("algowars", { selector: "span.font-medium" })
    ).not.toBeInTheDocument();
  });

  it("shows a tag count and lists tags when expanded", async () => {
    const user = userEvent.setup();
    render(
      <ProblemQuestion
        problem={buildProblem({ tags: ["arrays", "hash-map"] })}
      />
    );

    expect(screen.getByText("Tags (2)")).toBeVisible();

    await user.click(screen.getByRole("button", { name: /Tags \(2\)/ }));

    expect(screen.getByText("arrays")).toBeVisible();
    expect(screen.getByText("hash-map")).toBeVisible();
  });

  it("shows a no-tags message when there are none", async () => {
    const user = userEvent.setup();
    render(<ProblemQuestion problem={buildProblem({ tags: [] })} />);

    await user.click(screen.getByRole("button", { name: /Tags \(0\)/ }));

    expect(screen.getByText("No tags provided.")).toBeVisible();
  });
});
