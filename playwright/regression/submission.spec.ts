import { test } from "@playwright/test";
import { ProblemsPage } from "../pages/problems-page";

test(
  "running a problem's starter code round-trips through the execution engine",
  { tag: ["@regression", "@critical"] },
  async ({ page }) => {
    const problemsPage = new ProblemsPage(page);
    await problemsPage.goto();
    await problemsPage.openFirstProblem();

    await problemsPage.submitStarterCode();
  }
);
