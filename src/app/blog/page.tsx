import type { Metadata } from "next";
import { getPublishedPosts } from "@/domains/blog/lib/get-posts";
import { routerConfig } from "@/shared/router-config";
import { getCurrentTenant } from "@/domains/tenant/lib/get-current-tenant";
import BlogLayout from "@/views/blog/blog-layout";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const tenant = await getCurrentTenant();

  return {
    title: "Blog",
    description: `Updates, engineering notes, and announcements from ${tenant.name}.`,
    alternates: { canonical: routerConfig.blog.path },
  };
}

export default function BlogPage() {
  const posts = getPublishedPosts();

  return <BlogLayout posts={posts} />;
}
