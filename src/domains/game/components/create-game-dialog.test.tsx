import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import CreateGameDialog from "./create-game-dialog";
import { useGameModes } from "@/domains/game/api/use-game-modes";
import { useCreateGame } from "@/domains/game/api/create-game";
import { useTracks } from "@/domains/game/api/use-tracks";
import { useUserStore } from "@/domains/user/state/user-store";
import { resetUserStore } from "@/test/mocks/user-store";
import { buildAuthUser } from "@/test/factories/auth-user";
import { GameModeKey } from "../models/game-mode";

vi.mock("@/domains/game/api/use-game-modes", () => ({ useGameModes: vi.fn() }));
vi.mock("@/domains/game/api/create-game", () => ({ useCreateGame: vi.fn() }));
vi.mock("@/domains/game/api/use-tracks", () => ({ useTracks: vi.fn() }));
vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));
vi.mock("next/navigation", () => import("@/test/mocks/next-navigation"));

const mockedUseGameModes = vi.mocked(useGameModes);
const mockedUseCreateGame = vi.mocked(useCreateGame);
const mockedUseTracks = vi.mocked(useTracks);

describe("CreateGameDialog", () => {
  beforeEach(() => {
    resetUserStore();
    vi.clearAllMocks();
    mockedUseGameModes.mockReturnValue({
      data: [
        {
          id: "mode-duel",
          key: GameModeKey.Duel,
          name: "Duel",
          description: "",
          minPlayers: 2,
          maxPlayers: 2,
          timeOptions: [{ durationSeconds: 600, isDefault: true }],
        },
      ],
    } as never);
    mockedUseCreateGame.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as never);
    mockedUseTracks.mockReturnValue({
      data: [
        {
          id: "track-gp",
          key: "general-purpose",
          name: "General Purpose",
          allowsLanguageSelection: true,
          languages: [{ id: "lang-js", name: "JavaScript" }],
        },
      ],
    } as never);
  });

  it("disables the create button when the user is not signed in", () => {
    render(<CreateGameDialog />);

    expect(screen.getByRole("button", { name: "Create Game" })).toBeDisabled();
  });

  it("opens the dialog when signed in", async () => {
    useUserStore.setState({ authProfile: buildAuthUser() });
    const user = userEvent.setup();

    render(<CreateGameDialog />);
    await user.click(screen.getByRole("button", { name: "Create Game" }));

    expect(screen.getByText("Create a game")).toBeVisible();
  });

  it("toasts an error when trying to create without choosing a mode", async () => {
    useUserStore.setState({ authProfile: buildAuthUser() });
    const user = userEvent.setup();

    render(<CreateGameDialog />);
    await user.click(screen.getByRole("button", { name: "Create Game" }));
    await user.click(screen.getByRole("button", { name: "Create game" }));

    expect(toast.error).toHaveBeenCalledWith(
      "Choose a mode and time limit to create a game."
    );
  });

  it("pre-fills the mode from defaultModeKey and creates the game", async () => {
    const mutate = vi.fn(
      (_args, options?: { onSuccess?: (gameId: string) => void }) => {
        options?.onSuccess?.("game-1");
      }
    );
    mockedUseCreateGame.mockReturnValue({
      mutate,
      isPending: false,
    } as never);
    useUserStore.setState({ authProfile: buildAuthUser() });
    const user = userEvent.setup();

    render(<CreateGameDialog defaultModeKey={GameModeKey.Duel} />);
    await user.click(screen.getByRole("button", { name: "Create Game" }));
    await user.click(screen.getByRole("button", { name: "Create game" }));

    expect(mutate).toHaveBeenCalledWith(
      {
        gameModeKey: GameModeKey.Duel,
        timeLimitInSeconds: 600,
        trackSelections: [
          { trackKey: "general-purpose", languageIds: ["lang-js"] },
        ],
        skipsEnabled: true,
      },
      expect.anything()
    );
  });

  it("creates the game with skips disabled when the checkbox is unchecked", async () => {
    const mutate = vi.fn(
      (_args, options?: { onSuccess?: (gameId: string) => void }) => {
        options?.onSuccess?.("game-1");
      }
    );
    mockedUseCreateGame.mockReturnValue({
      mutate,
      isPending: false,
    } as never);
    useUserStore.setState({ authProfile: buildAuthUser() });
    const user = userEvent.setup();

    render(<CreateGameDialog defaultModeKey={GameModeKey.Duel} />);
    await user.click(screen.getByRole("button", { name: "Create Game" }));
    await user.click(screen.getByRole("checkbox", { name: /allow skips/i }));
    await user.click(screen.getByRole("button", { name: "Create game" }));

    expect(mutate).toHaveBeenCalledWith(
      expect.objectContaining({ skipsEnabled: false }),
      expect.anything()
    );
  });

  it("toasts an error when no tracks are available to select", async () => {
    mockedUseTracks.mockReturnValue({ data: [] } as never);
    useUserStore.setState({ authProfile: buildAuthUser() });
    const user = userEvent.setup();

    render(<CreateGameDialog defaultModeKey={GameModeKey.Duel} />);
    await user.click(screen.getByRole("button", { name: "Create Game" }));
    await user.click(screen.getByRole("button", { name: "Create game" }));

    expect(toast.error).toHaveBeenCalledWith(
      "Choose at least one tech stack to create a game."
    );
  });
});
