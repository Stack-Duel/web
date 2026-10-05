import fs from "node:fs";
import { test, expect } from "@playwright/test";
import { routerConfig } from "@/shared/router-config";
import { secondUserAuthFile } from "../auth-files";

const RESTRICTED_TEXT = /we could not find the page you are looking for/i;

const adminRoutes = [
  routerConfig.admin.path,
  routerConfig.adminUsers.path,
  routerConfig.adminGames.path,
  routerConfig.adminSubmissions.path,
  routerConfig.adminProblems.path,
  routerConfig.adminFeedback.path,
  routerConfig.adminFeatureFlags.path,
];

test.describe(() => {
  test.skip(
    !process.env.TEST_USER_2_EMAIL ||
      !process.env.TEST_USER_2_PASSWORD ||
      !fs.existsSync(secondUserAuthFile),
    "TEST_USER_2_EMAIL/TEST_USER_2_PASSWORD (admin) not configured"
  );
  test.use({ storageState: secondUserAuthFile });

  for (const path of adminRoutes) {
    test(
      `an admin can view ${path}`,
      { tag: ["@regression"] },
      async ({ page }) => {
        const response = await page.goto(path);

        expect(response?.ok()).toBe(true);
        await expect(page.getByText(RESTRICTED_TEXT)).toBeHidden();
      }
    );
  }
});

test(
  "a non-admin user sees a not-found fallback instead of the admin dashboard",
  { tag: ["@regression"] },
  async ({ page }) => {
    await page.goto(routerConfig.admin.path);

    await expect(page.getByText(RESTRICTED_TEXT)).toBeVisible();
    await expect(page.getByText(/you don't have permission/i)).toBeHidden();
  }
);
