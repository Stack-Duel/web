import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";
import type { BlogPost } from "@/domains/blog/models/blog-post";

const POSTS_DIR = path.join(process.cwd(), "src/content/blog");

const frontmatterSchema = z.object({
  title: z.string().min(1),
  excerpt: z.string().min(1),
  author: z.string().min(1),
  authorImageUrl: z.string().optional(),
  coverImage: z.string().optional(),
  tags: z.array(z.string()).default([]),
  publishedAt: z
    .union([z.string().min(1), z.date()])
    .transform((value) =>
      value instanceof Date ? value.toISOString().slice(0, 10) : value
    ),
  published: z.boolean(),
});

function loadPost(fileName: string): BlogPost {
  const filePath = path.join(POSTS_DIR, fileName);
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);

  const result = frontmatterSchema.safeParse(data);
  if (!result.success) {
    throw new Error(
      `Invalid blog post frontmatter in "${fileName}": ${result.error.message}`
    );
  }

  return {
    ...result.data,
    slug: fileName.replace(/\.md$/, ""),
    body: content.trim(),
  };
}

function loadAllPosts(): BlogPost[] {
  const fileNames = fs
    .readdirSync(POSTS_DIR)
    .filter((fileName) => fileName.endsWith(".md"));

  return fileNames.map(loadPost);
}

export function getPublishedPosts(): BlogPost[] {
  return loadAllPosts()
    .filter((post) => post.published)
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return getPublishedPosts().find((post) => post.slug === slug);
}

export function getRelatedPosts(post: BlogPost, limit = 4): BlogPost[] {
  return getPublishedPosts()
    .filter((candidate) => candidate.slug !== post.slug)
    .map((candidate) => ({
      candidate,
      sharedTags: candidate.tags.filter((tag) => post.tags.includes(tag))
        .length,
    }))
    .sort((a, b) => b.sharedTags - a.sharedTags)
    .slice(0, limit)
    .map(({ candidate }) => candidate);
}
