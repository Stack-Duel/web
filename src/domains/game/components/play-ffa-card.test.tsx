import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PlayFFACard from "./play-ffa-card";
import { useGameModes } from "../api/use-game-modes";
import { GameModeKey } from "../models/game-mode";
import { routerConfig } from "@/shared/router-config";

vi.mock("../api/use-game-modes", () => ({ useGameModes: vi.fn() }));
vi.mock("next/navigation", () => import("@/test/mocks/next-navigation"));

const mockedUseGameModes = vi.mocked(useGameModes);

describe("PlayFFACard", () => {
  it("is disabled while FFA mode is not yet loaded", () => {
    mockedUseGameModes.mockReturnValue({ data: undefined } as never);

    render(<PlayFFACard />);

    expect(screen.getByRole("button", { name: /Play now/ })).toBeDisabled();
  });

  it("navigates to the FFA lobbies once FFA mode is available", async () => {
    mockedUseGameModes.mockReturnValue({
      data: [
        {
          id: "mode-1",
          key: GameModeKey.Ffa,
          name: "FFA",
          description: "",
          minPlayers: 3,
          maxPlayers: 10,
          timeOptions: [],
        },
      ],
    } as never);
    const { routerMock } = await import("@/test/mocks/next-navigation");
    const user = userEvent.setup();

    render(<PlayFFACard />);
    const button = screen.getByRole("button", { name: /Play now/ });
    expect(button).not.toBeDisabled();

    await user.click(button);

    expect(routerMock.push).toHaveBeenCalledWith(
      routerConfig.games.execute({ mode: GameModeKey.Ffa })
    );
  });
});
