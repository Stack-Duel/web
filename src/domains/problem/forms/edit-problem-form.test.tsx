import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import EditProblemForm from "./edit-problem-form";
import { useUpdateAdminProblem } from "../api/update-admin-problem";
import { buildAdminProblemDetail } from "@/test/factories/problem";

vi.mock("../api/update-admin-problem", () => ({
  useUpdateAdminProblem: vi.fn(),
}));
vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const mockedUseUpdateAdminProblem = vi.mocked(useUpdateAdminProblem);

describe("EditProblemForm", () => {
  it("pre-fills the fields from the given problem", () => {
    mockedUseUpdateAdminProblem.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useUpdateAdminProblem>);

    render(
      <EditProblemForm
        problem={buildAdminProblemDetail({
          title: "Two Sum",
          question: "Given an array...",
        })}
      />
    );

    expect(screen.getByLabelText("Title")).toHaveValue("Two Sum");
    expect(screen.getByLabelText("Question")).toHaveValue("Given an array...");
  });

  it("calls the mutation with the edited fields on save", async () => {
    const mutate = vi.fn();
    mockedUseUpdateAdminProblem.mockReturnValue({
      mutate,
      isPending: false,
    } as unknown as ReturnType<typeof useUpdateAdminProblem>);

    const user = userEvent.setup();
    render(
      <EditProblemForm
        problem={buildAdminProblemDetail({ id: "problem_1", title: "Two Sum" })}
      />
    );

    await user.clear(screen.getByLabelText("Title"));
    await user.type(screen.getByLabelText("Title"), "Two Sum Updated");
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    expect(mutate).toHaveBeenCalledWith(
      expect.objectContaining({ id: "problem_1", title: "Two Sum Updated" }),
      expect.objectContaining({
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
      })
    );
  });

  it("shows a success toast on successful save", async () => {
    const mutate = vi.fn((_vars, options) => {
      options.onSuccess();
    });
    mockedUseUpdateAdminProblem.mockReturnValue({
      mutate,
      isPending: false,
    } as unknown as ReturnType<typeof useUpdateAdminProblem>);

    const user = userEvent.setup();
    render(<EditProblemForm problem={buildAdminProblemDetail()} />);

    await user.click(screen.getByRole("button", { name: "Save changes" }));

    expect(toast.success).toHaveBeenCalledWith("Problem updated");
  });

  it("shows an error toast on failed save", async () => {
    const mutate = vi.fn((_vars, options) => {
      options.onError(new Error("Update failed"));
    });
    mockedUseUpdateAdminProblem.mockReturnValue({
      mutate,
      isPending: false,
    } as unknown as ReturnType<typeof useUpdateAdminProblem>);

    const user = userEvent.setup();
    render(<EditProblemForm problem={buildAdminProblemDetail()} />);

    await user.click(screen.getByRole("button", { name: "Save changes" }));

    expect(toast.error).toHaveBeenCalledWith("Update failed");
  });

  it("disables the save button while the mutation is pending", () => {
    mockedUseUpdateAdminProblem.mockReturnValue({
      mutate: vi.fn(),
      isPending: true,
    } as unknown as ReturnType<typeof useUpdateAdminProblem>);

    render(<EditProblemForm problem={buildAdminProblemDetail()} />);

    expect(screen.getByRole("button", { name: "Saving..." })).toBeDisabled();
  });

  it("disables the status select for an archived problem, since it is terminal", () => {
    mockedUseUpdateAdminProblem.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useUpdateAdminProblem>);

    render(
      <EditProblemForm
        problem={buildAdminProblemDetail({ status: "Archived" })}
      />
    );

    expect(screen.getByRole("combobox")).toBeDisabled();
    expect(
      screen.getByText("Archived problems cannot change status.")
    ).toBeVisible();
  });

  it("allows changing status for a draft problem", () => {
    mockedUseUpdateAdminProblem.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useUpdateAdminProblem>);

    render(
      <EditProblemForm problem={buildAdminProblemDetail({ status: "Draft" })} />
    );

    expect(screen.getByRole("combobox")).toBeEnabled();
  });
});
