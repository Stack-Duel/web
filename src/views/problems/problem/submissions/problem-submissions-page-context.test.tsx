import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ProblemSubmissionsPageContext from "./problem-submissions-page-context";
import { fetchProblemBySlug } from "@/domains/problem/api/problem-server-api";
import { auth0 } from "@/shared/lib/auth0";
import { NextNotFoundError } from "@/test/mocks/next-navigation";
import { buildSessionData } from "@/test/factories/session";

vi.mock("next/navigation", () => import("@/test/mocks/next-navigation"));
vi.mock("@/domains/problem/api/problem-server-api", () => ({
  fetchProblemBySlug: vi.fn(),
}));
vi.mock("@/shared/lib/auth0", () => import("@/test/mocks/auth0"));
vi.mock("./problem-submissions-layout", () => ({
  default: ({
    problem,
    isAuthenticated,
  }: {
    problem: { title: string };
    isAuthenticated: boolean;
  }) => (
    <div>
      problem-submissions-layout:{problem.title}:{String(isAuthenticated)}
    </div>
  ),
}));

const mockFetchProblemBySlug = vi.mocked(fetchProblemBySlug);
const mockGetSession = vi.mocked(auth0.getSession);

describe("ProblemSubmissionsPageContext", () => {
  it("renders the submissions layout with the problem and authenticated flag", async () => {
    mockFetchProblemBySlug.mockResolvedValue(
      new Response(JSON.stringify({ title: "Two Sum" }), { status: 200 })
    );
    mockGetSession.mockResolvedValue(buildSessionData());

    render(await ProblemSubmissionsPageContext({ slug: "two-sum" }));

    expect(
      screen.getByText("problem-submissions-layout:Two Sum:true")
    ).toBeVisible();
  });

  it("renders as unauthenticated when there is no session", async () => {
    mockFetchProblemBySlug.mockResolvedValue(
      new Response(JSON.stringify({ title: "Two Sum" }), { status: 200 })
    );
    mockGetSession.mockResolvedValue(null);

    render(await ProblemSubmissionsPageContext({ slug: "two-sum" }));

    expect(
      screen.getByText("problem-submissions-layout:Two Sum:false")
    ).toBeVisible();
  });

  it("triggers notFound when the problem is missing (404)", async () => {
    mockFetchProblemBySlug.mockResolvedValue(
      new Response(null, { status: 404 })
    );
    mockGetSession.mockResolvedValue(null);

    await expect(
      ProblemSubmissionsPageContext({ slug: "missing" })
    ).rejects.toThrow(NextNotFoundError);
  });

  it("triggers notFound for any other non-ok response", async () => {
    mockFetchProblemBySlug.mockResolvedValue(
      new Response(null, { status: 500 })
    );
    mockGetSession.mockResolvedValue(null);

    await expect(
      ProblemSubmissionsPageContext({ slug: "two-sum" })
    ).rejects.toThrow(NextNotFoundError);
  });

  it("triggers notFound when the response body is empty", async () => {
    mockFetchProblemBySlug.mockResolvedValue(
      new Response("null", { status: 200 })
    );
    mockGetSession.mockResolvedValue(null);

    await expect(
      ProblemSubmissionsPageContext({ slug: "two-sum" })
    ).rejects.toThrow(NextNotFoundError);
  });
});
