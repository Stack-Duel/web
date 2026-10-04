export type TenantId = "stackduel";

export type TenantConfig = {
  id: TenantId;
  name: string;
  tagline: string;
  description: string;
  domain: string;
  logo: {
    light: string;
    dark: string;
  };
  favicon: string;
  googleAnalyticsId: string;
  social: {
    twitterHandle: string;
    sameAs: string[];
  };
};

export const defaultTenantId: TenantId = "stackduel";

export const tenants: Record<TenantId, TenantConfig> = {
  stackduel: {
    id: "stackduel",
    name: "Stack Duel",
    tagline: "Compete against other developers in fast-paced coding challenges",
    description:
      "Stack Duel is an online competitive coding platform for code battles. Battle other developers head-to-head or solo, get instant results, and track your progress.",
    domain: "www.stackduel.dev",
    logo: {
      light: "/stackduel-logo.svg",
      dark: "/stackduel-logo.svg",
    },
    favicon: "/stackduel-logo.svg",
    googleAnalyticsId: "",
    social: {
      twitterHandle: "@algowarsdev",
      sameAs: [
        "https://github.com/algowars",
        "https://discord.gg/q8bhZgsc2",
        "https://www.linkedin.com/company/106262028/",
        "https://x.com/algowarsdev",
      ],
    },
  },
};
