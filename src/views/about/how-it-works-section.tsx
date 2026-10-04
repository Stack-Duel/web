import { howItWorksSteps } from "@/shared/content/how-it-works-steps";

export default function HowItWorksSection() {
  return (
    <section className="border-b py-16">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-10 flex flex-col gap-2 text-center">
          <h2 className="text-2xl font-bold md:text-3xl">How it works</h2>
          <p className="mx-auto max-w-xl text-muted-foreground">
            From opening a lobby to climbing the ranks, in five steps.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {howItWorksSteps.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex flex-col gap-3">
              <span className="flex size-10 items-center justify-center rounded-full border bg-background">
                <Icon size={20} className="text-primary" aria-hidden="true" />
              </span>
              <h3 className="font-semibold">{title}</h3>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
