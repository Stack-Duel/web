import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { toast } from "sonner";
import SampleTestCaseEditor from "./sample-test-case-editor";
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
    <SampleTestCaseEditor problemId="problem_1" initialTestCases={[]} />,
    { wrapper: Wrapper }
  );
}

describe("SampleTestCaseEditor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("starts with one empty test case with one input", () => {
    renderEditor();

    expect(screen.getByPlaceholderText("Example 1")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Value")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Remove test case" })
    ).toBeDisabled();
    expect(screen.getByRole("button", { name: "Remove input" })).toBeDisabled();
  });

  it("adds and removes test cases", async () => {
    const user = userEvent.setup();
    renderEditor();

    await user.click(screen.getByRole("button", { name: "Add test case" }));
    expect(
      screen.getAllByRole("button", { name: "Remove test case" })
    ).toHaveLength(2);

    await user.click(
      screen.getAllByRole("button", { name: "Remove test case" })[1]
    );
    expect(
      screen.getAllByRole("button", { name: "Remove test case" })
    ).toHaveLength(1);
  });

  it("adds and removes inputs within a test case", async () => {
    const user = userEvent.setup();
    renderEditor();

    await user.click(screen.getByRole("button", { name: "Add input" }));
    expect(screen.getAllByPlaceholderText("Value")).toHaveLength(2);
    expect(
      screen.getAllByRole("button", { name: "Remove input" })
    ).toHaveLength(2);

    await user.click(
      screen.getAllByRole("button", { name: "Remove input" })[1]
    );
    expect(screen.getAllByPlaceholderText("Value")).toHaveLength(1);
  });

  it("requires every input to have a value before saving", async () => {
    const user = userEvent.setup();
    renderEditor();

    await user.click(
      screen.getByRole("button", { name: "Save sample test cases" })
    );

    expect(toast.error).toHaveBeenCalledWith("Every input needs a value.");
    expect(mockedHttp.put).not.toHaveBeenCalled();
  });

  it("requires every test case to have an expected output before saving", async () => {
    const user = userEvent.setup();
    renderEditor();

    await user.type(screen.getByPlaceholderText("Value"), "5");
    await user.click(
      screen.getByRole("button", { name: "Save sample test cases" })
    );

    expect(toast.error).toHaveBeenCalledWith(
      "Every test case needs an expected output."
    );
    expect(mockedHttp.put).not.toHaveBeenCalled();
  });

  it("saves the test case and shows a success toast", async () => {
    const user = userEvent.setup();
    mockedHttp.put.mockResolvedValue(undefined);
    renderEditor();

    await user.type(screen.getByPlaceholderText("Example 1"), "Basic case");
    await user.type(screen.getByPlaceholderText("Value"), "5");
    await user.type(screen.getByLabelText("Expected output"), "120");

    await user.click(
      screen.getByRole("button", { name: "Save sample test cases" })
    );

    await waitFor(() =>
      expect(mockedHttp.put).toHaveBeenCalledWith(
        "/api/v1/problem/admin/problem_1/sample-test-cases",
        {
          testCases: [
            {
              name: "Basic case",
              inputs: [{ value: "5", valueType: "integer" }],
              expectedOutputValue: "120",
              expectedOutputValueType: "integer",
            },
          ],
        },
        expect.anything()
      )
    );
    expect(toast.success).toHaveBeenCalledWith("Saved sample test cases");
  });

  it("shows an error toast when saving fails", async () => {
    const user = userEvent.setup();
    mockedHttp.put.mockRejectedValue(new Error("Invalid test case"));
    renderEditor();

    await user.type(screen.getByPlaceholderText("Value"), "5");
    await user.type(screen.getByLabelText("Expected output"), "120");
    await user.click(
      screen.getByRole("button", { name: "Save sample test cases" })
    );

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Invalid test case")
    );
  });

  it("changes the expected output type", async () => {
    const user = userEvent.setup();
    renderEditor();

    const [, expectedOutputTypeSelect] = screen.getAllByRole("combobox");
    await user.click(expectedOutputTypeSelect);
    await user.click(await screen.findByRole("option", { name: "string" }));

    expect(expectedOutputTypeSelect).toHaveTextContent("string");
  });
});
