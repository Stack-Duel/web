import type { ComponentProps } from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Trophy } from "lucide-react";
import { SidebarMainNav } from "./sidebar-main-nav";
import { SidebarProvider } from "@/shared/components/ui/sidebar";
import { TooltipProvider } from "@/shared/components/ui/tooltip";

function renderNav(
  items: ComponentProps<typeof SidebarMainNav>["items"],
  title?: string
) {
  return render(
    <TooltipProvider>
      <SidebarProvider>
        <SidebarMainNav items={items} title={title} />
      </SidebarProvider>
    </TooltipProvider>
  );
}

describe("SidebarMainNav", () => {
  it("renders the default title and a link for each item", () => {
    renderNav([
      { title: "Games", url: "/games", icon: Trophy },
      { title: "Problems", url: "/problems", icon: Trophy },
    ]);

    expect(screen.getByText("Platform")).toBeVisible();
    expect(screen.getByRole("link", { name: /Games/ })).toHaveAttribute(
      "href",
      "/games"
    );
    expect(screen.getByRole("link", { name: /Problems/ })).toHaveAttribute(
      "href",
      "/problems"
    );
  });

  it("renders a custom group title", () => {
    renderNav(
      [{ title: "Admin", url: "/admin", icon: Trophy }],
      "Administration"
    );

    expect(screen.getByText("Administration")).toBeVisible();
  });

  it("does not render a toggle when an item has no sub items", () => {
    renderNav([{ title: "Games", url: "/games", icon: Trophy }]);

    expect(
      screen.queryByRole("button", { name: "Toggle" })
    ).not.toBeInTheDocument();
  });

  it("reveals sub items when the toggle is clicked", async () => {
    const user = userEvent.setup();
    renderNav([
      {
        title: "Games",
        url: "/games",
        icon: Trophy,
        items: [{ title: "Ramp", url: "/games/ramp" }],
      },
    ]);

    expect(
      screen.queryByRole("link", { name: "Ramp" })
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Toggle" }));

    expect(screen.getByRole("link", { name: "Ramp" })).toHaveAttribute(
      "href",
      "/games/ramp"
    );
  });

  it("renders an item with no url as a toggle button instead of a link", () => {
    renderNav([
      {
        title: "Community",
        icon: Trophy,
        items: [{ title: "Discord", url: "https://discord.gg/example" }],
      },
    ]);

    expect(
      screen.queryByRole("link", { name: /Community/ })
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Community/ })
    ).toBeInTheDocument();
  });

  it("reveals sub items when clicking a url-less item's own button, not just the chevron", async () => {
    const user = userEvent.setup();
    renderNav([
      {
        title: "Community",
        icon: Trophy,
        items: [
          {
            title: "Discord",
            url: "https://discord.gg/example",
            icon: Trophy,
            external: true,
          },
        ],
      },
    ]);

    await user.click(screen.getByRole("button", { name: /Community/ }));

    const link = screen.getByRole("link", { name: /Discord/ });
    expect(link).toHaveAttribute("href", "https://discord.gg/example");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });
});
