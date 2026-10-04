import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import JoinCodeShare from "./join-code-share";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const writeText = vi.fn().mockResolvedValue(undefined);

describe("JoinCodeShare", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("hides the join code by default", () => {
    render(<JoinCodeShare joinCode="ABC1234" />);

    expect(screen.queryByText("ABC1234")).not.toBeInTheDocument();
    expect(screen.getByText("•".repeat(7))).toBeVisible();
  });

  it("reveals the code when the show toggle is clicked", async () => {
    const user = userEvent.setup();
    render(<JoinCodeShare joinCode="ABC1234" />);

    await user.click(screen.getByRole("button", { name: "Show code" }));

    expect(screen.getByText("ABC1234")).toBeVisible();
  });

  it("copies the code to the clipboard", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("navigator", {
      ...window.navigator,
      clipboard: { writeText },
    });
    render(<JoinCodeShare joinCode="ABC1234" />);

    await user.click(screen.getByRole("button", { name: "Copy code" }));

    expect(writeText).toHaveBeenCalledWith("ABC1234");
    expect(toast.success).toHaveBeenCalledWith("Code copied to clipboard");
  });

  it("copies the invite link to the clipboard", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("navigator", {
      ...window.navigator,
      clipboard: { writeText },
    });
    render(<JoinCodeShare joinCode="ABC1234" />);

    await user.click(screen.getByRole("button", { name: /copy invite link/i }));

    expect(writeText).toHaveBeenCalledWith(
      expect.stringContaining("/join/ABC1234")
    );
    expect(toast.success).toHaveBeenCalledWith(
      "Invite link copied to clipboard"
    );
  });
});
