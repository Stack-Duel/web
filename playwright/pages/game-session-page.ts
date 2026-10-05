import { expect, type Page } from "@playwright/test";

export class GameSessionPage {
  constructor(private readonly page: Page) {}

  async waitForRunning() {
    await expect(
      this.page.getByRole("button", { name: "Forfeit", exact: true })
    ).toBeVisible({ timeout: 30_000 });
  }

  async forfeit() {
    await this.page
      .getByRole("button", { name: "Forfeit", exact: true })
      .click();
    await this.page
      .getByRole("button", { name: "Forfeit game", exact: true })
      .click();
  }

  private async dismissFirstGameFeedbackPromptIfPresent() {
    await this.page
      .getByRole("dialog", { name: /give feedback/i })
      .getByRole("button", { name: "Close" })
      .click({ timeout: 3_000 })
      .catch(() => {});
  }

  async waitForWaitingOnOpponent() {
    await this.dismissFirstGameFeedbackPromptIfPresent();
    await expect(this.page.getByText("You forfeited")).toBeVisible({
      timeout: 15_000,
    });
  }

  async waitForGameOver() {
    await this.dismissFirstGameFeedbackPromptIfPresent();
    await expect(this.page.getByText(/game forfeited/i)).toBeVisible({
      timeout: 15_000,
    });
  }
}
