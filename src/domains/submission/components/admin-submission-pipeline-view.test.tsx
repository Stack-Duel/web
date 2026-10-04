import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdminSubmissionPipelineView from "./admin-submission-pipeline-view";
import {
  buildAdminSubmissionJob,
  buildAdminSubmissionJobStep,
} from "@/test/factories/submission";

describe("AdminSubmissionPipelineView", () => {
  it("shows a message when there is no job", () => {
    render(<AdminSubmissionPipelineView job={null} />);

    expect(
      screen.getByText("No pipeline job found for this submission.")
    ).toBeVisible();
  });

  it("selects the current step by default", () => {
    render(
      <AdminSubmissionPipelineView
        job={buildAdminSubmissionJob({
          currentStepId: "s2",
          steps: [
            buildAdminSubmissionJobStep({
              stepId: "s1",
              name: "Judge0 Execute",
            }),
            buildAdminSubmissionJobStep({ stepId: "s2", name: "Evaluate" }),
          ],
        })}
      />
    );

    expect(screen.getByText("Evaluate", { selector: "h3" })).toBeVisible();
  });

  it("falls back to the last step when there is no current step", () => {
    render(
      <AdminSubmissionPipelineView
        job={buildAdminSubmissionJob({
          currentStepId: null,
          steps: [
            buildAdminSubmissionJobStep({
              stepId: "s1",
              name: "Judge0 Execute",
            }),
            buildAdminSubmissionJobStep({ stepId: "s2", name: "Evaluate" }),
          ],
        })}
      />
    );

    expect(screen.getByText("Evaluate", { selector: "h3" })).toBeVisible();
  });

  it("switches the detail panel when a different step is selected", async () => {
    const user = userEvent.setup();
    render(
      <AdminSubmissionPipelineView
        job={buildAdminSubmissionJob({
          currentStepId: "s2",
          steps: [
            buildAdminSubmissionJobStep({
              stepId: "s1",
              name: "Judge0 Execute",
            }),
            buildAdminSubmissionJobStep({ stepId: "s2", name: "Evaluate" }),
          ],
        })}
      />
    );

    await user.click(screen.getByRole("button", { name: /Judge0 Execute/ }));

    expect(
      screen.getByText("Judge0 Execute", { selector: "h3" })
    ).toBeVisible();
  });
});
