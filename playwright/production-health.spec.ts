import { expect, test } from "@playwright/test";

test(
  "home page loads and the health check succeeds",
  { tag: "@production" },
  async ({ page }) => {
    const healthResponse = page.waitForResponse((response) => {
      const url = new URL(response.url());

      return (
        url.pathname === "/api/v1/health" &&
        response.request().method() === "GET"
      );
    });

    const homeResponse = await page.goto("/");

    expect(homeResponse?.ok()).toBe(true);
    expect((await healthResponse).ok()).toBe(true);
  }
);
