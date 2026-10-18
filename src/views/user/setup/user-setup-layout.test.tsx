import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import UserSetupLayout from "./user-setup-layout";

vi.mock("@/shared/layouts/layout/layout", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));
vi.mock("./user-setup-form-boundary", () => ({
  default: () => <div>user-setup-form-boundary</div>,
}));

describe("UserSetupLayout", () => {
  it("renders the form boundary inside the shared layout", () => {
    render(<UserSetupLayout />);

    expect(screen.getByText("user-setup-form-boundary")).toBeVisible();
  });
});
