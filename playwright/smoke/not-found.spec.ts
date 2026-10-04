import { test, expect } from "@playwright/test";

test(
  "an unknown route renders a 404 instead of crashing",
  { tag: ["@smoke"] },
  async ({ page }) => {
    const response = await page.goto("/this-page-does-not-exist");

    expect(response?.status()).toBe(404);
    await expect(page.getByText(/this page could not be found/i)).toBeVisible();
  }
);
