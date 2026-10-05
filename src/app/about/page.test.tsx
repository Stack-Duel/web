import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import AboutPage, { metadata } from "./page";
import { siteName } from "@/test/mocks/site";

vi.mock("@/shared/lib/site", () => import("@/test/mocks/site"));
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
  it("sets a canonical url and a description that names the site", () => {
    expect(metadata.alternates).toEqual({ canonical: "/about" });
    expect(metadata.description).toContain(siteName);
  });
});
