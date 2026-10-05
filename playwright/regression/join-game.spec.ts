import { test, expect } from "@playwright/test";
import { GamesPage } from "../pages/games-page";
import { LobbyPage } from "../pages/lobby-page";

test(
  "a duel's join code is hidden by default and reveals a 7-character code",
  { tag: ["@regression"] },
  async ({ page }) => {
    const gamesPage = new GamesPage(page);
    const lobbyPage = new LobbyPage(page);

    await gamesPage.goto();
    await gamesPage.createDuel();

    await expect(page.locator('[data-cy="join-code-value"]')).toHaveText(
      /^•+$/
    );

    const code = await lobbyPage.revealJoinCode();
    expect(code).toMatch(/^[A-Z0-9]{7}$/);
  }
);

test(
  "re-entering your own duel's code redirects you straight back into it",
  { tag: ["@regression", "@critical"] },
  async ({ page }) => {
    const gamesPage = new GamesPage(page);
    const lobbyPage = new LobbyPage(page);

    await gamesPage.goto();
    await gamesPage.createDuel();
    const lobbyUrl = page.url();

    const code = await lobbyPage.revealJoinCode();

    await gamesPage.goto();
    await gamesPage.joinWithCode(code);

    // Already a participant in this game — join-by-code should redirect back
    // into the same lobby rather than surfacing an "already joined" error.
    await expect(page).toHaveURL(lobbyUrl);
  }
);

test(
  "joining with an unknown code shows an error instead of navigating",
  { tag: ["@regression"] },
  async ({ page }) => {
    const gamesPage = new GamesPage(page);

    await gamesPage.goto();
    await gamesPage.joinWithCode("ZZZZZZZ");

    await expect(page.getByText(/invalid or expired code/i)).toBeVisible();
    await expect(page).toHaveURL(/\/games$/);
  }
);

test(
  "a shared invite link lets the host rejoin their own duel",
  { tag: ["@regression"] },
  async ({ page }) => {
    const gamesPage = new GamesPage(page);
    const lobbyPage = new LobbyPage(page);

    await gamesPage.goto();
    await gamesPage.createDuel();
    const lobbyUrl = page.url();

    const code = await lobbyPage.revealJoinCode();

    await page.goto(`/join/${code}`);
    await page.getByRole("button", { name: "Join Game" }).click();

    await expect(page).toHaveURL(lobbyUrl);
  }
);
