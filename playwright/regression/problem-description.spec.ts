import { test, expect } from "@playwright/test";
import { ProblemsPage } from "../pages/problems-page";

test(
  "problem description tab renders and its feedback button opens the feedback dialog",
  { tag: ["@regression"] },
  async ({ page }) => {
    const problemsPage = new ProblemsPage(page);
    await problemsPage.goto();
    await problemsPage.openFirstProblem();

    await expect(page.getByRole("heading", { level: 2 })).toBeVisible();

    const feedbackButton = page.getByRole("button", {
      name: "Feedback",
      exact: true,
    });
    await expect(feedbackButton).toBeVisible();
    await feedbackButton.click();

    await expect(
      page.getByRole("dialog", { name: /give feedback/i })
    ).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(
      page.getByRole("dialog", { name: /give feedback/i })
    ).toBeHidden();
  }
);
