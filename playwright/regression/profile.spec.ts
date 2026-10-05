import { test, expect } from "@playwright/test";
import { routerConfig } from "@/shared/router-config";

test(
  "the signed-in user can open their own profile from the sidebar menu",
  { tag: ["@regression"] },
  async ({ page }) => {
    await page.goto(routerConfig.dashboard.path);

    await page.locator('[data-cy="user-dropdown-trigger"]').click();
    await page.getByRole("menuitem", { name: "Profile" }).click();

    await expect(page).toHaveURL(/\/profile\//);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Edit profile" })
    ).toBeVisible();
    await expect(page.getByText("Game mode stats")).toBeVisible();
  }
);
