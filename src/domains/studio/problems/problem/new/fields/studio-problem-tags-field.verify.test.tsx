import { afterEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "@tanstack/react-form";
import StudioProblemTagsField from "./studio-problem-tags-field";
import { useNewStudioProblemStore } from "../new-studio-problem-store";

function TestHarness() {
  const form = useForm({ defaultValues: { tags: ["arrays", "hash-map"] } });
  return (
    <form.Field name="tags">
      {(field) => <StudioProblemTagsField field={field} />}
    </form.Field>
  );
}

describe("Backspace removes last tag (throwaway verification)", () => {
  afterEach(() => {
    useNewStudioProblemStore.getState().reset();
  });

  it("removes the last tag when Backspace is pressed on an empty draft", async () => {
    useNewStudioProblemStore.setState({ tags: ["arrays", "hash-map"] });
    render(<TestHarness />);

    expect(screen.getByText("arrays")).toBeVisible();
    expect(screen.getByText("hash-map")).toBeVisible();

    const input = screen.getByRole("textbox");
    await userEvent.click(input);
    await userEvent.keyboard("{Backspace}");

    expect(screen.queryByText("hash-map")).not.toBeInTheDocument();
    expect(screen.getByText("arrays")).toBeVisible();
  });
});
