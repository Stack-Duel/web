import Link from "next/link";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { routerConfig } from "@/shared/router-config";

type CtaSectionProps = {
  variant?: "section" | "card";
};

export default function CtaSection({
  variant = "section",
}: Readonly<CtaSectionProps> = {}) {
  const content = (
    <>
      <h2 className="text-2xl md:text-3xl font-bold">Ready to compete?</h2>
      <p className="text-muted-foreground max-w-md">
        Create a free account and jump into your first game in minutes.
      </p>
      <div className="flex items-center gap-3">
        <Button asChild size="lg">
          <a href={routerConfig.authSignUp.path}>Get Started Free</a>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href={routerConfig.problems.path}>Browse Problems</Link>
        </Button>
      </div>
    </>
  );

  if (variant === "card") {
    return (
      <Card className="flex flex-col items-center gap-4 p-10 text-center md:p-14">
        {content}
      </Card>
    );
  }

  return (
    <section className="border-t py-16">
      <div className="max-w-7xl mx-auto px-4 flex flex-col items-center gap-4 text-center">
        {content}
      </div>
    </section>
  );
}
