import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { toast } from "sonner";
import SubmitForValidationButton from "./submit-for-validation-button";
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
  return render(<SubmitForValidationButton problemId="problem_1" />, {
    wrapper: Wrapper,
  });
}

describe("SubmitForValidationButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("submits the problem for validation and shows a success toast", async () => {
    const user = userEvent.setup();
    mockedHttp.post.mockResolvedValue(undefined);
    renderButton();

    await user.click(
      screen.getByRole("button", { name: "Submit for validation" })
    );

    await waitFor(() =>
      expect(mockedHttp.post).toHaveBeenCalledWith(
        "/api/v1/problem/admin/problem_1/submit-for-validation",
        {},
        expect.anything()
      )
    );
    expect(toast.success).toHaveBeenCalledWith("Submitted for validation");
  });

  it("shows an error toast when submission fails", async () => {
    const user = userEvent.setup();
    mockedHttp.post.mockRejectedValue(new Error("Missing reference solution"));
    renderButton();

    await user.click(
      screen.getByRole("button", { name: "Submit for validation" })
    );

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Missing reference solution")
    );
  });
});
