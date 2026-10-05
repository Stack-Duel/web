import { test, expect } from "@playwright/test";
import { ProblemsPage } from "../pages/problems-page";

test(
  "submitting feedback from a problem page shows a success toast",
  { tag: ["@regression"] },
  async ({ page }) => {
    const problemsPage = new ProblemsPage(page);
    await problemsPage.goto();
    await problemsPage.openFirstProblem();

    await page.getByRole("button", { name: "Feedback", exact: true }).click();

    const dialog = page.getByRole("dialog", { name: /give feedback/i });
    await dialog.getByLabel("Message").fill("e2e regression check");
    await dialog.getByRole("button", { name: "Send feedback" }).click();

    await expect(page.getByText("Thanks for the feedback!")).toBeVisible();
    await expect(dialog).toBeHidden();
  }
);
