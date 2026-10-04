import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import SettingsPreferencesPage from "./page";

vi.mock("@/views/settings/preferences-tab", () => ({
  default: () => <div>Preferences Tab</div>,
}));

describe("SettingsPreferencesPage", () => {
  it("renders the preferences tab", () => {
    render(<SettingsPreferencesPage />);

    expect(screen.getByText("Preferences Tab")).toBeVisible();
  });
});
