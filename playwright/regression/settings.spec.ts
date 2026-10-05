import { test, expect } from "@playwright/test";
import { SettingsPage } from "../pages/settings-page";

test(
  "the profile tab is the default settings page and shows profile-only sections",
  { tag: ["@regression"] },
  async ({ page }) => {
    const settingsPage = new SettingsPage(page);
    await settingsPage.goto();

    await expect(page).toHaveURL(/\/settings\/profile$/);
    await expect(page.getByText("Avatar", { exact: true })).toBeVisible();
    await expect(page.getByText("Privacy", { exact: true })).toBeVisible();
  }
);

test(
  "switching to the account tab shows the read-only account section",
  { tag: ["@regression"] },
  async ({ page }) => {
    const settingsPage = new SettingsPage(page);
    await settingsPage.goto();

    await settingsPage.openTab("Account");

    await expect(page).toHaveURL(/\/settings\/account$/);
    await expect(
      page.getByText(
        "This information comes from your login provider and can't be edited here."
      )
    ).toBeVisible();
  }
);

test(
  "switching to the preferences tab shows the language preferences form",
  { tag: ["@regression"] },
  async ({ page }) => {
    const settingsPage = new SettingsPage(page);
    await settingsPage.goto();

    await settingsPage.openTab("Preferences");

    await expect(page).toHaveURL(/\/settings\/preferences$/);
    await expect(
      page.getByText("Edit your personal preferences like languages.")
    ).toBeVisible();
  }
);
