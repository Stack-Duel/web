import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useDeleteStudioProblem } from "@/domains/studio/api/delete-studio-problem";
import StudioProblemDeleteButton from "./studio-problem-delete-button";

vi.mock("@/env", () => import("@/test/mocks/env"));
vi.mock("next/navigation", () => import("@/test/mocks/next-navigation"));
vi.mock("@/domains/studio/api/delete-studio-problem");
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const mockUseDeleteStudioProblem = vi.mocked(useDeleteStudioProblem);
const deleteProblem = vi.fn();

const TITLE = "Count Repeated Values";

beforeEach(() => {
  deleteProblem.mockClear();
  mockUseDeleteStudioProblem.mockReturnValue({
    mutate: deleteProblem,
    isPending: false,
  } as unknown as ReturnType<typeof useDeleteStudioProblem>);
});

async function openDialog(isPublished = false) {
  const user = userEvent.setup();

  render(
    <StudioProblemDeleteButton
      problemId="problem_1"
      title={TITLE}
      isPublished={isPublished}
    />
  );

  await user.click(screen.getByRole("button", { name: /Delete/ }));

  return user;
}

function confirmButton() {
  return screen.getByRole("button", { name: "Delete problem" });
}

describe("StudioProblemDeleteButton", () => {
  it("keeps the confirm button disabled until the title is typed exactly", async () => {
    const user = await openDialog();

    expect(confirmButton()).toBeDisabled();

    await user.type(
      screen.getByLabelText(/to confirm/i),
      "count repeated values"
    );

    expect(confirmButton()).toBeDisabled();
  });

  it("enables the confirm button on an exact match and sends the typed title", async () => {
    const user = await openDialog();

    await user.type(screen.getByLabelText(/to confirm/i), TITLE);

    expect(confirmButton()).toBeEnabled();

    await user.click(confirmButton());

    expect(deleteProblem).toHaveBeenCalledWith(
      { problemId: "problem_1", confirmationTitle: TITLE },
      expect.anything()
    );
  });

  it("warns that a published problem is hidden rather than erased", async () => {
    await openDialog(true);

    expect(screen.getByText(/disappears from every listing/i)).toBeVisible();
  });

  it("says an untouched draft is permanently deleted", async () => {
    await openDialog(false);

    expect(screen.getByText(/permanently deleted/i)).toBeVisible();
  });

  it("reassures that a game in progress keeps working", async () => {
    await openDialog();

    expect(screen.getByText(/still in progress keeps working/i)).toBeVisible();
  });

  it("does not delete anything when the dialog is cancelled", async () => {
    const user = await openDialog();

    await user.type(screen.getByLabelText(/to confirm/i), TITLE);
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(deleteProblem).not.toHaveBeenCalled();
  });
});
