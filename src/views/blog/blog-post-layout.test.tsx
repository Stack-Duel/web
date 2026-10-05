import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import BlogPostLayout from "./blog-post-layout";
import type { BlogPost } from "@/domains/blog/models/blog-post";

vi.mock(
  "@/shared/layouts/sidebar-layout/sidebar-layout",
  () => import("@/test/mocks/sidebar-layout")
);

const basePost: BlogPost = {
  slug: "hello-world",
  title: "Hello World",
  excerpt: "An excerpt",
  body: "The full **body** of the post.",
  author: "Ada",
  tags: ["engineering"],
  publishedAt: "2026-01-01",
  published: true,
};

describe("BlogPostLayout", () => {
  it("renders the title, author, tags, and body", () => {
    render(<BlogPostLayout post={basePost} />);

    expect(screen.getByRole("heading", { name: "Hello World" })).toBeVisible();
    expect(screen.getByText("Ada")).toBeVisible();
    expect(screen.getByText("engineering")).toBeVisible();
    expect(screen.getByText("body", { exact: false })).toBeVisible();
  });

  it("renders a cover image when provided", () => {
    render(
      <BlogPostLayout
        post={{ ...basePost, coverImage: "/blog/hello-world/cover.jpg" }}
      />
    );

    expect(screen.getByRole("img", { name: basePost.title })).toBeVisible();
  });

  it("renders no image when coverImage is absent", () => {
    render(<BlogPostLayout post={basePost} />);

    expect(
      screen.queryByRole("img", { name: basePost.title })
    ).not.toBeInTheDocument();
  });

  it("renders no tag list when there are no tags", () => {
    render(<BlogPostLayout post={{ ...basePost, tags: [] }} />);

    expect(screen.queryByText("engineering")).not.toBeInTheDocument();
  });
});
