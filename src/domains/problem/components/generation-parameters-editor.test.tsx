import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { toast } from "sonner";
import GenerationParametersEditor from "./generation-parameters-editor";
import { http } from "@/shared/lib/http";

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

function renderEditor() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return render(
    <GenerationParametersEditor
      problemId="problem_1"
      initialParameters={[]}
      initialOutputValueType={null}
      initialTargetCaseCount={null}
      initialSeed={null}
    />,
    { wrapper: Wrapper }
  );
}

describe("GenerationParametersEditor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("starts with one empty integer parameter and default output settings", () => {
    renderEditor();

    expect(screen.getByLabelText("Name")).toHaveValue("");
    expect(screen.getByLabelText("Target case count")).toHaveValue(20);
    expect(screen.getByLabelText("Seed")).toHaveValue(12345);
    expect(
      screen.getByRole("button", { name: "Remove parameter" })
    ).toBeDisabled();
  });

  it("adds and removes parameter rows", async () => {
    const user = userEvent.setup();
    renderEditor();

    await user.click(screen.getByRole("button", { name: "Add parameter" }));
    expect(
      screen.getAllByRole("button", { name: "Remove parameter" })
    ).toHaveLength(2);
    for (const button of screen.getAllByRole("button", {
      name: "Remove parameter",
    })) {
      expect(button).toBeEnabled();
    }

    await user.click(
      screen.getAllByRole("button", { name: "Remove parameter" })[1]
    );
    expect(
      screen.getAllByRole("button", { name: "Remove parameter" })
    ).toHaveLength(1);
  });

  it("requires every parameter to have a name before saving", async () => {
    const user = userEvent.setup();
    renderEditor();

    await user.click(
      screen.getByRole("button", { name: "Save generation parameters" })
    );

    expect(toast.error).toHaveBeenCalledWith("Every parameter needs a name.");
    expect(mockedHttp.put).not.toHaveBeenCalled();
  });

  it("fills in min/max bounds and saves the parameters", async () => {
    const user = userEvent.setup();
    mockedHttp.put.mockResolvedValue(undefined);
    renderEditor();

    await user.type(screen.getByLabelText("Name"), "x");
    await user.type(screen.getByLabelText("Min"), "0");
    await user.type(screen.getByLabelText("Max"), "1000");

    await user.click(
      screen.getByRole("button", { name: "Save generation parameters" })
    );

    await waitFor(() =>
      expect(mockedHttp.put).toHaveBeenCalledWith(
        "/api/v1/problem/admin/problem_1/generation-parameters",
        expect.objectContaining({
          parameters: [
            expect.objectContaining({
              name: "x",
              valueType: "integer",
              min: 0,
              max: 1000,
            }),
          ],
          outputValueType: "integer",
          targetCaseCount: 20,
          seed: 12345,
        }),
        expect.anything()
      )
    );
    expect(toast.success).toHaveBeenCalledWith("Saved generation parameters");
  });

  it("shows an error toast when saving fails", async () => {
    const user = userEvent.setup();
    mockedHttp.put.mockRejectedValue(new Error("Invalid parameters"));
    renderEditor();

    await user.type(screen.getByLabelText("Name"), "x");
    await user.click(
      screen.getByRole("button", { name: "Save generation parameters" })
    );

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Invalid parameters")
    );
  });

  it("updates the target case count and seed", async () => {
    const user = userEvent.setup();
    mockedHttp.put.mockResolvedValue(undefined);
    renderEditor();

    await user.type(screen.getByLabelText("Name"), "x");
    await user.clear(screen.getByLabelText("Target case count"));
    await user.type(screen.getByLabelText("Target case count"), "50");
    await user.clear(screen.getByLabelText("Seed"));
    await user.type(screen.getByLabelText("Seed"), "777");

    await user.click(
      screen.getByRole("button", { name: "Save generation parameters" })
    );

    await waitFor(() =>
      expect(mockedHttp.put).toHaveBeenCalledWith(
        "/api/v1/problem/admin/problem_1/generation-parameters",
        expect.objectContaining({ targetCaseCount: 50, seed: 777 }),
        expect.anything()
      )
    );
  });
});
