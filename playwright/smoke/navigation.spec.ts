import { test, expect } from "@playwright/test";
import { routerConfig } from "@/shared/router-config";

const routes = [
  routerConfig.dashboard.path,
  routerConfig.problems.path,
  routerConfig.games.path,
];

for (const path of routes) {
  test(
    `${path} renders for an authenticated user`,
    { tag: ["@smoke"] },
    async ({ page }) => {
      const response = await page.goto(path);

      expect(response?.ok()).toBe(true);
      await expect(page).toHaveURL(new RegExp(`${path}$`));
      // The sidebar user menu only renders once the session + user sync
      // succeed, so its presence proves the page loaded as an authenticated
      // user rather than bouncing to a login/error state.
      await expect(
        page.locator('[data-cy="user-dropdown-trigger"]')
      ).toBeVisible();
    }
  );
}
