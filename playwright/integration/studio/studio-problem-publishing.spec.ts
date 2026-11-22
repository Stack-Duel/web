import { test, expect } from "@playwright/test";
import { StudioProblemDetailPage } from "../../pages/studio-problem-detail-page";
import {
  buildPublishReadiness,
  buildStudioAccount,
  mockAccount,
  mockStudioProblemDetail,
  mockSubmitForValidation,
} from "./mocks";

const PROBLEM_ID = "problem_1";

test(
  "a published problem with unsaved-to-live edits offers to publish the changes",
  { tag: ["@integration"] },
  async ({ page }) => {
    const studioProblem = new StudioProblemDetailPage(page);
    await mockAccount(page, buildStudioAccount());
    await mockStudioProblemDetail(page, PROBLEM_ID, {
      status: "Published",
      publishReadiness: buildPublishReadiness({
        hasUnpublishedChanges: true,
      }),
    });

    await studioProblem.goto(PROBLEM_ID);

    await expect(page.getByText(/edits that are not live yet/i)).toBeVisible();
    await expect(studioProblem.publishChangesButton).toBeEnabled();
    await expect(studioProblem.submitForValidationButton).toBeHidden();
  }
);

test(
  "publishing changes submits the problem for validation",
  { tag: ["@integration"] },
  async ({ page }) => {
    const studioProblem = new StudioProblemDetailPage(page);
    await mockAccount(page, buildStudioAccount());
    await mockStudioProblemDetail(page, PROBLEM_ID, {
      status: "Published",
      publishReadiness: buildPublishReadiness({
        hasUnpublishedChanges: true,
      }),
    });
    const submissions = await mockSubmitForValidation(page, PROBLEM_ID);

    await studioProblem.goto(PROBLEM_ID);
    await studioProblem.publishChangesButton.click();

    await expect(page.getByText(/publishing your changes/i)).toBeVisible();
    expect(submissions).toEqual(["POST"]);
  }
);

test(
  "a published problem with nothing pending cannot be submitted again",
  { tag: ["@integration"] },
  async ({ page }) => {
    const studioProblem = new StudioProblemDetailPage(page);
    await mockAccount(page, buildStudioAccount());
    await mockStudioProblemDetail(page, PROBLEM_ID, {
      status: "Published",
      publishReadiness: buildPublishReadiness({
        canSubmit: false,
        hasUnpublishedChanges: false,
      }),
    });

    await studioProblem.goto(PROBLEM_ID);

    await expect(page.getByText(/edits that are not live yet/i)).toBeHidden();
    await expect(studioProblem.submitForValidationButton).toBeDisabled();
  }
);

test(
  "a revalidating problem shows the publishing pipeline with a way to cancel",
  { tag: ["@integration"] },
  async ({ page }) => {
    const studioProblem = new StudioProblemDetailPage(page);
    await mockAccount(page, buildStudioAccount());
    await mockStudioProblemDetail(page, PROBLEM_ID, {
      status: "Published",
      publishReadiness: buildPublishReadiness({
        canSubmit: false,
        hasUnpublishedChanges: true,
        isRevalidating: true,
        lastAttemptStatus: "Pending",
        attemptCount: 2,
        lastSubmittedAt: "2026-11-21T04:15:00.000Z",
      }),
    });

    await studioProblem.goto(PROBLEM_ID);

    await expect(page.getByText("Publishing", { exact: true })).toBeVisible();
    await expect(page.getByText("Reference solutions")).toBeVisible();
    await expect(studioProblem.cancelValidationButton).toBeVisible();
    await expect(
      page.getByText(/editing is locked while validation runs/i)
    ).toBeVisible();
  }
);

test(
  "a failed attempt names the step that failed and the reason",
  { tag: ["@integration"] },
  async ({ page }) => {
    const studioProblem = new StudioProblemDetailPage(page);
    await mockAccount(page, buildStudioAccount());
    await mockStudioProblemDetail(page, PROBLEM_ID, {
      status: "Failed",
      publishReadiness: buildPublishReadiness({
        attemptCount: 1,
        lastAttemptStatus: "Failed",
        lastFailureReason:
          "Case 'Y counts when asked': runtime error. Expected 1, got no output.",
        steps: [
          {
            kind: "AuthorChecks",
            status: "Succeeded",
            startedAt: "2026-11-21T04:15:00.000Z",
            completedAt: "2026-11-21T04:15:00.400Z",
            detail: "1 setup(s) and generation parameters present.",
            items: [],
          },
          {
            kind: "ReferenceSolutions",
            status: "Failed",
            startedAt: "2026-11-21T04:15:01.000Z",
            completedAt: "2026-11-21T04:15:41.000Z",
            detail:
              "Case 'Y counts when asked': runtime error. Expected 1, got no output.",
            items: [
              {
                label: "JavaScript",
                status: "Failed",
                detail: "SyntaxError: Unexpected token 'const'",
              },
            ],
          },
          {
            kind: "TestCaseGeneration",
            status: "Skipped",
            startedAt: null,
            completedAt: null,
            detail: null,
            items: [],
          },
        ],
      }),
    });

    await studioProblem.goto(PROBLEM_ID);

    await expect(page.getByText("Publishing failed")).toBeVisible();
    await expect(
      page.getByText("SyntaxError: Unexpected token 'const'")
    ).toBeVisible();
    await expect(page.getByText("400ms")).toBeVisible();
    await expect(page.getByText(/editing is unlocked again/i)).toBeVisible();
  }
);

test(
  "a retried attempt reports the error it recovered from",
  { tag: ["@integration"] },
  async ({ page }) => {
    const studioProblem = new StudioProblemDetailPage(page);
    await mockAccount(page, buildStudioAccount());
    await mockStudioProblemDetail(page, PROBLEM_ID, {
      status: "Pending",
      publishReadiness: buildPublishReadiness({
        canSubmit: false,
        attemptCount: 1,
        lastAttemptStatus: "Pending",
        processingAttempts: 2,
        lastError: "23505: duplicate key value violates unique constraint",
      }),
    });

    await studioProblem.goto(PROBLEM_ID);

    await expect(page.getByText(/2 of 5 attempts used/i)).toBeVisible();
    await expect(page.getByText(/duplicate key value/i)).toBeVisible();
  }
);
