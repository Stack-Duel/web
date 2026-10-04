import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import CreateFeatureFlagDialog from "./create-feature-flag-dialog";
import { useCreateFeatureFlag } from "../api/create-feature-flag";

vi.mock("../api/create-feature-flag", () => ({
  useCreateFeatureFlag: vi.fn(),
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const mockedUseCreateFeatureFlag = vi.mocked(useCreateFeatureFlag);

describe("CreateFeatureFlagDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseCreateFeatureFlag.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as never);
  });

  it("opens the dialog with blank fields", async () => {
    const user = userEvent.setup();

    render(<CreateFeatureFlagDialog />);
    await user.click(screen.getByRole("button", { name: "Create Flag" }));

    expect(screen.getByLabelText("Key")).toHaveValue("");
    expect(screen.getByLabelText("Name")).toHaveValue("");
  });

  it("toasts an error when submitting without a key or name", async () => {
    const user = userEvent.setup();

    render(<CreateFeatureFlagDialog />);
    await user.click(screen.getByRole("button", { name: "Create Flag" }));
    await user.click(screen.getByRole("button", { name: "Create flag" }));

    expect(toast.error).toHaveBeenCalledWith("Key and name are required.");
  });

  it("creates the flag with the entered fields and closes on success", async () => {
    const mutate = vi.fn((_args, options?: { onSuccess?: () => void }) => {
      options?.onSuccess?.();
    });
    mockedUseCreateFeatureFlag.mockReturnValue({
      mutate,
      isPending: false,
    } as never);
    const user = userEvent.setup();

    render(<CreateFeatureFlagDialog />);
    await user.click(screen.getByRole("button", { name: "Create Flag" }));
    await user.type(screen.getByLabelText("Key"), "new-flag");
    await user.type(screen.getByLabelText("Name"), "New Flag");
    await user.type(screen.getByLabelText("Description"), "A new flag.");
    await user.click(screen.getByLabelText("Enabled by default"));
    await user.click(screen.getByRole("button", { name: "Create flag" }));

    expect(mutate).toHaveBeenCalledWith(
      {
        key: "new-flag",
        name: "New Flag",
        description: "A new flag.",
        defaultEnabled: true,
      },
      expect.anything()
    );
    expect(toast.success).toHaveBeenCalledWith(
      'Created feature flag "new-flag"'
    );
    expect(screen.queryByLabelText("Key")).not.toBeInTheDocument();
  });
});
