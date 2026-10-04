import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SetupBannerContent } from "./setup-banner";
import { routerConfig } from "@/shared/router-config";
import { routerMock } from "@/test/mocks/next-navigation";

vi.mock("next/navigation", () => import("@/test/mocks/next-navigation"));

describe("SetupBannerContent", () => {
  beforeEach(() => {
    routerMock.push.mockClear();
  });

  it("shows a prompt to finish setting up the account", () => {
    render(<SetupBannerContent />);

    expect(screen.getByText("Finish setting up your account")).toBeVisible();
  });

  it("navigates to the user setup route when Complete setup is clicked", async () => {
    const user = userEvent.setup();
    render(<SetupBannerContent />);

    await user.click(screen.getByRole("button", { name: /Complete setup/ }));

    expect(routerMock.push).toHaveBeenCalledWith(routerConfig.userSetup.path);
  });
});
