import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProblemTestCases from "./problem-test-cases";
import { buildPublicTestCase } from "@/test/factories/problem";
import { useWorkspaceStore } from "@/domains/workspace/state/workspace-store";

describe("ProblemTestCases", () => {
  beforeEach(() => {
    useWorkspaceStore.getState().reset();
  });

  it("shows an empty message and the custom panel when there are no public test cases", () => {
    render(<ProblemTestCases testCases={[]} />);

    expect(screen.getByText("No public test cases available.")).toBeVisible();
    expect(screen.getByText("Custom Test Cases")).toBeVisible();
  });

  it("shows a tab per public test case plus a Custom tab", () => {
    render(
      <ProblemTestCases
        testCases={[
          buildPublicTestCase({ name: "Example 1" }),
          buildPublicTestCase({ name: "Example 2" }),
        ]}
      />
    );

    expect(screen.getByRole("tab", { name: "Case 1" })).toBeVisible();
    expect(screen.getByRole("tab", { name: "Case 2" })).toBeVisible();
    expect(screen.getByRole("tab", { name: "Custom" })).toBeVisible();
  });

  it("shows the selected case's inputs and expected outputs", () => {
    render(
      <ProblemTestCases
        testCases={[
          buildPublicTestCase({
            name: "Example 1",
            inputs: [{ value: "[2,7,11,15]", valueType: "int[]" }],
            expectedOutputs: [{ value: "[0,1]", valueType: "int[]" }],
          }),
        ]}
      />
    );

    expect(screen.getByText("[2,7,11,15]")).toBeVisible();
    expect(screen.getByText("[0,1]")).toBeVisible();
  });

  it("adds a custom test case with one input per detected parameter", async () => {
    const user = userEvent.setup();
    render(
      <ProblemTestCases
        testCases={[
          buildPublicTestCase({
            inputs: [
              { value: "[2,7,11,15]", valueType: "int[]" },
              { value: "9", valueType: "int" },
            ],
          }),
        ]}
      />
    );

    await user.click(screen.getByRole("tab", { name: "Custom" }));
    await user.click(screen.getByRole("button", { name: "Add Test Case" }));

    const customCase = screen.getByText("Custom 1").closest("div")
      ?.parentElement as HTMLElement;
    expect(within(customCase).getByLabelText("Input 1 (int[])")).toBeVisible();
    expect(within(customCase).getByLabelText("Input 2 (int)")).toBeVisible();
  });

  it("removes a custom test case", async () => {
    const user = userEvent.setup();
    render(<ProblemTestCases testCases={[]} />);

    await user.click(screen.getByRole("button", { name: "Add Test Case" }));
    expect(screen.getByText("Custom 1")).toBeVisible();

    await user.click(
      screen.getByRole("button", { name: "Remove custom test case 1" })
    );

    expect(screen.queryByText("Custom 1")).not.toBeInTheDocument();
    expect(
      screen.getByText(
        "No custom test cases yet. Add one to try your own input."
      )
    ).toBeVisible();
  });

  it("updates a custom test case's input value", async () => {
    const user = userEvent.setup();
    render(<ProblemTestCases testCases={[]} />);

    await user.click(screen.getByRole("button", { name: "Add Test Case" }));
    await user.type(screen.getByLabelText("Input 1"), "{[}1,2,3{]}");

    expect(useWorkspaceStore.getState().customTestCases[0].inputs[0]).toBe(
      "[1,2,3]"
    );
  });
});
