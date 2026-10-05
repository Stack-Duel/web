import type { Metadata } from "next";
import ProblemsLayout from "@/views/problems/problems-layout";
import { siteName } from "@/shared/lib/site";
import { routerConfig } from "@/shared/router-config";
import { fetchProblems } from "@/domains/problem/api/problem-server-api";
import type { PageResult } from "@/shared/pagination/page-result";
import type { ProblemSummary } from "@/domains/problem/models/problem-summary";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Coding Problems",
  description: `Browse coding challenges on ${siteName}, an online competitive coding platform. Practice algorithms and prep for code battles across every difficulty tier.`,
  alternates: { canonical: routerConfig.problems.path },
};

async function getInitialProblems(): Promise<
  PageResult<ProblemSummary> | undefined
> {
  try {
    const response = await fetchProblems({ page: 1, size: 20 });
    if (!response.ok) return undefined;
    return await response.json();
  } catch {
    return undefined;
  }
}

export default async function ProblemsPage() {
  const initialProblems = await getInitialProblems();

  return <ProblemsLayout initialProblems={initialProblems} />;
}
