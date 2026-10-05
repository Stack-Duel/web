import type { Page } from "@playwright/test";
import { routerConfig } from "@/shared/router-config";

export class LoginPage {
  constructor(private readonly page: Page) {}

  async goto(returnTo: string = routerConfig.dashboard.path) {
    await this.page.goto(
      `${routerConfig.authLogIn.path}?returnTo=${encodeURIComponent(returnTo)}`
    );
  }

  async loginWithTestUser(email: string, password: string) {
    const emailInput = this.page.getByRole("textbox", {
      name: "Email address",
    });
    await emailInput.waitFor();
    await emailInput.fill(email);

    const passwordInput = this.page.getByRole("textbox", {
      name: "Password",
    });
    const continueButton = this.page.getByRole("button", {
      name: "Continue",
      exact: true,
    });

    if (await passwordInput.isVisible()) {
      await passwordInput.fill(password);
      await continueButton.click();
      return;
    }

    await continueButton.click();
    await passwordInput.waitFor();
    await passwordInput.fill(password);
    await continueButton.click();
  }
}
