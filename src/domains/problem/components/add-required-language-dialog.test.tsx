import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { toast } from "sonner";
import AddRequiredLanguageDialog from "./add-required-language-dialog";
import { http } from "@/shared/lib/http";
import type { ProgrammingLanguage } from "@/domains/language/models/programming-language";

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

const languages: ProgrammingLanguage[] = [
  {
    id: "python",
    name: "Python",
    versions: [{ id: "python-3.13", version: "3.13" }],
  },
  {
    id: "javascript",
    name: "JavaScript",
    versions: [{ id: "js-22", version: "22" }],
  },
];

function renderDialog() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return render(<AddRequiredLanguageDialog />, { wrapper: Wrapper });
}

describe("AddRequiredLanguageDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedHttp.get.mockImplementation((url: string) => {
      if (url === "/api/v1/language") return Promise.resolve(languages);
      if (url === "/api/v1/problem-required-language/admin")
        return Promise.resolve([]);
      return Promise.reject(new Error(`Unexpected GET ${url}`));
    });
  });

  it("excludes already-required language versions from the options", async () => {
    mockedHttp.get.mockImplementation((url: string) => {
      if (url === "/api/v1/language") return Promise.resolve(languages);
      if (url === "/api/v1/problem-required-language/admin")
        return Promise.resolve([
          {
            id: "req_1",
            languageVersionId: "python-3.13",
            languageName: "Python",
            versionLabel: "3.13",
            sortOrder: 0,
          },
        ]);
      return Promise.reject(new Error(`Unexpected GET ${url}`));
    });
    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByRole("button", { name: "Add Language" }));
    await user.click(screen.getByRole("combobox"));

    expect(
      screen.queryByRole("option", { name: "Python (3.13)" })
    ).not.toBeInTheDocument();
    expect(
      await screen.findByRole("option", { name: "JavaScript (22)" })
    ).toBeVisible();
  });

  it("requires a language selection before adding", async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByRole("button", { name: "Add Language" }));
    await user.click(screen.getByRole("button", { name: "Add language" }));

    expect(toast.error).toHaveBeenCalledWith("Select a language version.");
    expect(mockedHttp.post).not.toHaveBeenCalled();
  });

  it("adds the selected language and closes the dialog", async () => {
    const user = userEvent.setup();
    mockedHttp.post.mockResolvedValue("required_1");
    renderDialog();

    await user.click(screen.getByRole("button", { name: "Add Language" }));
    await user.click(screen.getByRole("combobox"));
    await user.click(
      await screen.findByRole("option", { name: "Python (3.13)" })
    );
    await user.click(screen.getByRole("button", { name: "Add language" }));

    await waitFor(() =>
      expect(mockedHttp.post).toHaveBeenCalledWith(
        "/api/v1/problem-required-language/admin",
        { languageVersionId: "python-3.13" },
        expect.anything()
      )
    );
    expect(toast.success).toHaveBeenCalledWith("Added required language");
    expect(
      screen.queryByRole("dialog", { name: "Add required language" })
    ).not.toBeInTheDocument();
  });

  it("shows an error toast when adding fails", async () => {
    const user = userEvent.setup();
    mockedHttp.post.mockRejectedValue(new Error("Already required"));
    renderDialog();

    await user.click(screen.getByRole("button", { name: "Add Language" }));
    await user.click(screen.getByRole("combobox"));
    await user.click(
      await screen.findByRole("option", { name: "Python (3.13)" })
    );
    await user.click(screen.getByRole("button", { name: "Add language" }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Already required")
    );
  });
});
