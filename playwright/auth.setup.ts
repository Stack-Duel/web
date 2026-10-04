import { test as setup, expect } from "@playwright/test";
import { LoginPage } from "./pages/login-page";
import { routerConfig } from "@/shared/router-config";
import { authFile, secondUserAuthFile, secondUserUsername } from "./auth-files";

const ALL_TAGS = ["@smoke", "@regression", "@critical"];

setup("authenticate", { tag: ALL_TAGS }, async ({ page }) => {
  const email = process.env.TEST_USER_EMAIL;
  const password = process.env.TEST_USER_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "TEST_USER_EMAIL and TEST_USER_PASSWORD must be set to run the e2e suite. " +
        "See playwright/README.md for how to configure a test account."
    );
  }

  const loginPage = new LoginPage(page);
  await loginPage.goto(routerConfig.dashboard.path);
  await loginPage.loginWithTestUser(email, password);

  await expect(page).toHaveURL(new RegExp(routerConfig.dashboard.path));
  await expect(page.locator('[data-cy="user-dropdown-trigger"]')).toBeVisible({
    timeout: 15_000,
  });

  await page.context().storageState({ path: authFile });
});

setup("authenticate second user", { tag: ALL_TAGS }, async ({ browser }) => {
  const email = process.env.TEST_USER_2_EMAIL;
  const password = process.env.TEST_USER_2_PASSWORD;
  setup.skip(!email || !password, "TEST_USER_2_EMAIL/PASSWORD not configured");

  const context = await browser.newContext();
  const page = await context.newPage();

  const loginPage = new LoginPage(page);
  await loginPage.goto(routerConfig.dashboard.path);
  await loginPage.loginWithTestUser(email!, password!);

  await expect(page).toHaveURL(new RegExp(routerConfig.dashboard.path));
  await expect(page.locator('[data-cy="user-dropdown-trigger"]')).toBeVisible({
    timeout: 15_000,
  });

  await page.goto(routerConfig.settingsProfile.path);
  const usernameInput = page.getByLabel("Username");
  await expect(usernameInput).toBeVisible();

  if ((await usernameInput.inputValue()) !== secondUserUsername) {
    await usernameInput.fill(secondUserUsername);
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByText("Profile updated")).toBeVisible();
  }

  await context.storageState({ path: secondUserAuthFile });
  await context.close();
});
