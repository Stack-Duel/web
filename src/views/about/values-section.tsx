const values = [
  {
    title: "Free to start",
    description:
      "Create an account, solve problems, and compete in games without paying anything.",
  },
  {
    title: "Multiple languages",
    description:
      "Solve challenges in the language you already know, and pick up new ones along the way.",
  },
  {
    title: "Fast results",
    description:
      "Your submission gets queued and judged in seconds, not minutes, so you're never stuck waiting to know where you stand.",
  },
  {
    title: "Multiple game modes",
    description:
      "Go head-to-head, join a free-for-all lobby, or race solo against the clock.",
  },
];

export default function ValuesSection() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-10 flex flex-col gap-2 text-center">
          <h2 className="text-2xl font-bold md:text-3xl">
            Why developers pick Algowars
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {values.map(({ title, description }) => (
            <div key={title} className="flex flex-col gap-2">
              <h3 className="font-semibold">{title}</h3>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
