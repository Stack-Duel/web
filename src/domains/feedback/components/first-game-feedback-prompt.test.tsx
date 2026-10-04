import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FirstGameFeedbackPrompt } from "./first-game-feedback-prompt";

vi.mock("@/env", () => import("@/test/mocks/env"));

const STORAGE_KEY = "algowars:has-seen-first-game-feedback-prompt";

function renderPrompt(gameId = "game_1") {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <FirstGameFeedbackPrompt gameId={gameId} />
    </QueryClientProvider>
  );
}

describe("FirstGameFeedbackPrompt", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("opens the feedback dialog the first time it renders", () => {
    renderPrompt();

    expect(screen.getByText("Give feedback")).toBeInTheDocument();
  });

  it("does not open again once the prompt has already been seen", () => {
    localStorage.setItem(STORAGE_KEY, "true");

    renderPrompt();

    expect(screen.queryByText("Give feedback")).not.toBeInTheDocument();
  });

  it("marks the prompt as seen after showing it once", () => {
    renderPrompt();

    expect(localStorage.getItem(STORAGE_KEY)).toBe("true");
  });

  it("scopes the dialog's feedback to the given game", () => {
    renderPrompt("game_42");

    expect(
      screen.getByText(
        "Thanks for playing your first game! Tell us how it went."
      )
    ).toBeInTheDocument();
  });
});
