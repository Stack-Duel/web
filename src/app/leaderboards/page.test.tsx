import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import LeaderboardsPage from "./page";
import { fetchFeatureFlags } from "@/domains/feature-flags/api/feature-flags-server-api";
import { NextNotFoundError } from "@/test/mocks/next-navigation";

vi.mock("next/navigation", () => import("@/test/mocks/next-navigation"));
vi.mock("@/domains/feature-flags/api/feature-flags-server-api", () => ({
  fetchFeatureFlags: vi.fn(),
}));
vi.mock("@/views/leaderboards/leaderboards-layout", () => ({
  default: () => <div>Leaderboards Layout</div>,
}));
vi.mock("@/shared/lib/site", () => import("@/test/mocks/site"));

const mockFetchFeatureFlags = vi.mocked(fetchFeatureFlags);

describe("LeaderboardsPage", () => {
  it("renders the leaderboards layout when the flag is enabled", async () => {
    mockFetchFeatureFlags.mockResolvedValue(
      new Response(JSON.stringify({ leaderboards: true }), { status: 200 })
    );

    render(await LeaderboardsPage());

    expect(await screen.findByText("Leaderboards Layout")).toBeVisible();
  });

  it("triggers notFound when the flag is disabled", async () => {
    mockFetchFeatureFlags.mockResolvedValue(
      new Response(JSON.stringify({ leaderboards: false }), { status: 200 })
    );

    await expect(LeaderboardsPage()).rejects.toThrow(NextNotFoundError);
  });

  it("triggers notFound when the flag is missing from the response", async () => {
    mockFetchFeatureFlags.mockResolvedValue(
      new Response(JSON.stringify({}), { status: 200 })
    );

    await expect(LeaderboardsPage()).rejects.toThrow(NextNotFoundError);
  });

  it("triggers notFound when the feature-flags request fails", async () => {
    mockFetchFeatureFlags.mockResolvedValue(
      new Response(null, { status: 500 })
    );

    await expect(LeaderboardsPage()).rejects.toThrow(NextNotFoundError);
  });
});
