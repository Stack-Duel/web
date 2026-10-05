import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LobbyPanel from "./lobby-panel";
import { useGameModes } from "../../api/use-game-modes";
import { useStartGame } from "../../api/start-game";
import { useCloseLobby } from "../../api/close-lobby";
import { useLeaveGame } from "../../api/leave-game";
import { useUserStore } from "@/domains/user/state/user-store";
import { resetUserStore } from "@/test/mocks/user-store";
import { buildUser } from "@/test/factories/user";
import { routerMock } from "@/test/mocks/next-navigation";
import { GameModeKey } from "../../models/game-mode";
import { GameStatus } from "../../models/game";
import type { Game, GameParticipant } from "../../models/game";

vi.mock("next/navigation", () => import("@/test/mocks/next-navigation"));
vi.mock("../../api/use-game-modes", () => ({ useGameModes: vi.fn() }));
vi.mock("../../api/start-game", () => ({ useStartGame: vi.fn() }));
vi.mock("../../api/close-lobby", () => ({ useCloseLobby: vi.fn() }));
vi.mock("../../api/leave-game", () => ({ useLeaveGame: vi.fn() }));

const mockedUseGameModes = vi.mocked(useGameModes);
const mockedUseStartGame = vi.mocked(useStartGame);

function buildParticipant(
  overrides: Partial<GameParticipant> = {}
): GameParticipant {
  return {
    userId: "user-1",
    username: "host",
    seatNumber: 0,
    joinedAt: new Date(),
    score: 0,
    hasForfeited: false,
    hasFinishedProblems: false,
    ...overrides,
  };
}

function buildGame(overrides: Partial<Game> = {}): Game {
  return {
    gameId: "game-1",
    gameModeId: "mode-1",
    gameModeKey: GameModeKey.Duel,
    status: GameStatus.Pending,
    timeLimitInSeconds: 600,
    createdAt: new Date(),
    participants: [buildParticipant()],
    techStacks: [],
    joinCode: "ABC1234",
    ...overrides,
  };
}

describe("LobbyPanel", () => {
  beforeEach(() => {
    resetUserStore();
    routerMock.back.mockClear();
    vi.mocked(useCloseLobby).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as never);
    vi.mocked(useLeaveGame).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as never);
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
    mockedUseStartGame.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as never);
  });

  it("shows the participant count against the mode's max players", () => {
    useUserStore.setState({ user: buildUser({ id: "user-1" }) });

    render(<LobbyPanel game={buildGame()} />);

    expect(screen.getByText("1/2")).toBeVisible();
  });

  it("shows the lobby's tech stacks", () => {
    useUserStore.setState({ user: buildUser({ id: "user-1" }) });

    render(<LobbyPanel game={buildGame({ techStacks: ["Python", "Java"] })} />);

    expect(screen.getByText("Python")).toBeVisible();
    expect(screen.getByText("Java")).toBeVisible();
  });

  it("marks the first-seated participant as host", () => {
    useUserStore.setState({ user: buildUser({ id: "user-2" }) });

    render(
      <LobbyPanel
        game={buildGame({
          participants: [
            buildParticipant({ userId: "user-1", username: "host" }),
            buildParticipant({
              userId: "user-2",
              username: "guest",
              seatNumber: 1,
            }),
          ],
        })}
      />
    );

    expect(screen.getByText("Host")).toBeVisible();
    expect(screen.getByText("guest (You)")).toBeVisible();
  });

  it("shows the host controls, disabled, until enough players have joined", () => {
    useUserStore.setState({ user: buildUser({ id: "user-1" }) });

    render(<LobbyPanel game={buildGame()} />);

    expect(screen.getByRole("button", { name: "Start game" })).toBeDisabled();
    expect(
      screen.getByText("Waiting for at least 2 players to join...")
    ).toBeVisible();
  });

  it("enables Start game for the host once enough players have joined", async () => {
    const start = vi.fn();
    mockedUseStartGame.mockReturnValue({
      mutate: start,
      isPending: false,
    } as never);
    useUserStore.setState({ user: buildUser({ id: "user-1" }) });
    const user = userEvent.setup();

    render(
      <LobbyPanel
        game={buildGame({
          participants: [
            buildParticipant({ userId: "user-1" }),
            buildParticipant({ userId: "user-2", seatNumber: 1 }),
          ],
        })}
      />
    );

    const startButton = screen.getByRole("button", { name: "Start game" });
    expect(startButton).not.toBeDisabled();
    await user.click(startButton);

    expect(start).toHaveBeenCalledWith({ gameId: "game-1" }, expect.anything());
  });

  it("shows a waiting message and no start button for non-host participants", () => {
    useUserStore.setState({ user: buildUser({ id: "user-2" }) });

    render(
      <LobbyPanel
        game={buildGame({
          participants: [
            buildParticipant({ userId: "user-1" }),
            buildParticipant({ userId: "user-2", seatNumber: 1 }),
          ],
        })}
      />
    );

    expect(
      screen.getByText("Waiting for the host to start the game...")
    ).toBeVisible();
    expect(
      screen.queryByRole("button", { name: "Start game" })
    ).not.toBeInTheDocument();
  });

  it("navigates back once leaving the lobby succeeds", async () => {
    const leave = vi.fn((_variables, options) => options?.onSuccess?.());
    vi.mocked(useLeaveGame).mockReturnValue({
      mutate: leave,
      isPending: false,
    } as never);
    useUserStore.setState({ user: buildUser({ id: "user-1" }) });
    const user = userEvent.setup();

    render(<LobbyPanel game={buildGame()} />);

    await user.click(screen.getByRole("button", { name: /Leave/ }));
    await user.click(screen.getByRole("button", { name: "Leave lobby" }));

    expect(routerMock.back).toHaveBeenCalledOnce();
  });
});
