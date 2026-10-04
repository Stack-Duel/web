import type { Metadata } from "next";
import { Geist_Mono, Oxanium } from "next/font/google";
import "./globals.css";
import { cn } from "@/shared/lib/utils";
import AppProviders from "@/views/app-providers";
import { getCurrentTenant } from "@/domains/tenant/lib/get-current-tenant";

const oxanium = Oxanium({ subsets: ["latin"], variable: "--font-sans" });

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const tenant = await getCurrentTenant();
  const titleDefault = `${tenant.name} - Competitive Coding Platform`;

  return {
    metadataBase: new URL(tenant.url),
    title: {
      default: titleDefault,
      template: `%s | ${tenant.name}`,
    },
    description: tenant.description,
    applicationName: tenant.name,
    icons: { icon: tenant.favicon },
    authors: [{ name: tenant.name }],
    openGraph: {
      type: "website",
      url: "/",
      siteName: tenant.name,
      title: titleDefault,
      description: tenant.description,
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: titleDefault,
      description: tenant.description,
      site: tenant.social.twitterHandle,
      creator: tenant.social.twitterHandle,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const tenant = await getCurrentTenant();

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: tenant.name,
    url: tenant.url,
    sameAs: tenant.social.sameAs,
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: tenant.name,
    url: tenant.url,
    description: tenant.description,
  };

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("font-sans", oxanium.variable)}
    >
      <body
        suppressHydrationWarning
        className={`${oxanium.variable} ${geistMono.variable} antialiased`}
      >
        <script type="application/ld+json">
          {JSON.stringify(organizationJsonLd)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(websiteJsonLd)}
        </script>
        <AppProviders tenant={tenant}>{children}</AppProviders>
      </body>
    </html>
  );
}
