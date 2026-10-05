import type { Page } from "@playwright/test";
import { routerConfig } from "@/shared/router-config";

export class GamesPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto(routerConfig.games.path);
  }

  async createDuel() {
    await this.page.getByRole("button", { name: "Create Game" }).click();

    // Scoped to the dialog — the games list behind it has its own mode
    // filter combobox, and .first() would otherwise pick that one up
    // instead of the dialog's (portaled options aren't scoped, but the
    // trigger itself must be).
    const dialog = this.page.getByRole("dialog");
    await dialog.getByRole("combobox").first().click();
    await this.page.getByRole("option", { name: "Duel" }).click();

    // Whichever track happens to be first is fine — the flow under test is
    // join-by-code, not track selection.
    await dialog.getByRole("checkbox").first().check();

    await dialog.getByRole("button", { name: "Create game" }).click();
    await this.page.waitForURL(/\/game\/play\//);
  }

  async joinWithCode(code: string) {
    await this.page.getByRole("button", { name: "Join with code" }).click();
    await this.page.getByPlaceholder(/e\.g\. ab2cd3e/i).fill(code);
    await this.page.getByRole("button", { name: "Join game" }).click();
  }
}
