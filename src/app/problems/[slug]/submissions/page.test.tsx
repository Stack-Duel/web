import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ProblemSubmissionsPage, { generateMetadata } from "./page";
import { fetchProblemBySlug } from "@/domains/problem/api/problem-server-api";

vi.mock(
  "@/views/problems/problem/submissions/problem-submissions-page-context",
  () => ({
    default: ({ slug }: { slug: string }) => (
      <div>Problem Submissions: {slug}</div>
    ),
  })
);
vi.mock("@/domains/problem/api/problem-server-api", () => ({
  fetchProblemBySlug: vi.fn(),
}));
vi.mock("@/shared/lib/site", () => import("@/test/mocks/site"));

const mockFetchProblemBySlug = vi.mocked(fetchProblemBySlug);

describe("ProblemSubmissionsPage", () => {
  it("renders the submissions content for the resolved slug", async () => {
    render(
      await ProblemSubmissionsPage({
        params: Promise.resolve({ slug: "two-sum" }),
      })
    );

    expect(screen.getByText("Problem Submissions: two-sum")).toBeVisible();
  });
});

describe("generateMetadata", () => {
  it("builds a title and description from the fetched problem", async () => {
    mockFetchProblemBySlug.mockResolvedValue(
      new Response(
        JSON.stringify({ title: "Two Sum", difficultyTier: "Easy" }),
        { status: 200 }
      )
    );

    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: "two-sum" }),
    });

    expect(metadata.title).toBe("Two Sum - Submissions");
    expect(metadata.description).toContain("Two Sum");
    expect(metadata.alternates?.canonical).toBe(
      "/problems/two-sum/submissions"
    );
  });

  it("falls back to a not-found title when the problem cannot be fetched", async () => {
    mockFetchProblemBySlug.mockResolvedValue(
      new Response(null, { status: 404 })
    );

    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: "missing" }),
    });

    expect(metadata.title).toBe("Problem not found");
  });
});
