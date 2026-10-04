import { fetchProblemBySlug } from "@/domains/problem/api/problem-server-api";
import { notFound } from "next/navigation";
import ProblemSubmissionsLayout from "./problem-submissions-layout";
import { auth0 } from "@/shared/lib/auth0";

type ProblemSubmissionsPageContextProps = {
  slug: string;
};

export default async function ProblemSubmissionsPageContext({
  slug,
}: Readonly<ProblemSubmissionsPageContextProps>) {
  const response = await fetchProblemBySlug({ slug });
  const session = await auth0.getSession();
  if (response.status === 404) {
    notFound();
  }

  if (!response.ok) {
    notFound();
  }

  const problem = await response.json();

  if (!problem) {
    notFound();
  }

  return (
    <ProblemSubmissionsLayout problem={problem} isAuthenticated={!!session} />
  );
}
