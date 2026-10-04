import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { toast } from "sonner";
import AddProblemSetupLanguageDialog from "./add-problem-setup-language-dialog";
import { http } from "@/shared/lib/http";
import { buildAdminProblemSetup } from "@/test/factories/problem";
import type { ProgrammingLanguage } from "@/domains/language/models/programming-language";
import type { AdminProblemSetup } from "../models/admin-problem";

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

function renderDialog(existingSetups: AdminProblemSetup[] = []) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return render(
    <AddProblemSetupLanguageDialog
      problemId="problem_1"
      existingSetups={existingSetups}
    />,
    { wrapper: Wrapper }
  );
}

async function openDialog(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "Add language" }));
  return within(await screen.findByRole("dialog"));
}

describe("AddProblemSetupLanguageDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedHttp.get.mockResolvedValue(languages);
  });

  it("excludes languages that already have a setup", async () => {
    const user = userEvent.setup();
    renderDialog([
      buildAdminProblemSetup({ languageVersionId: "python-3.13" }),
    ]);

    const dialog = await openDialog(user);
    await user.click(dialog.getByRole("combobox"));

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

    const dialog = await openDialog(user);
    await user.click(dialog.getByRole("button", { name: "Add language" }));

    expect(toast.error).toHaveBeenCalledWith("Select a language version.");
    expect(mockedHttp.post).not.toHaveBeenCalled();
  });

  it("adds the setup and closes the dialog", async () => {
    const user = userEvent.setup();
    mockedHttp.post.mockResolvedValue("setup_1");
    renderDialog();

    const dialog = await openDialog(user);
    await user.click(dialog.getByRole("combobox"));
    await user.click(
      await screen.findByRole("option", { name: "Python (3.13)" })
    );
    await user.click(dialog.getByRole("button", { name: "Add language" }));

    await waitFor(() =>
      expect(mockedHttp.post).toHaveBeenCalledWith(
        "/api/v1/problem/admin/problem_1/setups",
        { languageVersionId: "python-3.13" },
        expect.anything()
      )
    );
    expect(toast.success).toHaveBeenCalledWith("Added language setup");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows an error toast when adding fails", async () => {
    const user = userEvent.setup();
    mockedHttp.post.mockRejectedValue(new Error("Setup already exists"));
    renderDialog();

    const dialog = await openDialog(user);
    await user.click(dialog.getByRole("combobox"));
    await user.click(
      await screen.findByRole("option", { name: "Python (3.13)" })
    );
    await user.click(dialog.getByRole("button", { name: "Add language" }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Setup already exists")
    );
  });
});
