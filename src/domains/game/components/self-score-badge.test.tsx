import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import SelfScoreBadge from "./self-score-badge";
import { useUserStore } from "@/domains/user/state/user-store";
import { resetUserStore } from "@/test/mocks/user-store";
import { buildUser } from "@/test/factories/user";
import type { GameParticipant } from "../models/game";
import {
  buildParticipant as baseBuildParticipant,
  buildGame,
} from "@/test/factories/game";

function buildParticipant(
  overrides: Partial<GameParticipant> = {}
): GameParticipant {
  return baseBuildParticipant({ username: "me", ...overrides });
}

describe("SelfScoreBadge", () => {
  beforeEach(() => {
    resetUserStore();
  });

  it("shows the current user's score", () => {
    useUserStore.setState({ user: buildUser({ id: "user-1" }) });

    render(
      <SelfScoreBadge
        game={buildGame({
          participants: [buildParticipant({ userId: "user-1", score: 8 })],
        })}
      />
    );

    expect(screen.getByText("8")).toBeVisible();
  });

  it("renders nothing when the current user isn't a participant", () => {
    useUserStore.setState({ user: buildUser({ id: "user-1" }) });

    const { container } = render(
      <SelfScoreBadge game={buildGame({ participants: [] })} />
    );

    expect(container).toBeEmptyDOMElement();
  });
});
