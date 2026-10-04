import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PlaySoloRushCard from "./play-solo-rush-card";
import { useGameModes } from "@/domains/game/api/use-game-modes";
import { useTracks } from "@/domains/game/api/use-tracks";
import { useCreateGameAndPlay } from "@/domains/game/hooks/use-create-game-and-play";
import { GameModeKey } from "../models/game-mode";

vi.mock("@/domains/game/api/use-game-modes", () => ({ useGameModes: vi.fn() }));
vi.mock("@/domains/game/api/use-tracks", () => ({ useTracks: vi.fn() }));
vi.mock("@/domains/game/hooks/use-create-game-and-play", () => ({
  useCreateGameAndPlay: vi.fn(),
}));
vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

const mockedUseGameModes = vi.mocked(useGameModes);
const mockedUseTracks = vi.mocked(useTracks);
const mockedUseCreateGameAndPlay = vi.mocked(useCreateGameAndPlay);

describe("PlaySoloRushCard", () => {
  it("is disabled while solo rush mode is not yet loaded", () => {
    mockedUseGameModes.mockReturnValue({ data: undefined } as never);
    mockedUseTracks.mockReturnValue({ data: [] } as never);
    mockedUseCreateGameAndPlay.mockReturnValue({
      createGame: vi.fn(),
      isCreating: false,
    });

    render(<PlaySoloRushCard />);

    expect(screen.getByRole("button", { name: /Play now/ })).toBeDisabled();
  });

  it("opens the time-limit dialog and starts the game using the default duration and track", async () => {
    mockedUseGameModes.mockReturnValue({
      data: [
        {
          id: "mode-1",
          key: GameModeKey.SoloRush,
          name: "Solo Rush",
          description: "",
          minPlayers: 1,
          maxPlayers: 1,
          timeOptions: [{ durationSeconds: 300, isDefault: true }],
        },
      ],
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
    const createGame = vi.fn();
    mockedUseCreateGameAndPlay.mockReturnValue({
      createGame,
      isCreating: false,
    });
    const user = userEvent.setup();

    render(<PlaySoloRushCard />);
    await user.click(screen.getByRole("button", { name: /Play now/ }));
    expect(screen.getByText("Choose your time limit")).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Start game" }));

    expect(createGame).toHaveBeenCalledWith({
      gameModeKey: GameModeKey.SoloRush,
      timeLimitInSeconds: 300,
      trackSelections: [
        { trackKey: "general-purpose", languageIds: ["lang-js"] },
      ],
    });
  });

  it("toasts an error when no tracks are available to select", async () => {
    mockedUseGameModes.mockReturnValue({
      data: [
        {
          id: "mode-1",
          key: GameModeKey.SoloRush,
          name: "Solo Rush",
          description: "",
          minPlayers: 1,
          maxPlayers: 1,
          timeOptions: [{ durationSeconds: 300, isDefault: true }],
        },
      ],
    } as never);
    mockedUseTracks.mockReturnValue({ data: [] } as never);
    const createGame = vi.fn();
    mockedUseCreateGameAndPlay.mockReturnValue({
      createGame,
      isCreating: false,
    });
    const { toast } = await import("sonner");
    const user = userEvent.setup();

    render(<PlaySoloRushCard />);
    await user.click(screen.getByRole("button", { name: /Play now/ }));
    await user.click(screen.getByRole("button", { name: "Start game" }));

    expect(toast.error).toHaveBeenCalledWith(
      "Choose at least one tech stack to start Solo Rush."
    );
    expect(createGame).not.toHaveBeenCalled();
  });
});
