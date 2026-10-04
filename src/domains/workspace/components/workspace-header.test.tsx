import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WorkspaceHeader } from "./workspace-header";
import { useUserStore } from "@/domains/user/state/user-store";
import { resetUserStore } from "@/test/mocks/user-store";
import { buildUser } from "@/test/factories/user";
import { buildAuthUser } from "@/test/factories/auth-user";
import { Permissions } from "@/shared/lib/permissions";
import { useWorkspaceStore } from "../state/workspace-store";
import { useSubmitSolution } from "../hooks/use-submit-solution";
import { routerConfig } from "@/shared/router-config";
import type { Problem } from "@/domains/problem/models/problem";
import { TooltipProvider } from "@/shared/components/ui/tooltip";

vi.mock("@/env", () => import("@/test/mocks/env"));
vi.mock("../hooks/use-submit-solution");
vi.mock("../language-select/components/language-select", () => ({
  LanguageSelect: () => <div>language-select</div>,
}));

const mockUseSubmitSolution = vi.mocked(useSubmitSolution);
const initialWorkspaceState = useWorkspaceStore.getState();

const problem: Problem = {
  id: "p1",
  slug: "two-sum",
  title: "Two Sum",
  difficultyTier: "Easy",
  question: "",
  availableLanguages: [],
  publicTestCases: [],
};

function renderHeader() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WorkspaceHeader problem={problem} problemSetupId="setup-1" />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

describe("WorkspaceHeader", () => {
  const runCode = vi.fn();
  const submitCode = vi.fn();

  beforeEach(() => {
    resetUserStore();
    useWorkspaceStore.setState(initialWorkspaceState, true);
    mockUseSubmitSolution.mockReturnValue({ runCode, submitCode });
  });

  it("disables Run and Submit and shows a lock icon for an unauthenticated user", () => {
    renderHeader();

    const runButtons = screen.getAllByRole("button", { name: /Run/ });
    const submitButtons = screen.getAllByRole("button", { name: /Submit$/ });

    for (const button of [...runButtons, ...submitButtons]) {
      expect(button).toBeDisabled();
    }
  });

  it("disables Run and Submit for an authenticated user without the submission:create permission", () => {
    useUserStore.setState({
      authProfile: buildAuthUser(),
      user: buildUser({ permissions: [] }),
    });

    renderHeader();

    for (const button of screen.getAllByRole("button", { name: /^Run$/ })) {
      expect(button).toBeDisabled();
    }
  });

  it("enables Run and Submit for an authenticated user with permission", async () => {
    useUserStore.setState({
      authProfile: buildAuthUser(),
      user: buildUser({ permissions: [Permissions.SUBMISSION_CREATE] }),
    });
    const user = userEvent.setup();

    renderHeader();

    const [runButton] = screen.getAllByRole("button", { name: /^Run$/ });
    expect(runButton).toBeEnabled();

    await user.click(runButton);
    expect(runCode).toHaveBeenCalled();

    const [submitButton] = screen.getAllByRole("button", { name: /^Submit$/ });
    expect(submitButton).toBeEnabled();
    await user.click(submitButton);
    expect(submitCode).toHaveBeenCalled();
  });

  it("shows Running.../Submitting... labels while a submission is in flight", () => {
    useUserStore.setState({
      authProfile: buildAuthUser(),
      user: buildUser({ permissions: [Permissions.SUBMISSION_CREATE] }),
    });
    useWorkspaceStore.setState({ isSubmittingSubmission: true });

    renderHeader();

    expect(
      screen.getAllByRole("button", { name: /Running/ }).length
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByRole("button", { name: /Submitting/ }).length
    ).toBeGreaterThan(0);
  });

  it("links View Submissions to the problem's submissions route", () => {
    renderHeader();

    const [link] = screen.getAllByRole("link", { name: "View Submissions" });
    expect(link).toHaveAttribute(
      "href",
      routerConfig.problemSubmissions.execute({ slug: "two-sum" })
    );
  });

  it("submits with Ctrl+Enter when the user has permission", () => {
    useUserStore.setState({
      authProfile: buildAuthUser(),
      user: buildUser({ permissions: [Permissions.SUBMISSION_CREATE] }),
    });

    renderHeader();

    const event = new KeyboardEvent("keydown", {
      key: "Enter",
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    });
    window.dispatchEvent(event);

    expect(submitCode).toHaveBeenCalled();
  });
});
