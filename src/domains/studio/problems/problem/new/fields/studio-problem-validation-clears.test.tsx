import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "@tanstack/react-form";
import StudioProblemTitleField from "./studio-problem-title-field";
import { newStudioProblemSchema } from "../new-studio-problem-schema";
import { useNewStudioProblemStore } from "../new-studio-problem-store";

function TitleOnlyForm() {
  const form = useForm({
    defaultValues: {
      title: "",
      question: "",
      estimatedDifficulty: 500,
      timeLimitMs: 1000,
      memoryLimitMB: 64,
      trackId: "",
      tags: [] as string[],
    },
    validators: {
      onChange: newStudioProblemSchema,
      onSubmit: newStudioProblemSchema,
    },
  });

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <form.Field name="title">
        {(field) => <StudioProblemTitleField field={field} />}
      </form.Field>
      <button type="button">elsewhere</button>
    </form>
  );
}

beforeEach(() => useNewStudioProblemStore.getState().reset());

describe("studio problem field validation", () => {
  it("clears the error as soon as the value becomes valid, without needing to blur again", async () => {
    const user = userEvent.setup();
    render(<TitleOnlyForm />);

    const input = screen.getByRole("textbox", { name: "Title" });

    await user.type(input, "ab");
    await user.tab();

    expect(input).toHaveAttribute("aria-invalid", "true");

    await user.type(input, "c");

    expect(input).toHaveAttribute("aria-invalid", "false");
  });

  it("does not flag an untouched field even though the form as a whole is invalid", async () => {
    render(<TitleOnlyForm />);

    const input = screen.getByRole("textbox", { name: "Title" });

    expect(input).toHaveAttribute("aria-invalid", "false");
  });
});
