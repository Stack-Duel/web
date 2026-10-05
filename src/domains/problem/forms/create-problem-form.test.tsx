import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { toast } from "sonner";
import CreateProblemForm from "./create-problem-form";
import { http } from "@/shared/lib/http";
import { routerMock } from "@/test/mocks/next-navigation";

vi.mock("next/navigation", () => import("@/test/mocks/next-navigation"));
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
  return render(<CreateProblemForm />, { wrapper: Wrapper });
}

describe("CreateProblemForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedHttp.get.mockResolvedValue([
      {
        id: "track_1",
        key: "general-purpose",
        name: "General Purpose",
        allowsLanguageSelection: true,
        languages: [],
      },
    ]);
  });

  it("requires a title and question before creating a draft", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole("button", { name: "Create draft" }));

    expect(toast.error).toHaveBeenCalledWith(
      "Title and question are required."
    );
    expect(mockedHttp.post).not.toHaveBeenCalled();
  });

  it("requires a track before creating a draft", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText("Title"), "Two Sum");
    await user.type(screen.getByLabelText("Question"), "Given an array...");
    await user.click(screen.getByRole("button", { name: "Create draft" }));

    expect(toast.error).toHaveBeenCalledWith("Track is required.");
    expect(mockedHttp.post).not.toHaveBeenCalled();
  });

  it("creates the draft and navigates to its detail page", async () => {
    const user = userEvent.setup();
    mockedHttp.post.mockResolvedValue("problem_1");
    renderForm();

    await user.type(screen.getByLabelText("Title"), "Two Sum");
    await user.type(screen.getByLabelText("Question"), "Given an array...");

    await user.click(screen.getByRole("combobox"));
    await user.click(
      await screen.findByRole("option", { name: "General Purpose" })
    );

    await user.click(screen.getByRole("button", { name: "Create draft" }));

    await waitFor(() =>
      expect(mockedHttp.post).toHaveBeenCalledWith(
        "/api/v1/problem/admin",
        expect.objectContaining({
          title: "Two Sum",
          question: "Given an array...",
          trackId: "track_1",
        }),
        expect.anything()
      )
    );
    expect(toast.success).toHaveBeenCalledWith("Draft created");
    expect(routerMock.push).toHaveBeenCalledWith("/admin/problems/problem_1");
  });

  it("shows an error toast when creation fails", async () => {
    const user = userEvent.setup();
    mockedHttp.post.mockRejectedValue(new Error("Slug already exists"));
    renderForm();

    await user.type(screen.getByLabelText("Title"), "Two Sum");
    await user.type(screen.getByLabelText("Question"), "Given an array...");
    await user.click(screen.getByRole("combobox"));
    await user.click(
      await screen.findByRole("option", { name: "General Purpose" })
    );
    await user.click(screen.getByRole("button", { name: "Create draft" }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Slug already exists")
    );
  });
});
