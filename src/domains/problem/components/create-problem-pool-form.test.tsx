import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { toast } from "sonner";
import CreateProblemPoolForm from "./create-problem-pool-form";
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

function renderForm() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return render(<CreateProblemPoolForm />, { wrapper: Wrapper });
}

describe("CreateProblemPoolForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("disables the button until both key and name are filled in", async () => {
    const user = userEvent.setup();
    renderForm();

    expect(screen.getByRole("button", { name: "New pool" })).toBeDisabled();

    await user.type(screen.getByLabelText("Key"), "daily");
    expect(screen.getByRole("button", { name: "New pool" })).toBeDisabled();

    await user.type(screen.getByLabelText("Name"), "Daily challenge");
    expect(screen.getByRole("button", { name: "New pool" })).toBeEnabled();
  });

  it("creates the pool, clears the fields, and shows a success toast", async () => {
    const user = userEvent.setup();
    mockedHttp.post.mockResolvedValue("pool_1");
    renderForm();

    await user.type(screen.getByLabelText("Key"), "Daily ");
    await user.type(screen.getByLabelText("Name"), "Daily challenge");
    await user.click(screen.getByRole("button", { name: "New pool" }));

    await waitFor(() => {
      expect(mockedHttp.post).toHaveBeenCalledWith(
        "/api/v1/problempool",
        { key: "daily", name: "Daily challenge", description: undefined },
        expect.anything()
      );
    });
    expect(toast.success).toHaveBeenCalledWith(
      'Pool "Daily challenge" created'
    );
    expect(screen.getByLabelText("Key")).toHaveValue("");
    expect(screen.getByLabelText("Name")).toHaveValue("");
  });

  it("shows an error toast when creation fails", async () => {
    const user = userEvent.setup();
    mockedHttp.post.mockRejectedValue(new Error("Key already exists"));
    renderForm();

    await user.type(screen.getByLabelText("Key"), "daily");
    await user.type(screen.getByLabelText("Name"), "Daily challenge");
    await user.click(screen.getByRole("button", { name: "New pool" }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Key already exists");
    });
  });
});
