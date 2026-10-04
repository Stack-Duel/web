import type { Icon } from "@phosphor-icons/react";
import {
  DiscordLogo,
  GithubLogo,
  LinkedinLogo,
} from "@phosphor-icons/react/dist/ssr";

export type SocialLink = {
  name: string;
  href: string;
  icon: Icon;
  description: string;
};

export const discordLink: SocialLink = {
  name: "Discord",
  href: "https://discord.gg/3mW6Y9N5xZ",
  icon: DiscordLogo,
  description: "Chat with the community, find opponents, and get help.",
};

const githubLink: SocialLink = {
  name: "GitHub",
  href: "https://github.com/algowars",
  icon: GithubLogo,
  description: "Explore the code and contribute.",
};

const linkedinLink: SocialLink = {
  name: "LinkedIn",
  href: "https://www.linkedin.com/company/106262028/",
  icon: LinkedinLogo,
  description: "Follow along for updates and announcements.",
};

export const socialLinks: SocialLink[] = [
  discordLink,
  githubLink,
  linkedinLink,
];
