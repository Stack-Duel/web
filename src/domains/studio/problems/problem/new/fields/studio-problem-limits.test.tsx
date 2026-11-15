import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "@tanstack/react-form";
import StudioProblemTimeLimitField from "./studio-problem-time-limit-field";
import StudioProblemMemoryLimitField from "./studio-problem-memory-limit-field";
import { useNewStudioProblemStore } from "../new-studio-problem-store";

function LimitsForm() {
  const form = useForm({
    defaultValues: { timeLimitMs: 1000, memoryLimitMB: 64 },
  });
  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <form.Field name="timeLimitMs">
        {(field) => <StudioProblemTimeLimitField field={field} />}
      </form.Field>
      <form.Field name="memoryLimitMB">
        {(field) => <StudioProblemMemoryLimitField field={field} />}
      </form.Field>
      <button
        type="button"
        onClick={() => {
          form.setFieldValue("timeLimitMs", 2000);
          form.setFieldValue("memoryLimitMB", 128);
        }}
      >
        Load values
      </button>
    </form>
  );
}

beforeEach(() => useNewStudioProblemStore.getState().reset());

describe.each([
  {
    label: "Time limit (ms)",
    replacement: "1500",
    min: 100,
    max: 10000,
    key: "timeLimitMs" as const,
    loaded: 2000,
  },
  {
    label: "Memory limit (MB)",
    replacement: "256",
    min: 16,
    max: 512,
    key: "memoryLimitMB" as const,
    loaded: 128,
  },
])("$label editing", ({ label, replacement, min, max, key, loaded }) => {
  it("allows clearing and typing a multi-digit replacement before committing on blur", async () => {
    const user = userEvent.setup();
    render(<LimitsForm />);
    const input = screen.getByRole("spinbutton", { name: label });
    await user.clear(input);
    expect(input).toHaveValue(null);
    await user.type(input, replacement);
    expect(input).toHaveValue(Number(replacement));
    await user.tab();
    expect(useNewStudioProblemStore.getState()[key]).toBe(Number(replacement));
    await user.click(screen.getByRole("button", { name: "Load values" }));
    expect(input).toHaveValue(loaded);
  });

  it("clamps empty and out-of-range drafts on blur or Enter", async () => {
    const user = userEvent.setup();
    render(<LimitsForm />);
    const input = screen.getByRole("spinbutton", { name: label });
    await user.clear(input);
    await user.tab();
    expect(input).toHaveValue(min);
    await user.clear(input);
    await user.type(input, "99999");
    expect(input).toHaveValue(99999);
    await user.keyboard("{Enter}");
    expect(input).toHaveValue(max);
    expect(useNewStudioProblemStore.getState()[key]).toBe(max);
  });
});
