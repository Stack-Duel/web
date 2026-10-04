import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import CommunityPage, { metadata } from "./page";
import { siteName } from "@/test/mocks/site";

vi.mock("@/shared/lib/site", () => import("@/test/mocks/site"));
vi.mock("@/views/community/community-layout", () => ({
  default: () => <div>Community Layout</div>,
}));

describe("CommunityPage", () => {
  it("renders the community layout", () => {
    render(<CommunityPage />);

    expect(screen.getByText("Community Layout")).toBeVisible();
  });
});

describe("metadata", () => {
  it("sets a canonical url and a description that names the site", () => {
    expect(metadata.alternates).toEqual({ canonical: "/community" });
    expect(metadata.description).toContain(siteName);
  });
});
