export type TenantId = "algowars" | "stackduel";

export type TenantConfig = {
  id: TenantId;
  name: string;
  tagline: string;
  description: string;
  /** Hostname used to resolve this tenant from an incoming request (no protocol/port). */
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
  algowars: {
    id: "algowars",
    name: "Algowars",
    tagline: "Compete against other developers in fast-paced coding challenges",
    description:
      "Algowars is an online competitive coding platform for code battles. Battle other developers head-to-head or solo, get instant results, and track your progress.",
    domain: "www.algowars.dev",
    logo: {
      light:
        "/Algowars_Logo/Logo/Algowars Logo_Horizontal/Algowars Logo_Original/Algowars-01.svg",
      dark: "/Algowars_Logo/Logo/Algowars Logo_Inverse/Algowars-01.svg",
    },
    favicon: "/Algowars_Logo/Icon/Algowars Icon_Original/Algowars-01.svg",
    googleAnalyticsId: "G-HGM9ZQC3QF",
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
  stackduel: {
    id: "stackduel",
    name: "Stack Duel",
    tagline: "Compete against other developers in fast-paced coding challenges",
    description:
      "Stack Duel is an online competitive coding platform for code battles. Battle other developers head-to-head or solo, get instant results, and track your progress.",
    domain: "www.stackduel.dev",
    logo: {
      light:
        "/Algowars_Logo/Logo/Algowars Logo_Horizontal/Algowars Logo_Original/Algowars-01.svg",
      dark: "/Algowars_Logo/Logo/Algowars Logo_Inverse/Algowars-01.svg",
    },
    favicon: "/Algowars_Logo/Icon/Algowars Icon_Original/Algowars-01.svg",
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
