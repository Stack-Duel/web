import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http } from "@/shared/lib/http";
import { buildStudioProblemSetup } from "@/test/factories/studio-problem-setup";
import { useSuspenseStudioProblemSetups } from "@/domains/studio/api/get-studio-problem-setups";
import type { StudioProblemSetup } from "@/domains/studio/models/studio-problem-setup";
import StudioProblemEditSetups from "./studio-problem-edit-setups";
import { StudioProblemSetupsProvider } from "./studio-problem-setups-store-context";

vi.mock("@/shared/lib/http", () => ({
  http: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));
vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));
vi.mock("@/domains/studio/api/get-studio-problem-setups", () => ({
  useSuspenseStudioProblemSetups: vi.fn(),
}));
const renderCounts = new Map<string, number>();

function countRender(key: string) {
  renderCounts.set(key, (renderCounts.get(key) ?? 0) + 1);
}

vi.mock("@/shared/components/ui/input", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/shared/components/ui/input")>();

  return {
    ...actual,
    Input: (props: React.ComponentProps<typeof actual.Input>) => {
      countRender(`input:${props.id ?? "unknown"}`);
      return <actual.Input {...props} />;
    },
  };
});

vi.mock(
  "@/domains/workspace/solution-editor/components/solution-editor",
  () => ({
    default: ({
      value,
      onChange,
      ...props
    }: {
      value: string;
      onChange: (value: string) => void;
      "aria-label"?: string;
    }) => {
      const label = props["aria-label"] ?? "";
      countRender(label);

      return (
        <textarea
          aria-label={label}
          data-render-count={renderCounts.get(label)}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    },
  })
);

const mockedHttp = vi.mocked(http, { deep: true });
const mockedUseSetups = vi.mocked(useSuspenseStudioProblemSetups);

function renderSetups(setups: StudioProblemSetup[]) {
  mockedUseSetups.mockReturnValue({ data: setups } as unknown as ReturnType<
    typeof useSuspenseStudioProblemSetups
  >);

  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <StudioProblemSetupsProvider>{children}</StudioProblemSetupsProvider>
    </QueryClientProvider>
  );

  return render(
    <StudioProblemEditSetups problemId="problem_1" trackId="track_1" />,
    { wrapper: Wrapper }
  );
}

const pythonSetup = buildStudioProblemSetup({
  languageVersionId: "python-3.13",
  language: "Python",
  languageVersion: "3.13",
  starterCode: "def solve():",
  functionName: "solve",
  referenceSolution: "def solve(): return 1",
});

beforeEach(() => {
  vi.clearAllMocks();
  renderCounts.clear();
  mockedHttp.get.mockImplementation((url: string) =>
    url === "/api/v1/studio/problems/initial-values"
      ? Promise.resolve({ availableTracks: [] })
      : Promise.resolve([])
  );
});

describe("StudioProblemEditSetups", () => {
  it("keeps unsaved edits when the accordion is collapsed and reopened", async () => {
    const user = userEvent.setup();
    renderSetups([pythonSetup]);

    await user.click(screen.getByRole("button", { name: /Python 3.13/ }));

    const functionName = await screen.findByLabelText("Function name");
    await user.clear(functionName);
    await user.type(functionName, "twoSum");

    await user.click(screen.getByRole("button", { name: /Python 3.13/ }));
    await waitFor(() =>
      expect(screen.queryByLabelText("Function name")).not.toBeInTheDocument()
    );

    await user.click(screen.getByRole("button", { name: /Python 3.13/ }));

    expect(await screen.findByLabelText("Function name")).toHaveValue("twoSum");
  });

  it("keeps unsaved editor content when the accordion is collapsed and reopened", async () => {
    const user = userEvent.setup();
    renderSetups([pythonSetup]);

    await user.click(screen.getByRole("button", { name: /Python 3.13/ }));

    const starterCode = await screen.findByLabelText("Python starter code");
    await user.clear(starterCode);
    await user.type(starterCode, "def twoSum(nums):");

    await user.click(screen.getByRole("button", { name: /Python 3.13/ }));
    await waitFor(() =>
      expect(
        screen.queryByLabelText("Python starter code")
      ).not.toBeInTheDocument()
    );

    await user.click(screen.getByRole("button", { name: /Python 3.13/ }));

    expect(await screen.findByLabelText("Python starter code")).toHaveValue(
      "def twoSum(nums):"
    );
  });

  it("does not re-render the other code editor while one is typed in", async () => {
    const user = userEvent.setup();
    renderSetups([pythonSetup]);

    await user.click(screen.getByRole("button", { name: /Python 3.13/ }));

    const starterCode = await screen.findByLabelText("Python starter code");

    await user.type(starterCode, "x");

    const referenceSolution = screen.getByLabelText(
      "Python reference solution"
    );
    const rendersAfterDirtyFlip = renderCounts.get("Python reference solution");

    await user.type(starterCode, "yz");

    expect(renderCounts.get("Python reference solution")).toBe(
      rendersAfterDirtyFlip
    );
    expect(referenceSolution).toHaveValue("def solve(): return 1");
    expect(starterCode).toHaveValue("def solve():xyz");
  });

  it("leaves the function name field alone while a code editor is typed in", async () => {
    const user = userEvent.setup();
    renderSetups([pythonSetup]);

    await user.click(screen.getByRole("button", { name: /Python 3.13/ }));

    const starterCode = await screen.findByLabelText("Python starter code");
    await user.type(starterCode, "x");

    const functionName = screen.getByLabelText("Function name");
    const key = "input:studio-setup-function-name-python-3.13";
    const rendersAfterDirtyFlip = renderCounts.get(key);

    await user.type(starterCode, "yz");

    expect(renderCounts.get(key)).toBe(rendersAfterDirtyFlip);
    expect(functionName).toHaveValue("solve");
  });

  it("flags unsaved work on the collapsed row", async () => {
    const user = userEvent.setup();
    renderSetups([pythonSetup]);

    const trigger = screen.getByRole("button", { name: /Python 3.13/ });

    expect(
      within(trigger).queryByText("Unsaved changes")
    ).not.toBeInTheDocument();

    await user.click(trigger);
    const functionName = await screen.findByLabelText("Function name");
    await user.type(functionName, "X");
    await user.click(trigger);

    expect(within(trigger).getByText("Unsaved changes")).toBeVisible();
  });

  it("keeps each language's edits separate", async () => {
    const user = userEvent.setup();
    renderSetups([
      pythonSetup,
      buildStudioProblemSetup({
        languageVersionId: "js-22",
        language: "JavaScript",
        languageVersion: "22",
        functionName: "solve",
      }),
    ]);

    await user.click(screen.getByRole("button", { name: /Python 3.13/ }));
    const pythonFunctionName = await screen.findByLabelText("Function name");
    await user.clear(pythonFunctionName);
    await user.type(pythonFunctionName, "pythonSolve");

    await user.click(screen.getByRole("button", { name: /JavaScript 22/ }));
    const jsFunctionName = await screen.findByLabelText("Function name");

    expect(jsFunctionName).toHaveValue("solve");

    await user.click(screen.getByRole("button", { name: /Python 3.13/ }));

    expect(await screen.findByLabelText("Function name")).toHaveValue(
      "pythonSolve"
    );
  });

  it("discards back to the loaded values on request", async () => {
    const user = userEvent.setup();
    renderSetups([pythonSetup]);

    await user.click(screen.getByRole("button", { name: /Python 3.13/ }));
    const functionName = await screen.findByLabelText("Function name");
    await user.clear(functionName);
    await user.type(functionName, "changed");
    await user.click(screen.getByRole("button", { name: "Discard changes" }));

    expect(screen.getByLabelText("Function name")).toHaveValue("solve");
  });

  it("stops flagging unsaved work once the setup is saved", async () => {
    const user = userEvent.setup();
    mockedHttp.put.mockResolvedValue("setup_1");
    renderSetups([pythonSetup]);

    const trigger = screen.getByRole("button", { name: /Python 3.13/ });
    await user.click(trigger);
    const functionName = await screen.findByLabelText("Function name");
    await user.clear(functionName);
    await user.type(functionName, "twoSum");
    await user.click(
      screen.getByRole("button", { name: "Save language setup" })
    );

    await waitFor(() =>
      expect(mockedHttp.put).toHaveBeenCalledWith(
        "/api/v1/studio/problems/problem_1/setups/reference-solution",
        {
          languageVersionId: "python-3.13",
          starterCode: "def solve():",
          functionName: "twoSum",
          referenceSolution: "def solve(): return 1",
        },
        expect.anything()
      )
    );

    await waitFor(() =>
      expect(
        within(trigger).queryByText("Unsaved changes")
      ).not.toBeInTheDocument()
    );
  });
});
