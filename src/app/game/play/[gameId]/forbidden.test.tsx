import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Forbidden from "./forbidden";
import { routerMock } from "@/test/mocks/next-navigation";
import { routerConfig } from "@/shared/router-config";

vi.mock("next/navigation", () => import("@/test/mocks/next-navigation"));
vi.mock(
  "@/shared/layouts/sidebar-layout/sidebar-layout",
  () => import("@/test/mocks/sidebar-layout")
);

describe("Forbidden (game play)", () => {
  beforeEach(() => {
    routerMock.back.mockClear();
  });

  it("explains that access was denied", () => {
    render(<Forbidden />);

    expect(screen.getByText("Access denied")).toBeVisible();
  });

  it("links home", () => {
    render(<Forbidden />);

    expect(screen.getByRole("link", { name: "Go home" })).toHaveAttribute(
      "href",
      routerConfig.home.path
    );
  });

  it("navigates back when Go back is clicked", async () => {
    const user = userEvent.setup();
    render(<Forbidden />);

    await user.click(screen.getByRole("button", { name: "Go back" }));

    expect(routerMock.back).toHaveBeenCalledOnce();
  });
});
