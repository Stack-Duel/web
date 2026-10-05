import Layout from "@/shared/layouts/layout/layout";
import CtaSection from "@/views/landing/cta-section";
import CommunityLinksSection from "./community-links-section";

export default function CommunityLayout() {
  return (
    <Layout>
      <section className="border-b py-16 mt-12">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h1 className="text-3xl font-bold md:text-4xl">Join the community</h1>
          <p className="mt-4 text-muted-foreground">
            Algowars is more fun with other people. Jump into Discord to find
            opponents, get help, and talk shop with other developers.
          </p>
        </div>
      </section>
      <CommunityLinksSection />
      <CtaSection />
    </Layout>
  );
}
