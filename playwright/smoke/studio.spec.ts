import fs from "node:fs";
import { test, expect } from "@playwright/test";
import { StudioProblemsPage } from "../pages/studio-problems-page";
import { secondUserAuthFile } from "../auth-files";

test.describe(() => {
  test.skip(
    !process.env.TEST_USER_2_EMAIL ||
      !process.env.TEST_USER_2_PASSWORD ||
      !fs.existsSync(secondUserAuthFile),
    "TEST_USER_2_EMAIL/TEST_USER_2_PASSWORD (admin) not configured"
  );
  test.use({ storageState: secondUserAuthFile });

  test(
    "an admin can open the Studio problems page",
    { tag: ["@smoke"] },
    async ({ page }) => {
      const studio = new StudioProblemsPage(page);

      await studio.goto();

      await expect(studio.searchInput).toBeVisible();
    }
  );
});
