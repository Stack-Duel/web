import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { buildStudioProblemDetails } from "@/test/factories/studio-problem";
import type { StudioProblemPublishReadiness } from "@/domains/studio/models/studio-problem-publish-readiness";
import StudioProblemPublishingPipeline from "./studio-problem-publishing-pipeline";

function buildReadiness(
  overrides: Partial<StudioProblemPublishReadiness> = {}
): StudioProblemPublishReadiness {
  return {
    canSubmit: false,
    isReady: true,
    requirementsMet: 4,
    requirementCount: 4,
    setupCount: 4,
    languagesMissingReferenceSolution: [],
    sampleTestCaseCount: 6,
    hasGenerationParameters: true,
    attemptCount: 2,
    lastSubmittedAt: "2026-11-14T14:22:00.000Z",
    lastCompletedAt: null,
    lastAttemptStatus: "Pending",
    lastFailureReason: null,
    steps: null,
    ...overrides,
  };
}

function renderPipeline(readiness: StudioProblemPublishReadiness | null) {
  render(
    <StudioProblemPublishingPipeline
      details={buildStudioProblemDetails({ publishReadiness: readiness })}
    />
  );
}

function step(label: string) {
  return screen.getByText(label).closest("li") as HTMLElement;
}

describe("StudioProblemPublishingPipeline", () => {
  it("lists the four stages in order", () => {
    renderPipeline(buildReadiness());

    const steps = screen.getAllByRole("listitem");

    expect(steps).toHaveLength(4);
    expect(steps[0]).toHaveTextContent("Author checks");
    expect(steps[1]).toHaveTextContent("Reference solutions");
    expect(steps[2]).toHaveTextContent("Test case generation");
    expect(steps[3]).toHaveTextContent("Publish");
  });

  it("runs the reference solutions stage while validation is pending", () => {
    renderPipeline(buildReadiness({ lastAttemptStatus: "Pending" }));

    expect(within(step("Author checks")).getByLabelText("done")).toBeVisible();
    expect(
      within(step("Reference solutions")).getByLabelText("running")
    ).toBeVisible();
    expect(
      within(step("Test case generation")).getByLabelText("waiting")
    ).toBeVisible();
  });

  it("moves on to generation once reference solutions have passed", () => {
    renderPipeline(buildReadiness({ lastAttemptStatus: "AwaitingGeneration" }));

    expect(
      within(step("Reference solutions")).getByLabelText("done")
    ).toBeVisible();
    expect(
      within(step("Test case generation")).getByLabelText("running")
    ).toBeVisible();
    expect(within(step("Publish")).getByLabelText("waiting")).toBeVisible();
  });

  it("marks every stage done once publishing completes", () => {
    renderPipeline(buildReadiness({ lastAttemptStatus: "Completed" }));

    expect(screen.getAllByLabelText("done")).toHaveLength(4);
  });

  it("shows the failure reason on the stage that failed", () => {
    renderPipeline(
      buildReadiness({
        lastAttemptStatus: "Failed",
        lastFailureReason: "Python wrong answer on sample case 4",
      })
    );

    expect(screen.getByText("Publishing failed")).toBeVisible();
    expect(
      within(step("Reference solutions")).getByLabelText("failed")
    ).toBeVisible();
    expect(
      screen.getByText("Python wrong answer on sample case 4")
    ).toBeVisible();
  });

  it("says editing is locked while a run is in flight", () => {
    renderPipeline(buildReadiness({ lastAttemptStatus: "Pending" }));

    expect(
      screen.getByText(/Editing is locked while validation runs/)
    ).toBeVisible();
  });

  it("says editing is unlocked again after a failure", () => {
    renderPipeline(buildReadiness({ lastAttemptStatus: "Failed" }));

    expect(screen.getByText(/Editing is unlocked again/)).toBeVisible();
  });

  it("names the attempt it is reporting on", () => {
    renderPipeline(buildReadiness({ attemptCount: 3 }));

    expect(screen.getByText(/Attempt 3/)).toBeVisible();
  });

  it("renders the recorded steps rather than inferring them", () => {
    renderPipeline(
      buildReadiness({
        lastAttemptStatus: "AwaitingGeneration",
        steps: [
          {
            kind: "AuthorChecks",
            status: "Succeeded",
            startedAt: "2026-11-14T14:22:07.000Z",
            completedAt: "2026-11-14T14:22:07.400Z",
            detail: "4 setup(s) and generation parameters present.",
            items: [],
          },
          {
            kind: "ReferenceSolutions",
            status: "Succeeded",
            startedAt: "2026-11-14T14:22:09.000Z",
            completedAt: "2026-11-14T14:22:40.000Z",
            detail: "4 of 4 passed.",
            items: [
              { label: "TypeScript", status: "Succeeded", detail: null },
              { label: "Python", status: "Succeeded", detail: null },
            ],
          },
          {
            kind: "TestCaseGeneration",
            status: "Running",
            startedAt: "2026-11-14T14:22:40.000Z",
            completedAt: null,
            detail: null,
            items: [],
          },
          {
            kind: "Publish",
            status: "Pending",
            startedAt: null,
            completedAt: null,
            detail: null,
            items: [],
          },
        ],
      })
    );

    expect(
      screen.getByText("4 setup(s) and generation parameters present.")
    ).toBeVisible();
    expect(screen.getByText("4 of 4 passed.")).toBeVisible();
    expect(screen.getByText("TypeScript")).toBeVisible();
    expect(screen.getByText("Python")).toBeVisible();
  });

  it("shows how long a recorded step took", () => {
    renderPipeline(
      buildReadiness({
        steps: [
          {
            kind: "AuthorChecks",
            status: "Succeeded",
            startedAt: "2026-11-14T14:22:07.000Z",
            completedAt: "2026-11-14T14:22:07.400Z",
            detail: null,
            items: [],
          },
        ],
      })
    );

    expect(screen.getByText("400ms")).toBeVisible();
  });

  it("marks steps a failed run never reached", () => {
    renderPipeline(
      buildReadiness({
        lastAttemptStatus: "Failed",
        steps: [
          {
            kind: "ReferenceSolutions",
            status: "Failed",
            startedAt: "2026-11-14T14:22:09.000Z",
            completedAt: "2026-11-14T14:23:20.000Z",
            detail: "Python: wrong answer on sample case 4",
            items: [
              { label: "TypeScript", status: "Succeeded", detail: null },
              {
                label: "Python",
                status: "Failed",
                detail: "wrong answer on sample case 4",
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
      })
    );

    expect(screen.getByText("Publishing failed")).toBeVisible();
    expect(
      screen.getByText("Python: wrong answer on sample case 4")
    ).toBeVisible();
    expect(
      within(step("Test case generation")).getByLabelText("not reached")
    ).toBeVisible();
  });

  it("renders nothing when there is no readiness to report", () => {
    const { container } = render(
      <StudioProblemPublishingPipeline
        details={buildStudioProblemDetails({ publishReadiness: null })}
      />
    );

    expect(container).toBeEmptyDOMElement();
  });
});
