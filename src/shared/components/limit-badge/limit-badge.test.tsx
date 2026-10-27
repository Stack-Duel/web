import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import LimitBadge from "./limit-badge";

describe("LimitBadge", () => {
  it("renders the current and max values with the label", () => {
    render(<LimitBadge current={2} max={10} label="open" />);

    expect(screen.getByText("2/10 open")).toBeVisible();
  });

  it("uses the destructive variant when at the limit", () => {
    render(<LimitBadge current={10} max={10} label="open" />);

    expect(screen.getByText("10/10 open")).toHaveAttribute(
      "data-variant",
      "destructive"
    );
  });

  it("uses the outline variant when well under the limit", () => {
    render(<LimitBadge current={1} max={10} label="open" />);

    expect(screen.getByText("1/10 open")).toHaveAttribute(
      "data-variant",
      "outline"
    );
  });
});
