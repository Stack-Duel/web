import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import SocialLinkButton from "./social-link-button";
import { DiscordLogo } from "@phosphor-icons/react/dist/ssr";

describe("SocialLinkButton", () => {
  it("renders an icon-only link labeled for accessibility when no children are given", () => {
    render(
      <SocialLinkButton
        href="https://discord.gg/example"
        icon={DiscordLogo}
        label="Join our Discord"
      />
    );

    const link = screen.getByRole("link", { name: "Join our Discord" });
    expect(link).toHaveAttribute("href", "https://discord.gg/example");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders visible text instead of the aria-label when children are given", () => {
    render(
      <SocialLinkButton
        href="https://discord.gg/example"
        icon={DiscordLogo}
        label="Join our Discord"
      >
        Join the Discord
      </SocialLinkButton>
    );

    const link = screen.getByRole("link", { name: "Join the Discord" });
    expect(link).toHaveAttribute("href", "https://discord.gg/example");
    expect(
      screen.queryByRole("link", { name: "Join our Discord" })
    ).not.toBeInTheDocument();
  });
});
