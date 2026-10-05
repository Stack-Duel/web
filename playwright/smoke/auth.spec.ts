import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/login-page";

// Runs unauthenticated, independent of the `setup` project's storageState.
test.use({ storageState: { cookies: [], origins: [] } });

test(
  "user can log in through Auth0 and lands on the dashboard",
  { tag: ["@smoke", "@critical"] },
  async ({ page }) => {
    const email = process.env.TEST_USER_EMAIL;
    const password = process.env.TEST_USER_PASSWORD;
    test.skip(
      !email || !password,
      "TEST_USER_EMAIL / TEST_USER_PASSWORD not configured"
    );

    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginWithTestUser(email!, password!);

    await expect(page.locator('[data-cy="user-dropdown-trigger"]')).toBeVisible(
      { timeout: 15_000 }
    );
  }
);
