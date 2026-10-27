import type { Page } from "@playwright/test";

export async function mockJson(
  page: Page,
  pattern: string | RegExp,
  data: unknown
) {
  await page.route(pattern, async (route) => {
    await route.fulfill({ json: data });
  });
}
