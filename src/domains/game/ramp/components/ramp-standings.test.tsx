import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import RampStandings from "./ramp-standings";
import { useUserStore } from "@/domains/user/state/user-store";
import { resetUserStore } from "@/test/mocks/user-store";
import { buildUser } from "@/test/factories/user";
import { GameModeKey } from "../../models/game-mode";
import type { Game, GameParticipant } from "../../models/game";
import {
  buildParticipant as baseBuildParticipant,
  buildGame as baseBuildGame,
} from "@/test/factories/game";

function buildParticipant(
  overrides: Partial<GameParticipant> = {}
): GameParticipant {
  return baseBuildParticipant({ username: "player", ...overrides });
}

function buildGame(overrides: Partial<Game> = {}): Game {
  return baseBuildGame({ gameModeKey: GameModeKey.Ffa, ...overrides });
}

describe("RampStandings", () => {
  beforeEach(() => {
    resetUserStore();
  });

  it("orders participants by score, highest first", () => {
    render(
      <RampStandings
        game={buildGame({
          participants: [
            buildParticipant({ userId: "user-1", username: "low", score: 2 }),
            buildParticipant({
              userId: "user-2",
              username: "high",
              score: 9,
            }),
          ],
        })}
      />
    );

    const names = screen
      .getAllByText(/^(low|high)$/)
      .map((el) => el.textContent);
    expect(names).toEqual(["high", "low"]);
  });

  it("marks the current user's row with (You)", () => {
    useUserStore.setState({ user: buildUser({ id: "user-1" }) });

    render(
      <RampStandings
        game={buildGame({
          participants: [
            buildParticipant({ userId: "user-1", username: "me" }),
          ],
        })}
      />
    );

    expect(screen.getByText("me (You)")).toBeVisible();
  });

  it("shows a Forfeited badge for forfeited participants", () => {
    render(
      <RampStandings
        game={buildGame({
          participants: [buildParticipant({ hasForfeited: true })],
        })}
      />
    );

    expect(screen.getByText("Forfeited")).toBeVisible();
  });

  it("shows a Finished badge for participants who finished all problems", () => {
    render(
      <RampStandings
        game={buildGame({
          participants: [buildParticipant({ hasFinishedProblems: true })],
        })}
      />
    );

    expect(screen.getByText("Finished")).toBeVisible();
  });
});
