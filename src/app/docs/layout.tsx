import type { ReactNode } from "react";
import { RootProvider } from "fumadocs-ui/provider/next";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { docsSource } from "@/shared/lib/docs-source";
import { docsBaseOptions } from "@/shared/layouts/docs/docs-layout-options";

export default function DocsRouteLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <RootProvider theme={{ enabled: false }}>
      <DocsLayout tree={docsSource.getPageTree()} {...docsBaseOptions()}>
        {children}
      </DocsLayout>
    </RootProvider>
  );
}
