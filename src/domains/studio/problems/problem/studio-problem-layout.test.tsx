import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import StudioProblemLayout from "./studio-problem-layout";
import { useUserStore } from "@/domains/user/state/user-store";
import { resetUserStore } from "@/test/mocks/user-store";
import { buildUser } from "@/test/factories/user";
import { buildAuthUser } from "@/test/factories/auth-user";
import { Permissions } from "@/shared/lib/permissions";
import { useSuspenseStudioProblemDetails } from "../../api/get-studio-problem";
import { useSuspenseStudioProblemSetups } from "../../api/get-studio-problem-setups";
import { buildStudioProblemDetails } from "@/test/factories/studio-problem";

vi.mock("next/navigation", () => import("@/test/mocks/next-navigation"));
vi.mock(
  "@/shared/layouts/sidebar-layout/sidebar-layout",
  () => import("@/test/mocks/sidebar-layout")
);
vi.mock("@/domains/studio/api/get-studio-problem", () => ({
  useSuspenseStudioProblemDetails: vi.fn(),
}));
vi.mock("@/domains/studio/api/get-studio-problem-setups", () => ({
  useSuspenseStudioProblemSetups: vi.fn(),
}));

const mockUseSuspenseStudioProblemDetails = vi.mocked(
  useSuspenseStudioProblemDetails
);
const mockUseSuspenseStudioProblemSetups = vi.mocked(
  useSuspenseStudioProblemSetups
);

function grantPermissions(
  ...permissions: (typeof Permissions)[keyof typeof Permissions][]
) {
  useUserStore.setState({
    authProfile: buildAuthUser(),
    user: buildUser({ permissions }),
  });
}

describe("StudioProblemLayout", () => {
  beforeEach(() => {
    resetUserStore();
    mockUseSuspenseStudioProblemDetails.mockReturnValue({
      data: buildStudioProblemDetails({ title: "Two Sum", slug: "two-sum" }),
    } as unknown as ReturnType<typeof useSuspenseStudioProblemDetails>);
    mockUseSuspenseStudioProblemSetups.mockReturnValue({
      data: [],
    } as unknown as ReturnType<typeof useSuspenseStudioProblemSetups>);
  });

  it("hides the problem behind a not-found page without read permission", () => {
    render(<StudioProblemLayout id="problem_1" />);

    expect(
      screen.getByText(/we could not find the page you are looking for/i)
    ).toBeVisible();
    expect(screen.queryByText("Two Sum")).not.toBeInTheDocument();
  });

  it("shows the problem's content and question with read permission", () => {
    grantPermissions(Permissions.ADMIN_PROBLEMS_READ);

    render(<StudioProblemLayout id="problem_1" />);

    expect(screen.getByRole("heading", { name: "Two Sum" })).toBeVisible();
    expect(screen.getByRole("tab", { name: "Question" })).toBeVisible();
    expect(screen.getByRole("tab", { name: "Setups" })).toBeVisible();
  });

  it("switches to the Setups tab when clicked", async () => {
    grantPermissions(Permissions.ADMIN_PROBLEMS_READ);
    const user = userEvent.setup();

    render(<StudioProblemLayout id="problem_1" />);

    await user.click(screen.getByRole("tab", { name: "Setups" }));

    expect(
      screen.getByText("No language setups configured for this problem.")
    ).toBeVisible();
  });
});
