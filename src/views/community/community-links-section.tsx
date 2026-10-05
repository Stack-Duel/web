import { socialLinks } from "@/shared/lib/social-links";

export default function CommunityLinksSection() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-5xl px-4">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {socialLinks.map(({ name, href, icon: Icon, description }) => (
            <a
              key={name}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-3 rounded-lg border p-8 text-center transition-colors hover:bg-muted"
            >
              <span className="flex size-12 items-center justify-center rounded-full border bg-background">
                <Icon size={24} className="text-primary" aria-hidden="true" />
              </span>
              <h2 className="font-semibold">{name}</h2>
              <p className="text-sm text-muted-foreground">{description}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
