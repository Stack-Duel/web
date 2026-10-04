import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import PreferencesTab from "./preferences-tab";
import { useAccount } from "@/domains/user/api/get-account";
import { useTracks } from "@/domains/game/api/use-tracks";
import { useUpdateUsername } from "@/domains/user/api/update-username";
import { useUserStore } from "@/domains/user/state/user-store";
import { buildUser } from "@/test/factories/user";
import type { Track } from "@/domains/game/models/track";

vi.mock("@/env", () => import("@/test/mocks/env"));
vi.mock("@/domains/user/api/get-account");
vi.mock("@/domains/game/api/use-tracks");
vi.mock("@/domains/user/api/update-username");
vi.mock("@/domains/user/components/setup-language-table", () => ({
  default: ({
    languages,
    selectedIds,
    onSelectedIdsChange,
    groupLabel,
  }: {
    languages: { id: string; name: string }[];
    selectedIds: Set<string>;
    onSelectedIdsChange: (next: Set<string>) => void;
    groupLabel?: string;
  }) => (
    <div>
      setup-language-table {groupLabel}
      {languages.map((language) => (
        <button
          key={language.id}
          onClick={() => {
            const next = new Set(selectedIds);
            if (next.has(language.id)) {
              next.delete(language.id);
            } else {
              next.add(language.id);
            }
            onSelectedIdsChange(next);
          }}
        >
          toggle {language.name}
        </button>
      ))}
    </div>
  ),
}));
vi.mock("@/domains/user/components/priority-order-list", () => ({
  default: () => <div>priority-order-list</div>,
}));

const mockUseAccount = vi.mocked(useAccount);
const mockUseTracks = vi.mocked(useTracks);
const mockUseUpdateUsername = vi.mocked(useUpdateUsername);

const tracks: Track[] = [
  {
    id: "track-web",
    key: "web",
    name: "Web",
    allowsLanguageSelection: true,
    languages: [
      { id: "javascript", name: "JavaScript" },
      { id: "typescript", name: "TypeScript" },
    ],
  },
  {
    id: "track-general",
    key: "general-purpose",
    name: "General Purpose",
    allowsLanguageSelection: true,
    languages: [{ id: "python", name: "Python" }],
  },
];

function renderPreferences() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <PreferencesTab />
    </QueryClientProvider>
  );
}

describe("PreferencesTab", () => {
  const mutate = vi.fn();

  beforeEach(() => {
    useUserStore.setState({ user: buildUser() });
    mockUseUpdateUsername.mockReturnValue({
      mutate,
      isPending: false,
    } as unknown as ReturnType<typeof useUpdateUsername>);
  });

  it("shows a loading skeleton while account or tracks are loading", () => {
    mockUseAccount.mockReturnValue({
      data: undefined,
      isLoading: true,
    } as unknown as ReturnType<typeof useAccount>);
    mockUseTracks.mockReturnValue({
      data: undefined,
      isLoading: false,
    } as unknown as ReturnType<typeof useTracks>);

    renderPreferences();

    expect(screen.queryByText("Preferences")).not.toBeInTheDocument();
  });

  it("shows a language table and order list per tech stack once loaded", () => {
    mockUseAccount.mockReturnValue({
      data: buildUser({ languagePreferenceIds: ["python"] }),
      isLoading: false,
    } as unknown as ReturnType<typeof useAccount>);
    mockUseTracks.mockReturnValue({
      data: tracks,
      isLoading: false,
    } as unknown as ReturnType<typeof useTracks>);

    renderPreferences();

    expect(screen.getByText("Preferences")).toBeVisible();
    expect(screen.getByText("Web")).toBeVisible();
    expect(screen.getByText("General Purpose")).toBeVisible();
    // Only the General Purpose stack has a selected language, so only it
    // gets an order list; Web still shows the "select to order" prompt.
    expect(screen.getAllByText("priority-order-list")).toHaveLength(1);
    expect(
      screen.getByText("Select at least one language to set an order.")
    ).toBeVisible();
  });

  it("prompts to select a language per stack when none are selected yet", () => {
    mockUseAccount.mockReturnValue({
      data: buildUser({ languagePreferenceIds: [] }),
      isLoading: false,
    } as unknown as ReturnType<typeof useAccount>);
    mockUseTracks.mockReturnValue({
      data: tracks,
      isLoading: false,
    } as unknown as ReturnType<typeof useTracks>);

    renderPreferences();

    expect(
      screen.getAllByText("Select at least one language to set an order.")
    ).toHaveLength(2);
    expect(screen.queryByText("priority-order-list")).not.toBeInTheDocument();
  });

  it("submits the account's username, bio, and the current per-stack language order", async () => {
    mockUseAccount.mockReturnValue({
      data: buildUser({
        username: "ada",
        bio: "hi",
        languagePreferenceIds: ["python"],
      }),
      isLoading: false,
    } as unknown as ReturnType<typeof useAccount>);
    mockUseTracks.mockReturnValue({
      data: tracks,
      isLoading: false,
    } as unknown as ReturnType<typeof useTracks>);
    const user = userEvent.setup();

    renderPreferences();

    await user.click(screen.getByRole("button", { name: "Save changes" }));

    expect(mutate).toHaveBeenCalledWith({
      username: "ada",
      bio: "hi",
      languageIds: ["python"],
    });
  });

  it("orders languages by stack, then by each stack's own order", async () => {
    mockUseAccount.mockReturnValue({
      data: buildUser({ languagePreferenceIds: ["python"] }),
      isLoading: false,
    } as unknown as ReturnType<typeof useAccount>);
    mockUseTracks.mockReturnValue({
      data: tracks,
      isLoading: false,
    } as unknown as ReturnType<typeof useTracks>);
    const user = userEvent.setup();

    renderPreferences();

    await user.click(screen.getByRole("button", { name: "toggle JavaScript" }));
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    // Web comes before General Purpose in track order, so its newly
    // selected language is submitted first even though it was selected
    // after Python.
    expect(mutate).toHaveBeenCalledWith(
      expect.objectContaining({ languageIds: ["javascript", "python"] })
    );
  });

  it("shows Saving... while the mutation is pending", () => {
    mockUseAccount.mockReturnValue({
      data: buildUser({ languagePreferenceIds: ["python"] }),
      isLoading: false,
    } as unknown as ReturnType<typeof useAccount>);
    mockUseTracks.mockReturnValue({
      data: tracks,
      isLoading: false,
    } as unknown as ReturnType<typeof useTracks>);
    mockUseUpdateUsername.mockReturnValue({
      mutate,
      isPending: true,
    } as unknown as ReturnType<typeof useUpdateUsername>);

    renderPreferences();

    expect(screen.getByRole("button", { name: "Saving..." })).toBeDisabled();
  });
});
