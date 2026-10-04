import { test, expect } from "@playwright/test";
import { SettingsPage } from "../pages/settings-page";
import { routerConfig } from "@/shared/router-config";

test(
  "toggling profile privacy is reflected on the public profile",
  { tag: ["@regression"] },
  async ({ page }) => {
    const settingsPage = new SettingsPage(page);
    await settingsPage.goto();

    const privacyToggle = page.getByRole("button", {
      name: /make (private|public)/i,
    });
    const wasPrivate = (await privacyToggle.textContent())?.includes(
      "Make public"
    );

    await privacyToggle.click();
    await expect(
      page.getByRole("button", {
        name: wasPrivate ? "Make private" : "Make public",
      })
    ).toBeVisible();

    await page.locator('[data-cy="user-dropdown-trigger"]').click();
    await page.getByRole("menuitem", { name: "Profile" }).click();
    await expect(page).toHaveURL(/\/profile\//);

    if (wasPrivate) {
      await expect(page.getByText("Private", { exact: true })).toBeHidden();
    } else {
      await expect(page.getByText("Private", { exact: true })).toBeVisible();
    }

    await page.goto(routerConfig.settingsProfile.path);
    await privacyToggle.click();
    await expect(
      page.getByRole("button", {
        name: wasPrivate ? "Make public" : "Make private",
      })
    ).toBeVisible();
  }
);
