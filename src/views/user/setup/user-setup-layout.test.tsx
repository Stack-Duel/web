import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import UserSetupLayout from "./user-setup-layout";
import { useUser } from "@auth0/nextjs-auth0";

vi.mock(
  "@auth0/nextjs-auth0",
  () => import("@/test/mocks/nextjs-auth0-client")
);
vi.mock("@/domains/user/forms/user-setup-form", () => ({
  default: () => <div>user-setup-form</div>,
}));

const mockUseUser = vi.mocked(useUser);

describe("UserSetupLayout", () => {
  beforeEach(() => {
    mockUseUser.mockReturnValue({
      user: undefined,
      isLoading: false,
      error: undefined,
      invalidate: vi.fn(),
    });
  });

  it("renders the user setup form", async () => {
    render(<UserSetupLayout />);

    expect(await screen.findByText("user-setup-form")).toBeVisible();
  });
});
