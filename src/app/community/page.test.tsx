import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import CommunityPage, { generateMetadata } from "./page";
import { testTenant } from "@/test/mocks/tenant";

vi.mock(
  "@/domains/tenant/lib/get-current-tenant",
  () => import("@/test/mocks/tenant")
);
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
  it("sets a canonical url and a description that names the site", async () => {
    const metadata = await generateMetadata();

    expect(metadata.alternates).toEqual({ canonical: "/community" });
    expect(metadata.description).toContain(testTenant.name);
  });
});
