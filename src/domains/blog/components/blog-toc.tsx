"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/shared/lib/utils";
import type { BlogHeading } from "@/domains/blog/lib/get-headings";

type BlogTocProps = {
  headings: BlogHeading[];
};

export default function BlogToc({ headings }: Readonly<BlogTocProps>) {
  const [activeId, setActiveId] = useState<string | null>(
    headings[0]?.id ?? null
  );
  const visibility = useRef(new Map<string, boolean>());

  useEffect(() => {
    const elements = headings
      .map((heading) => document.getElementById(heading.id))
      .filter((element): element is HTMLElement => element !== null);

    if (elements.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          visibility.current.set(entry.target.id, entry.isIntersecting);
        }

        const lastVisible = headings.findLast((heading) =>
          visibility.current.get(heading.id)
        );

        if (lastVisible) {
          setActiveId(lastVisible.id);
        }
      },
      { rootMargin: "-112px 0px -60% 0px", threshold: 0 }
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Table of contents" className="flex flex-col gap-3">
      <span className="text-sm font-semibold tracking-tight">On this page</span>
      <ul className="flex flex-col gap-2 border-l text-sm">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              className={cn(
                "block border-l-2 border-transparent py-0.5 pl-4 -ml-px text-muted-foreground transition-colors hover:text-foreground",
                activeId === heading.id &&
                  "border-primary font-medium text-foreground"
              )}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
