import { describe, expect, it, vi } from "vitest";
import { gameWorkspaceRegistry } from "./game-workspace-registry";
import { GameModeKey } from "./models/game-mode";
import RampWorkspace from "./ramp/components/ramp-workspace";
import RampWorkspaceHeader from "./ramp/components/ramp-workspace-header";
import GameOverSummary from "./ramp/components/game-over-summary";
import MultiplayerWorkspace from "./lobby/components/multiplayer-workspace";
import MultiplayerWorkspaceHeader from "./lobby/components/multiplayer-workspace-header";

vi.mock("@/env", () => import("@/test/mocks/env"));

describe("gameWorkspaceRegistry", () => {
  it("registers Solo Rush with the shared ramp workspace", () => {
    expect(gameWorkspaceRegistry[GameModeKey.SoloRush]).toEqual({
      Workspace: RampWorkspace,
      Header: RampWorkspaceHeader,
      GameOverSummary,
    });
  });

  it("registers Duel and FFA with the multiplayer workspace", () => {
    expect(gameWorkspaceRegistry[GameModeKey.Duel]).toEqual({
      Workspace: MultiplayerWorkspace,
      Header: MultiplayerWorkspaceHeader,
      GameOverSummary,
    });
    expect(gameWorkspaceRegistry[GameModeKey.Ffa]).toEqual({
      Workspace: MultiplayerWorkspace,
      Header: MultiplayerWorkspaceHeader,
      GameOverSummary,
    });
  });
});
