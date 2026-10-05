import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import AdminSubmissionStepDetail, {
  formatDurationMs,
} from "./admin-submission-step-detail";
import {
  buildAdminSubmissionJobAttempt,
  buildAdminSubmissionJobStep,
} from "@/test/factories/submission";

describe("formatDurationMs", () => {
  it("renders a placeholder dash for null", () => {
    expect(formatDurationMs(null)).toBe("-");
  });

  it("renders sub-second durations in milliseconds", () => {
    expect(formatDurationMs(250)).toBe("250ms");
  });

  it("renders durations of a second or more in seconds", () => {
    expect(formatDurationMs(1500)).toBe("1.50s");
  });
});

describe("AdminSubmissionStepDetail", () => {
  it("prompts to select a step when none is given", () => {
    render(<AdminSubmissionStepDetail step={undefined} />);

    expect(
      screen.getByText("Select a step to see its attempts.")
    ).toBeVisible();
  });

  it("shows a not-started message when the step has no attempts", () => {
    render(
      <AdminSubmissionStepDetail
        step={buildAdminSubmissionJobStep({ attempts: [] })}
      />
    );

    expect(screen.getByText("This step has not started yet.")).toBeVisible();
  });

  it("renders an attempt card per attempt", () => {
    render(
      <AdminSubmissionStepDetail
        step={buildAdminSubmissionJobStep({
          attempts: [
            buildAdminSubmissionJobAttempt({ attemptNumber: 1 }),
            buildAdminSubmissionJobAttempt({
              attemptNumber: 2,
              status: "Failed",
            }),
          ],
        })}
      />
    );

    expect(screen.getByText("Attempt 1")).toBeVisible();
    expect(screen.getByText("Attempt 2")).toBeVisible();
  });

  it("shows the attempt's error when present", () => {
    render(
      <AdminSubmissionStepDetail
        step={buildAdminSubmissionJobStep({
          attempts: [
            buildAdminSubmissionJobAttempt({ error: "Timeout exceeded" }),
          ],
        })}
      />
    );

    expect(screen.getByText("Timeout exceeded")).toBeVisible();
  });

  it("hides the error section when there is none", () => {
    render(
      <AdminSubmissionStepDetail
        step={buildAdminSubmissionJobStep({
          attempts: [buildAdminSubmissionJobAttempt({ error: null })],
        })}
      />
    );

    expect(screen.queryByText("Error")).not.toBeInTheDocument();
  });
});
