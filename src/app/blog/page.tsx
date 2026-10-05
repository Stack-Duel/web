import type { Metadata } from "next";
import { getPublishedPosts } from "@/domains/blog/lib/get-posts";
import { routerConfig } from "@/shared/router-config";
import { siteName } from "@/shared/lib/site";
import BlogLayout from "@/views/blog/blog-layout";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog",
  description: `Updates, engineering notes, and announcements from ${siteName}.`,
  alternates: { canonical: routerConfig.blog.path },
};

export default function BlogPage() {
  const posts = getPublishedPosts();

  return <BlogLayout posts={posts} />;
}
