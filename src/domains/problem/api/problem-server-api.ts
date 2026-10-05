import { env } from "@/env";

type FetchProblemBySlugInput = {
  slug: string;
};

export async function fetchProblemBySlug({ slug }: FetchProblemBySlugInput) {
  return fetch(`${env.NEXT_PUBLIC_API_SERVER_URL}/api/v1/problem/${slug}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });
}

type FetchProblemsInput = {
  page: number;
  size: number;
};

export async function fetchProblems({ page, size }: FetchProblemsInput) {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
    timestamp: new Date().toISOString(),
  });

  return fetch(`${env.NEXT_PUBLIC_API_SERVER_URL}/api/v1/problem?${params}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
