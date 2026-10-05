import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import ScoreBadge from "./score-badge";

describe("ScoreBadge", () => {
  it("shows the score", () => {
    render(<ScoreBadge score={42} />);

    expect(screen.getByText("Score: 42")).toBeVisible();
  });

  it("shows a crown icon when leading", () => {
    const { container } = render(<ScoreBadge score={10} leading />);

    expect(container.querySelector(".lucide-crown")).not.toBeNull();
    expect(container.querySelector(".lucide-trophy")).toBeNull();
  });

  it("shows a trophy icon when not leading", () => {
    const { container } = render(<ScoreBadge score={10} />);

    expect(container.querySelector(".lucide-trophy")).not.toBeNull();
    expect(container.querySelector(".lucide-crown")).toBeNull();
  });
});
