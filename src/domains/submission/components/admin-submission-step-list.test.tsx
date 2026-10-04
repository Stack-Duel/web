import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdminSubmissionStepList from "./admin-submission-step-list";
import { buildAdminSubmissionJobStep } from "@/test/factories/submission";

describe("AdminSubmissionStepList", () => {
  it("renders a button per step with its name", () => {
    render(
      <AdminSubmissionStepList
        steps={[
          buildAdminSubmissionJobStep({ stepId: "s1", name: "Judge0 Execute" }),
          buildAdminSubmissionJobStep({ stepId: "s2", name: "Evaluate" }),
        ]}
        selectedStepId={null}
        onSelectStep={vi.fn()}
      />
    );

    expect(screen.getByText("Judge0 Execute")).toBeVisible();
    expect(screen.getByText("Evaluate")).toBeVisible();
  });

  it("shows the attempt count badge only when there is more than one attempt", () => {
    render(
      <AdminSubmissionStepList
        steps={[
          buildAdminSubmissionJobStep({
            stepId: "s1",
            name: "Judge0 Execute",
            attemptCount: 3,
          }),
          buildAdminSubmissionJobStep({
            stepId: "s2",
            name: "Evaluate",
            attemptCount: 1,
          }),
        ]}
        selectedStepId={null}
        onSelectStep={vi.fn()}
      />
    );

    expect(screen.getByText("3 attempts")).toBeVisible();
    expect(screen.queryByText("1 attempts")).not.toBeInTheDocument();
  });

  it("calls onSelectStep with the clicked step's id", async () => {
    const onSelectStep = vi.fn();
    const user = userEvent.setup();
    render(
      <AdminSubmissionStepList
        steps={[
          buildAdminSubmissionJobStep({ stepId: "s1", name: "Judge0 Execute" }),
        ]}
        selectedStepId={null}
        onSelectStep={onSelectStep}
      />
    );

    await user.click(screen.getByRole("button", { name: /Judge0 Execute/ }));

    expect(onSelectStep).toHaveBeenCalledWith("s1");
  });
});
