import { useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { http } from "@/shared/lib/http";
import { toAxiosConfig } from "@/shared/lib/request-config";
import type { RequestConfig } from "@/shared/lib/request-config";
import type { PageResult } from "@/shared/pagination/page-result";
import type { ProblemSubmission } from "../models/problem-submission";
import type { SubmissionFilterType } from "../models/submission-filter-type";
import type { SubmissionOrderByType } from "../models/submission-order-by-type";

const PAGE_SIZE = 10;

type GetProblemSubmissionsParams = {
  slug: string;
  page: number;
  size: number;
  timestamp: string;
  type: SubmissionFilterType;
  sortBy: SubmissionOrderByType;
};

export const getProblemSubmissions = ({
  slug,
  page,
  size,
  timestamp,
  type,
  sortBy,
  signal,
}: GetProblemSubmissionsParams & RequestConfig) =>
  http.get<PageResult<ProblemSubmission>>(
    `/api/v1/problem/${encodeURIComponent(slug)}/submissions`,
    {
      ...toAxiosConfig({ signal }),
      params: { page, size, timestamp, type, sortBy },
    }
  );

type UseProblemSubmissionsParams = {
  slug: string;
  type: SubmissionFilterType;
  sortBy: SubmissionOrderByType;
  /** Pass `false` while auth/slug aren't ready yet. Mirrors the old
   *  `isAuthenticated && problem.slug` guard from the mount effect. */
  enabled?: boolean;
};

/**
 * Note on `timestamp`: the backend wants one stable snapshot time across all
 * pages of a single scroll session, but a fresh one whenever the person
 * changes what they're looking at (slug/type/sortBy). `useMemo` keyed on
 * those three gives exactly that: recomputed only when the "session"
 * changes, not on every render or every `fetchNextPage()` call.
 */
export function useProblemSubmissions({
  slug,
  type,
  sortBy,
  enabled = true,
}: UseProblemSubmissionsParams) {
  const timestamp = useMemo(
    () => new Date().toISOString(),
    [slug, type, sortBy]
  );

  return useInfiniteQuery({
    queryKey: ["problem-submissions", slug, type, sortBy, timestamp],
    queryFn: ({ pageParam, signal }) =>
      getProblemSubmissions({
        slug,
        page: pageParam,
        size: PAGE_SIZE,
        timestamp,
        type,
        sortBy,
        signal,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < (lastPage.totalPages ?? 0)
        ? lastPage.page + 1
        : undefined,
    enabled: enabled && slug.trim() !== "",
    meta: { errorToast: "Error loading submissions" },
  });
}
