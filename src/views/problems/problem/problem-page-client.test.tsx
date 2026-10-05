import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ProblemPage from "./problem-page-client";
import { fetchProblemBySlug } from "@/domains/problem/api/problem-server-api";
import { NextNotFoundError } from "@/test/mocks/next-navigation";

vi.mock("next/navigation", () => import("@/test/mocks/next-navigation"));
vi.mock("@/domains/problem/api/problem-server-api", () => ({
  fetchProblemBySlug: vi.fn(),
}));
vi.mock("./problem-layout", () => ({
  default: ({ problem }: { problem: { title: string } }) => (
    <div>problem-layout:{problem.title}</div>
  ),
}));

const mockFetchProblemBySlug = vi.mocked(fetchProblemBySlug);

describe("ProblemPage", () => {
  it("renders the problem layout when the fetch succeeds", async () => {
    mockFetchProblemBySlug.mockResolvedValue(
      new Response(JSON.stringify({ title: "Two Sum" }), { status: 200 })
    );

    render(await ProblemPage({ slug: "two-sum" }));

    expect(screen.getByText("problem-layout:Two Sum")).toBeVisible();
  });

  it("triggers notFound when the problem is missing (404)", async () => {
    mockFetchProblemBySlug.mockResolvedValue(
      new Response(null, { status: 404 })
    );

    await expect(ProblemPage({ slug: "missing" })).rejects.toThrow(
      NextNotFoundError
    );
  });

  it("triggers notFound for any other non-ok response", async () => {
    mockFetchProblemBySlug.mockResolvedValue(
      new Response(null, { status: 500 })
    );

    await expect(ProblemPage({ slug: "two-sum" })).rejects.toThrow(
      NextNotFoundError
    );
  });

  it("triggers notFound when the response body is empty", async () => {
    mockFetchProblemBySlug.mockResolvedValue(
      new Response("null", { status: 200 })
    );

    await expect(ProblemPage({ slug: "two-sum" })).rejects.toThrow(
      NextNotFoundError
    );
  });
});
