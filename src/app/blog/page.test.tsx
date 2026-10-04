import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import BlogPage from "./page";
import { getPublishedPosts } from "@/domains/blog/lib/get-posts";
import type { BlogPost } from "@/domains/blog/models/blog-post";

vi.mock("@/domains/blog/lib/get-posts", () => ({
  getPublishedPosts: vi.fn(),
}));
vi.mock("@/views/blog/blog-layout", () => ({
  default: ({ posts }: { posts: BlogPost[] }) => (
    <div>Blog posts: {posts.length}</div>
  ),
}));
vi.mock("@/shared/lib/site", () => import("@/test/mocks/site"));

const mockGetPublishedPosts = vi.mocked(getPublishedPosts);

describe("BlogPage", () => {
  it("renders the layout with the published posts", () => {
    mockGetPublishedPosts.mockReturnValue([
      { slug: "hello-world" } as BlogPost,
    ]);

    render(<BlogPage />);

    expect(screen.getByText("Blog posts: 1")).toBeVisible();
  });
});
