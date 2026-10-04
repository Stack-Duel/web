import { test, expect } from "@playwright/test";
import { routerConfig } from "@/shared/router-config";

test(
  "the blog index lists posts and opening one renders its content",
  { tag: ["@smoke"] },
  async ({ page }) => {
    await page.goto(routerConfig.blog.path);

    const firstPost = page.getByRole("heading", { level: 3 }).first();
    await expect(firstPost).toBeVisible();
    const title = await firstPost.textContent();

    await firstPost.click();

    await expect(
      page.getByRole("heading", { level: 1, name: title ?? undefined })
    ).toBeVisible();
  }
);
