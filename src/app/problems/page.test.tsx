import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ProblemsPage from "./page";
import { fetchProblems } from "@/domains/problem/api/problem-server-api";

vi.mock("@/views/problems/problems-layout", () => ({
  default: () => <div>Problems Layout</div>,
}));
vi.mock("@/shared/lib/site", () => import("@/test/mocks/site"));
vi.mock("@/domains/problem/api/problem-server-api", () => ({
  fetchProblems: vi.fn(),
}));

const mockFetchProblems = vi.mocked(fetchProblems);

describe("ProblemsPage", () => {
  it("renders the problems layout when the initial problems fetch fails", async () => {
    mockFetchProblems.mockResolvedValue(new Response(null, { status: 500 }));

    render(await ProblemsPage());

    expect(screen.getByText("Problems Layout")).toBeVisible();
  });

  it("renders the problems layout when the initial problems fetch throws", async () => {
    mockFetchProblems.mockRejectedValue(new Error("network error"));

    render(await ProblemsPage());

    expect(screen.getByText("Problems Layout")).toBeVisible();
  });
});
