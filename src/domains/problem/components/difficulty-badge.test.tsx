import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import DifficultyBadge from "./difficulty-badge";

describe("DifficultyBadge", () => {
  it.each([
    ["beginner", "Beginner"],
    ["easy", "Easy"],
    ["intermediate", "Intermediate"],
    ["advanced", "Advanced"],
    ["expert", "Expert"],
  ])("renders the %s tier as %s", (difficulty, label) => {
    render(<DifficultyBadge difficulty={difficulty} />);

    expect(screen.getByText(label)).toBeVisible();
  });

  it("is case-insensitive", () => {
    render(<DifficultyBadge difficulty="EASY" />);

    expect(screen.getByText("Easy")).toBeVisible();
  });

  it("renders nothing for an unrecognized tier", () => {
    const { container } = render(<DifficultyBadge difficulty="unknown" />);

    expect(container).toBeEmptyDOMElement();
  });
});
