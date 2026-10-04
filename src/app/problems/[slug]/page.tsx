import type { Metadata } from "next";
import { fetchProblemBySlug } from "@/domains/problem/api/problem-server-api";
import { buildProblemDescription } from "@/domains/problem/lib/build-problem-metadata";
import type { Problem } from "@/domains/problem/models/problem";
import { routerConfig } from "@/shared/router-config";
import { siteName } from "@/shared/lib/site";
import ProblemPageContent from "../../../views/problems/problem/problem-page-client";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> => {
  const slug = (await params).slug;
  const response = await fetchProblemBySlug({ slug });

  if (!response.ok) {
    return {
      title: "Problem not found",
      description: `This coding problem could not be found on ${siteName}.`,
    };
  }

  const problem: Problem = await response.json();
  const description = buildProblemDescription(problem);

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
