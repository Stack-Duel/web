import type { ComponentProps } from "react";
import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { KeyboardShortcutTooltip } from "./keyboard-shortcut-tooltip";
import { TooltipProvider } from "@/shared/components/ui/tooltip";

function renderTooltip(
  props: Omit<ComponentProps<typeof KeyboardShortcutTooltip>, "children">
) {
  return render(
    <TooltipProvider>
      <KeyboardShortcutTooltip {...props}>
        <button>Run</button>
      </KeyboardShortcutTooltip>
    </TooltipProvider>
  );
}

describe("KeyboardShortcutTooltip", () => {
  it("renders the trigger content", () => {
    renderTooltip({ shortcut: ["Ctrl", "Enter"] });

    expect(screen.getByRole("button", { name: "Run" })).toBeVisible();
  });

  it("shows every shortcut key joined by a separator on hover", async () => {
    const user = userEvent.setup();
    renderTooltip({ shortcut: ["Ctrl", "Enter"] });

    await user.hover(screen.getByRole("button", { name: "Run" }));

    const tooltip = within(await screen.findByRole("tooltip"));
    expect(tooltip.getByText("Ctrl")).toBeInTheDocument();
    expect(tooltip.getByText("Enter")).toBeInTheDocument();
    expect(tooltip.getByText("+")).toBeInTheDocument();
  });

  it("includes a screen-reader-only label when provided", async () => {
    const user = userEvent.setup();
    renderTooltip({ shortcut: ["Esc"], label: "Cancel run" });

    await user.hover(screen.getByRole("button", { name: "Run" }));

    const tooltip = within(await screen.findByRole("tooltip"));
    expect(tooltip.getByText("Cancel run")).toBeInTheDocument();
  });
});
