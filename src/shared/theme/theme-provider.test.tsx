import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "./theme-provider";

function stubMatchMedia() {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))
  );
}

describe("ThemeProvider", () => {
  it("renders its children", () => {
    stubMatchMedia();

    render(
      <ThemeProvider attribute="class" defaultTheme="system">
        <p>Themed content</p>
      </ThemeProvider>
    );

    expect(screen.getByText("Themed content")).toBeVisible();

    vi.unstubAllGlobals();
  });
});
