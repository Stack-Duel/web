import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { toast } from "sonner";
import RequiredProblemLanguagesTable from "./required-problem-languages-table";
import { http } from "@/shared/lib/http";
import type { RequiredProblemLanguage } from "../models/required-language";

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

function buildLanguage(
  overrides: Partial<RequiredProblemLanguage> = {}
): RequiredProblemLanguage {
  return {
    id: "lang_1",
    languageVersionId: "version_1",
    languageName: "Python",
    versionLabel: "3.13",
    sortOrder: 0,
    trackId: "track_1",
    trackKey: "general-purpose",
    trackName: "General Purpose",
    ...overrides,
  };
}

function renderTable() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return render(<RequiredProblemLanguagesTable />, { wrapper: Wrapper });
}

describe("RequiredProblemLanguagesTable", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists each required language's name and version", async () => {
    mockedHttp.get.mockResolvedValue([
      buildLanguage({ languageName: "Python", versionLabel: "3.13" }),
      buildLanguage({
        id: "lang_2",
        languageName: "JavaScript",
        versionLabel: "Node 22",
      }),
    ]);

    renderTable();

    expect(await screen.findByText("Python")).toBeVisible();
    expect(screen.getByText("3.13")).toBeVisible();
    expect(screen.getByText("JavaScript")).toBeVisible();
    expect(screen.getByText("Node 22")).toBeVisible();
  });

  it("removes a language and shows a success toast", async () => {
    const user = userEvent.setup();
    mockedHttp.get.mockResolvedValue([
      buildLanguage({ id: "lang_1", languageName: "Python" }),
    ]);
    mockedHttp.delete.mockResolvedValue(undefined);

    renderTable();

    await screen.findByText("Python");
    await user.click(screen.getByRole("button", { name: "Remove" }));

    await waitFor(() =>
      expect(mockedHttp.delete).toHaveBeenCalledWith(
        "/api/v1/problem-required-language/admin/lang_1",
        expect.anything()
      )
    );
    expect(toast.success).toHaveBeenCalledWith("Removed Python");
  });

  it("shows an error toast when removal fails", async () => {
    const user = userEvent.setup();
    mockedHttp.get.mockResolvedValue([buildLanguage()]);
    mockedHttp.delete.mockRejectedValue(new Error("Cannot remove language"));

    renderTable();

    await screen.findByText("Python");
    await user.click(screen.getByRole("button", { name: "Remove" }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Cannot remove language")
    );
  });
});
