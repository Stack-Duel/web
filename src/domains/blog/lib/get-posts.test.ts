import { describe, expect, it, vi, beforeEach } from "vitest";
import fs from "node:fs";
import { getPostBySlug, getPublishedPosts } from "./get-posts";

vi.mock("node:fs", () => ({
  default: {
    readdirSync: vi.fn(),
    readFileSync: vi.fn(),
  },
}));

const mockReaddirSync = vi.mocked(fs.readdirSync);
const mockReadFileSync = vi.mocked(fs.readFileSync);

function post(fileName: string, frontmatter: Record<string, unknown>) {
  const yamlLines = Object.entries(frontmatter).map(([key, value]) => {
    if (Array.isArray(value)) {
      return `${key}: [${value.map((v) => JSON.stringify(v)).join(", ")}]`;
    }
    return `${key}: ${JSON.stringify(value)}`;
  });

  return {
    fileName,
    content: `---\n${yamlLines.join("\n")}\n---\n\nBody for ${fileName}.\n`,
  };
}

function mockPosts(posts: { fileName: string; content: string }[]) {
  mockReaddirSync.mockReturnValue(
    posts.map((p) => p.fileName) as unknown as ReturnType<typeof fs.readdirSync>
  );
  mockReadFileSync.mockImplementation((filePath) => {
    const match = posts.find((p) => String(filePath).endsWith(p.fileName));
    if (!match) throw new Error(`Unexpected file read: ${filePath}`);
    return match.content;
  });
}

const validFrontmatter = {
  title: "Hello World",
  excerpt: "An excerpt",
  author: "Ada",
  tags: ["engineering"],
  publishedAt: "2026-01-01",
  published: true,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getPublishedPosts", () => {
  it("returns only published posts, newest first", () => {
    mockPosts([
      post("older.md", { ...validFrontmatter, publishedAt: "2026-01-01" }),
      post("newer.md", { ...validFrontmatter, publishedAt: "2026-06-01" }),
      post("hidden.md", { ...validFrontmatter, published: false }),
    ]);

    const posts = getPublishedPosts();

    expect(posts.map((p) => p.slug)).toEqual(["newer", "older"]);
  });

  it("ignores non-markdown files", () => {
    mockReaddirSync.mockReturnValue(["README.txt"] as unknown as ReturnType<
      typeof fs.readdirSync
    >);

    expect(getPublishedPosts()).toEqual([]);
  });

  it("derives the slug from the filename", () => {
    mockPosts([post("my-first-post.md", validFrontmatter)]);

    expect(getPublishedPosts()[0].slug).toBe("my-first-post");
  });

  it("normalizes a YAML-parsed Date value for publishedAt", () => {
    mockReaddirSync.mockReturnValue(["dated.md"] as unknown as ReturnType<
      typeof fs.readdirSync
    >);
    mockReadFileSync.mockReturnValue(
      "---\ntitle: Hello\nexcerpt: Excerpt\nauthor: Ada\npublished: true\npublishedAt: 2026-01-01\n---\n\nBody.\n"
    );

    expect(getPublishedPosts()[0].publishedAt).toBe("2026-01-01");
  });

  it("throws a descriptive error when frontmatter is invalid", () => {
    mockPosts([post("broken.md", { excerpt: "missing title" })]);

    expect(() => getPublishedPosts()).toThrow(/broken\.md/);
  });
});

describe("getPostBySlug", () => {
  it("returns the matching published post", () => {
    mockPosts([post("hello-world.md", validFrontmatter)]);

    expect(getPostBySlug("hello-world")?.title).toBe("Hello World");
  });

  it("returns undefined for an unpublished post", () => {
    mockPosts([post("hidden.md", { ...validFrontmatter, published: false })]);

    expect(getPostBySlug("hidden")).toBeUndefined();
  });

  it("returns undefined for an unknown slug", () => {
    mockPosts([post("hello-world.md", validFrontmatter)]);

    expect(getPostBySlug("does-not-exist")).toBeUndefined();
  });
});
