import type { Metadata } from "next";
import AboutLayout from "@/views/about/about-layout";
import { routerConfig } from "@/shared/router-config";
import { siteDescription, siteName } from "@/shared/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: `About ${siteName}: ${siteDescription}`,
  alternates: { canonical: routerConfig.about.path },
};

export default function AboutPage() {
  return <AboutLayout />;
}
