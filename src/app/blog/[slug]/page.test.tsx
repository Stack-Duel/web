import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import BlogPostPage, { generateMetadata } from "./page";
import { getPostBySlug } from "@/domains/blog/lib/get-posts";
import { NextNotFoundError } from "@/test/mocks/next-navigation";
import type { BlogPost } from "@/domains/blog/models/blog-post";

vi.mock("next/navigation", () => import("@/test/mocks/next-navigation"));
vi.mock("@/domains/blog/lib/get-posts", () => ({
  getPostBySlug: vi.fn(),
}));
vi.mock("@/views/blog/blog-post-layout", () => ({
  default: ({ post }: { post: BlogPost }) => (
    <div>blog-post-layout:{post.title}</div>
  ),
}));
vi.mock("@/shared/lib/site", () => import("@/test/mocks/site"));

const mockGetPostBySlug = vi.mocked(getPostBySlug);

const post: BlogPost = {
  slug: "hello-world",
  title: "Hello World",
  excerpt: "An excerpt",
  body: "Body",
  author: "Ada",
  tags: [],
  publishedAt: "2026-01-01",
  published: true,
};

describe("BlogPostPage", () => {
  it("renders the post layout when the post exists", async () => {
    mockGetPostBySlug.mockReturnValue(post);

    render(
      await BlogPostPage({ params: Promise.resolve({ slug: "hello-world" }) })
    );

    expect(screen.getByText("blog-post-layout:Hello World")).toBeVisible();
  });

  it("triggers notFound when the post does not exist", async () => {
    mockGetPostBySlug.mockReturnValue(undefined);

    await expect(
      BlogPostPage({ params: Promise.resolve({ slug: "missing" }) })
    ).rejects.toThrow(NextNotFoundError);
  });
});

describe("generateMetadata", () => {
  it("builds metadata from the post, including the cover image", async () => {
    mockGetPostBySlug.mockReturnValue({
      ...post,
      coverImage: "/blog/hello-world/cover.jpg",
    });

    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: "hello-world" }),
    });

    expect(metadata.title).toBe("Hello World");
    expect(metadata.description).toBe("An excerpt");
    expect(metadata.alternates?.canonical).toBe("/blog/hello-world");
    expect(metadata.openGraph?.images).toEqual(["/blog/hello-world/cover.jpg"]);
  });

  it("omits openGraph images when there is no cover image", async () => {
    mockGetPostBySlug.mockReturnValue(post);

    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: "hello-world" }),
    });

    expect(metadata.openGraph?.images).toBeUndefined();
  });

  it("falls back to a not-found title when the post is missing", async () => {
    mockGetPostBySlug.mockReturnValue(undefined);

    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: "missing" }),
    });

    expect(metadata.title).toBe("Post not found");
  });
});
