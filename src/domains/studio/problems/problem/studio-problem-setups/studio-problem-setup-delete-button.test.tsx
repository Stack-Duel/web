import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import StudioProblemSetupDeleteButton from "./studio-problem-setup-delete-button";
import { useRemoveStudioProblemSetup } from "@/domains/studio/api/remove-studio-problem-setup";

vi.mock("@/domains/studio/api/remove-studio-problem-setup", () => ({
  useRemoveStudioProblemSetup: vi.fn(),
}));

const mockUseRemoveStudioProblemSetup = vi.mocked(useRemoveStudioProblemSetup);

function setup(testCaseCount = "0") {
  const mutate = vi.fn();
  mockUseRemoveStudioProblemSetup.mockReturnValue({
    mutate,
    isPending: false,
  } as unknown as ReturnType<typeof useRemoveStudioProblemSetup>);

  render(
    <StudioProblemSetupDeleteButton
      problemId="problem_1"
      languageVersionId="lang_version_1"
      languageLabel="Java JDK 17.0.6"
      testCaseCount={testCaseCount}
    />
  );

  return { mutate };
}

describe("StudioProblemSetupDeleteButton", () => {
  it("asks for confirmation before removing and names the language", async () => {
    const user = userEvent.setup();
    const { mutate } = setup();

    await user.click(
      screen.getByRole("button", { name: "Remove Java JDK 17.0.6 setup" })
    );

    expect(
      screen.getByRole("heading", { name: "Remove Java JDK 17.0.6?" })
    ).toBeVisible();
    expect(mutate).not.toHaveBeenCalled();
  });

  it("removes the setup with the language version id once confirmed", async () => {
    const user = userEvent.setup();
    const { mutate } = setup();

    await user.click(
      screen.getByRole("button", { name: "Remove Java JDK 17.0.6 setup" })
    );
    await user.click(screen.getByRole("button", { name: "Remove" }));

    expect(mutate).toHaveBeenCalledWith(
      { problemId: "problem_1", languageVersionId: "lang_version_1" },
      expect.anything()
    );
  });

  it("warns how many test cases go with the setup", async () => {
    const user = userEvent.setup();
    setup("12");

    await user.click(
      screen.getByRole("button", { name: "Remove Java JDK 17.0.6 setup" })
    );

    expect(screen.getByText(/12 test cases/)).toBeVisible();
  });
});
