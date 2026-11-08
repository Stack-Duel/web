import { test, expect } from "@playwright/test";
import { StudioProblemDetailPage } from "../../pages/studio-problem-detail-page";
import { mockAccount, buildStudioAccount, mockStudioProblemDetail } from "./mocks";

test(
  "a creator can view their studio problem's details and question",
  { tag: ["@integration"] },
  async ({ page }) => {
    const studioProblem = new StudioProblemDetailPage(page);
    await mockAccount(page, buildStudioAccount());
    await mockStudioProblemDetail(page, "problem_1", {
      slug: "two-sum",
      title: "Two Sum",
      difficultyTier: "Easy",
      status: "Published",
      question: "## Given an array, return two indices.",
    });

    await studioProblem.goto("problem_1");

    await expect(page.getByText("two-sum")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Two Sum" })
    ).toBeVisible();
    await expect(page.getByText("Easy")).toBeVisible();
    await expect(
      page.getByText("Published", { exact: true })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Given an array, return two indices." })
    ).toBeVisible();
  }
);

test(
  "a creator can switch to the Setups tab",
  { tag: ["@integration"] },
  async ({ page }) => {
    const studioProblem = new StudioProblemDetailPage(page);
    await mockAccount(page, buildStudioAccount());
    await mockStudioProblemDetail(page, "problem_1");

    await studioProblem.goto("problem_1");
    await studioProblem.setupsTab.click();

    await expect(page.getByRole("heading", { name: "SETUPS" })).toBeVisible();
  }
);

test(
  "a creator without Studio access sees a not-found page instead of the problem",
  { tag: ["@integration"] },
  async ({ page }) => {
    const studioProblem = new StudioProblemDetailPage(page);
    await mockAccount(page, buildStudioAccount({ permissions: [] }));
    await mockStudioProblemDetail(page, "problem_1");

    await studioProblem.goto("problem_1");

    await expect(
      page.getByText(/we could not find the page you are looking for/i)
    ).toBeVisible();
  }
);

test(
  "a creator viewing a problem that fails to load sees a retry option",
  { tag: ["@integration"] },
  async ({ page }) => {
    const studioProblem = new StudioProblemDetailPage(page);
    await mockAccount(page, buildStudioAccount());
    await page.route(
      /\/api\/v1\/studio\/problems\/missing(?:\?.*)?$/,
      async (route) => {
        await route.fulfill({ status: 404 });
      }
    );

    await studioProblem.goto("missing");

    await expect(
      page.getByRole("button", { name: "Try again" })
    ).toBeVisible();
  }
);
