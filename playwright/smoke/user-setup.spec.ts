import { test, expect } from "@playwright/test";
import { routerConfig } from "@/shared/router-config";

test(
  "the setup wizard walks through username, bio, and language steps",
  { tag: ["@smoke"] },
  async ({ page }) => {
    await page.goto(routerConfig.userSetup.path);

    await expect(page.getByText("What should we call you?")).toBeVisible();
    await page.getByTestId("user-setup-username").fill("e2e-smoke-check");
    await page.getByRole("button", { name: "Next", exact: true }).click();

    await expect(page.getByText("Tell us about yourself")).toBeVisible();
    await page.getByRole("button", { name: "Skip" }).click();

    await expect(page.getByText("Which languages do you know?")).toBeVisible();
    await page.getByRole("checkbox").first().check();
    await page.getByRole("button", { name: "Next", exact: true }).click();

    await expect(page.getByText("Rank your languages")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Finish setup" })
    ).toBeVisible();
  }
);
