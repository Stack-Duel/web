import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  getProblemSubmissions,
  useProblemSubmissions,
} from "./use-problem-submissions";
import { http } from "@/shared/lib/http";
import { buildProblemSubmission } from "@/test/factories/problem";
import { SubmissionFilterType } from "../models/submission-filter-type";
import { SubmissionOrderByType } from "../models/submission-order-by-type";

vi.mock("@/shared/lib/http", () => ({
  http: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockedHttp = vi.mocked(http, { deep: true });

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  }
  return Wrapper;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getProblemSubmissions", () => {
  it("encodes the slug into the URL and forwards filter params", async () => {
    const page = {
      results: [buildProblemSubmission()],
      total: 1,
      page: 1,
      size: 10,
      timestamp: "2026-01-01T00:00:00.000Z",
    };
    mockedHttp.get.mockResolvedValue(page);

    const result = await getProblemSubmissions({
      slug: "two sum",
      page: 1,
      size: 10,
      timestamp: "2026-01-01T00:00:00.000Z",
      type: SubmissionFilterType.UserSolutions,
      sortBy: SubmissionOrderByType.Newest,
    });

    expect(mockedHttp.get).toHaveBeenCalledWith(
      "/api/v1/problem/two%20sum/submissions",
      expect.objectContaining({
        params: {
          page: 1,
          size: 10,
          timestamp: "2026-01-01T00:00:00.000Z",
          type: SubmissionFilterType.UserSolutions,
          sortBy: SubmissionOrderByType.Newest,
        },
      })
    );
    expect(result).toEqual(page);
  });
});

describe("useProblemSubmissions", () => {
  it("does not fetch when disabled", () => {
    renderHook(
      () =>
        useProblemSubmissions({
          slug: "two-sum",
          type: SubmissionFilterType.UserSolutions,
          sortBy: SubmissionOrderByType.Newest,
          enabled: false,
        }),
      { wrapper: createWrapper() }
    );

    expect(mockedHttp.get).not.toHaveBeenCalled();
  });

  it("does not fetch when the slug is blank", () => {
    renderHook(
      () =>
        useProblemSubmissions({
          slug: "  ",
          type: SubmissionFilterType.UserSolutions,
          sortBy: SubmissionOrderByType.Newest,
        }),
      { wrapper: createWrapper() }
    );

    expect(mockedHttp.get).not.toHaveBeenCalled();
  });

  it("fetches the first page when enabled with a real slug", async () => {
    mockedHttp.get.mockResolvedValue({
      results: [buildProblemSubmission()],
      total: 1,
      page: 1,
      size: 10,
      timestamp: "2026-01-01T00:00:00.000Z",
      totalPages: 1,
    });

    const { result } = renderHook(
      () =>
        useProblemSubmissions({
          slug: "two-sum",
          type: SubmissionFilterType.UserSolutions,
          sortBy: SubmissionOrderByType.Newest,
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.hasNextPage).toBe(false);
  });

  it("exposes another page when totalPages is greater than the current page", async () => {
    mockedHttp.get.mockResolvedValue({
      results: [buildProblemSubmission()],
      total: 20,
      page: 1,
      size: 10,
      timestamp: "2026-01-01T00:00:00.000Z",
      totalPages: 2,
    });

    const { result } = renderHook(
      () =>
        useProblemSubmissions({
          slug: "two-sum",
          type: SubmissionFilterType.UserSolutions,
          sortBy: SubmissionOrderByType.Newest,
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.hasNextPage).toBe(true);
  });
});
