import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ErrorCard from "./error-card";

describe("ErrorCard", () => {
  it("calls onRetry when Try again is clicked", async () => {
    const onRetry = vi.fn();
    render(
      <ErrorCard onRetry={onRetry} homeHref="/" homeLabel="Go home" />
    );

    await userEvent.click(screen.getByRole("button", { name: "Try again" }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("links to the given home href and label", () => {
    render(
      <ErrorCard onRetry={vi.fn()} homeHref="/studio/problems" homeLabel="My problems" />
    );

    const link = screen.getByRole("link", { name: "My problems" });
    expect(link).toHaveAttribute("href", "/studio/problems");
  });
});
