import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MainErrorFallback, MinimalErrorFallback } from "./main-error-fallback";

describe("MainErrorFallback", () => {
  const originalLocation = window.location;

  beforeEach(() => {
    Object.defineProperty(window, "location", {
      configurable: true,
      writable: true,
      value: { ...originalLocation, reload: vi.fn(), href: "" },
    });
  });

  afterEach(() => {
    Object.defineProperty(window, "location", {
      configurable: true,
      writable: true,
      value: originalLocation,
    });
    vi.unstubAllEnvs();
  });

  it("shows a generic error message", () => {
    render(
      <MainErrorFallback
        error={new Error("boom")}
        resetErrorBoundary={vi.fn()}
      />
    );

    expect(screen.getByText("Something went wrong")).toBeVisible();
  });

  it("calls resetErrorBoundary when Try Again is clicked", async () => {
    const resetErrorBoundary = vi.fn();
    const user = userEvent.setup();

    render(
      <MainErrorFallback
        error={new Error("boom")}
        resetErrorBoundary={resetErrorBoundary}
      />
    );

    await user.click(screen.getByRole("button", { name: /Try Again/ }));

    expect(resetErrorBoundary).toHaveBeenCalledTimes(1);
  });

  it("reloads the page when Reload Page is clicked", async () => {
    const user = userEvent.setup();

    render(
      <MainErrorFallback
        error={new Error("boom")}
        resetErrorBoundary={vi.fn()}
      />
    );

    await user.click(screen.getByRole("button", { name: /Reload Page/ }));

    expect(window.location.reload).toHaveBeenCalledTimes(1);
  });

  it("navigates home when Go Home is clicked", async () => {
    const user = userEvent.setup();

    render(
      <MainErrorFallback
        error={new Error("boom")}
        resetErrorBoundary={vi.fn()}
      />
    );

    await user.click(screen.getByRole("button", { name: /Go Home/ }));

    expect(window.location.href).toBe("/");
  });

  it("does not show error details outside of development", () => {
    vi.stubEnv("NODE_ENV", "production");

    render(
      <MainErrorFallback
        error={new Error("boom message")}
        resetErrorBoundary={vi.fn()}
      />
    );

    expect(screen.queryByText(/boom message/)).not.toBeInTheDocument();
  });

  it("shows the error message in development", () => {
    vi.stubEnv("NODE_ENV", "development");

    render(
      <MainErrorFallback
        error={new Error("boom message")}
        resetErrorBoundary={vi.fn()}
      />
    );

    expect(screen.getAllByText(/boom message/).length).toBeGreaterThan(0);
  });

  it("normalizes a non-Error thrown value", () => {
    vi.stubEnv("NODE_ENV", "development");

    render(
      <MainErrorFallback error={"just a string"} resetErrorBoundary={vi.fn()} />
    );

    expect(screen.getByText(/just a string/)).toBeVisible();
  });
});

describe("MinimalErrorFallback", () => {
  it("calls resetErrorBoundary when Try again is clicked", async () => {
    const resetErrorBoundary = vi.fn();
    const user = userEvent.setup();

    render(<MinimalErrorFallback resetErrorBoundary={resetErrorBoundary} />);

    await user.click(screen.getByRole("button", { name: "Try again" }));

    expect(resetErrorBoundary).toHaveBeenCalledTimes(1);
  });
});
