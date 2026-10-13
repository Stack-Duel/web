import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { routerConfig } from "@/shared/router-config";

export function docsBaseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: "Stack Duel Docs",
      url: routerConfig.docs.path,
    },
    links: [
      {
        type: "main",
        url: routerConfig.home.path,
        text: "Back to Stack Duel",
      },
    ],
  };
}
