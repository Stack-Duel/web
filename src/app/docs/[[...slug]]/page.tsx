import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  DocsPage,
  DocsBody,
  DocsTitle,
  DocsDescription,
} from "fumadocs-ui/page";
import { createRelativeLink } from "fumadocs-ui/mdx";
import { docsSource } from "@/shared/lib/docs-source";
import { getDocsMdxComponents } from "@/shared/components/docs-mdx-components";
import { getCurrentTenant } from "@/domains/tenant/lib/get-current-tenant";

export const dynamic = "force-static";

type DocsPageParams = {
  params: Promise<{ slug?: string[] }>;
};

export default async function Page({ params }: Readonly<DocsPageParams>) {
  const { slug } = await params;
  const page = docsSource.getPage(slug);

  if (!page) {
    notFound();
  }

  const MDXContent = page.data.body;

  return (
    <DocsPage toc={page.data.toc} full={page.data.full}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        <MDXContent
          components={getDocsMdxComponents({
            a: createRelativeLink(docsSource, page),
          })}
        />
      </DocsBody>
    </DocsPage>
  );
}

export function generateStaticParams() {
  return docsSource.generateParams();
}

export async function generateMetadata({
  params,
}: Readonly<DocsPageParams>): Promise<Metadata> {
  const { slug } = await params;
  const page = docsSource.getPage(slug);

  if (!page) {
    const tenant = await getCurrentTenant();
    return {
      title: "Not found",
      description: `This doc could not be found on ${tenant.name}.`,
    };
  }

  return {
    title: page.data.title,
    description: page.data.description,
    alternates: { canonical: page.url },
  };
}
