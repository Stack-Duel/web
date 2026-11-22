import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "@tanstack/react-form";
import StudioProblemQuestionField from "./studio-problem-question-field";
import { newStudioProblemSchema } from "../new-studio-problem-schema";

const VALID_QUESTION = `A valid question body that comfortably clears the fifty character minimum.`;

function QuestionForm() {
  const form = useForm({
    defaultValues: {
      title: "Count Repeated Values",
      question: "",
      estimatedDifficulty: 450,
      timeLimitMs: 1000,
      memoryLimitMB: 64,
      trackId: "track-1",
      tags: ["arrays"],
    },
    validators: {
      onBlur: newStudioProblemSchema,
    },
  });

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <form.Field name="question">
        {(field) => <StudioProblemQuestionField field={field} />}
      </form.Field>
    </form>
  );
}

describe("StudioProblemQuestionField", () => {
  it("does not complain about length while a valid question is being pasted in", async () => {
    const user = userEvent.setup();
    render(<QuestionForm />);

    const textarea = screen.getByRole("textbox", { name: "Question" });

    await user.click(textarea);
    await user.paste(VALID_QUESTION);

    expect(textarea).toHaveValue(VALID_QUESTION);
    expect(textarea).not.toHaveAttribute("aria-invalid", "true");
    expect(screen.queryByText(/at least/i)).not.toBeInTheDocument();
  });

  it("keeps quiet after blurring a valid pasted question", async () => {
    const user = userEvent.setup();
    render(<QuestionForm />);

    const textarea = screen.getByRole("textbox", { name: "Question" });

    await user.click(textarea);
    await user.paste(VALID_QUESTION);
    await user.tab();

    expect(textarea).not.toHaveAttribute("aria-invalid", "true");
  });

  it("reports a too-short question once the field has been left", async () => {
    const user = userEvent.setup();
    render(<QuestionForm />);

    const textarea = screen.getByRole("textbox", { name: "Question" });

    await user.click(textarea);
    await user.paste("too short");
    await user.tab();

    expect(textarea).toHaveAttribute("aria-invalid", "true");
  });
});
