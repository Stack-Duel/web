import defaultMdxComponents from "fumadocs-ui/mdx";
import { Callout } from "fumadocs-ui/components/callout";
import { Accordion, Accordions } from "fumadocs-ui/components/accordion";
import type { MDXComponents } from "mdx/types";

export function getDocsMdxComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    Callout,
    Accordion,
    Accordions,
    ...components,
  } satisfies MDXComponents;
}
