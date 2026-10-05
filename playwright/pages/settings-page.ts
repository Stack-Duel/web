import type { Page } from "@playwright/test";
import { routerConfig } from "@/shared/router-config";

export class SettingsPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto(routerConfig.settingsProfile.path);
  }

  async openTab(name: "Profile" | "Account" | "Preferences") {
    await this.page.getByRole("link", { name, exact: true }).click();
  }
}
