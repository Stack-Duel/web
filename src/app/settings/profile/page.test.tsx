import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import SettingsProfilePage from "./page";

vi.mock("@/views/settings/profile-tab", () => ({
  default: () => <div>Profile Tab</div>,
}));

describe("SettingsProfilePage", () => {
  it("renders the profile tab", () => {
    render(<SettingsProfilePage />);

    expect(screen.getByText("Profile Tab")).toBeVisible();
  });
});
