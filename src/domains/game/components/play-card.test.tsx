import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Swords } from "lucide-react";
import PlayCard from "./play-card";

describe("PlayCard", () => {
  it("shows the card content and calls onClick when Play now is clicked", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(
      <PlayCard
        color="sky"
        icon={Swords}
        header="Duel"
        tidbit="Head-to-head"
        description="Challenge someone."
        playerCount="2 players"
        time="10 minutes"
        onClick={onClick}
        type="Ranked"
      />
    );

    expect(screen.getByText("Duel")).toBeVisible();
    expect(screen.getByText("Ranked")).toBeVisible();
    await user.click(screen.getByRole("button", { name: /Play now/ }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("disables the button and shows the disabled text when disabled", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(
      <PlayCard
        color="lime"
        icon={Swords}
        header="Duel"
        tidbit="Head-to-head"
        description="Challenge someone."
        playerCount="2 players"
        time="10 minutes"
        onClick={onClick}
        type="Ranked"
        disabled
        disabledText="Coming soon"
      />
    );

    expect(screen.getByText("Coming soon")).toBeVisible();
    expect(screen.queryByText("Ranked")).not.toBeInTheDocument();
    const button = screen.getByRole("button", { name: /Play now/ });
    expect(button).toBeDisabled();

    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });
});
