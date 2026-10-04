import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useProblemSetupSync } from "./use-problem-setup-sync";
import { useProblemSetupStore } from "../state/problem-setup-store";
import { useProblemSetup } from "../api/get-problem-setup";
import { useWorkspaceStore } from "@/domains/workspace/state/workspace-store";
import { buildProblem, buildProblemSetup } from "@/test/factories/problem";

vi.mock("../api/get-problem-setup", () => ({
  useProblemSetup: vi.fn(),
}));

const mockedUseProblemSetup = vi.mocked(useProblemSetup);

function mockQuery(
  overrides: Partial<ReturnType<typeof useProblemSetup>> = {}
) {
  mockedUseProblemSetup.mockReturnValue({
    data: undefined,
    isLoading: false,
    error: null,
    ...overrides,
  } as unknown as ReturnType<typeof useProblemSetup>);
}

describe("useProblemSetupSync", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useProblemSetupStore.setState({ currentProblem: null });
    useWorkspaceStore.getState().reset();
    mockQuery();
  });

  it("is disabled and reports not loading when there is no current problem", () => {
    const { result } = renderHook(() => useProblemSetupSync());

    expect(mockedUseProblemSetup.mock.calls[0][0].queryConfig).toEqual({
      enabled: false,
    });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.setup).toBeNull();
  });

  it("is disabled when a problem is set but no version is selected yet", () => {
    useProblemSetupStore.setState({ currentProblem: buildProblem() });

    renderHook(() => useProblemSetupSync());

    expect(mockedUseProblemSetup.mock.calls[0][0].queryConfig).toEqual({
      enabled: false,
    });
  });

  it("enables the query once a problem and version are both set", () => {
    useProblemSetupStore.setState({
      currentProblem: buildProblem({ slug: "two-sum" }),
    });
    useWorkspaceStore.setState({ selectedVersionId: "lang_1" });

    renderHook(() => useProblemSetupSync());

    expect(mockedUseProblemSetup.mock.calls[0][0]).toMatchObject({
      slug: "two-sum",
      languageVersionId: "lang_1",
      queryConfig: { enabled: true },
    });
  });

  it("syncs loaded setup data into the workspace store", () => {
    useProblemSetupStore.setState({
      currentProblem: buildProblem({ slug: "two-sum" }),
    });
    useWorkspaceStore.setState({ selectedVersionId: "lang_1" });
    const setup = buildProblemSetup({ initialCode: "function twoSum() {}" });
    mockQuery({ data: setup });

    renderHook(() => useProblemSetupSync());

    expect(useWorkspaceStore.getState().code).toBe("function twoSum() {}");
    expect(useWorkspaceStore.getState().codeVersionId).toBe("lang_1");
  });

  it("surfaces the query error message", () => {
    mockQuery({ error: new Error("Failed to load setup") });

    const { result } = renderHook(() => useProblemSetupSync());

    expect(result.current.error).toBe("Failed to load setup");
  });
});
