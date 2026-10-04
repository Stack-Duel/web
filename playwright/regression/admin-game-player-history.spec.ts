import fs from "node:fs";
import { test, expect } from "@playwright/test";
import { routerConfig } from "@/shared/router-config";
import {
  authFile,
  secondUserAuthFile,
  secondUserUsername,
} from "../auth-files";
import { GamesPage } from "../pages/games-page";
import { LobbyPage } from "../pages/lobby-page";
import { GameSessionPage } from "../pages/game-session-page";

test(
  "an admin can view a completed duel's player history, with a tab per player",
  { tag: ["@regression"] },
  async ({ browser }) => {
    test.skip(
      !process.env.TEST_USER_2_EMAIL ||
        !process.env.TEST_USER_2_PASSWORD ||
        !fs.existsSync(secondUserAuthFile),
      "TEST_USER_2_EMAIL/TEST_USER_2_PASSWORD (admin) not configured"
    );

    const viewport = { width: 1920, height: 1080 };
    const hostContext = await browser.newContext({
      storageState: authFile,
      viewport,
    });
    // TEST_USER_2 doubles as the granted-admin account (see
    // playwright/README.md), so the same context that plays as the
    // opponent can view the admin page afterwards without a third identity.
    const adminContext = await browser.newContext({
      storageState: secondUserAuthFile,
      viewport,
    });

    let hostLobby: LobbyPage | undefined;
    let adminLobby: LobbyPage | undefined;

    try {
      const hostPage = await hostContext.newPage();
      const adminPage = await adminContext.newPage();

      const hostGames = new GamesPage(hostPage);
      hostLobby = new LobbyPage(hostPage);
      adminLobby = new LobbyPage(adminPage);
      await hostGames.goto();
      await hostGames.createDuel();
      const code = await hostLobby.revealJoinCode();

      const adminGames = new GamesPage(adminPage);
      await adminGames.goto();
      await adminGames.joinWithCode(code);

      await hostLobby.startGame();

      const hostSession = new GameSessionPage(hostPage);
      const adminSession = new GameSessionPage(adminPage);
      await hostSession.waitForRunning();
      await adminSession.waitForRunning();

      const gameId = new URL(hostPage.url()).pathname.split("/").pop();
      expect(gameId).toBeTruthy();

      await hostSession.forfeit();
      await hostSession.waitForWaitingOnOpponent();
      await adminSession.forfeit();
      await hostSession.waitForGameOver();
      await adminSession.waitForGameOver();

      await adminPage.goto(
        routerConfig.adminGameDetail.execute({ id: gameId! })
      );

      await expect(adminPage.getByText("Player history")).toBeVisible();

      const tabs = adminPage.getByRole("tab");
      await expect(tabs).toHaveCount(2);
      await expect(
        adminPage.getByRole("tab", {
          name: new RegExp(secondUserUsername, "i"),
        })
      ).toBeVisible();

      // Both players only forfeited — neither submitted nor skipped
      // anything — so the active tab's timeline is the empty state. This
      // round-trips the whole stack (admin permission check, the history
      // endpoint, and rendering) without depending on Judge0 execution.
      await expect(
        adminPage.getByText("No activity recorded yet.")
      ).toBeVisible();

      await tabs.nth(1).click();
      await expect(
        adminPage.getByText("No activity recorded yet.")
      ).toBeVisible();
    } finally {
      await hostLobby?.leaveIfStillWaiting().catch(() => {});
      await adminLobby?.leaveIfStillWaiting().catch(() => {});
      await hostContext.close();
      await adminContext.close();
    }
  }
);
