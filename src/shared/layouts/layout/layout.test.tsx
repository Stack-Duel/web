import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Layout from "./layout";
import { useUser } from "@auth0/nextjs-auth0";

vi.mock(
  "@auth0/nextjs-auth0",
  () => import("@/test/mocks/nextjs-auth0-client")
);

const mockUseUser = vi.mocked(useUser);

describe("Layout", () => {
  beforeEach(() => {
    mockUseUser.mockReturnValue({
      user: undefined,
      isLoading: false,
      error: undefined,
      invalidate: vi.fn(),
    });
  });

  it("renders the navbar, the children, and the footer", () => {
    render(
      <Layout>
        <p>Page content</p>
      </Layout>
    );

    expect(screen.getByRole("banner")).toBeVisible();
    expect(screen.getByText("Page content")).toBeVisible();
    expect(screen.getByRole("contentinfo")).toBeVisible();
  });
});
