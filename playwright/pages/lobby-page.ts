import { expect, type Page } from "@playwright/test";

export class LobbyPage {
  constructor(private readonly page: Page) {}

  private get joinCodeValue() {
    return this.page.locator('[data-cy="join-code-value"]');
  }

  async revealJoinCode(): Promise<string> {
    await this.page.getByRole("button", { name: "Show code" }).click();
    return (await this.joinCodeValue.innerText()).trim();
  }

  async startGame() {
    const startButton = this.page.getByRole("button", {
      name: "Start game",
      exact: true,
    });
    await expect(startButton).toBeEnabled({ timeout: 30_000 });
    await startButton.click();
  }

  async leaveIfStillWaiting() {
    const leaveButton = this.page.getByRole("button", {
      name: "Leave",
      exact: true,
    });
    if (!(await leaveButton.isVisible().catch(() => false))) return;

    await leaveButton.click();
    await this.page
      .getByRole("button", { name: "Leave lobby" })
      .click({ timeout: 5_000 });
  }
}
