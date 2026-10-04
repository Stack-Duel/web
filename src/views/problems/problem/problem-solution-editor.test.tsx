import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProblemSolutionEditor from "./problem-solution-editor";
import { useWorkspaceStore } from "@/domains/workspace/state/workspace-store";
import { buildProblem } from "@/test/factories/problem";

vi.mock(
  "@/domains/workspace/solution-editor/components/solution-editor",
  () => ({
    default: ({
      value,
      onChange,
    }: {
      value: string;
      onChange: (value: string) => void;
    }) => (
      <textarea
        aria-label="code"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    ),
  })
);

const initialState = useWorkspaceStore.getState();
const problem = buildProblem();

describe("ProblemSolutionEditor", () => {
  beforeEach(() => {
    useWorkspaceStore.setState(initialState, true);
  });

  it("renders the workspace store's current code", () => {
    useWorkspaceStore.setState({ code: "print(1)" });

    render(<ProblemSolutionEditor problem={problem} />);

    expect(screen.getByLabelText("code")).toHaveValue("print(1)");
  });

  it("writes edits back into the workspace store", async () => {
    const user = userEvent.setup();
    render(<ProblemSolutionEditor problem={problem} />);

    await user.type(screen.getByLabelText("code"), "x");

    expect(useWorkspaceStore.getState().code).toBe("x");
  });
});
