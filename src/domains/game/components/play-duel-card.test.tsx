import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PlayDuelCard from "./play-duel-card";
import { useGameModes } from "../api/use-game-modes";
import { GameModeKey } from "../models/game-mode";
import { routerConfig } from "@/shared/router-config";

vi.mock("../api/use-game-modes", () => ({ useGameModes: vi.fn() }));
vi.mock("next/navigation", () => import("@/test/mocks/next-navigation"));

const mockedUseGameModes = vi.mocked(useGameModes);

describe("PlayDuelCard", () => {
  it("is disabled while duel mode is not yet loaded", () => {
    mockedUseGameModes.mockReturnValue({ data: undefined } as never);

    render(<PlayDuelCard />);

    expect(screen.getByRole("button", { name: /Play now/ })).toBeDisabled();
  });

  it("stays disabled when only unrelated game modes are available", () => {
    mockedUseGameModes.mockReturnValue({
      data: [
        {
          id: "mode-1",
          key: GameModeKey.SoloRush,
          name: "Solo Rush",
          description: "",
          minPlayers: 1,
          maxPlayers: 1,
          timeOptions: [],
        },
      ],
    } as never);

    render(<PlayDuelCard />);

    expect(screen.getByRole("button", { name: /Play now/ })).toBeDisabled();
  });

  it("navigates to the duel lobbies once duel mode is available", async () => {
    mockedUseGameModes.mockReturnValue({
      data: [
        {
          id: "mode-1",
          key: GameModeKey.Duel,
          name: "Duel",
          description: "",
          minPlayers: 2,
          maxPlayers: 2,
          timeOptions: [],
        },
      ],
    } as never);
    const { routerMock } = await import("@/test/mocks/next-navigation");
    const user = userEvent.setup();

    render(<PlayDuelCard />);
    const button = screen.getByRole("button", { name: /Play now/ });
    expect(button).not.toBeDisabled();

    await user.click(button);

    expect(routerMock.push).toHaveBeenCalledWith(
      routerConfig.games.execute({ mode: GameModeKey.Duel })
    );
  });
});
