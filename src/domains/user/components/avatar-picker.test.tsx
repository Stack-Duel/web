import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { toast } from "sonner";
import AvatarPicker from "./avatar-picker";
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

function renderPicker() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return render(<AvatarPicker />, { wrapper: Wrapper });
}

describe("AvatarPicker", () => {
  it("marks the current avatar and lets you pick a previous one", async () => {
    const user = userEvent.setup();
    mockedHttp.get.mockResolvedValue([
      { id: "a1", url: "https://x.test/1.png", createdAt: "", isCurrent: true },
      {
        id: "a2",
        url: "https://x.test/2.png",
        createdAt: "",
        isCurrent: false,
      },
    ]);
    mockedHttp.put.mockResolvedValue(undefined);

    renderPicker();

    expect(await screen.findByLabelText("Current avatar")).toBeVisible();
    await user.click(screen.getByLabelText("Use this avatar"));

    await waitFor(() => {
      expect(mockedHttp.put).toHaveBeenCalledWith(
        "/api/v1/user/avatar/a2",
        undefined,
        expect.anything()
      );
    });
    expect(toast.success).toHaveBeenCalledWith("Avatar updated");
  });

  it("uploads a chosen file and shows a success toast", async () => {
    const user = userEvent.setup();
    mockedHttp.get.mockResolvedValue([]);
    mockedHttp.post.mockResolvedValue("https://x.test/new.png");

    renderPicker();
    const file = new File(["content"], "avatar.png", { type: "image/png" });
    const input = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;

    await user.upload(input, file);

    await waitFor(() => {
      expect(mockedHttp.post).toHaveBeenCalledWith(
        "/api/v1/user/avatar",
        expect.any(FormData),
        expect.anything()
      );
    });
    expect(toast.success).toHaveBeenCalledWith("Avatar updated");
  });

  it("shows an error toast when the upload fails", async () => {
    const user = userEvent.setup();
    mockedHttp.get.mockResolvedValue([]);
    mockedHttp.post.mockRejectedValue(new Error("Upload failed"));

    renderPicker();
    const file = new File(["content"], "avatar.png", { type: "image/png" });
    const input = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;

    await user.upload(input, file);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Upload failed");
    });
  });
});
