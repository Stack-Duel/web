import fs from "node:fs";
import { test } from "@playwright/test";
import { authFile, secondUserAuthFile } from "../auth-files";
import { GamesPage } from "../pages/games-page";
import { LobbyPage } from "../pages/lobby-page";
import { GameSessionPage } from "../pages/game-session-page";

test(
  "two players can join, start, and complete a duel end to end",
  { tag: ["@regression", "@critical"] },
  async ({ browser }) => {
    test.skip(
      !process.env.TEST_USER_2_EMAIL ||
        !process.env.TEST_USER_2_PASSWORD ||
        !fs.existsSync(secondUserAuthFile),
      "TEST_USER_2_EMAIL/TEST_USER_2_PASSWORD not configured"
    );

    const viewport = { width: 1920, height: 1080 };
    const hostContext = await browser.newContext({
      storageState: authFile,
      viewport,
    });
    const opponentContext = await browser.newContext({
      storageState: secondUserAuthFile,
      viewport,
    });

    let hostLobby: LobbyPage | undefined;
    let opponentLobby: LobbyPage | undefined;

    try {
      const hostPage = await hostContext.newPage();
      const opponentPage = await opponentContext.newPage();

      const hostGames = new GamesPage(hostPage);
      hostLobby = new LobbyPage(hostPage);
      opponentLobby = new LobbyPage(opponentPage);
      await hostGames.goto();
      await hostGames.createDuel();
      const code = await hostLobby.revealJoinCode();

      const opponentGames = new GamesPage(opponentPage);
      await opponentGames.goto();
      await opponentGames.joinWithCode(code);

      await hostLobby.startGame();

      const hostSession = new GameSessionPage(hostPage);
      const opponentSession = new GameSessionPage(opponentPage);
      await hostSession.waitForRunning();
      await opponentSession.waitForRunning();

      await hostSession.forfeit();
      await hostSession.waitForWaitingOnOpponent();

      await opponentSession.forfeit();

      await hostSession.waitForGameOver();
      await opponentSession.waitForGameOver();
    } finally {
      await hostLobby?.leaveIfStillWaiting().catch(() => {});
      await opponentLobby?.leaveIfStillWaiting().catch(() => {});
      await hostContext.close();
      await opponentContext.close();
    }
  }
);
