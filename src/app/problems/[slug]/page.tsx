import type { Metadata } from "next";
import { fetchProblemBySlug } from "@/domains/problem/api/problem-server-api";
import { buildProblemDescription } from "@/domains/problem/lib/build-problem-metadata";
import type { Problem } from "@/domains/problem/models/problem";
import { routerConfig } from "@/shared/router-config";
import { getCurrentTenant } from "@/domains/tenant/lib/get-current-tenant";
import ProblemPageContent from "../../../views/problems/problem/problem-page-client";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> => {
  const [slug, tenant] = await Promise.all([
    params.then((p) => p.slug),
    getCurrentTenant(),
  ]);
  const response = await fetchProblemBySlug({ slug });

  if (!response.ok) {
    return {
      title: "Problem not found",
      description: `This coding problem could not be found on ${tenant.name}.`,
    };
  }

  const problem: Problem = await response.json();
  const description = buildProblemDescription(problem, tenant.name);

  return {
    title: problem.title,
    description,
    alternates: { canonical: routerConfig.problem.execute({ slug }) },
    openGraph: {
      title: problem.title,
      description,
    },
    twitter: {
      title: problem.title,
      description,
    },
  };
};

export default async function ProblemPage({
  params,
}: Readonly<{
  params: Promise<{ slug: string }>;
}>) {
  const slug = (await params).slug;

  return <ProblemPageContent slug={slug} />;
}
