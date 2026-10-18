import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ProfilePage, { generateMetadata } from "./page";
import { testTenant } from "@/test/mocks/tenant";

vi.mock("@/views/profile/profile-layout", () => ({
  default: ({ username }: { username: string }) => (
    <div>Profile Layout: {username}</div>
  ),
}));
vi.mock(
  "@/domains/tenant/lib/get-current-tenant",
  () => import("@/test/mocks/tenant")
);

describe("ProfilePage", () => {
  it("renders the profile layout for the resolved username", async () => {
    render(await ProfilePage({ params: Promise.resolve({ username: "ada" }) }));

    expect(screen.getByText("Profile Layout: ada")).toBeVisible();
  });
});

describe("generateMetadata", () => {
  it("builds a title from the resolved username", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ username: "ada" }),
    });

    expect(metadata.title).toBe("ada's Profile");
    expect(metadata.description).toContain("ada");
    expect(metadata.description).toContain(testTenant.name);
  });
});
