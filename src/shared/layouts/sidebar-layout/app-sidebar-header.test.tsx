import type { ComponentProps } from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import AppSidebarHeader from "./app-sidebar-header";
import { SidebarProvider } from "@/shared/components/ui/sidebar";

function renderHeader(props: ComponentProps<typeof AppSidebarHeader>) {
  return render(
    <SidebarProvider>
      <AppSidebarHeader {...props} />
    </SidebarProvider>
  );
}

describe("AppSidebarHeader", () => {
  it("renders no breadcrumb nav when no breadcrumbs are given", () => {
    renderHeader({});

    expect(
      screen.queryByRole("navigation", { name: "breadcrumb" })
    ).not.toBeInTheDocument();
  });

  it("links every breadcrumb except the last, which renders as the current page", () => {
    renderHeader({
      breadcrumbs: [
        { name: "Problems", url: "/problems" },
        { name: "Two Sum" },
      ],
    });

    expect(screen.getByRole("link", { name: "Problems" })).toHaveAttribute(
      "href",
      "/problems"
    );
    const currentPage = screen.getByText("Two Sum");
    expect(currentPage).toHaveAttribute("aria-current", "page");
    expect(currentPage).toHaveAttribute("aria-disabled", "true");
    expect(currentPage.tagName).not.toBe("A");
  });

  it("renders the mode toggle by default", () => {
    renderHeader({});

    expect(screen.getByRole("button", { name: "Toggle theme" })).toBeVisible();
  });

  it("links to the Discord invite by default", () => {
    renderHeader({});

    const link = screen.getByRole("link", { name: "Join our Discord" });
    expect(link).toHaveAttribute("href", "https://discord.gg/3mW6Y9N5xZ");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders custom header items when provided", () => {
    renderHeader({ headerItems: <button>Custom action</button> });

    expect(screen.getByRole("button", { name: "Custom action" })).toBeVisible();
    expect(
      screen.queryByRole("button", { name: "Toggle theme" })
    ).not.toBeInTheDocument();
  });
});
