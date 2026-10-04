import Layout from "@/shared/layouts/layout/layout";
import MissionSection from "./mission-section";
import HowItWorksSection from "./how-it-works-section";
import ValuesSection from "./values-section";
import CtaSection from "@/views/landing/cta-section";

export default function AboutLayout() {
  return (
    <Layout>
      <MissionSection />
      <HowItWorksSection />
      <ValuesSection />
      <CtaSection />
    </Layout>
  );
}
