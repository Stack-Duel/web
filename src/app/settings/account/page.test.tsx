import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import SettingsAccountPage from "./page";

vi.mock("@/views/settings/account-tab", () => ({
  default: () => <div>Account Tab</div>,
}));

describe("SettingsAccountPage", () => {
  it("renders the account tab", () => {
    render(<SettingsAccountPage />);

    expect(screen.getByText("Account Tab")).toBeVisible();
  });
});
