import { afterEach, describe, expect, it, vi } from "vitest";
import sitemap from "./sitemap";
import { testTenant } from "@/test/mocks/tenant";
import { env } from "@/test/mocks/env";
import type { PageResult } from "@/shared/pagination/page-result";
import type { ProblemSummary } from "@/domains/problem/models/problem-summary";
import type { BlogPost } from "@/domains/blog/models/blog-post";

const siteUrl = testTenant.url;
const getPublishedPosts = vi.fn<() => BlogPost[]>().mockReturnValue([]);

vi.mock(
  "@/domains/tenant/lib/get-current-tenant",
  () => import("@/test/mocks/tenant")
);
vi.mock("@/env", () => import("@/test/mocks/env"));
vi.mock("@/domains/blog/lib/get-posts", () => ({
  getPublishedPosts: () => getPublishedPosts(),
}));

function buildProblemPage(
  results: ProblemSummary[]
): PageResult<ProblemSummary> {
  return { results, total: results.length, page: 1, size: 200, timestamp: "" };
}

const staticRoutes = [
  { url: siteUrl, changeFrequency: "daily", priority: 1 },
  {
    url: `${siteUrl}/problems`,
    changeFrequency: "daily",
    priority: 0.9,
  },
  {
    url: `${siteUrl}/about`,
    changeFrequency: "monthly",
    priority: 0.5,
  },
  {
    url: `${siteUrl}/community`,
    changeFrequency: "monthly",
    priority: 0.5,
  },
  {
    url: `${siteUrl}/blog`,
    changeFrequency: "weekly",
    priority: 0.6,
  },
];

function buildPost(overrides: Partial<BlogPost> = {}): BlogPost {
  return {
    slug: "writing-code-in-the-age-of-ai",
    title: "Writing Code In The Age Of AI",
    excerpt: "excerpt",
    body: "body",
    author: "Algowars",
    tags: [],
    publishedAt: "2026-01-01",
    published: true,
    ...overrides,
  };
}

describe("sitemap", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    getPublishedPosts.mockReturnValue([]);
  });

  it("includes the static routes plus one entry per problem returned by the API", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve(
          buildProblemPage([
            {
              id: "1",
              slug: "two-sum",
              title: "Two Sum",
              difficultyTier: "easy",
              tags: [],
              languages: [],
            },
          ])
        ),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await sitemap();

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining(
        `${env.NEXT_PUBLIC_API_SERVER_URL}/api/v1/problem?page=1&size=200`
      ),
      expect.objectContaining({
        headers: { "Content-Type": "application/json" },
      })
    );
    expect(result).toEqual([
      ...staticRoutes,
      {
        url: `${siteUrl}/problems/two-sum`,
        changeFrequency: "weekly",
        priority: 0.6,
      },
    ]);
  });

  it("falls back to just the static routes when the API responds with an error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, json: () => Promise.resolve() })
    );

    const result = await sitemap();

    expect(result).toEqual(staticRoutes);
  });

  it("falls back to just the static routes when the API request throws", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("network error"))
    );

    const result = await sitemap();

    expect(result).toEqual(staticRoutes);
  });

  it("includes one entry per published blog post", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(buildProblemPage([])),
      })
    );
    getPublishedPosts.mockReturnValue([buildPost()]);

    const result = await sitemap();

    expect(result).toEqual([
      ...staticRoutes,
      {
        url: `${siteUrl}/blog/writing-code-in-the-age-of-ai`,
        lastModified: "2026-01-01",
        changeFrequency: "monthly",
        priority: 0.5,
      },
    ]);
  });
});
