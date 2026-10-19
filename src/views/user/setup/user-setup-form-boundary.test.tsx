import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import UserSetupFormBoundary from "./user-setup-form-boundary";

vi.mock("@/domains/user/forms/user-setup-form", () => ({
  default: () => <div>user-setup-form</div>,
}));

describe("UserSetupFormBoundary", () => {
  it("renders the user setup form", async () => {
    render(<UserSetupFormBoundary />);

    expect(await screen.findByText("user-setup-form")).toBeVisible();
  });
});
