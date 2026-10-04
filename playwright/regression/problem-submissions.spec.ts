import { test, expect } from "@playwright/test";
import { ProblemsPage } from "../pages/problems-page";

test(
  "a completed submission appears in the problem's submission history",
  { tag: ["@regression"] },
  async ({ page }) => {
    const problemsPage = new ProblemsPage(page);
    await problemsPage.goto();
    await problemsPage.openFirstProblem();
    await problemsPage.submitStarterCode();

    await page.getByRole("link", { name: "View Submissions" }).click();

    await expect(page.getByText("No submissions found.")).toBeHidden();
  }
);
