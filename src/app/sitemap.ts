import type { MetadataRoute } from "next";
import { env } from "@/env";
import { getCurrentTenant } from "@/domains/tenant/lib/get-current-tenant";
import { routerConfig } from "@/shared/router-config";
import type { PageResult } from "@/shared/pagination/page-result";
import type { ProblemSummary } from "@/domains/problem/models/problem-summary";
import { getPublishedPosts } from "@/domains/blog/lib/get-posts";

export const revalidate = 3600;

async function getProblemSitemapEntries(
  siteUrl: string
): Promise<MetadataRoute.Sitemap> {
  try {
    const response = await fetch(
      `${env.NEXT_PUBLIC_API_SERVER_URL}/api/v1/problem?page=1&size=200&timestamp=${Date.now()}`,
      { headers: { "Content-Type": "application/json" } }
    );

    if (!response.ok) {
      console.error(
        `Failed to build problem sitemap entries: ${response.status} ${response.statusText}`
      );
      return [];
    }

    const page: PageResult<ProblemSummary> = await response.json();

    return page.results.map((problem) => ({
      url: `${siteUrl}${routerConfig.problem.execute({ slug: problem.slug })}`,
      changeFrequency: "weekly",
      priority: 0.6,
    }));
  } catch (error) {
    console.error("Failed to build problem sitemap entries", error);
    return [];
  }
}

function getBlogSitemapEntries(siteUrl: string): MetadataRoute.Sitemap {
  const posts = getPublishedPosts();

  return posts.map((post) => ({
    url: `${siteUrl}${routerConfig.blogPost.execute({ slug: post.slug })}`,
    lastModified: post.publishedAt,
    changeFrequency: "monthly",
    priority: 0.5,
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const tenant = await getCurrentTenant();
  const siteUrl = tenant.url;

  const problemEntries = await getProblemSitemapEntries(siteUrl);
  const blogEntries = getBlogSitemapEntries(siteUrl);

  return [
    {
      url: siteUrl,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${siteUrl}${routerConfig.problems.path}`,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}${routerConfig.about.path}`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${siteUrl}${routerConfig.community.path}`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${siteUrl}${routerConfig.blog.path}`,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    ...problemEntries,
    ...blogEntries,
  ];
}
