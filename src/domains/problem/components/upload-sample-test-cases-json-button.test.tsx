import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { toast } from "sonner";
import UploadSampleTestCasesJsonButton from "./upload-sample-test-cases-json-button";
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

function renderButton() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return render(<UploadSampleTestCasesJsonButton problemId="problem_1" />, {
    wrapper: Wrapper,
  });
}

async function openDialog(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "Upload JSON" }));
  return within(await screen.findByRole("dialog"));
}

describe("UploadSampleTestCasesJsonButton", () => {
  it("rejects a payload that does not match the schema", async () => {
    const user = userEvent.setup();
    renderButton();

    const dialog = await openDialog(user);
    fireEvent.change(dialog.getByRole("textbox"), {
      target: { value: JSON.stringify([{ name: "bad" }]) },
    });
    await user.click(dialog.getByRole("button", { name: "Upload" }));

    await waitFor(() => expect(toast.error).toHaveBeenCalled());
    expect(mockedHttp.put).not.toHaveBeenCalled();
  });

  it("uploads a valid payload to the sample test cases endpoint", async () => {
    const user = userEvent.setup();
    mockedHttp.put.mockResolvedValue(undefined);
    renderButton();

    const payload = [
      {
        name: "Example 1",
        inputs: [{ value: "[2,7,11,15]", valueType: "integer_array" }],
        expectedOutputValue: "[0,1]",
        expectedOutputValueType: "integer_array",
      },
    ];

    const dialog = await openDialog(user);
    fireEvent.change(dialog.getByRole("textbox"), {
      target: { value: JSON.stringify(payload) },
    });
    await user.click(dialog.getByRole("button", { name: "Upload" }));

    await waitFor(() =>
      expect(mockedHttp.put).toHaveBeenCalledWith(
        "/api/v1/problem/admin/problem_1/sample-test-cases",
        { testCases: payload },
        expect.anything()
      )
    );
    expect(toast.success).toHaveBeenCalledWith("Uploaded successfully");
  });
});
