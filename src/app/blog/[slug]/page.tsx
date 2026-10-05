import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPostBySlug } from "@/domains/blog/lib/get-posts";
import { routerConfig } from "@/shared/router-config";
import { siteName } from "@/shared/lib/site";
import BlogPostLayout from "@/views/blog/blog-post-layout";

export const dynamic = "force-dynamic";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> => {
  const slug = (await params).slug;
  const post = getPostBySlug(slug);

  if (!post) {
    return {
      title: "Post not found",
      description: `This blog post could not be found on ${siteName}.`,
    };
  }

  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: routerConfig.blogPost.execute({ slug }) },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.coverImage ? [post.coverImage] : undefined,
    },
    twitter: {
      title: post.title,
      description: post.excerpt,
    },
  };
};

export default async function BlogPostPage({
  params,
}: Readonly<{
  params: Promise<{ slug: string }>;
}>) {
  const slug = (await params).slug;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return <BlogPostLayout post={post} />;
}
