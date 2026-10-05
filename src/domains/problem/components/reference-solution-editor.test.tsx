import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { toast } from "sonner";
import ReferenceSolutionEditor from "./reference-solution-editor";
import { http } from "@/shared/lib/http";
import { buildAdminProblemSetup } from "@/test/factories/problem";

vi.mock(
  "@/domains/workspace/solution-editor/components/solution-editor",
  () => ({
    default: ({
      value,
      onChange,
    }: {
      value: string;
      onChange: (value: string) => void;
    }) => <textarea value={value} onChange={(e) => onChange(e.target.value)} />,
  })
);
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

const mockedHttp = vi.mocked(http, { deep: true });

function renderEditor(setup = buildAdminProblemSetup()) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return render(
    <ReferenceSolutionEditor problemId="problem_1" setup={setup} />,
    { wrapper: Wrapper }
  );
}

describe("ReferenceSolutionEditor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("requires a non-empty reference solution before saving", async () => {
    const user = userEvent.setup();
    renderEditor(buildAdminProblemSetup({ referenceSolutionCode: null }));

    await user.click(
      screen.getByRole("button", { name: "Save reference solution" })
    );

    expect(toast.error).toHaveBeenCalledWith(
      "A reference solution is required."
    );
    expect(mockedHttp.put).not.toHaveBeenCalled();
  });

  it("saves the reference solution and shows a success toast", async () => {
    const user = userEvent.setup();
    mockedHttp.put.mockResolvedValue("setup_1");
    renderEditor(
      buildAdminProblemSetup({
        id: "setup_1",
        languageVersionId: "lang_1",
        languageName: "JavaScript",
        initialCode: "function solve() {}",
        referenceSolutionCode: null,
        functionName: "solve",
      })
    );

    const [, , referenceSolutionEditor] = screen.getAllByRole("textbox");
    fireEvent.change(referenceSolutionEditor, {
      target: { value: "function solve() { return 1; }" },
    });
    await user.click(
      screen.getByRole("button", { name: "Save reference solution" })
    );

    await waitFor(() =>
      expect(mockedHttp.put).toHaveBeenCalledWith(
        "/api/v1/problem/admin/problem_1/setups/reference-solution",
        expect.objectContaining({
          languageVersionId: "lang_1",
          functionName: "solve",
          referenceSolutionCode: "function solve() { return 1; }",
        }),
        expect.anything()
      )
    );
    expect(toast.success).toHaveBeenCalledWith(
      "Saved JavaScript reference solution"
    );
  });

  it("shows an error toast when saving fails", async () => {
    const user = userEvent.setup();
    mockedHttp.put.mockRejectedValue(new Error("Invalid reference solution"));
    renderEditor(buildAdminProblemSetup({ referenceSolutionCode: "code" }));

    await user.click(
      screen.getByRole("button", { name: "Save reference solution" })
    );

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Invalid reference solution")
    );
  });
});
