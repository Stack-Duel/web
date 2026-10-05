import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import BlogPostCard from "./blog-post-card";
import type { BlogPost } from "@/domains/blog/models/blog-post";

const basePost: BlogPost = {
  slug: "hello-world",
  title: "Hello World",
  excerpt: "An excerpt",
  body: "Body",
  author: "Ada",
  tags: ["engineering", "announcements"],
  publishedAt: "2026-01-01",
  published: true,
};

describe("BlogPostCard", () => {
  it("renders the title, excerpt, tags, and author", () => {
    render(<BlogPostCard post={basePost} />);

    expect(screen.getByText("Hello World")).toBeVisible();
    expect(screen.getByText("An excerpt")).toBeVisible();
    expect(screen.getByText("engineering")).toBeVisible();
    expect(screen.getByText("Ada")).toBeVisible();
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "/blog/hello-world"
    );
  });

  it("renders a cover image when provided", () => {
    render(
      <BlogPostCard
        post={{ ...basePost, coverImage: "/blog/hello-world/cover.jpg" }}
      />
    );

    expect(screen.getByRole("img")).toBeVisible();
  });

  it("renders no image when coverImage is absent", () => {
    render(<BlogPostCard post={basePost} />);

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("renders no tag list when there are no tags", () => {
    render(<BlogPostCard post={{ ...basePost, tags: [] }} />);

    expect(screen.queryByText("engineering")).not.toBeInTheDocument();
  });
});
