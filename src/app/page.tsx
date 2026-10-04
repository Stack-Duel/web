import type { Metadata } from "next";
import Hero from "@/views/landing/hero";
import DuelDemoSection from "@/views/landing/duel-demo-section";
import FeaturesSection from "@/views/landing/features-section";
import FaqSection from "@/views/landing/faq-section";
import CtaSection from "@/views/landing/cta-section";
import Layout from "@/shared/layouts/layout/layout";
import { getCurrentTenant } from "@/domains/tenant/lib/get-current-tenant";

export async function generateMetadata(): Promise<Metadata> {
  const tenant = await getCurrentTenant();

  return {
    title: { absolute: `${tenant.name} - Real-Time Coding Duels & DSA Practice` },
    alternates: { canonical: "/" },
  };
}

export default function Home() {
  return (
    <Layout>
      <Hero />
      <DuelDemoSection />
      <FeaturesSection />
      <FaqSection />
      <CtaSection />
    </Layout>
  );
}
