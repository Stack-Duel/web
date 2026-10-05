import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono, Oxanium } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/shared/theme/theme-provider";
import { cn } from "@/shared/lib/utils";
import AppProviders from "@/views/app-providers";
import { auth0 } from "@/shared/lib/auth0";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import { getCurrentTenant } from "@/domains/tenant/lib/get-current-tenant";

const oxanium = Oxanium({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

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
    keywords: [
      "competitive programming",
      "online competitive coding",
      "coding challenges",
      "coding competition",
      "code battles",
      "algorithm practice",
      "coding duel",
      "programming practice",
      "online judge",
    ],
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [session, tenant] = await Promise.all([
    auth0.getSession(),
    getCurrentTenant(),
  ]);

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

  const webApplicationJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: tenant.name,
    url: tenant.url,
    description: tenant.description,
    applicationCategory: "GameApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("font-sans", oxanium.variable)}
    >
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <script type="application/ld+json">
          {JSON.stringify(organizationJsonLd)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(websiteJsonLd)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(webApplicationJsonLd)}
        </script>
        {process.env.NODE_ENV === "production" && (
          <>
            <Script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${tenant.googleAnalyticsId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${tenant.googleAnalyticsId}');
              `}
            </Script>
          </>
        )}
        <SpeedInsights />
        <Analytics />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AppProviders session={session} tenant={tenant}>
            {children}
          </AppProviders>
        </ThemeProvider>
      </body>
    </html>
  );
}
