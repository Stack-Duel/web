import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import AboutPage, { generateMetadata } from "./page";
import { testTenant } from "@/test/mocks/tenant";

vi.mock(
  "@/domains/tenant/lib/get-current-tenant",
  () => import("@/test/mocks/tenant")
);
vi.mock("@/views/about/about-layout", () => ({
  default: () => <div>About Layout</div>,
}));

describe("AboutPage", () => {
  it("renders the about layout", () => {
    render(<AboutPage />);

    expect(screen.getByText("About Layout")).toBeVisible();
  });
});

describe("metadata", () => {
  it("sets a canonical url and a description that names the site", async () => {
    const metadata = await generateMetadata();

    expect(metadata.alternates).toEqual({ canonical: "/about" });
    expect(metadata.description).toContain(testTenant.name);
  });
});
