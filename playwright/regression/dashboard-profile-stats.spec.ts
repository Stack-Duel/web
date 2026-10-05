import { test, expect } from "@playwright/test";
import { routerConfig } from "@/shared/router-config";

test(
  "the dashboard shows the signed-in user's stats",
  { tag: ["@regression"] },
  async ({ page }) => {
    await page.goto(routerConfig.dashboard.path);

    const statsCard = page.locator('[data-slot="card"]', {
      hasText: "Your stats",
    });
    await expect(statsCard).toBeVisible();

    for (const label of ["Wins", "Current streak", "Longest streak"]) {
      const tile = statsCard.getByText(label).locator("..");
      await expect(tile.getByText(/^[\d,]+$/)).toBeVisible();
    }
  }
);
