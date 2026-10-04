import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import BlogLayout from "./blog-layout";
import type { BlogPost } from "@/domains/blog/models/blog-post";

vi.mock(
  "@/shared/layouts/sidebar-layout/sidebar-layout",
  () => import("@/test/mocks/sidebar-layout")
);

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

describe("BlogLayout", () => {
  it("renders a card for each post", () => {
    render(<BlogLayout posts={[post]} />);

    expect(screen.getByText("Hello World")).toBeVisible();
  });

  it("shows an empty state when there are no posts", () => {
    render(<BlogLayout posts={[]} />);

    expect(screen.getByText("No posts yet.")).toBeVisible();
  });
});
