import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http } from "@/shared/lib/http";
import { buildStudioProblemSetup } from "@/test/factories/studio-problem-setup";
import type { ProgrammingLanguage } from "@/domains/language/models/programming-language";
import type { StudioProblemSetup } from "@/domains/studio/models/studio-problem-setup";
import StudioProblemAddLanguageDialog from "./studio-problem-add-language-dialog";

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
    id: "lang_sql",
    name: "SQL",
    versions: [{ id: "sql-15", version: "15" }],
  },
  {
    id: "lang_python",
    name: "Python",
    versions: [{ id: "python-3.13", version: "3.13" }],
  },
  {
    id: "lang_javascript",
    name: "JavaScript",
    versions: [{ id: "js-22", version: "22" }],
  },
];

const sqlTrack = {
  id: "track_sql",
  key: "sql",
  name: "SQL",
  allowsLanguageSelection: true,
  languages: [{ id: "lang_sql", name: "SQL" }],
};

const generalTrack = {
  id: "track_general",
  key: "general",
  name: "General Purpose",
  allowsLanguageSelection: true,
  languages: [
    { id: "lang_python", name: "Python" },
    { id: "lang_javascript", name: "JavaScript" },
  ],
};

function renderDialog(
  trackId: string | null,
  existingSetups: StudioProblemSetup[] = []
) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return render(
    <StudioProblemAddLanguageDialog
      problemId="problem_1"
      trackId={trackId}
      existingSetups={existingSetups}
    />,
    { wrapper: Wrapper }
  );
}

async function openDialog(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "Add language" }));
  return within(await screen.findByRole("dialog"));
}

beforeEach(() => {
  vi.clearAllMocks();
  mockedHttp.get.mockImplementation((url: string) => {
    if (url === "/api/v1/language") return Promise.resolve(languages);
    if (url === "/api/v1/studio/problems/initial-values")
      return Promise.resolve({ availableTracks: [sqlTrack, generalTrack] });
    throw new Error(`Unexpected GET ${url}`);
  });
});

describe("StudioProblemAddLanguageDialog", () => {
  it("only offers languages that belong to the problem's track", async () => {
    const user = userEvent.setup();
    renderDialog("track_sql");

    const dialog = await openDialog(user);
    await user.click(dialog.getByRole("combobox"));

    expect(
      await screen.findByRole("option", { name: "SQL (15)" })
    ).toBeVisible();
    expect(
      screen.queryByRole("option", { name: "Python (3.13)" })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("option", { name: "JavaScript (22)" })
    ).not.toBeInTheDocument();
  });

  it("offers every language on a multi-language track", async () => {
    const user = userEvent.setup();
    renderDialog("track_general");

    const dialog = await openDialog(user);
    await user.click(dialog.getByRole("combobox"));

    expect(
      await screen.findByRole("option", { name: "Python (3.13)" })
    ).toBeVisible();
    expect(
      screen.getByRole("option", { name: "JavaScript (22)" })
    ).toBeVisible();
    expect(
      screen.queryByRole("option", { name: "SQL (15)" })
    ).not.toBeInTheDocument();
  });

  it("excludes track languages that already have a setup", async () => {
    const user = userEvent.setup();
    renderDialog("track_general", [
      buildStudioProblemSetup({ languageVersionId: "python-3.13" }),
    ]);

    const dialog = await openDialog(user);
    await user.click(dialog.getByRole("combobox"));

    expect(
      await screen.findByRole("option", { name: "JavaScript (22)" })
    ).toBeVisible();
    expect(
      screen.queryByRole("option", { name: "Python (3.13)" })
    ).not.toBeInTheDocument();
  });

  it("explains that nothing can be added when the problem has no active track", async () => {
    const user = userEvent.setup();
    renderDialog(null);

    const dialog = await openDialog(user);

    expect(
      dialog.getByText(
        "This problem has no active track, so there are no languages available to add."
      )
    ).toBeVisible();
    expect(dialog.getByRole("combobox")).toBeDisabled();
  });

  it("names the track so the author knows why the list is limited", async () => {
    const user = userEvent.setup();
    renderDialog("track_sql");

    const dialog = await openDialog(user);

    expect(
      await dialog.findByText(/Only languages on the SQL track can be added/)
    ).toBeVisible();
  });

  it("adds the selected track language", async () => {
    const user = userEvent.setup();
    mockedHttp.post.mockResolvedValue("setup_1");
    renderDialog("track_sql");

    const dialog = await openDialog(user);
    await user.click(dialog.getByRole("combobox"));
    await user.click(await screen.findByRole("option", { name: "SQL (15)" }));
    await user.click(dialog.getByRole("button", { name: "Add language" }));

    await waitFor(() =>
      expect(mockedHttp.post).toHaveBeenCalledWith(
        "/api/v1/studio/problems/problem_1/setups",
        { languageVersionId: "sql-15" },
        expect.anything()
      )
    );
  });
});
