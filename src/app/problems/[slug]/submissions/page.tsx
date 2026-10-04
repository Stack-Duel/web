import type { Metadata } from "next";
import { fetchProblemBySlug } from "@/domains/problem/api/problem-server-api";
import type { Problem } from "@/domains/problem/models/problem";
import { routerConfig } from "@/shared/router-config";
import { siteName } from "@/shared/lib/site";
import ProblemSubmissionsPageContext from "@/views/problems/problem/submissions/problem-submissions-page-context";

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
  const title = `${problem.title} - Submissions`;
  const description = `Review your submission history for "${problem.title}" on ${siteName}, an online competitive coding platform for code battles.`;

  return {
    title,
    description,
    alternates: {
      canonical: routerConfig.problemSubmissions.execute({ slug }),
    },
    openGraph: {
      title,
      description,
    },
    twitter: {
      title,
      description,
    },
  };
};

export default async function ProblemSubmissionsPage({
  params,
}: Readonly<{
  params: Promise<{ slug: string }>;
}>) {
  const slug = (await params).slug;

  return <ProblemSubmissionsPageContext slug={slug} />;
}
