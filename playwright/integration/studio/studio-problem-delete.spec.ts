import { test, expect } from "@playwright/test";
import { StudioProblemDetailPage } from "../../pages/studio-problem-detail-page";
import {
  buildStudioAccount,
  mockAccount,
  mockDeleteStudioProblem,
  mockStudio,
  mockStudioProblemDetail,
} from "./mocks";

const PROBLEM_ID = "problem_1";
const TITLE = "Count Repeated Values";

test(
  "a creator must type the exact title before the delete is allowed",
  { tag: ["@integration"] },
  async ({ page }) => {
    const studioProblem = new StudioProblemDetailPage(page);
    await mockAccount(page, buildStudioAccount());
    await mockStudioProblemDetail(page, PROBLEM_ID, { title: TITLE });

    await studioProblem.goto(PROBLEM_ID);
    await studioProblem.deleteButton.click();

    await expect(studioProblem.confirmDeleteButton).toBeDisabled();

    await studioProblem.confirmationInput.fill("count repeated values");

    await expect(studioProblem.confirmDeleteButton).toBeDisabled();

    await studioProblem.confirmationInput.fill(TITLE);

    await expect(studioProblem.confirmDeleteButton).toBeEnabled();
  }
);

test(
  "deleting a problem sends the typed title and returns the creator to their problems",
  { tag: ["@integration"] },
  async ({ page }) => {
    const studioProblem = new StudioProblemDetailPage(page);
    await mockStudio(page);
    await mockStudioProblemDetail(page, PROBLEM_ID, { title: TITLE });
    const deleteRequests = await mockDeleteStudioProblem(page, PROBLEM_ID);

    await studioProblem.goto(PROBLEM_ID);
    await studioProblem.deleteButton.click();
    await studioProblem.confirmationInput.fill(TITLE);
    await studioProblem.confirmDeleteButton.click();

    await expect(page).toHaveURL(/\/studio\/problems$/);
    expect(deleteRequests).toHaveLength(1);
    expect(deleteRequests[0].confirmationTitle).toBe(TITLE);
  }
);

test(
  "cancelling the delete dialog leaves the problem alone",
  { tag: ["@integration"] },
  async ({ page }) => {
    const studioProblem = new StudioProblemDetailPage(page);
    await mockAccount(page, buildStudioAccount());
    await mockStudioProblemDetail(page, PROBLEM_ID, { title: TITLE });
    const deleteRequests = await mockDeleteStudioProblem(page, PROBLEM_ID);

    await studioProblem.goto(PROBLEM_ID);
    await studioProblem.deleteButton.click();
    await studioProblem.confirmationInput.fill(TITLE);
    await page.getByRole("button", { name: "Cancel" }).click();

    await expect(studioProblem.confirmationInput).toBeHidden();
    expect(deleteRequests).toHaveLength(0);
  }
);

test(
  "a published problem warns that its record is kept rather than erased",
  { tag: ["@integration"] },
  async ({ page }) => {
    const studioProblem = new StudioProblemDetailPage(page);
    await mockAccount(page, buildStudioAccount());
    await mockStudioProblemDetail(page, PROBLEM_ID, {
      title: TITLE,
      status: "Published",
    });

    await studioProblem.goto(PROBLEM_ID);
    await studioProblem.deleteButton.click();

    await expect(
      page.getByText(/disappears from every listing/i)
    ).toBeVisible();
    await expect(
      page.getByText(/still in progress keeps working/i)
    ).toBeVisible();
  }
);

test(
  "a draft warns that it will be permanently deleted",
  { tag: ["@integration"] },
  async ({ page }) => {
    const studioProblem = new StudioProblemDetailPage(page);
    await mockAccount(page, buildStudioAccount());
    await mockStudioProblemDetail(page, PROBLEM_ID, {
      title: TITLE,
      status: "Draft",
    });

    await studioProblem.goto(PROBLEM_ID);
    await studioProblem.deleteButton.click();

    await expect(page.getByText(/permanently deleted/i)).toBeVisible();
  }
);

test(
  "a failed delete surfaces the server's reason and keeps the creator on the problem",
  { tag: ["@integration"] },
  async ({ page }) => {
    const studioProblem = new StudioProblemDetailPage(page);
    await mockAccount(page, buildStudioAccount());
    await mockStudioProblemDetail(page, PROBLEM_ID, { title: TITLE });

    await page.route(
      new RegExp(`/api/v1/studio/problems/${PROBLEM_ID}(?:\\?.*)?$`),
      async (route) => {
        if (route.request().method() !== "DELETE") {
          await route.fallback();
          return;
        }

        await route.fulfill({
          status: 400,
          json: { message: "Wait for validation to finish before deleting." },
        });
      }
    );

    await studioProblem.goto(PROBLEM_ID);
    await studioProblem.deleteButton.click();
    await studioProblem.confirmationInput.fill(TITLE);
    await studioProblem.confirmDeleteButton.click();

    await expect(
      page.getByText(/wait for validation to finish before deleting/i)
    ).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`${PROBLEM_ID}$`));
  }
);
