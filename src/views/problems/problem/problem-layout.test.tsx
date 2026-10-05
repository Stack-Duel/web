import { beforeEach, describe, expect, it, vi } from "vitest";
import { useMyActiveGames } from "@/domains/game/api/get-my-active-games";
vi.mock("@/domains/feature-flags/hooks/use-feature-flag", () => ({
  useFeatureFlag: () => true,
}));
import { render, screen } from "@testing-library/react";
import ProblemLayout from "./problem-layout";
import { useUser } from "@auth0/nextjs-auth0";
import { useIsMobile } from "@/shared/hooks/use-mobile";
import { useInitializeProblem } from "@/domains/problem/hooks/use-problem-actions";
import { useProblemSetupSync } from "@/domains/problem/hooks/use-problem-setup-sync";
import Workspace from "@/domains/workspace/components/workspace";
import { useWorkspaceStore } from "@/domains/workspace/state/workspace-store";
import type { EditorWindowTabNode } from "@/domains/workspace/editor-window/state/editor-window-store";
import type { Problem } from "@/domains/problem/models/problem";

vi.mock(
  "@auth0/nextjs-auth0",
  () => import("@/test/mocks/nextjs-auth0-client")
);
vi.mock(
  "@/domains/user/hooks/use-user-sync",
  () => import("@/test/mocks/use-user-sync")
);
vi.mock("@/env", () => import("@/test/mocks/env"));
vi.mock("@/shared/hooks/use-mobile");
vi.mock("@/domains/problem/hooks/use-problem-actions");
vi.mock("@/domains/problem/hooks/use-problem-setup-sync");
vi.mock("@/domains/workspace/components/workspace");
vi.mock("@/domains/workspace/components/workspace-header", () => ({
  WorkspaceHeader: () => <div>workspace-header</div>,
}));
vi.mock("@/domains/problem/components/problem-question", () => ({
  ProblemQuestion: () => <div>problem-question</div>,
}));
vi.mock("@/domains/problem/components/problem-test-cases", () => ({
  default: () => <div>problem-test-cases</div>,
}));
vi.mock("@/domains/submission/components/submission-status-panel", () => ({
  default: () => <div>submission-status-panel</div>,
}));
vi.mock("./problem-solution-editor", () => ({
  default: () => <div>problem-solution-editor</div>,
  ProblemSolutionFileEditor: () => <div>problem-solution-file-editor</div>,
}));
vi.mock("@/app/problems/[slug]/loading", () => ({
  default: () => <div>problem-loading</div>,
}));
vi.mock("next/navigation", () => import("@/test/mocks/next-navigation"));
vi.mock("@/domains/game/api/get-my-active-games", () => ({
  useMyActiveGames: vi.fn(),
}));

const mockUseUser = vi.mocked(useUser);
const mockUseIsMobile = vi.mocked(useIsMobile);
const mockUseInitializeProblem = vi.mocked(useInitializeProblem);
const mockUseProblemSetupSync = vi.mocked(useProblemSetupSync);
const mockWorkspace = vi.mocked(Workspace);

const problem: Problem = {
  id: "p1",
  slug: "two-sum",
  title: "Two Sum",
  difficultyTier: "Easy",
  question: "",
  availableLanguages: [],
  publicTestCases: [],
};

const reactProblem: Problem = {
  ...problem,
  availableLanguages: [
    {
      id: "lang-react",
      name: "React",
      versions: [{ id: "v-react", version: "18" }],
    },
  ],
};

const initialWorkspaceState = useWorkspaceStore.getState();

const mockUseMyActiveGames = vi.mocked(useMyActiveGames);
describe("ProblemLayout", () => {
  const initializeProblem = vi.fn();

  beforeEach(() => {
    mockUseMyActiveGames.mockReturnValue({
      data: undefined,
    } as unknown as ReturnType<typeof useMyActiveGames>);
    useWorkspaceStore.setState(initialWorkspaceState, true);
    mockUseUser.mockReturnValue({
      user: undefined,
      isLoading: false,
      error: undefined,
      invalidate: vi.fn(),
    });
    mockUseInitializeProblem.mockReturnValue(initializeProblem);
    mockUseProblemSetupSync.mockReturnValue({
      setup: undefined,
    } as unknown as ReturnType<typeof useProblemSetupSync>);
    mockWorkspace.mockImplementation(() => <div data-testid="workspace" />);
  });

  function getRenderedTab(): EditorWindowTabNode {
    const lastCall =
      mockWorkspace.mock.calls[mockWorkspace.mock.calls.length - 1];
    return lastCall[0].tab;
  }

  it("shows the loading page while the mobile/desktop layout is undetermined", () => {
    mockUseIsMobile.mockReturnValue(undefined as unknown as boolean);

    render(<ProblemLayout problem={problem} />);

    expect(screen.getByText("problem-loading")).toBeVisible();
  });

  it("initializes the problem once on mount", () => {
    mockUseIsMobile.mockReturnValue(false);

    render(<ProblemLayout problem={problem} />);

    expect(initializeProblem).toHaveBeenCalledWith(problem);
  });

  it("renders the workspace header and workspace once the layout is determined", () => {
    mockUseIsMobile.mockReturnValue(false);

    render(<ProblemLayout problem={problem} />);

    expect(screen.getByText("workspace-header")).toBeVisible();
    expect(screen.getByTestId("workspace")).toBeVisible();
  });

  it("builds a single-column tab tree on mobile", () => {
    mockUseIsMobile.mockReturnValue(true);

    render(<ProblemLayout problem={problem} />);

    const tab = getRenderedTab();

    expect(tab.orientation).toBeUndefined();
    expect(tab.children?.map((c) => c.key)).toEqual([
      "code",
      "problem",
      "tests",
      "submission",
    ]);
  });

  it("builds a two-column horizontal split on desktop", () => {
    mockUseIsMobile.mockReturnValue(false);

    render(<ProblemLayout problem={problem} />);

    const tab = getRenderedTab();

    expect(tab.orientation).toBe("horizontal");
    expect(tab.children?.map((c) => c.key)).toEqual(["code", "right-column"]);
    expect(tab.children?.[1]?.orientation).toBe("vertical");
  });

  it("builds an open, closable tab per open additional file for a React problem", () => {
    mockUseIsMobile.mockReturnValue(false);
    useWorkspaceStore.setState({
      selectedVersionId: "v-react",
      additionalFiles: [
        { path: "Helper.jsx", content: "" },
        { path: "Utils.jsx", content: "" },
      ],
      openFileKeys: ["Helper.jsx"],
    });

    render(<ProblemLayout problem={reactProblem} />);

    const codeTab = getRenderedTab().children?.[0];
    expect(codeTab?.children?.map((c) => c.key)).toEqual([
      "__main__",
      "Helper.jsx",
    ]);
    expect(codeTab?.children?.[0].onClose).toBeUndefined();
    expect(codeTab?.children?.[1].onClose).toBeInstanceOf(Function);
  });

  it("closing a file tab removes it from the open files without deleting it", () => {
    mockUseIsMobile.mockReturnValue(false);
    useWorkspaceStore.setState({
      selectedVersionId: "v-react",
      additionalFiles: [{ path: "Helper.jsx", content: "code" }],
      openFileKeys: ["Helper.jsx"],
    });

    render(<ProblemLayout problem={reactProblem} />);

    getRenderedTab().children?.[0].children?.[1].onClose?.();

    expect(useWorkspaceStore.getState().openFileKeys).toEqual([]);
    expect(useWorkspaceStore.getState().additionalFiles).toEqual([
      { path: "Helper.jsx", content: "code" },
    ]);
  });
});
