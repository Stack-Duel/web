import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import StepStatusIcon from "./admin-submission-step-status-icon";

describe("StepStatusIcon", () => {
  it("renders a green check for Succeeded", () => {
    const { container } = render(<StepStatusIcon status="Succeeded" />);
    expect(container.querySelector(".lucide-check")).toHaveClass(
      "text-green-600"
    );
  });

  it("renders a destructive x for Failed", () => {
    const { container } = render(<StepStatusIcon status="Failed" />);
    expect(container.querySelector(".lucide-x")).toHaveClass(
      "text-destructive"
    );
  });

  it("renders a spinning loader for Running", () => {
    const { container } = render(<StepStatusIcon status="Running" />);
    expect(container.querySelector(".lucide-loader-circle")).toHaveClass(
      "animate-spin"
    );
  });

  it("renders a muted clock for Pending", () => {
    const { container } = render(<StepStatusIcon status="Pending" />);
    expect(container.querySelector(".lucide-clock")).toHaveClass(
      "text-muted-foreground"
    );
  });
});
