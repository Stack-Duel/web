import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NotFound from "./not-found";
import { routerMock } from "@/test/mocks/next-navigation";
import { routerConfig } from "@/shared/router-config";

vi.mock("next/navigation", () => import("@/test/mocks/next-navigation"));
vi.mock(
  "@/shared/layouts/sidebar-layout/sidebar-layout",
  () => import("@/test/mocks/sidebar-layout")
);

describe("NotFound (problem)", () => {
  beforeEach(() => {
    routerMock.back.mockClear();
  });

  it("explains that the problem could not be found", () => {
    render(<NotFound />);

    expect(screen.getByText("Problem not found")).toBeVisible();
  });

  it("links home", () => {
    render(<NotFound />);

    expect(screen.getByRole("link", { name: "Go home" })).toHaveAttribute(
      "href",
      routerConfig.home.path
    );
  });

  it("navigates back when Go back is clicked", async () => {
    const user = userEvent.setup();
    render(<NotFound />);

    await user.click(screen.getByRole("button", { name: "Go back" }));

    expect(routerMock.back).toHaveBeenCalledOnce();
  });
});
